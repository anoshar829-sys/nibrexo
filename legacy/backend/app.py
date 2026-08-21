import hashlib
import hmac
import json
import os
import re
import secrets
import time
import uuid
from datetime import datetime, timedelta, timezone
from functools import wraps
from html import escape
from pathlib import Path
from urllib.parse import parse_qs, quote, urlsplit, urlunsplit

from flask import Flask, jsonify, make_response, redirect, request, send_from_directory
from werkzeug.exceptions import HTTPException
from werkzeug.security import check_password_hash, generate_password_hash

from database import DatabaseError, IntegrityError, get_db
from config import readiness, validate_production_environment
from login_rate_limit import (
    canonical_client_ip,
    clear_login_failures,
    is_login_rate_limited,
    login_attempt_key,
    record_login_failure,
)
from payments import PaymentUnavailable, get_payment_provider
from storage import StorageUnavailable, get_storage_provider
from license_vault import LicenseVaultUnavailable, get_license_vault
from integrations.ai import get_ai_provider
from integrations.crm import get_crm_provider
from integrations.email import get_email_provider
from integrations.newsletter import get_newsletter_provider
from integrations.registry import provider_statuses
from integrations.base import ProviderUnavailable
from events import emit_event
from workflows import queue_workflows_for_event

BASE_DIR = Path(__file__).resolve().parent
FRONTEND_DIR = BASE_DIR.parent
COOKIE_NAME = "nibrexo_session"
PASSWORD_MIN_LENGTH = 8
# A non-secret placeholder keeps nonexistent-account password verification on the
# same code path as a real account without exposing whether an email exists.
DUMMY_PASSWORD_HASH = generate_password_hash("nibrexo-invalid-login-placeholder")
ADMIN_ROLES = {"owner", "admin", "manager", "support", "editor"}
CONTENT_ROLES = {"owner", "admin", "manager", "editor"}
SUPPORT_ROLES = {"owner", "admin", "manager", "support"}
SETTINGS_ROLES = {"owner", "admin"}
SLUG_RE = re.compile(r"^[a-z0-9]+(?:-[a-z0-9]+)*$")
SOCIAL_CONTACT_SETTINGS_KEY = "social_contact_links"
SOCIAL_CONTACT_PLATFORMS = (
    ("tiktok", "TikTok", 10),
    ("instagram", "Instagram", 20),
    ("facebook", "Facebook", 30),
    ("pinterest", "Pinterest", 40),
    ("whatsapp", "WhatsApp", 50),
    ("email", "Email", 60),
)
SOCIAL_CONTACT_PLATFORM_MAP = {platform: {"label": label, "displayOrder": order} for platform, label, order in SOCIAL_CONTACT_PLATFORMS}
EMAIL_RE = re.compile(r"^[A-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[A-Z0-9](?:[A-Z0-9-]{0,61}[A-Z0-9])?(?:\.[A-Z0-9](?:[A-Z0-9-]{0,61}[A-Z0-9])?)+$", re.IGNORECASE)
OWNER_SETUP_TOKEN_COOKIE = "nibrexo_owner_setup"
OWNER_SETUP_TOKEN_TTL_SECONDS = 600
OWNER_SETUP_RATE_WINDOW_SECONDS = 600
OWNER_SETUP_MAX_FAILURES = 5
OWNER_SETUP_ATTEMPTS = {}
# Development setup is normally protected by a double-submit HttpOnly cookie. The
# short-lived server record below is a fallback for embedded development previews
# whose browser context refuses to persist that cookie. It stores token hashes only.
OWNER_SETUP_ISSUED_TOKENS = {}

# Same-origin restrictive policy for every response. The frontend has no inline
# scripts, no inline styles, no third-party assets, no frames, and no workers,
# so no unsafe-inline/unsafe-eval is required. img-src permits https: images and
# data: URIs used by the application UI.
CSP_POLICY = (
    "default-src 'self'; "
    "base-uri 'self'; "
    "connect-src 'self'; "
    "font-src 'self'; "
    "form-action 'self'; "
    "frame-src 'none'; "
    "frame-ancestors 'self'; "
    "img-src 'self' data: https:; "
    "media-src 'self'; "
    "object-src 'none'; "
    "script-src 'self'; "
    "style-src 'self'"
)
PERMISSIONS_POLICY = "accelerometer=(), camera=(), geolocation=(), gyroscope=(), magnetometer=(), microphone=(), payment=(), usb=()"
HSTS_MAX_AGE = "max-age=31536000"


def now_iso():
    return datetime.now(timezone.utc).isoformat()


def parse_iso(value):
    try:
        return datetime.fromisoformat(value)
    except (TypeError, ValueError):
        return None


def new_id(prefix):
    return f"{prefix}_{uuid.uuid4().hex}"


def token_hash(token):
    return hashlib.sha256(token.encode("utf-8")).hexdigest()


def request_uses_https_proxy():
    """Recognize TLS terminated by the development-preview proxy without trusting URL input."""
    forwarded = request.headers.get("Forwarded", "")
    for item in forwarded.split(";"):
        if item.strip().lower() == "proto=https":
            return True
    for header in ("X-Forwarded-Proto", "X-Forwarded-Scheme"):
        value = request.headers.get(header, "").split(",", 1)[0].strip().lower()
        if value == "https":
            return True
    return request.is_secure


def request_uses_embedded_development_preview():
    """Recognize the sandbox's externally proxied browser traffic when forwarding headers are absent."""
    if os.environ.get("E2B_SANDBOX") != "true":
        return False
    host = request.host.split(":", 1)[0].lower()
    remote = request.remote_addr or ""
    return host.endswith(".e2b.app") or remote not in {"127.0.0.1", "::1", "localhost"}


def session_cookie_options():
    """Keep normal sessions Lax; use a partitioned secure cookie only in the HTTPS development preview."""
    configured_secure = os.environ.get("NIBREXO_COOKIE_SECURE", "false").lower() == "true"
    preview_cross_site = (
        os.environ.get("NIBREXO_ENV") != "production"
        and not configured_secure
        and (request_uses_https_proxy() or request_uses_embedded_development_preview())
    )
    return {
        "secure": configured_secure or preview_cross_site,
        "samesite": "None" if preview_cross_site else "Lax",
        # The embedded preview browser did not return a CHIPS-partitioned cookie
        # after a real same-origin login. Use the standard secure cross-site cookie
        # transport in development preview; production retains its existing Lax policy.
        "partitioned": False,
    }


def json_error(message, status=400):
    return jsonify({"ok": False, "error": {"message": message}}), status


def payload():
    data = request.get_json(silent=True)
    if not isinstance(data, dict):
        return {}
    return data


def safe_user(row):
    return {
        "id": row["id"],
        "name": row["name"],
        "email": row["email"],
        "role": row["role"],
        "status": row["status"],
        "createdAt": row["created_at"],
    }


def row_dict(row):
    return dict(row) if row else None


def social_contact_defaults():
    return [
        {
            "platform": platform,
            "label": label,
            "value": "",
            "enabled": False,
            "displayOrder": order,
        }
        for platform, label, order in SOCIAL_CONTACT_PLATFORMS
    ]


def normalize_https_url(value):
    candidate = str(value or "").strip()
    if not candidate or len(candidate) > 2048 or any(ord(char) < 32 or char.isspace() for char in candidate):
        raise ValueError("Enter a valid HTTPS URL.")
    parsed = urlsplit(candidate)
    hostname = parsed.hostname or ""
    try:
        port = parsed.port
    except ValueError:
        raise ValueError("Enter a valid HTTPS URL.")
    if (
        parsed.scheme.lower() != "https"
        or not hostname
        or parsed.username
        or parsed.password
        or not re.fullmatch(r"[A-Za-z0-9.-]+", hostname)
        or hostname.startswith((".", "-"))
        or hostname.endswith((".", "-"))
        or ".." in hostname
        or (port is not None and not 1 <= port <= 65535)
    ):
        raise ValueError("Enter a valid HTTPS URL.")
    return urlunsplit(("https", parsed.netloc, parsed.path, parsed.query, parsed.fragment))


def normalize_whatsapp_url(value):
    candidate = normalize_https_url(value)
    parsed = urlsplit(candidate)
    hostname = (parsed.hostname or "").lower().rstrip(".")
    if hostname == "wa.me":
        number = parsed.path.strip("/")
        if not re.fullmatch(r"[1-9]\d{5,14}", number) or parsed.query or parsed.fragment:
            raise ValueError("Enter a valid WhatsApp contact URL.")
        return candidate
    if hostname == "api.whatsapp.com" and parsed.path.rstrip("/") == "/send":
        phone_values = parse_qs(parsed.query).get("phone", [])
        if len(phone_values) != 1 or not re.fullmatch(r"[1-9]\d{5,14}", phone_values[0]):
            raise ValueError("Enter a valid WhatsApp contact URL.")
        return candidate
    raise ValueError("Enter a valid WhatsApp contact URL.")


def normalize_email_address(value):
    candidate = str(value or "").strip().lower()
    if len(candidate) > 254 or not EMAIL_RE.fullmatch(candidate):
        raise ValueError("Enter a valid email address.")
    return candidate


def normalize_social_contact_links(data):
    links = data.get("links") if isinstance(data, dict) else None
    if not isinstance(links, list) or len(links) > len(SOCIAL_CONTACT_PLATFORMS):
        raise ValueError("Social/contact links must be a valid list.")
    provided = {}
    for item in links:
        if not isinstance(item, dict):
            raise ValueError("Each social/contact link must be valid.")
        platform = str(item.get("platform", "")).strip().lower()
        if platform not in SOCIAL_CONTACT_PLATFORM_MAP or platform in provided:
            raise ValueError("Select a valid social/contact platform once.")
        enabled = item.get("enabled", False)
        if not isinstance(enabled, bool):
            raise ValueError("Enabled must be true or false.")
        display_order = item.get("displayOrder", SOCIAL_CONTACT_PLATFORM_MAP[platform]["displayOrder"])
        if isinstance(display_order, bool) or not isinstance(display_order, int) or not 0 <= display_order <= 999:
            raise ValueError("Display order must be a whole number between 0 and 999.")
        raw_value = str(item.get("value", "")).strip()
        if not raw_value:
            normalized_value = ""
            enabled = False
        elif platform == "email":
            normalized_value = normalize_email_address(raw_value)
        elif platform == "whatsapp":
            normalized_value = normalize_whatsapp_url(raw_value)
        else:
            normalized_value = normalize_https_url(raw_value)
        provided[platform] = {
            "platform": platform,
            "label": SOCIAL_CONTACT_PLATFORM_MAP[platform]["label"],
            "value": normalized_value,
            "enabled": enabled,
            "displayOrder": display_order,
        }
    return [provided.get(default["platform"], default) for default in social_contact_defaults()]


def load_social_contact_links(db):
    row = db.execute("SELECT value_json FROM site_settings WHERE setting_key = ?", (SOCIAL_CONTACT_SETTINGS_KEY,)).fetchone()
    if not row:
        return social_contact_defaults()
    try:
        return normalize_social_contact_links({"links": json.loads(row["value_json"])})
    except (TypeError, ValueError, json.JSONDecodeError):
        return social_contact_defaults()


def public_social_contact_links(links):
    public_links = []
    for link in links:
        if not link["enabled"] or not link["value"]:
            continue
        href = f"mailto:{quote(link['value'], safe='@._+-')}" if link["platform"] == "email" else link["value"]
        public_links.append({
            "platform": link["platform"],
            "label": link["label"],
            "href": href,
            "displayOrder": link["displayOrder"],
        })
    return sorted(public_links, key=lambda item: (item["displayOrder"], item["platform"]))


def current_user():
    raw_token = request.cookies.get(COOKIE_NAME)
    if not raw_token:
        return None
    hashed = token_hash(raw_token)
    with get_db() as db:
        row = db.execute(
            """
            SELECT users.* FROM sessions
            JOIN users ON users.id = sessions.user_id
            WHERE sessions.token_hash = ? AND sessions.revoked_at IS NULL
            """,
            (hashed,),
        ).fetchone()
        if not row:
            return None
        expiry = parse_iso(
            db.execute("SELECT expires_at FROM sessions WHERE token_hash = ?", (hashed,)).fetchone()["expires_at"]
        )
        if not expiry or expiry < datetime.now(timezone.utc):
            db.execute("UPDATE sessions SET revoked_at = ? WHERE token_hash = ?", (now_iso(), hashed))
            db.commit()
            return None
        if row["status"] != "active":
            return None
        return row


