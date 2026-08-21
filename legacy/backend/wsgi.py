"""Legacy WSGI compatibility entry point; not the production deployment target.

Production is deployed through api/index.py on Vercel. This module never starts
Flask's development server or runs migrations.
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
