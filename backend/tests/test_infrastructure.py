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

    def configure_production_environment(self, database_path=None):
        os.environ["NIBREXO_ENV"] = "production"
        os.environ["FLASK_SECRET_KEY"] = "a-real-production-secret-value-that-is-long-enough"
        os.environ["NIBREXO_DB_PATH"] = str(database_path or self.db_path)
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

    def test_production_startup_refuses_missing_database_without_recreating_it(self):
        missing_database = Path(self.temp.name) / "missing" / "nibrexo.db"
        self.configure_production_environment(missing_database)
        with self.assertRaises(RuntimeError):
            create_app()
        self.assertFalse(missing_database.exists())

    def test_production_migration_command_creates_configured_database_before_wsgi_startup(self):
        production_database = Path(self.temp.name) / "production-volume" / "nibrexo.db"
        self.configure_production_environment(production_database)
        result = subprocess.run(
            [sys.executable, "backend/manage.py", "migrate"],
            cwd=PROJECT_ROOT,
            env=os.environ.copy(),
            capture_output=True,
            text=True,
            timeout=20,
        )
        self.assertEqual(result.returncode, 0, result.stderr)
        self.assertTrue(production_database.is_file())
        self.assertIn("Migrations applied.", result.stdout)
        self.assertTrue(all(item["applied"] for item in migration_status()))
        self.assertEqual(create_app().test_client().get("/api/health").status_code, 200)

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

    def test_wsgi_entrypoint_loads_in_production_mode_without_development_server(self):
        self.configure_production_environment()
        environment = os.environ.copy()
        command = (
            "from backend.wsgi import app\n"
            "from werkzeug.test import Client\n"
            "from werkzeug.wrappers import Response\n"
            "response = Client(app, Response).get('/api/health')\n"
            "print(response.status_code)\n"
        )
        result = subprocess.run(
            [sys.executable, "-c", command],
            cwd=PROJECT_ROOT,
            env=environment,
            capture_output=True,
            text=True,
            timeout=20,
        )
        self.assertEqual(result.returncode, 0, result.stderr)
        self.assertEqual(result.stdout.strip(), "200")

        missing_environment = environment.copy()
        missing_environment.pop("NIBREXO_ENV", None)
        rejected = subprocess.run(
            [sys.executable, "-c", "from backend.wsgi import app"],
            cwd=PROJECT_ROOT,
            env=missing_environment,
            capture_output=True,
            text=True,
            timeout=20,
        )
        self.assertNotEqual(rejected.returncode, 0)
        self.assertIn("NIBREXO_ENV=production", rejected.stderr)

    def test_production_cookie_and_controlled_api_error_behavior(self):
        self.configure_production_environment()
        production_app = create_app()
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
