"""Server-only environment validation. Values are never returned to frontend clients."""
import json
import os
import re
from urllib.parse import urlsplit

from cryptography.fernet import Fernet

DEVELOPMENT_SECRET = "development-only-change-this"
KEY_VERSION_RE = re.compile(r"^[A-Za-z0-9][A-Za-z0-9._-]{0,63}$")


def _valid_fernet_key(value):
    if not value:
        return False
    try:
        Fernet(str(value).encode("utf-8"))
        return True
    except (ValueError, TypeError):
        return False


def _valid_key_version(value):
    return bool(isinstance(value, str) and KEY_VERSION_RE.fullmatch(value.strip()))


def _valid_postgresql_url(value=None):
    raw_url = str(value if value is not None else os.environ.get("NIBREXO_DATABASE_URL", "")).strip()
    if not raw_url:
        return False
    try:
        parsed = urlsplit(raw_url)
        _ = parsed.port
    except (TypeError, ValueError):
        return False
    return bool(
        parsed.scheme in {"postgres", "postgresql"}
        and parsed.hostname
        and parsed.username
        and parsed.password
        and parsed.path
        and parsed.path != "/"
    )


def license_key_configuration():
    """Return validation booleans only — never key material or version values."""
    active_version = str(os.environ.get("LICENSE_ENCRYPTION_KEY_VERSION", "fernet-v1")).strip()
    previous_raw = os.environ.get("LICENSE_ENCRYPTION_PREVIOUS_KEYS", "{}")
    try:
        previous = json.loads(previous_raw)
    except (TypeError, json.JSONDecodeError):
        previous = None

    previous_valid = isinstance(previous, dict)
    if previous_valid:
        for version, key in previous.items():
            normalized_version = str(version).strip()
            if (
                not _valid_key_version(normalized_version)
                or normalized_version == active_version
                or not _valid_fernet_key(key)
            ):
                previous_valid = False
                break

    return {
        "active_key": _valid_fernet_key(os.environ.get("LICENSE_ENCRYPTION_KEY")),
        "key_version": _valid_key_version(active_version),
        "previous_keys": previous_valid,
    }


def provider_configuration():
    """Configuration presence only; this never reports a provider as connected."""
    return {
        "payment": bool(os.environ.get("PAYMENT_PROVIDER") and os.environ.get("PAYMENT_SECRET")),
        "storage": bool(os.environ.get("STORAGE_PROVIDER") and os.environ.get("STORAGE_BUCKET") and os.environ.get("STORAGE_ACCESS_KEY") and os.environ.get("STORAGE_SECRET_KEY")),
        "email": bool(os.environ.get("EMAIL_PROVIDER") and os.environ.get("EMAIL_API_KEY") and os.environ.get("EMAIL_FROM")),
        "ai": bool(os.environ.get("AI_PROVIDER") and os.environ.get("AI_API_KEY") and os.environ.get("AI_MODEL")),
        "crm": bool(os.environ.get("CRM_PROVIDER") and os.environ.get("CRM_API_KEY")),
        "newsletter": bool(os.environ.get("NEWSLETTER_PROVIDER") and os.environ.get("NEWSLETTER_API_KEY")),
        "analytics": bool(os.environ.get("ANALYTICS_PROVIDER") and os.environ.get("ANALYTICS_KEY")),
    }


def readiness(require_existing_database=True):
    # require_existing_database is retained for API compatibility; PostgreSQL existence is
    # verified by migration status/health checks rather than filesystem inspection.
    del require_existing_database
    production = os.environ.get("NIBREXO_ENV") == "production"
    secret = os.environ.get("FLASK_SECRET_KEY")
    license_configuration_state = license_key_configuration()
    required = {
        "database_configuration": _valid_postgresql_url() if production else True,
        "application_secret": bool(secret and secret != DEVELOPMENT_SECRET and len(secret) >= 32),
        "secure_cookie": os.environ.get("NIBREXO_COOKIE_SECURE", "false").lower() == "true" if production else True,
        "license_encryption": license_configuration_state["active_key"],
        "license_key_version": license_configuration_state["key_version"],
        "license_previous_keys": license_configuration_state["previous_keys"],
    }
    providers = provider_configuration()
    return {
        "environment": "production" if production else "development",
        "required": required,
        "providers": providers,
        "ready_for_production": production and all(required.values()),
    }


def validate_database_environment():
    """Validate only what migration/database commands require."""
    if os.environ.get("NIBREXO_ENV") == "production" and not _valid_postgresql_url():
        raise RuntimeError("Required production database configuration is missing or invalid.")


def validate_production_environment(*, require_existing_database=True):
    """Fail closed in production without disclosing missing values or credentials."""
    if os.environ.get("NIBREXO_ENV") != "production":
        return
    readiness_state = readiness(require_existing_database=require_existing_database)
    if not all(readiness_state["required"].values()):
        raise RuntimeError("Required production configuration is missing or invalid.")