def require_auth(handler):
    @wraps(handler)
    def wrapped(*args, **kwargs):
        user = current_user()
        if not user:
            return json_error("Authentication required.", 401)
        return handler(user, *args, **kwargs)
    return wrapped


def require_roles(*roles):
    def decorator(handler):
        @wraps(handler)
        def wrapped(user, *args, **kwargs):
            if user["role"] not in roles:
                return json_error("Administrator access is required.", 403)
            return handler(user, *args, **kwargs)
        return wrapped
    return decorator


def create_password_reset_token(db, user_id):
    token = secrets.token_urlsafe(48)
    expiry = datetime.now(timezone.utc) + timedelta(minutes=int(os.environ.get("NIBREXO_RESET_TOKEN_MINUTES", "30")))
    db.execute("INSERT INTO password_resets (id, token_hash, user_id, expires_at, created_at) VALUES (?, ?, ?, ?, ?)", (new_id("reset"), token_hash(token), user_id, expiry.isoformat(), now_iso()))
    return token


def new_order_reference():
    return f"ORD-{secrets.token_hex(8).upper()}"


def new_license_key():
    # Secure random server-side key. Store only its hash in the database.
    return f"LIC-{secrets.token_urlsafe(24)}"


def finalize_verified_payment(db, order_id, provider, payment_reference, provider_event_id):
    """Idempotent payment finalization. Call only after a provider verifies an event server-side."""
    existing_event = db.execute("SELECT id FROM payment_events WHERE provider = ? AND provider_event_id = ?", (provider, provider_event_id)).fetchone()
    if existing_event:
        return False
    order = db.execute("SELECT * FROM orders WHERE id = ?", (order_id,)).fetchone()
    if not order:
        raise ValueError("Order not found.")
    timestamp = now_iso()
    db.execute("INSERT INTO payment_events (id, provider, provider_event_id, order_id, status, created_at) VALUES (?, ?, ?, ?, 'verified', ?)", (new_id("payment_event"), provider, provider_event_id, order_id, timestamp))
    if order["payment_status"] == "paid":
        return False
    db.execute("UPDATE orders SET payment_status = 'paid', order_status = 'completed', payment_reference = ?, updated_at = ? WHERE id = ?", (payment_reference, timestamp, order_id))
    items = db.execute("SELECT * FROM order_items WHERE order_id = ?", (order_id,)).fetchall()
    vault = get_license_vault()
    license_status = "active" if vault.configured else "pending"
    for item in items:
        license_id = new_id("license")
        key_hash = None
        key_ciphertext = None
        key_version = None
        try:
            issued_key = vault.issue()
            key_hash = issued_key["hash"]
            key_ciphertext = issued_key["ciphertext"]
            key_version = issued_key["version"]
        except LicenseVaultUnavailable:
            db.execute("INSERT INTO provider_usage_logs (id, provider, operation, status, safe_summary, created_at) VALUES (?, 'license_vault', 'issue_license', 'blocked', 'License encryption is not configured.', ?)", (new_id("provider_log"), timestamp))
        db.execute("INSERT INTO licenses (id, user_id, order_id, product_id, license_type, key_hash, key_ciphertext, key_version, status, issued_at, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)", (license_id, order["user_id"], order_id, item["product_id"], "standard", key_hash, key_ciphertext, key_version, license_status, timestamp if license_status == "active" else None, timestamp))
        if license_status != "active":
            continue
        product_files = db.execute("SELECT * FROM product_files WHERE product_id = ? AND status = 'available'", (item["product_id"],)).fetchall()
        for product_file in product_files:
            db.execute("INSERT INTO downloads (id, user_id, order_id, product_id, version, storage_key, availability, created_at) VALUES (?, ?, ?, ?, ?, ?, 'available', ?)", (new_id("download"), order["user_id"], order_id, item["product_id"], product_file["version"], product_file["storage_key"], timestamp))
    event_key = f"order.paid:{provider}:{provider_event_id}"
    db.execute("INSERT OR IGNORE INTO integration_events (id, event_type, actor_user_id, payload_json, idempotency_key, status, created_at) VALUES (?, 'order.paid', ?, ?, ?, 'recorded', ?)", (new_id("event"), order["user_id"], json.dumps({"orderId": order_id, "reference": order["reference"]}), event_key, timestamp))
    db.execute("INSERT OR IGNORE INTO analytics_events (id, event_type, user_id, order_id, payload_json, idempotency_key, created_at) VALUES (?, 'purchase_completed', ?, ?, ?, ?, ?)", (new_id("analytics"), order["user_id"], order_id, json.dumps({"orderReference": order["reference"]}), f"purchase_completed:{provider}:{provider_event_id}", timestamp))
    return True


def create_session_response(user, status=200, redirect_to=None):
    token = secrets.token_urlsafe(48)
    expiry = datetime.now(timezone.utc) + timedelta(days=int(os.environ.get("NIBREXO_SESSION_DAYS", "7")))
    with get_db() as db:
        db.execute(
            "INSERT INTO sessions (id, token_hash, user_id, expires_at, created_at) VALUES (?, ?, ?, ?, ?)",
            (new_id("session"), token_hash(token), user["id"], expiry.isoformat(), now_iso()),
        )
        db.commit()
    response = redirect(redirect_to, code=status) if redirect_to else make_response(jsonify({"ok": True, "data": {"user": safe_user(user)}}), status)
    cookie_options = session_cookie_options()
    response.set_cookie(
        COOKIE_NAME,
        token,
        httponly=True,
        secure=cookie_options["secure"],
        samesite=cookie_options["samesite"],
        partitioned=cookie_options["partitioned"],
        max_age=int((expiry - datetime.now(timezone.utc)).total_seconds()),
        path="/",
    )
    return response


def log_activity(db, user_id, action, module, target=None, status="success"):
    db.execute(
        "INSERT INTO activity_logs (id, user_id, action, module, target, status, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)",
        (new_id("activity"), user_id, action, module, target, status, now_iso()),
    )


def validate_product(data, db):
    title = str(data.get("title", "")).strip()
    slug = str(data.get("slug", "")).strip().lower()
    if not title or not slug or not SLUG_RE.match(slug):
        return None, "Product title and a valid slug are required."
    price = data.get("priceCents")
    if price not in (None, ""):
        try:
            price = int(price)
            if price < 0:
                raise ValueError
        except (TypeError, ValueError):
            return None, "Price must be a non-negative amount."
    else:
        price = None
    category_id = data.get("categoryId") or None
    if category_id and not db.execute("SELECT 1 FROM categories WHERE id = ?", (category_id,)).fetchone():
        return None, "Select a valid category."
    status = data.get("status", "draft")
    if status not in {"draft", "published", "archived"}:
        return None, "Select a valid product status."
    return {
        "title": title,
        "slug": slug,
        "short_description": str(data.get("shortDescription", "")).strip() or None,
        "description": str(data.get("description", "")).strip() or None,
        "price_cents": price,
        "currency": str(data.get("currency", "")).strip() or None,
        "category_id": category_id,
        "status": status,
        "thumbnail": str(data.get("thumbnail", "")).strip() or None,
        "featured": 1 if bool(data.get("featured", False)) else 0,
        "metadata_json": json.dumps(data.get("metadata", {})) if isinstance(data.get("metadata", {}), dict) else None,
        "license_reference": "legal/digital-product-license-agreement.html", 
        "refund_reference": "legal/refund-policy.html",
    }, None


def serialize_product(row):
    data = row_dict(row)
    if not data:
        return None
    return {
        "id": data["id"],
        "slug": data["slug"],
        "name": data["title"],
        "shortDescription": data["short_description"],
        "fullDescription": data["description"],
        "priceCents": data["price_cents"],
        "priceLabel": f"{data['currency']} {data['price_cents'] / 100:.2f}" if data["price_cents"] is not None and data["currency"] else None,
        "currency": data["currency"],
        "categoryId": data.get("category_id"),
        "category": data.get("category_name"),
        "image": data["thumbnail"],
        "featured": bool(data.get("featured", 0)),
        "metadata": data.get("metadata_json"),
        "availability": "available" if data["status"] == "published" else "pending",
        "purchaseState": "available" if data["status"] == "published" and data["price_cents"] is not None else "unavailable",
        "licenseReference": data["license_reference"],
        "refundReference": data["refund_reference"],
        "status": data["status"],
        "createdAt": data["created_at"],
        "updatedAt": data["updated_at"],
    }


def owner_setup_allowed():
    """Development-only bootstrap guard. It closes permanently after the first Owner exists."""
    if (
        os.environ.get("NIBREXO_ENV") == "production"
        or os.environ.get("NIBREXO_API_ONLY", "false").lower() == "true"
    ):
        return False
    with get_db() as db:
        return not db.execute("SELECT 1 FROM users WHERE role = 'owner' LIMIT 1").fetchone()


def owner_setup_client_key():
    return request.remote_addr or "unknown"


def owner_setup_is_rate_limited():
    now = time.monotonic()
    key = owner_setup_client_key()
    attempts = [stamp for stamp in OWNER_SETUP_ATTEMPTS.get(key, []) if now - stamp < OWNER_SETUP_RATE_WINDOW_SECONDS]
    OWNER_SETUP_ATTEMPTS[key] = attempts
    return len(attempts) >= OWNER_SETUP_MAX_FAILURES


def record_owner_setup_failure():
    OWNER_SETUP_ATTEMPTS.setdefault(owner_setup_client_key(), []).append(time.monotonic())


def clear_owner_setup_failures():
    OWNER_SETUP_ATTEMPTS.pop(owner_setup_client_key(), None)


def owner_setup_request_context():
    """A privacy-preserving, request-bound context for the development fallback."""
    user_agent = request.headers.get("User-Agent", "")
    return {
        "client_key": owner_setup_client_key(),
        "user_agent_hash": hashlib.sha256(user_agent.encode("utf-8")).hexdigest(),
    }


def purge_expired_owner_setup_tokens():
    now = time.monotonic()
    for digest, record in list(OWNER_SETUP_ISSUED_TOKENS.items()):
        if now - record["issued_at"] >= OWNER_SETUP_TOKEN_TTL_SECONDS:
            OWNER_SETUP_ISSUED_TOKENS.pop(digest, None)


def issue_owner_setup_token():
    """Issue one current, short-lived bootstrap token without retaining its plaintext."""
    purge_expired_owner_setup_tokens()
    context = owner_setup_request_context()
    # A fresh setup page supersedes an earlier page from the same browser context.
    # This prevents a cached or back/forward-restored form from retaining a valid token.
    for existing_digest, record in list(OWNER_SETUP_ISSUED_TOKENS.items()):
        if (
            hmac.compare_digest(context["client_key"], record["client_key"])
            and hmac.compare_digest(context["user_agent_hash"], record["user_agent_hash"])
        ):
            OWNER_SETUP_ISSUED_TOKENS.pop(existing_digest, None)
    token = secrets.token_urlsafe(32)
    digest = token_hash(token)
    OWNER_SETUP_ISSUED_TOKENS[digest] = {
        "token_hash": digest,
        "issued_at": time.monotonic(),
        "client_key": context["client_key"],
        "user_agent_hash": context["user_agent_hash"],
    }
    return token


def owner_setup_issued_token_matches_request(token):
    """Verify the token was issued by this development process for this browser context."""
    if not token:
        return False
    purge_expired_owner_setup_tokens()
    digest = token_hash(token)
    record = OWNER_SETUP_ISSUED_TOKENS.get(digest)
    if not record:
        return False
    context = owner_setup_request_context()
    return (
        hmac.compare_digest(digest, record["token_hash"])
        and hmac.compare_digest(context["client_key"], record["client_key"])
        and hmac.compare_digest(context["user_agent_hash"], record["user_agent_hash"])
    )


def consume_owner_setup_token(token):
    if token:
        OWNER_SETUP_ISSUED_TOKENS.pop(token_hash(token), None)


def owner_setup_expected_hosts():
    """Accept the direct host and the public host preserved by a development proxy."""
    hosts = {request.host.lower()}
    for header in ("X-Forwarded-Host", "X-Original-Host"):
        forwarded_host = request.headers.get(header, "").split(",", 1)[0].strip().lower()
        if forwarded_host:
            hosts.add(forwarded_host)
    return hosts


def owner_setup_url_matches_request_host(value):
    try:
        parsed = urlsplit(value)
    except (TypeError, ValueError):
        return False
    if parsed.scheme not in {"http", "https"} or not parsed.netloc or parsed.username or parsed.password:
        return False
    request_hosts = owner_setup_expected_hosts()
    candidate = parsed.netloc.lower()
    return any(hmac.compare_digest(candidate, expected) for expected in request_hosts)


