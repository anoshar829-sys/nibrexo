"""Vercel Python Function entry point for the existing Nibrexo Flask API."""
import os
import sys
from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parents[1]
BACKEND_DIR = PROJECT_ROOT / "backend"
if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))


def _enforce_vercel_invariant(name, required_value, *, case_insensitive=False):
    configured = os.environ.get(name)
    if configured is None:
        os.environ[name] = required_value
        return
    matches = configured.lower() == required_value if case_insensitive else configured == required_value
    if not matches:
        raise RuntimeError("Required Vercel production configuration is invalid.")


# Missing values receive secure Vercel defaults. Explicit insecure/development
# overrides are rejected rather than silently changed.
_enforce_vercel_invariant("NIBREXO_ENV", "production")
_enforce_vercel_invariant("NIBREXO_COOKIE_SECURE", "true", case_insensitive=True)
_enforce_vercel_invariant("NIBREXO_API_ONLY", "true", case_insensitive=True)

from app import create_app

app = create_app()
