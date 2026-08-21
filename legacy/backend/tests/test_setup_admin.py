import os
import secrets
import sys
import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch

BACKEND_DIR = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(BACKEND_DIR))

from database import get_db
from setup_admin import create_operator, provision_founder_from_environment


class SetupAdminTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.db_path = Path(self.temp.name) / "setup-admin.db"
        self.original = os.environ.get("NIBREXO_DB_PATH")
        os.environ["NIBREXO_DB_PATH"] = str(self.db_path)
        self.password = secrets.token_urlsafe(18)

    def tearDown(self):
        if self.original is None:
            os.environ.pop("NIBREXO_DB_PATH", None)
        else:
            os.environ["NIBREXO_DB_PATH"] = self.original
        self.temp.cleanup()

    def test_owner_creation_hashes_password_and_prevents_duplicate_founder(self):
        result = create_operator("founder@example.test", "Founder", self.password, "owner")
        self.assertEqual(result["role"], "owner")
        with get_db() as db:
            row = db.execute("SELECT id, password_hash, role, status FROM users WHERE email = ?", ("founder@example.test",)).fetchone()
            team = db.execute("SELECT role, status FROM team_members WHERE user_id = ?", (result["id"],)).fetchone()
        self.assertEqual(row["role"], "owner")
        self.assertEqual(row["status"], "active")
        self.assertNotEqual(row["password_hash"], self.password)
        self.assertTrue(row["password_hash"])
        self.assertEqual(team["role"], "owner")
        self.assertEqual(team["status"], "active")
        with self.assertRaisesRegex(ValueError, "owner account already exists"):
            create_operator("another-founder@example.test", "Another Founder", secrets.token_urlsafe(18), "owner")
        with self.assertRaisesRegex(ValueError, "email already exists"):
            create_operator("founder@example.test", "Founder", self.password, "owner")

    def test_from_environment_provisions_owner_without_leaking_secret_values(self):
        environment = {
            "NIBREXO_FOUNDER_EMAIL": "founder-env@example.test",
            "NIBREXO_FOUNDER_NAME": "Founder Environment",
            "NIBREXO_FOUNDER_PASSWORD": self.password,
        }
        with patch.dict(os.environ, environment, clear=False):
            result = provision_founder_from_environment()
        self.assertEqual(result["role"], "owner")
        with get_db() as db:
            row = db.execute("SELECT email, password_hash, role, status FROM users WHERE id = ?", (result["id"],)).fetchone()
            owners = db.execute("SELECT COUNT(*) FROM users WHERE role = 'owner'").fetchone()[0]
            teams = db.execute("SELECT COUNT(*) FROM team_members WHERE user_id = ? AND role = 'owner' AND status = 'active'", (result["id"],)).fetchone()[0]
        self.assertEqual(row["email"], "founder-env@example.test")
        self.assertEqual(row["role"], "owner")
        self.assertEqual(row["status"], "active")
        self.assertNotEqual(row["password_hash"], self.password)
        self.assertEqual(owners, 1)
        self.assertEqual(teams, 1)

    def test_from_environment_requires_secrets_and_production_postgresql(self):
        with patch.dict(os.environ, {}, clear=True):
            with self.assertRaisesRegex(RuntimeError, "Founder provisioning secrets are unavailable"):
                provision_founder_from_environment()
        environment = {
            "NIBREXO_ENV": "production",
            "NIBREXO_FOUNDER_EMAIL": "founder-env@example.test",
            "NIBREXO_FOUNDER_NAME": "Founder Environment",
            "NIBREXO_FOUNDER_PASSWORD": self.password,
        }
        with patch.dict(os.environ, environment, clear=True):
            with self.assertRaisesRegex(RuntimeError, "requires PostgreSQL"):
                provision_founder_from_environment()


if __name__ == "__main__":
    unittest.main()