def owner_setup_submission_origin_is_trusted():
    """Reject a supplied cross-origin submission; tolerate opaque preview origins."""
    origin = request.headers.get("Origin", "").strip()
    referer = request.headers.get("Referer", "").strip()
    if origin and origin.lower() != "null" and not owner_setup_url_matches_request_host(origin):
        return False
    if referer and not owner_setup_url_matches_request_host(referer):
        return False
    return True


def owner_setup_form_html(token, error_message="", email="", name=""):
    error_html = f'<p class="form-status is-visible is-error">{escape(error_message)}</p>' if error_message else '<p class="form-status" aria-live="polite"></p>'
    return (
        '<!doctype html><html lang="en"><head><meta charset="UTF-8" />'
        '<meta name="viewport" content="width=device-width, initial-scale=1.0" />'
        '<meta name="robots" content="noindex, nofollow" /><meta name="theme-color" content="#FFFFFF" />'
        '<title>Owner Setup — Nibrexo</title><link rel="icon" type="image/png" href="/assets/favicon.png" />'
        '<link rel="stylesheet" href="/css/account.css" /></head><body>'
        '<main class="auth-page" id="main-content"><div class="account-container"><div class="auth-layout">'
        '<section class="auth-form-panel"><p class="eyebrow"><span class="eyebrow-line"></span>Development Bootstrap</p>'
        '<h1>Create First Owner</h1><p>This development-only setup is available only while no Owner account exists. '
        'Production deployment must use secure operator provisioning.</p>'
        '<form class="account-form" method="post" action="/setup/owner" novalidate>'
        f'<input type="hidden" name="_setup_token" value="{escape(token)}" />'
        f'<div class="form-field"><label for="owner-name">Founder name</label><input id="owner-name" name="name" type="text" autocomplete="name" value="{escape(name)}" required /></div>'
        f'<div class="form-field"><label for="owner-email">Founder email</label><input id="owner-email" name="email" type="email" autocomplete="email" value="{escape(email)}" required /></div>'
        '<div class="form-field password-field"><label for="owner-password">Founder password</label>'
        '<input id="owner-password" name="password" type="password" autocomplete="new-password" required />'
        '<p class="password-requirement">Use at least 8 characters.</p></div>'
        '<div class="form-field password-field"><label for="owner-confirm-password">Confirm Founder password</label>'
        '<input id="owner-confirm-password" name="confirm_password" type="password" autocomplete="new-password" required /></div>'
        '<button class="button button--primary" type="submit">Create Owner Account</button>'
        f'{error_html}</form></section><aside class="auth-context"><h2>One-time local setup.</h2>'
        '<p>After creation this route is disabled. Use the normal login flow for Admin access.</p>'
        '<div class="auth-context__visual" aria-hidden="true"></div></aside></div></div></main></body></html>'
    )


def render_owner_setup_form(token, error_message=None, email="", name="", status=200):
    response = make_response(owner_setup_form_html(token, error_message or "", email, name), status)
    # The token-bearing page must never be reused from a browser or proxy cache.
    response.headers["Cache-Control"] = "private, no-store, max-age=0"
    response.headers["Pragma"] = "no-cache"
    response.headers["Expires"] = "0"
    response.headers["Vary"] = "Cookie"
    response.set_cookie(
        OWNER_SETUP_TOKEN_COOKIE,
        token,
        httponly=True,
        secure=os.environ.get("NIBREXO_COOKIE_SECURE", "false").lower() == "true",
        samesite="Strict",
        max_age=OWNER_SETUP_TOKEN_TTL_SECONDS,
        path="/setup/owner",
    )
    return response


def create_development_owner(email, name, password, confirmation):
    normalized_email = str(email or "").strip().lower()
    normalized_name = str(name or "").strip()
    if not normalized_name or not EMAIL_RE.fullmatch(normalized_email):
        raise ValueError("Enter a valid Founder name and email address.")
    if len(password or "") < PASSWORD_MIN_LENGTH:
        raise ValueError("Password must contain at least 8 characters.")
    if password != confirmation:
        raise ValueError("Passwords do not match.")
    timestamp = now_iso()
    with get_db() as db:
        db.begin_write()
        if db.execute("SELECT 1 FROM users WHERE role = 'owner' LIMIT 1").fetchone():
            raise RuntimeError("Owner setup is no longer available.")
        if db.execute("SELECT 1 FROM users WHERE email = ?", (normalized_email,)).fetchone():
            raise ValueError("An account with this email already exists.")
        user = {
            "id": new_id("user"),
            "name": normalized_name,
            "email": normalized_email,
            "role": "owner",
            "status": "active",
            "created_at": timestamp,
        }
        db.execute(
            "INSERT INTO users (id, name, email, password_hash, role, status, created_at, updated_at) VALUES (?, ?, ?, ?, 'owner', 'active', ?, ?)",
            (user["id"], user["name"], user["email"], generate_password_hash(password), timestamp, timestamp),
        )
        db.execute(
            "INSERT INTO team_members (id, user_id, role, status, created_at) VALUES (?, ?, 'owner', 'active', ?)",
            (new_id("team"), user["id"], timestamp),
        )
        log_activity(db, user["id"], "First Owner account provisioned", "authentication", user["id"])
        db.commit()
    return user


