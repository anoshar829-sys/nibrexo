import hashlib
import json
import uuid
from datetime import datetime, timezone

from database import get_db

ALLOWED_EVENTS = {
    "customer.registered",
    "order.paid",
    "support.ticket.created",
    "newsletter.subscribed",
    "form.submitted",
}
SENSITIVE_KEYS = {"password", "token", "secret", "api_key", "license_key", "download_url"}


def now_iso():
    return datetime.now(timezone.utc).isoformat()


def new_id(prefix):
    return f"{prefix}_{uuid.uuid4().hex}"


def safe_payload(payload):
    if not isinstance(payload, dict):
        return {}
    return {key: value for key, value in payload.items() if key.lower() not in SENSITIVE_KEYS}


def emit_event(event_type, payload=None, actor_user_id=None, idempotency_key=None):
    """Record a safe internal event exactly once, including concurrent request retries."""
    if event_type not in ALLOWED_EVENTS:
        return None
    safe = safe_payload(payload or {})
    key = idempotency_key or hashlib.sha256(f"{event_type}:{json.dumps(safe, sort_keys=True)}".encode()).hexdigest()
    event_id = new_id("event")
    with get_db() as db:
        inserted = db.execute(
            "INSERT OR IGNORE INTO integration_events (id, event_type, actor_user_id, payload_json, idempotency_key, status, created_at) VALUES (?, ?, ?, ?, ?, 'recorded', ?)",
            (event_id, event_type, actor_user_id, json.dumps(safe), key, now_iso()),
        )
        db.commit()
        if inserted.rowcount == 1:
            return event_id
        existing = db.execute("SELECT id FROM integration_events WHERE idempotency_key = ?", (key,)).fetchone()
    return existing["id"] if existing else None
