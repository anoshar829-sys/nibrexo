import os
import sqlite3
import subprocess
import sys
import tempfile
import unittest
from pathlib import Path

from cryptography.fernet import Fernet

BACKEND_DIR = Path(__file__).resolve().parents[1]
PROJECT_ROOT = BACKEND_DIR.parent
sys.path.insert(0, str(BACKEND_DIR))

from app import create_app
from backup import create_backup, restore_to_test_database
from config import readiness, validate_production_environment
from database import get_db, init_db
from migrations import MIGRATIONS_DIR, migration_status, run_migrations


ENVIRONMENT_KEYS = (
    "NIBREXO_DB_PATH",
    "NIBREXO_DATABASE_URL",
    "NIBREXO_API_ONLY",
    "NIBREXO_ENV",
    "FLASK_SECRET_KEY",
    "NIBREXO_COOKIE_SECURE",
    "LICENSE_ENCRYPTION_KEY",
    "LICENSE_ENCRYPTION_KEY_VERSION",
    "LICENSE_ENCRYPTION_PREVIOUS_KEYS",
)


class InfrastructureTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.original_environment = {key: os.environ.get(key) for key in ENVIRONMENT_KEYS}
        self.db_path = Path(self.temp.name) / "source.db"
        os.environ["NIBREXO_DB_PATH"] = str(self.db_path)
        os.environ.pop("NIBREXO_DATABASE_URL", None)
        os.environ.pop("NIBREXO_API_ONLY", None)
        os.environ.pop("NIBREXO_ENV", None)
        os.environ.pop("FLASK_SECRET_KEY", None)
        os.environ["NIBREXO_COOKIE_SECURE"] = "false"
        os.environ.pop("LICENSE_ENCRYPTION_KEY", None)
        os.environ.pop("LICENSE_ENCRYPTION_KEY_VERSION", None)
        os.environ.pop("LICENSE_ENCRYPTION_PREVIOUS_KEYS", None)
        init_db()

    def tearDown(self):
        for key, value in self.original_environment.items():
            if value is None:
                os.environ.pop(key, None)
            else:
                os.environ[key] = value
        self.temp.cleanup()

    def configure_production_environment(self):
        os.environ["NIBREXO_ENV"] = "production"
        os.environ["NIBREXO_DATABASE_URL"] = "postgresql://nibrexo:secret@db.example.test:5432/nibrexo"
        os.environ["FLASK_SECRET_KEY"] = "a-real-production-secret-value-that-is-long-enough"
        os.environ["NIBREXO_COOKIE_SECURE"] = "true"
        os.environ["LICENSE_ENCRYPTION_KEY"] = Fernet.generate_key().decode("utf-8")
        os.environ["LICENSE_ENCRYPTION_KEY_VERSION"] = "audit-v1"
        os.environ["LICENSE_ENCRYPTION_PREVIOUS_KEYS"] = "{}"

    def test_migrations_are_applied_repeatably(self):
        status = migration_status()
        self.assertTrue(status)
        self.assertTrue(all(item["applied"] for item in status))
        init_db()
        self.assertTrue(all(item["applied"] for item in migration_status()))

    def test_backup_restore_preserves_rows(self):
        with get_db() as db:
            db.execute("INSERT INTO users (id,name,email,password_hash,role,status,created_at,updated_at) VALUES ('user_test','User','user@example.com','hash','customer','active','now','now')")
            db.execute("INSERT INTO products (id,title,slug,status,created_at,updated_at) VALUES ('product_test','Product','product-test','draft','now','now')")
            db.commit()
        backup = create_backup(Path(self.temp.name) / "backups")
        restored_path = restore_to_test_database(backup, Path(self.temp.name) / "restored.db")
        restored = sqlite3.connect(restored_path)
        try:
            self.assertEqual(restored.execute("SELECT COUNT(*) FROM users").fetchone()[0], 1)
            self.assertEqual(restored.execute("SELECT COUNT(*) FROM products").fetchone()[0], 1)
        finally:
            restored.close()

    def test_production_environment_requires_explicit_valid_configuration(self):
        os.environ["NIBREXO_ENV"] = "production"
        with self.assertRaises(RuntimeError):
            validate_production_environment()

        self.configure_production_environment()
        validate_production_environment()
        state = readiness()
        self.assertTrue(state["ready_for_production"])
        self.assertTrue(all(state["required"].values()))

        os.environ["LICENSE_ENCRYPTION_PREVIOUS_KEYS"] = "not-json"
        with self.assertRaises(RuntimeError):
            validate_production_environment()

    def test_production_startup_refuses_sqlite_fallback_without_creating_it(self):
        missing_database = Path(self.temp.name) / "missing" / "nibrexo.db"
        os.environ["NIBREXO_ENV"] = "production"
        os.environ["NIBREXO_DB_PATH"] = str(missing_database)
        os.environ.pop("NIBREXO_DATABASE_URL", None)
        with self.assertRaises(RuntimeError):
            create_app()
        self.assertFalse(missing_database.exists())

    def test_local_migration_command_creates_sqlite_and_production_requires_url(self):
        local_database = Path(self.temp.name) / "local" / "nibrexo.db"
        os.environ["NIBREXO_DB_PATH"] = str(local_database)
        result = subprocess.run(
            [sys.executable, "backend/manage.py", "migrate"],
            cwd=PROJECT_ROOT,
            env=os.environ.copy(),
            capture_output=True,
            text=True,
            timeout=20,
        )
        self.assertEqual(result.returncode, 0, result.stderr)
        self.assertTrue(local_database.is_file())
        self.assertIn("Migrations applied.", result.stdout)

        production_environment = os.environ.copy()
        production_environment["NIBREXO_ENV"] = "production"
        production_environment.pop("NIBREXO_DATABASE_URL", None)
        rejected = subprocess.run(
            [sys.executable, "backend/manage.py", "migrate"],
            cwd=PROJECT_ROOT,
            env=production_environment,
            capture_output=True,
            text=True,
            timeout=20,
        )
        self.assertNotEqual(rejected.returncode, 0)
        self.assertIn("production database configuration", rejected.stderr)

    def test_forward_migration_preserves_existing_data_and_starts_app_and_worker(self):
        legacy_path = Path(self.temp.name) / "legacy.db"
        os.environ["NIBREXO_DB_PATH"] = str(legacy_path)
        connection = sqlite3.connect(legacy_path)
        try:
            connection.executescript((MIGRATIONS_DIR / "001_initial.sql").read_text())
            connection.execute("CREATE TABLE schema_migrations (version TEXT PRIMARY KEY, applied_at TEXT NOT NULL)")
            connection.execute("INSERT INTO schema_migrations (version, applied_at) VALUES ('001_initial', 'before-upgrade')")
            connection.execute("INSERT INTO users (id,name,email,password_hash,role,status,created_at,updated_at) VALUES ('legacy_user','Legacy User','legacy@example.com','hash','customer','active','before','before')")
            connection.execute("INSERT INTO products (id,title,slug,status,created_at,updated_at) VALUES ('legacy_product','Legacy Product','legacy-product','draft','before','before')")
            connection.execute("INSERT INTO workflows (id,name,status,definition_json,created_at,updated_at) VALUES ('legacy_workflow','Legacy Workflow','active','{\"nodes\":[]}','before','before')")
            connection.execute("INSERT INTO integration_events (id,event_type,payload_json,idempotency_key,status,created_at) VALUES ('legacy_event','customer.registered','{}','legacy-event','recorded','before')")
            connection.execute("INSERT INTO workflow_executions (id,workflow_id,event_id,execution_key,status,created_at,updated_at) VALUES ('legacy_execution','legacy_workflow','legacy_event','legacy-execution-key','queued','before','before')")
            connection.commit()
        finally:
            connection.close()

        run_migrations()
        self.assertTrue(all(item["applied"] for item in migration_status()))
        with get_db() as db:
            self.assertEqual(db.execute("SELECT name FROM users WHERE id = 'legacy_user'").fetchone()["name"], "Legacy User")
            self.assertEqual(db.execute("SELECT title FROM products WHERE id = 'legacy_product'").fetchone()["title"], "Legacy Product")
            execution = db.execute("SELECT status, attempt_count, lock_token FROM workflow_executions WHERE id = 'legacy_execution'").fetchone()
            self.assertEqual(execution["status"], "queued")
            self.assertEqual(execution["attempt_count"], 0)
            self.assertIsNone(execution["lock_token"])

        app = create_app({"TESTING": True, "SECRET_KEY": "test-secret"})
        self.assertEqual(app.test_client().get("/api/health").status_code, 200)

        environment = os.environ.copy()
        environment["NIBREXO_DB_PATH"] = str(legacy_path)
        environment.pop("NIBREXO_ENV", None)
        result = subprocess.run(
            [sys.executable, "backend/worker.py", "--once"],
            cwd=PROJECT_ROOT,
            env=environment,
            capture_output=True,
            text=True,
            timeout=20,
        )
        self.assertEqual(result.returncode, 0, result.stderr)
        self.assertIn("'processed': True", result.stdout)

    def test_legacy_wsgi_entrypoint_fails_closed_without_production_configuration(self):
        environment = os.environ.copy()
        environment.pop("NIBREXO_ENV", None)
        environment.pop("NIBREXO_DATABASE_URL", None)
        rejected = subprocess.run(
            [sys.executable, "-c", "from backend.wsgi import app"],
            cwd=PROJECT_ROOT,
            env=environment,
            capture_output=True,
            text=True,
            timeout=20,
        )
        self.assertNotEqual(rejected.returncode, 0)
        self.assertIn("NIBREXO_ENV=production", rejected.stderr)

    def test_production_cookie_and_controlled_api_error_behavior(self):
        os.environ["NIBREXO_COOKIE_SECURE"] = "true"
        production_app = create_app({"TESTING": True, "SECRET_KEY": "test-secret"})
        production_client = production_app.test_client()
        registration = production_client.post("/api/auth/register", json={"name": "Production Test", "email": "production-test@example.com", "password": "password123"})
        self.assertEqual(registration.status_code, 201)
        cookie = registration.headers.get("Set-Cookie", "")
        self.assertIn("Secure", cookie)
        self.assertIn("HttpOnly", cookie)
        self.assertIn("SameSite=Lax", cookie)

        app = create_app({"TESTING": False, "SECRET_KEY": "test-secret"})

        @app.get("/api/audit-force-error")
        def audit_force_error():
            raise RuntimeError("/private/audit/path must not reach the response")

        response = app.test_client().get("/api/audit-force-error")
        self.assertEqual(response.status_code, 500)
        body = response.get_json()
        self.assertEqual(body["error"]["message"], "The service is temporarily unavailable.")
        self.assertNotIn("/private/audit/path", response.get_data(as_text=True))
        not_found = app.test_client().get("/api/not-a-route")
        self.assertEqual(not_found.status_code, 404)
        self.assertEqual(not_found.get_json()["error"]["message"], "Not found.")


if __name__ == "__main__":
    unittest.main()
