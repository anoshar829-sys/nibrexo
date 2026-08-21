"""Database-backed login throttling shared by SQLite and PostgreSQL."""
import hashlib
import ipaddress
import os
from datetime import datetime, timedelta, timezone

LOGIN_RATE_LIMIT_MAX_FAILURES = 5
LOGIN_RATE_LIMIT_WINDOW_MINUTES = 15


def _utc_now(value=None):
    current = value or datetime.now(timezone.utc)
    if current.tzinfo is None:
        current = current.replace(tzinfo=timezone.utc)
    return current.astimezone(timezone.utc)


def normalize_login_email(email):
    return str(email or "").strip().lower()


def canonical_client_ip(request):
    candidates = []
    # Vercel supplies the public client chain. Outside Vercel, do not trust a
    # caller-controlled forwarding header.
    if os.environ.get("VERCEL") == "1":
        candidates.extend(request.headers.get("X-Vercel-Forwarded-For", "").split(","))
        candidates.extend(request.headers.get("X-Forwarded-For", "").split(","))
    candidates.append(request.remote_addr or "")
    for candidate in candidates:
        try:
            return ipaddress.ip_address(str(candidate).strip()).compressed
        except ValueError:
            continue
    return "unknown"


def login_attempt_key(email, client_ip):
    normalized = normalize_login_email(email)
    material = f"{normalized}\0{client_ip}".encode("utf-8")
    return hashlib.sha256(material).hexdigest()


def purge_expired_attempts(db, now=None):
    cutoff = (_utc_now(now) - timedelta(minutes=LOGIN_RATE_LIMIT_WINDOW_MINUTES)).isoformat()
    db.execute("DELETE FROM login_attempts WHERE last_failed_at < ?", (cutoff,))


def is_login_rate_limited(db, key_hash, now=None):
    current = _utc_now(now)
    cutoff = current - timedelta(minutes=LOGIN_RATE_LIMIT_WINDOW_MINUTES)
    purge_expired_attempts(db, current)
    current_iso = current.isoformat()
    db.execute(
        """INSERT INTO login_attempts
             (key_hash, failure_count, window_started_at, last_failed_at)
           VALUES (?, 0, ?, ?)
           ON CONFLICT(key_hash) DO NOTHING""",
        (key_hash, current_iso, current_iso),
    )
    lock_clause = " FOR UPDATE" if db.engine == "postgresql" else ""
    row = db.execute(
        "SELECT failure_count, window_started_at FROM login_attempts WHERE key_hash = ?" + lock_clause,
        (key_hash,),
    ).fetchone()
    if not row:
        return False
    try:
        window_started = datetime.fromisoformat(row["window_started_at"])
        if window_started.tzinfo is None:
            window_started = window_started.replace(tzinfo=timezone.utc)
    except (TypeError, ValueError):
        db.execute("DELETE FROM login_attempts WHERE key_hash = ?", (key_hash,))
        return False
    if window_started.astimezone(timezone.utc) < cutoff:
        db.execute("DELETE FROM login_attempts WHERE key_hash = ?", (key_hash,))
        return False
    return int(row["failure_count"]) >= LOGIN_RATE_LIMIT_MAX_FAILURES


def record_login_failure(db, key_hash, now=None):
    current = _utc_now(now)
    current_iso = current.isoformat()
    cutoff_iso = (current - timedelta(minutes=LOGIN_RATE_LIMIT_WINDOW_MINUTES)).isoformat()
    db.execute(
        """INSERT INTO login_attempts
             (key_hash, failure_count, window_started_at, last_failed_at)
           VALUES (?, 1, ?, ?)
           ON CONFLICT(key_hash) DO UPDATE SET
             failure_count = CASE
               WHEN login_attempts.window_started_at < ? THEN 1
               ELSE login_attempts.failure_count + 1
             END,
             window_started_at = CASE
               WHEN login_attempts.window_started_at < ? THEN excluded.window_started_at
               ELSE login_attempts.window_started_at
             END,
             last_failed_at = excluded.last_failed_at""",
        (key_hash, current_iso, current_iso, cutoff_iso, cutoff_iso),
    )
    row = db.execute(
        "SELECT failure_count FROM login_attempts WHERE key_hash = ?",
        (key_hash,),
    ).fetchone()
    return int(row["failure_count"]) if row else 0


def clear_login_failures(db, key_hash):
    db.execute("DELETE FROM login_attempts WHERE key_hash = ?", (key_hash,))
