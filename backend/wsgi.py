"""Production WSGI entry point.

Run database migrations before a WSGI server imports this module. This module does not
start Flask's development server and does not run migrations automatically.
"""
from pathlib import Path
import os
import sys

if os.environ.get("NIBREXO_ENV") != "production":
    raise RuntimeError("Production WSGI startup requires NIBREXO_ENV=production.")

# Keep the existing script-style backend modules importable when this file is loaded as
# `backend.wsgi:app` from the project root by a production WSGI server.
BACKEND_DIR = Path(__file__).resolve().parent
if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))

from app import create_app

app = create_app()