def create_app(test_config=None):
    if not test_config:
        validate_production_environment()
        if os.environ.get("NIBREXO_ENV") == "production":
            # Refuse startup when migrations are pending; do not apply them implicitly.
            from migrations import migration_status
            if any(not item["applied"] for item in migration_status()):
                raise RuntimeError("Pending database migrations. Run the migration command before application startup.")
    configured_secret = os.environ.get("FLASK_SECRET_KEY")
    app = Flask(__name__)
    app.config.update(
        SECRET_KEY=configured_secret or "development-only-change-this",
        MAX_CONTENT_LENGTH=2 * 1024 * 1024,
    )
    if test_config:
        app.config.update(test_config)

    @app.errorhandler(HTTPException)
    def controlled_http_error(error):
        if request.path.startswith("/api/"):
            messages = {
                400: "Invalid request.",
                401: "Authentication required.",
                403: "Access is not permitted.",
                404: "Not found.",
                405: "Method not allowed.",
                413: "Request is too large.",
            }
            return json_error(messages.get(error.code, "Request could not be completed."), error.code or 500)
        return error

    @app.errorhandler(Exception)
    def controlled_unexpected_error(_error):
        # Never return exception text, paths, environment values, or provider details to clients.
        if request.path.startswith("/api/") or os.environ.get("NIBREXO_API_ONLY", "false").lower() == "true":
            return json_error("The service is temporarily unavailable.", 500)
        return send_from_directory(FRONTEND_DIR, "404.html"), 500

    @app.after_request
    def security_headers(response):
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "SAMEORIGIN"
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
        response.headers["Permissions-Policy"] = PERMISSIONS_POLICY
        response.headers["Content-Security-Policy"] = CSP_POLICY
        # HSTS is issued only for production deployments reached over externally
        # terminated HTTPS. It is never sent for development HTTP.
        if os.environ.get("NIBREXO_ENV") == "production" and (
            request.is_secure
            or request.headers.get("X-Forwarded-Proto", "").split(",", 1)[0].strip().lower() == "https"
        ):
            response.headers["Strict-Transport-Security"] = HSTS_MAX_AGE
        return response

    @app.get("/api/health")
    def health():
        try:
            with get_db() as db:
                db.execute("SELECT 1").fetchone()
        except DatabaseError:
            return jsonify({"ok": False, "data": {"application": "healthy", "database": "unavailable"}}), 503
        return jsonify({"ok": True, "data": {"application": "healthy", "database": "ready"}})

    @app.route("/setup/owner", methods=["GET", "POST"])
    def setup_first_owner():
        if not owner_setup_allowed():
            return send_from_directory(FRONTEND_DIR, "404.html"), 404
        if request.method == "GET":
            return render_owner_setup_form(issue_owner_setup_token())
        if owner_setup_is_rate_limited():
            return render_owner_setup_form(issue_owner_setup_token(), "Too many setup attempts. Try again later.", status=429)

        form_token = str(request.form.get("_setup_token", ""))
        cookie_token = request.cookies.get(OWNER_SETUP_TOKEN_COOKIE, "")
        cookie_verified = bool(form_token and cookie_token and hmac.compare_digest(form_token, cookie_token))
        # Retain the original double-submit cookie protection. Every successful
        # request must also present a short-lived token issued by this process.
        # If an embedded development preview declines the HttpOnly cookie, the
        # server-issued token remains bound to the same browser context and must
        # be accompanied by a non-conflicting same-origin/referrer check.
        issued_token_verified = owner_setup_issued_token_matches_request(form_token)
        bootstrap_verified = issued_token_verified and (
            cookie_verified or owner_setup_submission_origin_is_trusted()
        )
        if not bootstrap_verified:
            record_owner_setup_failure()
            return render_owner_setup_form(
                issue_owner_setup_token(),
                "Setup request could not be verified.",
                status=400,
            )

        email = request.form.get("email", "")
        name = request.form.get("name", "")
        password = request.form.get("password", "")
        confirmation = request.form.get("confirm_password", "")
        try:
            user = create_development_owner(email, name, password, confirmation)
        except RuntimeError:
            return send_from_directory(FRONTEND_DIR, "404.html"), 404
        except ValueError as exc:
            record_owner_setup_failure()
            return render_owner_setup_form(form_token, str(exc), email=email, name=name, status=422)

        consume_owner_setup_token(form_token)
        clear_owner_setup_failures()
        response = create_session_response(user, status=303, redirect_to="/admin/index.html")
        response.headers["Cache-Control"] = "no-store"
        response.delete_cookie(OWNER_SETUP_TOKEN_COOKIE, path="/setup/owner")
        return response

    @app.get("/api/settings/social-links")
    def public_social_links_settings():
        with get_db() as db:
            links = public_social_contact_links(load_social_contact_links(db))
        return jsonify({"ok": True, "data": {"links": links}})

    @app.post("/api/auth/register")
    def register():
        form_submission = not request.is_json and bool(request.form)
        data = request.form if form_submission else payload()
        name = str(data.get("name", "")).strip()
        email = str(data.get("email", "")).strip().lower()
        password = str(data.get("password", ""))
        if not name or not email or "@" not in email or len(password) < PASSWORD_MIN_LENGTH:
            if form_submission:
                return redirect("/account/register.html", code=303)
            return json_error("Unable to create account with these details.", 422)
        timestamp = now_iso()
        user = {
            "id": new_id("user"),
            "name": name,
            "email": email,
            "role": "customer",
            "status": "active",
            "created_at": timestamp,
        }
        try:
            with get_db() as db:
                db.execute(
                    "INSERT INTO users (id, name, email, password_hash, role, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
                    (user["id"], name, email, generate_password_hash(password), "customer", "active", timestamp, timestamp),
                )
                db.commit()
        except IntegrityError:
            if form_submission:
                return redirect("/account/register.html", code=303)
            return json_error("Unable to create account with these details.", 409)
        event_id = emit_event("customer.registered", {"userId": user["id"]}, actor_user_id=user["id"], idempotency_key=f"customer.registered:{user['id']}")
        if event_id:
            queue_workflows_for_event(event_id, "customer.registered")
        if form_submission:
            return create_session_response(user, status=303, redirect_to="/account/dashboard.html")
        return create_session_response(user, 201)

    @app.post("/api/auth/login")
    def login():
        form_submission = not request.is_json and bool(request.form)
        data = request.form if form_submission else payload()
        email = str(data.get("email", "")).strip().lower()
        password = str(data.get("password", ""))
        attempt_key = login_attempt_key(email, canonical_client_ip(request))
        with get_db() as db:
            db.begin_write()
            if is_login_rate_limited(db, attempt_key):
                db.commit()
                return json_error("Too many login attempts. Try again later.", 429)
            user = db.execute("SELECT * FROM users WHERE email = ?", (email,)).fetchone()
            password_hash = user["password_hash"] if user else DUMMY_PASSWORD_HASH
            password_valid = check_password_hash(password_hash, password)
            if not user or user["status"] != "active" or not password_valid:
                record_login_failure(db, attempt_key)
                db.commit()
                if form_submission:
                    return redirect("/account/login.html", code=303)
                return json_error("Invalid email or password.", 401)
            clear_login_failures(db, attempt_key)
            db.commit()
        if form_submission:
            destination = "/admin/index.html" if user["role"] in ADMIN_ROLES else "/account/dashboard.html"
            return create_session_response(user, status=303, redirect_to=destination)
        return create_session_response(user)

    @app.post("/api/auth/logout")
    def logout():
        token = request.cookies.get(COOKIE_NAME)
        if token:
            with get_db() as db:
                db.execute("UPDATE sessions SET revoked_at = ? WHERE token_hash = ?", (now_iso(), token_hash(token)))
                db.commit()
        response = make_response(jsonify({"ok": True, "data": {"loggedOut": True}}))
        cookie_options = session_cookie_options()
        response.delete_cookie(
            COOKIE_NAME,
            path="/",
            secure=cookie_options["secure"],
            samesite=cookie_options["samesite"],
            partitioned=cookie_options["partitioned"],
        )
        return response

    @app.get("/api/auth/me")
    @require_auth
    def me(user):
        return jsonify({"ok": True, "data": {"user": safe_user(user)}})

    @app.post("/api/auth/forgot-password")
    def forgot_password():
        data = payload()
        email = str(data.get("email", "")).strip().lower()
        if not email or "@" not in email:
            return json_error("Enter a valid email address.", 422)
        provider = get_email_provider()
        if not provider.configured:
            return json_error("Password reset email service is not configured. No reset email was sent.", 503)
        with get_db() as db:
            user = db.execute("SELECT * FROM users WHERE email = ? AND status = 'active'", (email,)).fetchone()
            if not user:
                # Generic response prevents account enumeration once delivery is configured.
                return jsonify({"ok": True, "data": {"accepted": True}}), 202
            token = create_password_reset_token(db, user["id"])
            try:
                provider.send_email("account.password_reset", user["email"], "account.password_reset", {"token": token, "name": user["name"]})
            except ProviderUnavailable as exc:
                db.execute("UPDATE password_resets SET used_at = ? WHERE token_hash = ?", (now_iso(), token_hash(token)))
                db.commit()
                return json_error(str(exc), 503)
            db.commit()
        return jsonify({"ok": True, "data": {"accepted": True}}), 202

    @app.post("/api/auth/reset-password")
    def reset_password():
        data = payload()
        token = str(data.get("token", ""))
        password = str(data.get("password", ""))
        if not token or len(password) < PASSWORD_MIN_LENGTH:
            return json_error("Unable to reset password with these details.", 422)
        with get_db() as db:
            reset = db.execute(
                "SELECT * FROM password_resets WHERE token_hash = ? AND used_at IS NULL", (token_hash(token),)
            ).fetchone()
            if not reset or not parse_iso(reset["expires_at"]) or parse_iso(reset["expires_at"]) < datetime.now(timezone.utc):
                return json_error("Unable to reset password with these details.", 400)
            db.execute("UPDATE users SET password_hash = ?, updated_at = ? WHERE id = ?", (generate_password_hash(password), now_iso(), reset["user_id"]))
            db.execute("UPDATE password_resets SET used_at = ? WHERE id = ?", (now_iso(), reset["id"]))
            db.execute("UPDATE sessions SET revoked_at = ? WHERE user_id = ? AND revoked_at IS NULL", (now_iso(), reset["user_id"]))
            db.commit()
        return jsonify({"ok": True, "data": {"passwordReset": True}})

    @app.get("/api/products")
    def public_products():
        with get_db() as db:
            rows = db.execute(
                "SELECT products.*, categories.name AS category_name FROM products LEFT JOIN categories ON categories.id = products.category_id WHERE products.status = 'published' ORDER BY products.created_at DESC"
            ).fetchall()
        return jsonify({"ok": True, "data": {"products": [serialize_product(row) for row in rows]}})

    @app.get("/api/products/<slug>")
    def public_product(slug):
        with get_db() as db:
            row = db.execute(
                "SELECT products.*, categories.name AS category_name FROM products LEFT JOIN categories ON categories.id = products.category_id WHERE products.slug = ? AND products.status = 'published'",
                (slug,),
            ).fetchone()
        if not row:
            return json_error("Product not found.", 404)
        return jsonify({"ok": True, "data": {"product": serialize_product(row)}})

    @app.get("/api/categories")
    def public_categories():
        with get_db() as db:
            rows = db.execute("SELECT id, name, slug, description FROM categories WHERE status = 'published' ORDER BY name ASC").fetchall()
        return jsonify({"ok": True, "data": {"categories": [row_dict(row) for row in rows]}})

    @app.post("/api/checkout")
    @require_auth
    def create_checkout(user):
        data = payload()
        items = data.get("items")
        idempotency_key = request.headers.get("Idempotency-Key") or str(data.get("idempotencyKey", "")).strip() or secrets.token_urlsafe(24)
        if not isinstance(items, list) or not items:
            return json_error("Add at least one published product before checkout.", 422)
        if data.get("couponCode"):
            return json_error("Coupon validation is not configured.", 503)
        with get_db() as db:
            existing = db.execute("SELECT * FROM orders WHERE user_id = ? AND checkout_idempotency_key = ?", (user["id"], idempotency_key)).fetchone()
            if existing:
                existing_order = {
                    "id": existing["id"], "reference": existing["reference"],
                    "subtotalCents": existing["subtotal_cents"], "discountCents": existing["discount_cents"],
                    "totalCents": existing["total_cents"], "currency": existing["currency"],
                    "paymentStatus": existing["payment_status"], "orderStatus": existing["order_status"],
                }
                return jsonify({"ok": True, "data": {"order": existing_order, "payment": {"state": "unavailable", "message": "Payment provider is not connected."}}})
            validated_items = []
            currency = None
            subtotal = 0
            for item in items:
                product_id = str(item.get("productId", ""))
                try:
                    quantity = int(item.get("quantity", 0))
                except (TypeError, ValueError):
                    quantity = 0
                if not product_id or quantity < 1 or quantity > 100:
                    return json_error("Checkout contains an invalid product quantity.", 422)
                product = db.execute("SELECT * FROM products WHERE id = ? AND status = 'published'", (product_id,)).fetchone()
                if not product or product["price_cents"] is None or not product["currency"]:
                    return json_error("A selected product is unavailable for checkout.", 422)
                if currency and currency != product["currency"]:
                    return json_error("Products must use the same currency for this checkout.", 422)
                currency = product["currency"]
                line_subtotal = product["price_cents"] * quantity
                subtotal += line_subtotal
                validated_items.append((product, quantity, line_subtotal))
            timestamp = now_iso()
            order_id = new_id("order")
            reference = new_order_reference()
            db.execute("INSERT INTO orders (id, reference, user_id, subtotal_cents, discount_cents, total_cents, currency, checkout_idempotency_key, payment_status, order_status, created_at, updated_at) VALUES (?, ?, ?, ?, 0, ?, ?, ?, 'pending', 'pending', ?, ?)", (order_id, reference, user["id"], subtotal, subtotal, currency, idempotency_key, timestamp, timestamp))
            for product, quantity, line_subtotal in validated_items:
                db.execute("INSERT INTO order_items (id, order_id, product_id, product_title_snapshot, quantity, unit_price_cents, line_subtotal_cents, currency, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)", (new_id("order_item"), order_id, product["id"], product["title"], quantity, product["price_cents"], line_subtotal, currency, timestamp))
            db.commit()
        checkout_order = {
            "id": order_id, "reference": reference, "subtotalCents": subtotal,
            "discountCents": 0, "totalCents": subtotal, "currency": currency,
            "paymentStatus": "pending", "orderStatus": "pending",
        }
        try:
            payment = get_payment_provider().create_payment(checkout_order, user)
            return jsonify({"ok": True, "data": {"order": checkout_order, "payment": payment}}), 201
        except PaymentUnavailable as exc:
            return jsonify({"ok": True, "data": {"order": checkout_order, "payment": {"state": "unavailable", "message": f"{exc} No payment was taken."}}}), 201

    @app.get("/api/services")
    def public_services():
        with get_db() as db:
            rows = db.execute("SELECT id, name, slug, short_description, detailed_description, visual, cta, category, created_at, updated_at FROM services WHERE status = 'published' ORDER BY created_at DESC").fetchall()
        return jsonify({"ok": True, "data": {"services": [row_dict(row) for row in rows]}})

    @app.get("/api/services/<slug>")
    def public_service(slug):
        with get_db() as db:
            row = db.execute("SELECT id, name, slug, short_description, detailed_description, visual, cta, category, created_at, updated_at FROM services WHERE slug = ? AND status = 'published'", (slug,)).fetchone()
        if not row:
            return json_error("Service not found.", 404)
        return jsonify({"ok": True, "data": {"service": row_dict(row)}})

    @app.get("/api/customer/dashboard")
    @require_auth
    def customer_dashboard(user):
        with get_db() as db:
            counts = {
                "orders": db.execute("SELECT COUNT(*) AS count FROM orders WHERE user_id = ?", (user["id"],)).fetchone()["count"],
                "downloads": db.execute("SELECT COUNT(*) AS count FROM downloads WHERE user_id = ?", (user["id"],)).fetchone()["count"],
                "licenses": db.execute("SELECT COUNT(*) AS count FROM licenses WHERE user_id = ? AND status = 'active'", (user["id"],)).fetchone()["count"],
                "savedItems": db.execute("SELECT COUNT(*) AS count FROM saved_items WHERE user_id = ?", (user["id"],)).fetchone()["count"],
                "tickets": db.execute("SELECT COUNT(*) AS count FROM support_tickets WHERE user_id = ? AND status IN ('open','pending')", (user["id"],)).fetchone()["count"],
                "messages": db.execute("SELECT COUNT(*) AS count FROM messages WHERE recipient_user_id = ? AND read_at IS NULL", (user["id"],)).fetchone()["count"],
                "notifications": db.execute("SELECT COUNT(*) AS count FROM notifications WHERE user_id = ? AND read_at IS NULL", (user["id"],)).fetchone()["count"],
            }
        return jsonify({"ok": True, "data": {"user": safe_user(user), "counts": counts}})

    @app.patch("/api/customer/profile")
    @require_auth
    def update_customer_profile(user):
        data = payload()
        name = str(data.get("name", user["name"])).strip()
        email = str(data.get("email", user["email"])).strip().lower()
        if not name or not email or "@" not in email:
            return json_error("Enter valid profile details.", 422)
        try:
            with get_db() as db:
                db.execute("UPDATE users SET name = ?, email = ?, updated_at = ? WHERE id = ?", (name, email, now_iso(), user["id"]))
                db.commit()
                updated = db.execute("SELECT * FROM users WHERE id = ?", (user["id"],)).fetchone()
        except IntegrityError:
            return json_error("Unable to update profile with these details.", 409)
        return jsonify({"ok": True, "data": {"user": safe_user(updated)}})

    @app.patch("/api/customer/settings")
    @require_auth
    def update_customer_settings(user):
        return json_error("Account settings service is not configured.", 503)

    @app.get("/api/customer/orders")
    @require_auth
    def customer_orders(user):
        with get_db() as db:
            rows = db.execute("SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC", (user["id"],)).fetchall()
        return jsonify({"ok": True, "data": {"orders": [row_dict(row) for row in rows]}})

    @app.get("/api/customer/orders/<order_id>")
    @require_auth
    def customer_order_detail(user, order_id):
        with get_db() as db:
            order = db.execute("SELECT * FROM orders WHERE id = ? AND user_id = ?", (order_id, user["id"])).fetchone()
            if not order:
                return json_error("Order not found.", 404)
            items = db.execute("SELECT * FROM order_items WHERE order_id = ?", (order_id,)).fetchall()
        return jsonify({"ok": True, "data": {"order": row_dict(order), "items": [row_dict(item) for item in items]}})

    @app.get("/api/customer/downloads")
    @require_auth
    def customer_downloads(user):
        with get_db() as db:
            rows = db.execute("SELECT * FROM downloads WHERE user_id = ? ORDER BY created_at DESC", (user["id"],)).fetchall()
        return jsonify({"ok": True, "data": {"downloads": [row_dict(row) for row in rows]}})

    @app.get("/api/customer/downloads/<download_id>/download")
    @require_auth
    def secure_download(user, download_id):
        with get_db() as db:
            download = db.execute("SELECT downloads.*, orders.payment_status FROM downloads LEFT JOIN orders ON orders.id = downloads.order_id WHERE downloads.id = ? AND downloads.user_id = ?", (download_id, user["id"])).fetchone()
            if not download:
                return json_error("Download not found.", 404)
            license_row = db.execute("SELECT id FROM licenses WHERE user_id = ? AND order_id = ? AND product_id = ? AND status = 'active'", (user["id"], download["order_id"], download["product_id"])).fetchone()
            if download["availability"] != "available" or download["payment_status"] != "paid" or not license_row:
                return json_error("Download is not available for this account.", 403)
            try:
                access = get_storage_provider().authorized_download(download["storage_key"])
            except StorageUnavailable as exc:
                return json_error(str(exc), 503)
            db.execute("INSERT INTO download_events (id, user_id, download_id, product_id, created_at) VALUES (?, ?, ?, ?, ?)", (new_id("download_event"), user["id"], download_id, download["product_id"], now_iso()))
            db.commit()
        return jsonify({"ok": True, "data": {"download": access}})

    @app.get("/api/customer/licenses")
    @require_auth
    def customer_licenses(user):
        with get_db() as db:
            rows = db.execute("SELECT id, product_id, license_type, key_ciphertext, key_version, status, issued_at, expires_at, created_at FROM licenses WHERE user_id = ? ORDER BY created_at DESC", (user["id"],)).fetchall()
        vault = get_license_vault()
        licenses = []
        for row in rows:
            item = row_dict(row)
            ciphertext = item.pop("key_ciphertext", None)
            item["licenseKey"] = None
            if item["status"] == "active" and ciphertext and vault.configured:
                try:
                    item["licenseKey"] = vault.reveal(ciphertext, item.get("key_version"))
                except LicenseVaultUnavailable:
                    item["status"] = "pending"
            licenses.append(item)
        return jsonify({"ok": True, "data": {"licenses": licenses}})

    @app.get("/api/customer/saved-items")
    @require_auth
    def customer_saved_items(user):
        with get_db() as db:
            rows = db.execute("SELECT * FROM saved_items WHERE user_id = ? ORDER BY created_at DESC", (user["id"],)).fetchall()
        return jsonify({"ok": True, "data": {"savedItems": [row_dict(row) for row in rows]}})

    @app.post("/api/customer/saved-items/<product_id>")
    @require_auth
    def save_item(user, product_id):
        with get_db() as db:
            if not db.execute("SELECT 1 FROM products WHERE id = ? AND status = 'published'", (product_id,)).fetchone():
                return json_error("Product not found.", 404)
            try:
                db.execute("INSERT INTO saved_items (id, user_id, product_id, created_at) VALUES (?, ?, ?, ?)", (new_id("saved"), user["id"], product_id, now_iso()))
                db.commit()
            except IntegrityError:
                db.rollback()
                return jsonify({"ok": True, "data": {"saved": True}})
        return jsonify({"ok": True, "data": {"saved": True}}), 201

    @app.delete("/api/customer/saved-items/<product_id>")
    @require_auth
    def remove_saved_item(user, product_id):
        with get_db() as db:
            db.execute("DELETE FROM saved_items WHERE user_id = ? AND product_id = ?", (user["id"], product_id))
            db.commit()
        return jsonify({"ok": True, "data": {"removed": True}})

    @app.get("/api/customer/notifications")
    @require_auth
    def customer_notifications(user):
        with get_db() as db:
            rows = db.execute("SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC", (user["id"],)).fetchall()
        return jsonify({"ok": True, "data": {"notifications": [row_dict(row) for row in rows]}})

    @app.get("/api/customer/billing")
    @require_auth
    def customer_billing(user):
        with get_db() as db:
            rows = db.execute("SELECT id, order_id, provider_reference, amount_cents, currency, status, created_at FROM billing_records WHERE user_id = ? ORDER BY created_at DESC", (user["id"],)).fetchall()
        return jsonify({"ok": True, "data": {"billing": [row_dict(row) for row in rows]}})

    @app.get("/api/customer/messages")
    @require_auth
    def customer_messages(user):
        with get_db() as db:
            rows = db.execute("SELECT id, conversation_id, sender_user_id, body, read_at, created_at FROM messages WHERE recipient_user_id = ? ORDER BY created_at DESC", (user["id"],)).fetchall()
        return jsonify({"ok": True, "data": {"messages": [row_dict(row) for row in rows]}})

    @app.get("/api/customer/messages/<message_id>")
    @require_auth
    def customer_message_detail(user, message_id):
        with get_db() as db:
            message = db.execute(
                "SELECT id, conversation_id, sender_user_id, recipient_user_id, body, read_at, created_at FROM messages WHERE id = ? AND recipient_user_id = ?",
                (message_id, user["id"]),
            ).fetchone()
        if not message:
            return json_error("Message not found.", 404)
        return jsonify({"ok": True, "data": {"message": row_dict(message)}})

    @app.get("/api/customer/tickets")
    @require_auth
    def customer_tickets(user):
        with get_db() as db:
            rows = db.execute("SELECT * FROM support_tickets WHERE user_id = ? ORDER BY updated_at DESC", (user["id"],)).fetchall()
        return jsonify({"ok": True, "data": {"tickets": [row_dict(row) for row in rows]}})

    @app.get("/api/customer/tickets/<ticket_id>")
    @require_auth
    def customer_ticket_detail(user, ticket_id):
        with get_db() as db:
            ticket = db.execute("SELECT * FROM support_tickets WHERE id = ? AND user_id = ?", (ticket_id, user["id"])).fetchone()
            if not ticket:
                return json_error("Support ticket not found.", 404)
            messages = db.execute("SELECT id, ticket_id, author_user_id, body, created_at FROM ticket_messages WHERE ticket_id = ? AND internal_note = 0 ORDER BY created_at ASC", (ticket_id,)).fetchall()
        return jsonify({"ok": True, "data": {"ticket": row_dict(ticket), "messages": [row_dict(message) for message in messages]}})

    @app.post("/api/customer/tickets")
    @require_auth
    def create_ticket(user):
        data = payload()
        subject = str(data.get("subject", "")).strip()
        message = str(data.get("message", "")).strip()
        if not subject or not message:
            return json_error("Subject and message are required.", 422)
        ticket_id = new_id("ticket")
        timestamp = now_iso()
        with get_db() as db:
            db.execute("INSERT INTO support_tickets (id, user_id, subject, created_at, updated_at) VALUES (?, ?, ?, ?, ?)", (ticket_id, user["id"], subject, timestamp, timestamp))
            db.execute("INSERT INTO ticket_messages (id, ticket_id, author_user_id, body, created_at) VALUES (?, ?, ?, ?, ?)", (new_id("ticket_message"), ticket_id, user["id"], message, timestamp))
            db.commit()
        event_id = emit_event("support.ticket.created", {"ticketId": ticket_id}, actor_user_id=user["id"], idempotency_key=f"support.ticket.created:{ticket_id}")
        if event_id:
            queue_workflows_for_event(event_id, "support.ticket.created")
        return jsonify({"ok": True, "data": {"ticketId": ticket_id}}), 201

    @app.post("/api/webhooks/payment/<provider>")
    def payment_webhook(provider):
        # Webhook verification must be implemented by the selected provider adapter.
        try:
            get_payment_provider().verify_webhook(request)
        except PaymentUnavailable as exc:
            return json_error(str(exc), 503)
        return json_error("Payment webhook verification is not configured.", 503)

    @app.get("/api/admin/automations")
    @require_auth
    @require_roles(*ADMIN_ROLES)
    def admin_automations(user):
        with get_db() as db:
            rows = db.execute("SELECT id, name, status, created_at, updated_at FROM workflows ORDER BY updated_at DESC").fetchall()
        return jsonify({"ok": True, "data": {"automations": [row_dict(row) for row in rows]}})

    @app.get("/api/admin/workflows")
    @require_auth
    @require_roles(*ADMIN_ROLES)
    def admin_workflows(user):
        with get_db() as db:
            rows = db.execute("SELECT * FROM workflows ORDER BY updated_at DESC").fetchall()
        return jsonify({"ok": True, "data": {"workflows": [row_dict(row) for row in rows]}})

    @app.post("/api/admin/workflows")
    @require_auth
    @require_roles(*ADMIN_ROLES)
    def create_workflow(user):
        data = payload()
        name = str(data.get("name", "")).strip()
        nodes = data.get("nodes", [])
        status = data.get("status", "draft")
        if not name or not isinstance(nodes, list) or status not in {"draft", "active", "paused", "completed", "error"}:
            return json_error("Workflow name, nodes, and status are required.", 422)
        with get_db() as db:
            workflow_id = new_id("workflow")
            timestamp = now_iso()
            db.execute("INSERT INTO workflows (id, name, status, definition_json, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)", (workflow_id, name, status, json.dumps({"nodes": nodes}), timestamp, timestamp))
            log_activity(db, user["id"], "Workflow definition created", "automation", workflow_id)
            db.commit()
        return jsonify({"ok": True, "data": {"id": workflow_id}}), 201

    @app.get("/api/admin/forms")
    @require_auth
    @require_roles(*CONTENT_ROLES)
    def admin_forms(user):
        with get_db() as db:
            rows = db.execute("SELECT * FROM forms ORDER BY updated_at DESC").fetchall()
        return jsonify({"ok": True, "data": {"forms": [row_dict(row) for row in rows]}})

    @app.post("/api/admin/forms")
    @require_auth
    @require_roles(*CONTENT_ROLES)
    def create_form(user):
        data = payload()
        name = str(data.get("name", "")).strip()
        fields = data.get("fields", [])
        if not name or not isinstance(fields, list):
            return json_error("Form name and fields are required.", 422)
        with get_db() as db:
            form_id = new_id("form")
            timestamp = now_iso()
            db.execute("INSERT INTO forms (id, name, status, definition_json, created_at, updated_at) VALUES (?, ?, 'draft', ?, ?, ?)", (form_id, name, json.dumps({"fields": fields}), timestamp, timestamp))
            log_activity(db, user["id"], "Form definition created", "forms", form_id)
            db.commit()
        return jsonify({"ok": True, "data": {"id": form_id}}), 201

    @app.get("/api/admin/forms/submissions")
    @require_auth
    @require_roles(*CONTENT_ROLES)
    def admin_form_submissions(user):
        with get_db() as db:
            rows = db.execute("SELECT * FROM form_submissions ORDER BY created_at DESC").fetchall()
        return jsonify({"ok": True, "data": {"submissions": [row_dict(row) for row in rows]}})

    @app.get("/api/admin/crm/contacts")
    @require_auth
    @require_roles(*ADMIN_ROLES)
    def admin_crm_contacts(user):
        with get_db() as db:
            rows = db.execute("SELECT * FROM crm_contacts ORDER BY created_at DESC").fetchall()
        return jsonify({"ok": True, "data": {"contacts": [row_dict(row) for row in rows]}})

    @app.get("/api/admin/crm/contacts/<contact_id>")
    @require_auth
    @require_roles(*ADMIN_ROLES)
    def admin_crm_contact(user, contact_id):
        with get_db() as db:
            row = db.execute("SELECT * FROM crm_contacts WHERE id = ?", (contact_id,)).fetchone()
        if not row:
            return json_error("Contact not found.", 404)
        return jsonify({"ok": True, "data": {"contact": row_dict(row)}})

    @app.get("/api/admin/newsletter/subscribers")
    @require_auth
    @require_roles(*ADMIN_ROLES)
    def admin_newsletter_subscribers(user):
        with get_db() as db:
            rows = db.execute("SELECT id, email, status, created_at FROM newsletter_subscribers ORDER BY created_at DESC").fetchall()
        return jsonify({"ok": True, "data": {"subscribers": [row_dict(row) for row in rows]}})

    @app.patch("/api/admin/newsletter/settings")
    @require_auth
    @require_roles(*ADMIN_ROLES)
    def admin_newsletter_settings(user):
        return json_error("Email provider is not connected. No newsletter settings were saved.", 503)

    @app.get("/api/admin/ai/settings")
    @require_auth
    @require_roles(*ADMIN_ROLES)
    def admin_ai_settings(user):
        return json_error("AI provider is not connected.", 503)

    @app.patch("/api/admin/ai/settings")
    @require_auth
    @require_roles(*ADMIN_ROLES)
    def update_ai_settings(user):
        return json_error("AI provider is not connected. No agent settings were saved.", 503)

    @app.post("/api/admin/integrations/configure")
    @require_auth
    @require_roles(*ADMIN_ROLES)
    def integration_configuration(user):
        return json_error("Integration configuration requires secure server-side environment setup.", 503)

    @app.get("/api/admin/settings/social-links")
    @require_auth
    @require_roles(*SETTINGS_ROLES)
    def admin_social_links_settings(user):
        with get_db() as db:
            links = load_social_contact_links(db)
        return jsonify({"ok": True, "data": {"links": links}})

    @app.patch("/api/admin/settings/social-links")
    @require_auth
    @require_roles(*SETTINGS_ROLES)
    def update_admin_social_links_settings(user):
        try:
            links = normalize_social_contact_links(payload())
        except ValueError as exc:
            return json_error(str(exc), 422)
        timestamp = now_iso()
        with get_db() as db:
            if any(link["value"] for link in links):
                db.execute(
                    """INSERT INTO site_settings (setting_key, value_json, updated_by_user_id, updated_at)
                       VALUES (?, ?, ?, ?)
                       ON CONFLICT(setting_key) DO UPDATE SET
                         value_json=excluded.value_json,
                         updated_by_user_id=excluded.updated_by_user_id,
                         updated_at=excluded.updated_at""",
                    (SOCIAL_CONTACT_SETTINGS_KEY, json.dumps(links), user["id"], timestamp),
                )
            else:
                db.execute("DELETE FROM site_settings WHERE setting_key = ?", (SOCIAL_CONTACT_SETTINGS_KEY,))
            log_activity(db, user["id"], "Social and contact links updated", "settings", SOCIAL_CONTACT_SETTINGS_KEY)
            db.commit()
        return jsonify({"ok": True, "data": {"links": links}})

    @app.get("/api/admin/readiness")
    @require_auth
    @require_roles(*ADMIN_ROLES)
    def admin_readiness(user):
        return jsonify({"ok": True, "data": readiness()})

    @app.get("/api/admin/integrations/status")
    @require_auth
    @require_roles(*ADMIN_ROLES)
    def integration_status(user):
        return jsonify({"ok": True, "data": {"integrations": provider_statuses()}})

    @app.post("/api/admin/ai/respond")
    @require_auth
    @require_roles(*ADMIN_ROLES)
    def ai_response(user):
        data = payload()
        prompt = str(data.get("prompt", "")).strip()
        if not prompt:
            return json_error("AI prompt is required.", 422)
        try:
            response = get_ai_provider().respond(str(data.get("instructions", "")), prompt)
        except (ProviderUnavailable, ValueError) as exc:
            return json_error(str(exc), 503 if isinstance(exc, ProviderUnavailable) else 422)
        return jsonify({"ok": True, "data": {"response": response}})

    @app.post("/api/newsletter/subscribe")
    def newsletter_subscribe():
        data = payload()
        email = str(data.get("email", "")).strip().lower()
        consent = bool(data.get("marketingConsent", False))
        if not email or "@" not in email:
            return json_error("Enter a valid email address.", 422)
        if not consent:
            return json_error("Marketing consent is required to subscribe.", 422)
        try:
            get_newsletter_provider().subscribe(email, consent)
        except (ProviderUnavailable, ValueError) as exc:
            return json_error(str(exc), 503 if isinstance(exc, ProviderUnavailable) else 422)
        return jsonify({"ok": True, "data": {"subscribed": True}}), 201

    @app.post("/api/analytics/events")
    def analytics_event():
        data = payload()
        event_type = str(data.get("eventType", "")).strip()
        allowed = {"page_view", "product_view", "search", "add_to_cart", "checkout_started", "purchase_completed", "newsletter_signup"}
        if event_type not in allowed:
            return json_error("Unsupported analytics event.", 422)
        safe_payload = {key: value for key, value in data.get("payload", {}).items() if key not in {"password", "token", "licenseKey", "message"}} if isinstance(data.get("payload"), dict) else {}
        with get_db() as db:
            key = request.headers.get("Idempotency-Key") or secrets.token_urlsafe(24)
            existing = db.execute("SELECT id FROM analytics_events WHERE idempotency_key = ?", (key,)).fetchone()
            if not existing:
                db.execute("INSERT INTO analytics_events (id, event_type, payload_json, idempotency_key, created_at) VALUES (?, ?, ?, ?, ?)", (new_id("analytics"), event_type, json.dumps(safe_payload), key, now_iso()))
                db.commit()
        return jsonify({"ok": True, "data": {"localRecorded": True, "externalDelivery": "not_configured"}}), 202

    @app.get("/api/admin/dashboard")
    @require_auth
    @require_roles(*ADMIN_ROLES)
    def admin_dashboard(user):
        period = str(request.args.get("period", "30d")).strip().lower()
        period_days = {"7d": 7, "30d": 30, "90d": 90, "12m": 365}
        if period not in period_days:
            return json_error("Select a valid dashboard period.", 422)
        cutoff = datetime.now(timezone.utc) - timedelta(days=period_days[period])
        with get_db() as db:
            products_total = db.execute("SELECT COUNT(*) AS count FROM products").fetchone()["count"]
            products_published = db.execute("SELECT COUNT(*) AS count FROM products WHERE status = 'published'").fetchone()["count"]
            products_draft = db.execute("SELECT COUNT(*) AS count FROM products WHERE status = 'draft'").fetchone()["count"]
            orders_total = db.execute("SELECT COUNT(*) AS count FROM orders").fetchone()["count"]
            order_rows = db.execute("SELECT order_status, COUNT(*) AS count FROM orders GROUP BY order_status").fetchall()
            order_counts = {"pending": 0, "processing": 0, "completed": 0, "cancelled": 0}
            for row in order_rows:
                if row["order_status"] in order_counts:
                    order_counts[row["order_status"]] = row["count"]
            customers_total = db.execute("SELECT COUNT(*) AS count FROM users WHERE role = 'customer'").fetchone()["count"]
            services_total = db.execute("SELECT COUNT(*) AS count FROM services").fetchone()["count"]
            services_published = db.execute("SELECT COUNT(*) AS count FROM services WHERE status = 'published'").fetchone()["count"]
            blog_published = db.execute("SELECT COUNT(*) AS count FROM blog_posts WHERE status = 'published'").fetchone()["count"]
            documentation_published = db.execute("SELECT COUNT(*) AS count FROM documentation_entries WHERE status = 'published'").fetchone()["count"]
            reviews_total = db.execute("SELECT COUNT(*) AS count FROM reviews").fetchone()["count"]
            tickets_open = db.execute("SELECT COUNT(*) AS count FROM support_tickets WHERE status IN ('open', 'pending')").fetchone()["count"]

            paid_orders = db.execute(
                "SELECT total_cents, currency, created_at FROM orders WHERE payment_status = 'paid' AND created_at >= ? ORDER BY created_at ASC",
                (cutoff.isoformat(),),
            ).fetchall()
            currencies = {row["currency"] for row in paid_orders if row["currency"]}
            revenue_currency = next(iter(currencies)) if len(currencies) == 1 else None
            revenue_total = sum((row["total_cents"] or 0) for row in paid_orders) if revenue_currency else 0 if not paid_orders else None
            revenue_series = []
            if revenue_currency:
                buckets = {}
                for row in paid_orders:
                    if row["currency"] != revenue_currency:
                        continue
                    label = row["created_at"][:7] if period == "12m" else row["created_at"][:10]
                    buckets[label] = buckets.get(label, 0) + (row["total_cents"] or 0)
                revenue_series = [{"label": label, "totalCents": total} for label, total in sorted(buckets.items())]

            recent_orders = db.execute(
                """SELECT orders.id, orders.reference, orders.total_cents, orders.currency, orders.payment_status,
                          orders.order_status, orders.created_at, users.name AS customer_name
                   FROM orders JOIN users ON users.id = orders.user_id
                   ORDER BY orders.created_at DESC LIMIT 5"""
            ).fetchall()
            recent_customers = db.execute(
                """SELECT users.id, users.name, users.email, users.status, users.created_at,
                          (SELECT COUNT(*) FROM orders WHERE orders.user_id = users.id) AS order_count
                   FROM users WHERE users.role = 'customer'
                   ORDER BY users.created_at DESC LIMIT 5"""
            ).fetchall()
            top_products = db.execute(
                """SELECT order_items.product_id, COALESCE(products.title, order_items.product_title_snapshot, order_items.product_id) AS product_name,
                          products.status AS product_status, order_items.currency,
                          SUM(order_items.quantity) AS sales_count, SUM(COALESCE(order_items.line_subtotal_cents, 0)) AS revenue_cents
                   FROM order_items JOIN orders ON orders.id = order_items.order_id
                   LEFT JOIN products ON products.id = order_items.product_id
                   WHERE orders.payment_status = 'paid'
                   GROUP BY order_items.product_id, order_items.currency
                   ORDER BY sales_count DESC, revenue_cents DESC LIMIT 5"""
            ).fetchall()
            recent_activity = db.execute(
                """SELECT activity_logs.action, activity_logs.module, activity_logs.target, activity_logs.status,
                          activity_logs.created_at, users.name AS user_name
                   FROM activity_logs JOIN users ON users.id = activity_logs.user_id
                   ORDER BY activity_logs.created_at DESC LIMIT 6"""
            ).fetchall()

        dashboard = {
            "period": period,
            "revenue": {"totalCents": revenue_total, "currency": revenue_currency, "series": revenue_series},
            "orders": {"total": orders_total, **order_counts},
            "customers": {"total": customers_total, "recent": [row_dict(row) for row in recent_customers]},
            "products": {"total": products_total, "published": products_published, "draft": products_draft, "top": [row_dict(row) for row in top_products]},
            "services": {"total": services_total, "published": services_published},
            "storeHealth": {
                "publishedProducts": products_published,
                "draftProducts": products_draft,
                "activeServices": services_published,
                "publishedBlogPosts": blog_published,
                "publishedDocumentation": documentation_published,
                "openSupportTickets": tickets_open,
            },
            "recentOrders": [row_dict(row) for row in recent_orders],
            "recentActivity": [row_dict(row) for row in recent_activity],
        }
        # Retain the previous compact metrics for existing API consumers.
        return jsonify({"ok": True, "data": {"products": products_total, "orders": orders_total, "customers": customers_total, "services": services_total, "reviews": reviews_total, "tickets": tickets_open, "revenue": revenue_total, "dashboard": dashboard}})

    @app.get("/api/admin/products")
    @require_auth
    @require_roles(*CONTENT_ROLES)
    def admin_products(user):
        with get_db() as db:
            rows = db.execute("SELECT products.*, categories.name AS category_name FROM products LEFT JOIN categories ON categories.id = products.category_id ORDER BY products.updated_at DESC").fetchall()
        return jsonify({"ok": True, "data": {"products": [serialize_product(row) for row in rows]}})

    @app.post("/api/admin/products")
    @require_auth
    @require_roles(*CONTENT_ROLES)
    def create_product(user):
        with get_db() as db:
            valid, error = validate_product(payload(), db)
            if error:
                return json_error(error, 422)
            if db.execute("SELECT 1 FROM products WHERE slug = ?", (valid["slug"],)).fetchone():
                return json_error("A product with this slug already exists.", 409)
            product_id = new_id("product")
            timestamp = now_iso()
            db.execute(
                """INSERT INTO products (id,title,slug,short_description,description,price_cents,currency,category_id,status,thumbnail,featured,metadata_json,license_reference,refund_reference,created_at,updated_at)
                   VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)""",
                (product_id, valid["title"], valid["slug"], valid["short_description"], valid["description"], valid["price_cents"], valid["currency"], valid["category_id"], valid["status"], valid["thumbnail"], valid["featured"], valid["metadata_json"], valid["license_reference"], valid["refund_reference"], timestamp, timestamp),
            )
            log_activity(db, user["id"], "Product created", "products", product_id)
            db.commit()
            row = db.execute("SELECT products.*, categories.name AS category_name FROM products LEFT JOIN categories ON categories.id = products.category_id WHERE products.id = ?", (product_id,)).fetchone()
        return jsonify({"ok": True, "data": {"product": serialize_product(row)}}), 201

    @app.patch("/api/admin/products/<product_id>")
    @require_auth
    @require_roles(*CONTENT_ROLES)
    def update_product(user, product_id):
        with get_db() as db:
            if not db.execute("SELECT 1 FROM products WHERE id = ?", (product_id,)).fetchone():
                return json_error("Product not found.", 404)
            valid, error = validate_product(payload(), db)
            if error:
                return json_error(error, 422)
            conflict = db.execute("SELECT id FROM products WHERE slug = ? AND id != ?", (valid["slug"], product_id)).fetchone()
            if conflict:
                return json_error("A product with this slug already exists.", 409)
            db.execute(
                """UPDATE products SET title=?,slug=?,short_description=?,description=?,price_cents=?,currency=?,category_id=?,status=?,thumbnail=?,featured=?,metadata_json=?,license_reference=?,refund_reference=?,updated_at=? WHERE id=?""",
                (valid["title"], valid["slug"], valid["short_description"], valid["description"], valid["price_cents"], valid["currency"], valid["category_id"], valid["status"], valid["thumbnail"], valid["featured"], valid["metadata_json"], valid["license_reference"], valid["refund_reference"], now_iso(), product_id),
            )
            log_activity(db, user["id"], "Product updated", "products", product_id)
            db.commit()
            row = db.execute("SELECT products.*, categories.name AS category_name FROM products LEFT JOIN categories ON categories.id = products.category_id WHERE products.id = ?", (product_id,)).fetchone()
        return jsonify({"ok": True, "data": {"product": serialize_product(row)}})

    @app.delete("/api/admin/products/<product_id>")
    @require_auth
    @require_roles(*CONTENT_ROLES)
    def archive_product(user, product_id):
        with get_db() as db:
            if not db.execute("SELECT 1 FROM products WHERE id = ?", (product_id,)).fetchone():
                return json_error("Product not found.", 404)
            db.execute("UPDATE products SET status = 'archived', updated_at = ? WHERE id = ?", (now_iso(), product_id))
            log_activity(db, user["id"], "Product archived", "products", product_id)
            db.commit()
        return jsonify({"ok": True, "data": {"archived": True}})

    @app.get("/api/admin/products/<product_id>/files")
    @require_auth
    @require_roles(*CONTENT_ROLES)
    def admin_product_files(user, product_id):
        with get_db() as db:
            if not db.execute("SELECT 1 FROM products WHERE id = ?", (product_id,)).fetchone():
                return json_error("Product not found.", 404)
            rows = db.execute("SELECT id, file_name, file_type, size_bytes, version, status, created_at FROM product_files WHERE product_id = ? ORDER BY created_at DESC", (product_id,)).fetchall()
        return jsonify({"ok": True, "data": {"files": [row_dict(row) for row in rows]}})

    @app.post("/api/admin/products/<product_id>/files")
    @require_auth
    @require_roles(*CONTENT_ROLES)
    def add_product_file(user, product_id):
        return json_error("Storage provider is not connected. No product file was uploaded.", 503)

    @app.get("/api/admin/categories")
    @require_auth
    @require_roles(*CONTENT_ROLES)
    def admin_categories(user):
        with get_db() as db:
            rows = db.execute("SELECT categories.*, COUNT(products.id) AS product_count FROM categories LEFT JOIN products ON products.category_id = categories.id GROUP BY categories.id ORDER BY categories.updated_at DESC").fetchall()
        return jsonify({"ok": True, "data": {"categories": [row_dict(row) for row in rows]}})

    @app.post("/api/admin/categories")
    @require_auth
    @require_roles(*CONTENT_ROLES)
    def create_category(user):
        data = payload()
        name = str(data.get("name", "")).strip()
        slug = str(data.get("slug", "")).strip().lower()
        if not name or not SLUG_RE.match(slug):
            return json_error("Category name and a valid slug are required.", 422)
        status = data.get("status", "draft")
        if status not in {"draft", "published", "archived"}:
            return json_error("Select a valid category status.", 422)
        try:
            with get_db() as db:
                category_id = new_id("category")
                timestamp = now_iso()
                db.execute("INSERT INTO categories (id,name,slug,description,status,created_at,updated_at) VALUES (?,?,?,?,?,?,?)", (category_id, name, slug, str(data.get("description", "")).strip() or None, status, timestamp, timestamp))
                log_activity(db, user["id"], "Category created", "categories", category_id)
                db.commit()
        except IntegrityError:
            return json_error("A category with this slug already exists.", 409)
        return jsonify({"ok": True, "data": {"id": category_id}}), 201

    @app.patch("/api/admin/categories/<category_id>")
    @require_auth
    @require_roles(*CONTENT_ROLES)
    def update_category(user, category_id):
        data = payload()
        name = str(data.get("name", "")).strip()
        slug = str(data.get("slug", "")).strip().lower()
        status = data.get("status", "draft")
        if not name or not SLUG_RE.match(slug) or status not in {"draft", "published", "archived"}:
            return json_error("Category name, slug, and status are required.", 422)
        with get_db() as db:
            if not db.execute("SELECT 1 FROM categories WHERE id = ?", (category_id,)).fetchone():
                return json_error("Category not found.", 404)
            conflict = db.execute("SELECT id FROM categories WHERE slug = ? AND id != ?", (slug, category_id)).fetchone()
            if conflict:
                return json_error("A category with this slug already exists.", 409)
            db.execute("UPDATE categories SET name=?, slug=?, description=?, status=?, updated_at=? WHERE id=?", (name, slug, str(data.get("description", "")).strip() or None, status, now_iso(), category_id))
            log_activity(db, user["id"], "Category updated", "categories", category_id)
            db.commit()
        return jsonify({"ok": True, "data": {"id": category_id}})

    @app.delete("/api/admin/categories/<category_id>")
    @require_auth
    @require_roles(*CONTENT_ROLES)
    def archive_category(user, category_id):
        with get_db() as db:
            if not db.execute("SELECT 1 FROM categories WHERE id = ?", (category_id,)).fetchone():
                return json_error("Category not found.", 404)
            db.execute("UPDATE categories SET status='archived', updated_at=? WHERE id=?", (now_iso(), category_id))
            log_activity(db, user["id"], "Category archived", "categories", category_id)
            db.commit()
        return jsonify({"ok": True, "data": {"archived": True}})

    @app.get("/api/admin/services")
    @require_auth
    @require_roles(*CONTENT_ROLES)
    def admin_services(user):
        with get_db() as db:
            rows = db.execute("SELECT * FROM services ORDER BY updated_at DESC").fetchall()
        return jsonify({"ok": True, "data": {"services": [row_dict(row) for row in rows]}})

    @app.post("/api/admin/services")
    @require_auth
    @require_roles(*CONTENT_ROLES)
    def create_service(user):
        data = payload()
        name = str(data.get("name", "")).strip()
        slug = str(data.get("slug", "")).strip().lower() or re.sub(r"[^a-z0-9]+", "-", name.lower()).strip("-")
        if not name or not SLUG_RE.match(slug):
            return json_error("Service name and a valid slug are required.", 422)
        status = data.get("status", "draft")
        if status not in {"draft", "published", "archived"}:
            return json_error("Select a valid service status.", 422)
        try:
            with get_db() as db:
                service_id = new_id("service")
                timestamp = now_iso()
                db.execute("INSERT INTO services (id,name,slug,short_description,detailed_description,visual,deliverables,cta,category,status,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)", (service_id, name, slug, str(data.get("shortDescription", "")).strip() or None, str(data.get("detailedDescription", "")).strip() or None, None, str(data.get("deliverables", "")).strip() or None, str(data.get("cta", "")).strip() or None, str(data.get("category", "")).strip() or None, status, timestamp, timestamp))
                log_activity(db, user["id"], "Service created", "services", service_id)
                db.commit()
        except IntegrityError:
            return json_error("A service with this slug already exists.", 409)
        return jsonify({"ok": True, "data": {"id": service_id}}), 201

    @app.patch("/api/admin/services/<service_id>")
    @require_auth
    @require_roles(*CONTENT_ROLES)
    def update_service(user, service_id):
        data = payload()
        name = str(data.get("name", "")).strip()
        slug = str(data.get("slug", "")).strip().lower() or re.sub(r"[^a-z0-9]+", "-", name.lower()).strip("-")
        status = data.get("status", "draft")
        if not name or not SLUG_RE.match(slug) or status not in {"draft", "published", "archived"}:
            return json_error("Service name, slug, and status are required.", 422)
        with get_db() as db:
            if not db.execute("SELECT 1 FROM services WHERE id = ?", (service_id,)).fetchone():
                return json_error("Service not found.", 404)
            conflict = db.execute("SELECT id FROM services WHERE slug = ? AND id != ?", (slug, service_id)).fetchone()
            if conflict:
                return json_error("A service with this slug already exists.", 409)
            db.execute("UPDATE services SET name=?, slug=?, short_description=?, detailed_description=?, deliverables=?, cta=?, category=?, status=?, updated_at=? WHERE id=?", (name, slug, str(data.get("shortDescription", "")).strip() or None, str(data.get("detailedDescription", "")).strip() or None, str(data.get("deliverables", "")).strip() or None, str(data.get("cta", "")).strip() or None, str(data.get("category", "")).strip() or None, status, now_iso(), service_id))
            log_activity(db, user["id"], "Service updated", "services", service_id)
            db.commit()
        return jsonify({"ok": True, "data": {"id": service_id}})

    @app.delete("/api/admin/services/<service_id>")
    @require_auth
    @require_roles(*CONTENT_ROLES)
    def archive_service(user, service_id):
        with get_db() as db:
            if not db.execute("SELECT 1 FROM services WHERE id = ?", (service_id,)).fetchone():
                return json_error("Service not found.", 404)
            db.execute("UPDATE services SET status='archived', updated_at=? WHERE id=?", (now_iso(), service_id))
            log_activity(db, user["id"], "Service archived", "services", service_id)
            db.commit()
        return jsonify({"ok": True, "data": {"archived": True}})

    @app.get("/api/admin/documentation")
    @require_auth
    @require_roles(*CONTENT_ROLES)
    def admin_documentation(user):
        with get_db() as db:
            rows = db.execute("SELECT * FROM documentation_entries ORDER BY updated_at DESC").fetchall()
        return jsonify({"ok": True, "data": {"documentation": [row_dict(row) for row in rows]}})

    @app.post("/api/admin/documentation")
    @require_auth
    @require_roles(*CONTENT_ROLES)
    def create_documentation(user):
        data = payload()
        title = str(data.get("title", "")).strip()
        slug = str(data.get("slug", "")).strip().lower()
        content = str(data.get("content", "")).strip()
        status = data.get("status", "draft")
        if not title or not content or not SLUG_RE.match(slug) or status not in {"draft", "published", "archived"}:
            return json_error("Documentation title, slug, content, and status are required.", 422)
        try:
            with get_db() as db:
                entry_id = new_id("doc")
                timestamp = now_iso()
                db.execute("INSERT INTO documentation_entries (id,title,slug,summary,content,category,display_order,seo_title,seo_description,status,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)", (entry_id, title, slug, str(data.get("summary", "")).strip() or None, content, str(data.get("category", "")).strip() or None, data.get("displayOrder") or None, str(data.get("seoTitle", "")).strip() or None, str(data.get("seoDescription", "")).strip() or None, status, timestamp, timestamp))
                log_activity(db, user["id"], "Documentation created", "documentation", entry_id)
                db.commit()
        except IntegrityError:
            return json_error("Documentation with this slug already exists.", 409)
        return jsonify({"ok": True, "data": {"id": entry_id}}), 201

    @app.patch("/api/admin/documentation/<entry_id>")
    @require_auth
    @require_roles(*CONTENT_ROLES)
    def update_documentation(user, entry_id):
        data = payload()
        title = str(data.get("title", "")).strip()
        slug = str(data.get("slug", "")).strip().lower()
        content = str(data.get("content", "")).strip()
        status = data.get("status", "draft")
        if not title or not content or not SLUG_RE.match(slug) or status not in {"draft", "published", "archived"}:
            return json_error("Documentation title, slug, content, and status are required.", 422)
        with get_db() as db:
            if not db.execute("SELECT 1 FROM documentation_entries WHERE id = ?", (entry_id,)).fetchone():
                return json_error("Documentation not found.", 404)
            conflict = db.execute("SELECT id FROM documentation_entries WHERE slug = ? AND id != ?", (slug, entry_id)).fetchone()
            if conflict:
                return json_error("Documentation with this slug already exists.", 409)
            db.execute("UPDATE documentation_entries SET title=?,slug=?,summary=?,content=?,category=?,display_order=?,seo_title=?,seo_description=?,status=?,updated_at=? WHERE id=?", (title, slug, str(data.get("summary", "")).strip() or None, content, str(data.get("category", "")).strip() or None, data.get("displayOrder") or None, str(data.get("seoTitle", "")).strip() or None, str(data.get("seoDescription", "")).strip() or None, status, now_iso(), entry_id))
            log_activity(db, user["id"], "Documentation updated", "documentation", entry_id)
            db.commit()
        return jsonify({"ok": True, "data": {"id": entry_id}})

    @app.get("/api/admin/blog")
    @require_auth
    @require_roles(*CONTENT_ROLES)
    def admin_blog(user):
        with get_db() as db:
            rows = db.execute("SELECT blog_posts.*, users.name AS author_name FROM blog_posts LEFT JOIN users ON users.id = blog_posts.author_user_id ORDER BY updated_at DESC").fetchall()
        return jsonify({"ok": True, "data": {"posts": [row_dict(row) for row in rows]}})

    @app.post("/api/admin/blog")
    @require_auth
    @require_roles(*CONTENT_ROLES)
    def create_blog_post(user):
        data = payload()
        title = str(data.get("title", "")).strip()
        slug = str(data.get("slug", "")).strip().lower()
        content = str(data.get("content", "")).strip()
        status = data.get("status", "draft")
        if not title or not content or not SLUG_RE.match(slug) or status not in {"draft", "published", "scheduled", "archived"}:
            return json_error("Post title, slug, content, and status are required.", 422)
        try:
            with get_db() as db:
                post_id = new_id("post")
                timestamp = now_iso()
                published_at = timestamp if status == "published" else None
                db.execute("INSERT INTO blog_posts (id,title,slug,excerpt,content,category,author_user_id,seo_title,seo_description,status,published_at,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)", (post_id, title, slug, str(data.get("excerpt", "")).strip() or None, content, str(data.get("category", "")).strip() or None, user["id"], str(data.get("seoTitle", "")).strip() or None, str(data.get("seoDescription", "")).strip() or None, status, published_at, timestamp, timestamp))
                log_activity(db, user["id"], "Blog post created", "blog", post_id)
                db.commit()
        except IntegrityError:
            return json_error("Post with this slug already exists.", 409)
        return jsonify({"ok": True, "data": {"id": post_id}}), 201

    @app.patch("/api/admin/blog/<post_id>")
    @require_auth
    @require_roles(*CONTENT_ROLES)
    def update_blog_post(user, post_id):
        data = payload()
        title = str(data.get("title", "")).strip()
        slug = str(data.get("slug", "")).strip().lower()
        content = str(data.get("content", "")).strip()
        status = data.get("status", "draft")
        if not title or not content or not SLUG_RE.match(slug) or status not in {"draft", "published", "scheduled", "archived"}:
            return json_error("Post title, slug, content, and status are required.", 422)
        with get_db() as db:
            if not db.execute("SELECT 1 FROM blog_posts WHERE id = ?", (post_id,)).fetchone():
                return json_error("Post not found.", 404)
            conflict = db.execute("SELECT id FROM blog_posts WHERE slug = ? AND id != ?", (slug, post_id)).fetchone()
            if conflict:
                return json_error("Post with this slug already exists.", 409)
            published_at = now_iso() if status == "published" else None
            db.execute("UPDATE blog_posts SET title=?,slug=?,excerpt=?,content=?,category=?,seo_title=?,seo_description=?,status=?,published_at=?,updated_at=? WHERE id=?", (title, slug, str(data.get("excerpt", "")).strip() or None, content, str(data.get("category", "")).strip() or None, str(data.get("seoTitle", "")).strip() or None, str(data.get("seoDescription", "")).strip() or None, status, published_at, now_iso(), post_id))
            log_activity(db, user["id"], "Blog post updated", "blog", post_id)
            db.commit()
        return jsonify({"ok": True, "data": {"id": post_id}})

    @app.get("/api/docs")
    def public_documentation():
        with get_db() as db:
            rows = db.execute("SELECT id,title,slug,summary,category,updated_at FROM documentation_entries WHERE status = 'published' ORDER BY display_order ASC, updated_at DESC").fetchall()
        return jsonify({"ok": True, "data": {"documentation": [row_dict(row) for row in rows]}})

    @app.get("/api/docs/<slug>")
    def public_documentation_detail(slug):
        with get_db() as db:
            row = db.execute("SELECT id,title,slug,summary,content,category,seo_title,seo_description,updated_at FROM documentation_entries WHERE slug = ? AND status = 'published'", (slug,)).fetchone()
        if not row:
            return json_error("Documentation not found.", 404)
        return jsonify({"ok": True, "data": {"documentation": row_dict(row)}})

    @app.get("/api/blog")
    def public_blog():
        with get_db() as db:
            rows = db.execute("SELECT id,title,slug,excerpt,category,published_at,updated_at FROM blog_posts WHERE status = 'published' ORDER BY published_at DESC, updated_at DESC").fetchall()
        return jsonify({"ok": True, "data": {"posts": [row_dict(row) for row in rows]}})

    @app.get("/api/blog/<slug>")
    def public_blog_detail(slug):
        with get_db() as db:
            row = db.execute("SELECT id,title,slug,excerpt,content,category,seo_title,seo_description,published_at,updated_at FROM blog_posts WHERE slug = ? AND status = 'published'", (slug,)).fetchone()
        if not row:
            return json_error("Post not found.", 404)
        return jsonify({"ok": True, "data": {"post": row_dict(row)}})

    @app.get("/api/admin/media")
    @require_auth
    @require_roles(*CONTENT_ROLES)
    def admin_media(user):
        with get_db() as db:
            rows = db.execute("SELECT * FROM media ORDER BY created_at DESC").fetchall()
        return jsonify({"ok": True, "data": {"media": [row_dict(row) for row in rows]}})

    @app.post("/api/admin/media")
    @require_auth
    @require_roles(*CONTENT_ROLES)
    def create_media_metadata(user):
        return json_error("Storage provider is not connected. No file upload was performed.", 503)

    @app.get("/api/admin/payments")
    @require_auth
    @require_roles(*ADMIN_ROLES)
    def admin_payments(user):
        with get_db() as db:
            rows = db.execute("SELECT billing_records.id, billing_records.order_id, billing_records.user_id, billing_records.amount_cents, billing_records.currency, billing_records.status, billing_records.provider_reference, billing_records.created_at, users.name AS customer_name FROM billing_records JOIN users ON users.id = billing_records.user_id ORDER BY billing_records.created_at DESC").fetchall()
        return jsonify({"ok": True, "data": {"payments": [row_dict(row) for row in rows]}})

    @app.get("/api/admin/orders")
    @require_auth
    @require_roles(*ADMIN_ROLES)
    def admin_orders(user):
        with get_db() as db:
            rows = db.execute("SELECT orders.*, users.name AS customer_name, users.email AS customer_email FROM orders JOIN users ON users.id = orders.user_id ORDER BY orders.created_at DESC").fetchall()
        return jsonify({"ok": True, "data": {"orders": [row_dict(row) for row in rows]}})

    @app.get("/api/admin/orders/<order_id>")
    @require_auth
    @require_roles(*ADMIN_ROLES)
    def admin_order_detail(user, order_id):
        with get_db() as db:
            order = db.execute("SELECT orders.*, users.name AS customer_name, users.email AS customer_email FROM orders JOIN users ON users.id = orders.user_id WHERE orders.id = ?", (order_id,)).fetchone()
            if not order:
                return json_error("Order not found.", 404)
            items = db.execute("SELECT * FROM order_items WHERE order_id = ?", (order_id,)).fetchall()
            licenses = db.execute("SELECT id, product_id, license_type, status, issued_at, expires_at FROM licenses WHERE order_id = ?", (order_id,)).fetchall()
            downloads = db.execute("SELECT id, product_id, version, availability, created_at FROM downloads WHERE order_id = ?", (order_id,)).fetchall()
        return jsonify({"ok": True, "data": {"order": row_dict(order), "items": [row_dict(item) for item in items], "licenses": [row_dict(item) for item in licenses], "downloads": [row_dict(item) for item in downloads]}})

    @app.get("/api/admin/customers")
    @require_auth
    @require_roles(*ADMIN_ROLES)
    def admin_customers(user):
        with get_db() as db:
            rows = db.execute("SELECT id, name, email, status, created_at FROM users WHERE role = 'customer' ORDER BY created_at DESC").fetchall()
        return jsonify({"ok": True, "data": {"customers": [row_dict(row) for row in rows]}})

    @app.get("/api/admin/customers/<customer_id>")
    @require_auth
    @require_roles(*ADMIN_ROLES)
    def admin_customer_detail(user, customer_id):
        with get_db() as db:
            customer = db.execute("SELECT id, name, email, role, status, created_at FROM users WHERE id = ? AND role = 'customer'", (customer_id,)).fetchone()
            if not customer:
                return json_error("Customer not found.", 404)
            counts = {
                "orders": db.execute("SELECT COUNT(*) AS count FROM orders WHERE user_id = ?", (customer_id,)).fetchone()["count"],
                "downloads": db.execute("SELECT COUNT(*) AS count FROM downloads WHERE user_id = ?", (customer_id,)).fetchone()["count"],
                "licenses": db.execute("SELECT COUNT(*) AS count FROM licenses WHERE user_id = ?", (customer_id,)).fetchone()["count"],
                "tickets": db.execute("SELECT COUNT(*) AS count FROM support_tickets WHERE user_id = ?", (customer_id,)).fetchone()["count"],
            }
        return jsonify({"ok": True, "data": {"customer": row_dict(customer), "counts": counts}})

    @app.get("/api/admin/tickets")
    @require_auth
    @require_roles(*SUPPORT_ROLES)
    def admin_tickets(user):
        with get_db() as db:
            rows = db.execute("SELECT support_tickets.*, users.name AS customer_name FROM support_tickets JOIN users ON users.id = support_tickets.user_id ORDER BY support_tickets.updated_at DESC").fetchall()
        return jsonify({"ok": True, "data": {"tickets": [row_dict(row) for row in rows]}})

    @app.get("/api/admin/tickets/<ticket_id>")
    @require_auth
    @require_roles(*SUPPORT_ROLES)
    def admin_ticket_detail(user, ticket_id):
        with get_db() as db:
            ticket = db.execute("SELECT support_tickets.*, users.name AS customer_name, users.email AS customer_email FROM support_tickets JOIN users ON users.id = support_tickets.user_id WHERE support_tickets.id = ?", (ticket_id,)).fetchone()
            if not ticket:
                return json_error("Support ticket not found.", 404)
            messages = db.execute("SELECT * FROM ticket_messages WHERE ticket_id = ? ORDER BY created_at ASC", (ticket_id,)).fetchall()
        return jsonify({"ok": True, "data": {"ticket": row_dict(ticket), "messages": [row_dict(message) for message in messages]}})

    @app.post("/api/admin/tickets/<ticket_id>/messages")
    @require_auth
    @require_roles(*SUPPORT_ROLES)
    def admin_ticket_reply(user, ticket_id):
        data = payload()
        body = str(data.get("body", "")).strip()
        if not body:
            return json_error("Reply content is required.", 422)
        with get_db() as db:
            if not db.execute("SELECT 1 FROM support_tickets WHERE id = ?", (ticket_id,)).fetchone():
                return json_error("Support ticket not found.", 404)
            timestamp = now_iso()
            message_id = new_id("ticket_message")
            db.execute("INSERT INTO ticket_messages (id, ticket_id, author_user_id, body, internal_note, created_at) VALUES (?, ?, ?, ?, 0, ?)", (message_id, ticket_id, user["id"], body, timestamp))
            db.execute("UPDATE support_tickets SET updated_at = ? WHERE id = ?", (timestamp, ticket_id))
            log_activity(db, user["id"], "Support ticket replied", "support", ticket_id)
            db.commit()
        return jsonify({"ok": True, "data": {"messageId": message_id}}), 201

    @app.get("/api/admin/activity")
    @require_auth
    @require_roles(*ADMIN_ROLES)
    def admin_activity(user):
        with get_db() as db:
            rows = db.execute("SELECT activity_logs.*, users.name AS user_name FROM activity_logs JOIN users ON users.id = activity_logs.user_id ORDER BY activity_logs.created_at DESC").fetchall()
        return jsonify({"ok": True, "data": {"activity": [row_dict(row) for row in rows]}})

    @app.get("/")
    def root_index():
        if os.environ.get("NIBREXO_API_ONLY", "false").lower() == "true":
            return json_error("Not found.", 404)
        return send_from_directory(FRONTEND_DIR, "index.html")

    @app.get("/<path:requested_path>")
    def frontend_file(requested_path):
        if (
            os.environ.get("NIBREXO_API_ONLY", "false").lower() == "true"
            or requested_path.startswith("api/")
        ):
            return json_error("Not found.", 404)
        forbidden_prefixes = ("backend/", ".")
        forbidden_suffixes = (".py", ".sql", ".db", ".env", ".md", ".txt")
        if requested_path.startswith(forbidden_prefixes) or requested_path.endswith(forbidden_suffixes):
            return send_from_directory(FRONTEND_DIR, "404.html"), 404
        candidate = (FRONTEND_DIR / requested_path).resolve()
        if candidate.is_file() and str(candidate).startswith(str(FRONTEND_DIR.resolve())):
            return send_from_directory(FRONTEND_DIR, requested_path)
        return send_from_directory(FRONTEND_DIR, "404.html"), 404

    return app


if __name__ == "__main__":
    app = create_app()
    app.run(host="0.0.0.0", port=int(os.environ.get("PORT", "5000")), debug=False)
