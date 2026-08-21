import os
import sys
import tempfile
import unittest
from datetime import datetime, timedelta, timezone
from pathlib import Path

BACKEND_DIR = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(BACKEND_DIR))

from werkzeug.security import generate_password_hash
from app import create_app, new_id, now_iso
from database import DatabaseConnection, get_db, init_db
from login_rate_limit import (
    is_login_rate_limited,
    login_attempt_key,
    record_login_failure,
)


class RecordingRawConnection:
    def __init__(self):
        self.statements = []

    def execute(self, sql, parameters=(), **kwargs):
        self.statements.append((sql, parameters, kwargs))
        return self

    def fetchone(self):
        return {"failure_count": 1}

    def commit(self):
        pass

    def rollback(self):
        pass

    def close(self):
        pass


class LoginRateLimitTests(unittest.TestCase):
    def setUp(self):
        self.original = {
            key: os.environ.get(key)
            for key in ("NIBREXO_DATABASE_URL", "NIBREXO_DB_PATH", "NIBREXO_ENV", "NIBREXO_COOKIE_SECURE", "VERCEL")
        }
        os.environ.pop("NIBREXO_DATABASE_URL", None)
        os.environ.pop("NIBREXO_ENV", None)
        os.environ.pop("VERCEL", None)
        os.environ["NIBREXO_COOKIE_SECURE"] = "false"
        self.temp = tempfile.TemporaryDirectory()
        os.environ["NIBREXO_DB_PATH"] = str(Path(self.temp.name) / "login-rate.db")
        init_db()
        timestamp = now_iso()
        self.email = "owner@example.test"
        self.password = "correct-password"
        with get_db() as db:
            db.execute(
                "INSERT INTO users (id,name,email,password_hash,role,status,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?)",
                (new_id("user"), "Owner", self.email, generate_password_hash(self.password), "owner", "active", timestamp, timestamp),
            )
            db.commit()
        self.app = create_app({"TESTING": True, "SECRET_KEY": "rate-limit-test"})
        self.client = self.app.test_client()

    def tearDown(self):
        for key, value in self.original.items():
            if value is None:
                os.environ.pop(key, None)
            else:
                os.environ[key] = value
        self.temp.cleanup()

    def login(self, password, ip="192.0.2.10", email=None):
        return self.client.post(
            "/api/auth/login",
            json={"email": email or self.email, "password": password},
            environ_overrides={"REMOTE_ADDR": ip},
        )

    def test_five_failures_are_allowed_and_sixth_attempt_is_blocked(self):
        for _ in range(5):
            response = self.login("wrong-password")
            self.assertEqual(response.status_code, 401)
            self.assertEqual(response.get_json()["error"]["message"], "Invalid email or password.")
        blocked = self.login(self.password)
        self.assertEqual(blocked.status_code, 429)
        self.assertEqual(blocked.get_json()["error"]["message"], "Too many login attempts. Try again later.")

        with get_db() as db:
            rows = db.execute("SELECT * FROM login_attempts").fetchall()
        self.assertEqual(len(rows), 1)
        self.assertEqual(rows[0]["failure_count"], 5)
        self.assertEqual(set(dict(rows[0])), {"key_hash", "failure_count", "window_started_at", "last_failed_at"})
        self.assertNotIn(self.email, rows[0]["key_hash"])
        self.assertNotIn("192.0.2.10", rows[0]["key_hash"])

    def test_rate_limit_is_scoped_by_normalized_email_and_ip(self):
        for _ in range(5):
            self.login("wrong-password", email=" OWNER@EXAMPLE.TEST ")
        self.assertEqual(self.login(self.password, email="owner@example.test").status_code, 429)
        self.assertEqual(self.login(self.password, ip="192.0.2.11").status_code, 200)

    def test_successful_login_clears_failure_state_and_session_remains_valid(self):
        self.assertEqual(self.login("wrong-password").status_code, 401)
        self.assertEqual(self.login("wrong-again").status_code, 401)
        success = self.login(self.password)
        self.assertEqual(success.status_code, 200)
        self.assertEqual(self.client.get("/api/auth/me").status_code, 200)
        with get_db() as db:
            count = db.execute("SELECT COUNT(*) AS count FROM login_attempts").fetchone()["count"]
        self.assertEqual(count, 0)
        self.client.post("/api/auth/logout")
        self.assertEqual(self.client.get("/api/auth/me").status_code, 401)

    def test_window_expiration_removes_old_failure_state(self):
        key = login_attempt_key(self.email, "192.0.2.10")
        old = datetime.now(timezone.utc) - timedelta(minutes=16)
        with get_db() as db:
            for _ in range(5):
                record_login_failure(db, key, old)
            db.commit()
        with get_db() as db:
            self.assertFalse(is_login_rate_limited(db, key, datetime.now(timezone.utc)))
            db.commit()
            row = db.execute("SELECT failure_count FROM login_attempts WHERE key_hash = ?", (key,)).fetchone()
            self.assertEqual(row["failure_count"], 0)

    def test_unknown_account_uses_same_error_contract(self):
        unknown = self.login("wrong-password", email="missing@example.test")
        known = self.login("wrong-password")
        self.assertEqual(unknown.status_code, 401)
        self.assertEqual(known.status_code, 401)
        self.assertEqual(unknown.get_json(), known.get_json())

    def test_rate_limit_upsert_generates_postgresql_placeholders(self):
        raw = RecordingRawConnection()
        db = DatabaseConnection(raw, "postgresql")
        record_login_failure(db, "a" * 64, datetime.now(timezone.utc))
        upsert = raw.statements[0][0]
        self.assertIn("ON CONFLICT(key_hash) DO UPDATE", upsert)
        self.assertIn("VALUES (%s, 1, %s, %s)", upsert)
        self.assertNotIn("?", upsert)


if __name__ == "__main__":
    unittest.main()
