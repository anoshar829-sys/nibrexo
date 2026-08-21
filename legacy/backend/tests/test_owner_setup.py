import os
import re
import secrets
import sys
import tempfile
import unittest
from pathlib import Path

BACKEND_DIR = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(BACKEND_DIR))

from app import OWNER_SETUP_ATTEMPTS, OWNER_SETUP_ISSUED_TOKENS, create_app
from database import get_db, init_db


class OwnerSetupRouteTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.original = {key: os.environ.get(key) for key in ("NIBREXO_DB_PATH", "NIBREXO_ENV", "NIBREXO_COOKIE_SECURE", "FLASK_SECRET_KEY")}
        os.environ["NIBREXO_DB_PATH"] = str(Path(self.temp.name) / "owner-setup.db")
        os.environ.pop("NIBREXO_ENV", None)
        os.environ.pop("FLASK_SECRET_KEY", None)
        os.environ["NIBREXO_COOKIE_SECURE"] = "false"
        init_db()
        OWNER_SETUP_ATTEMPTS.clear()
        OWNER_SETUP_ISSUED_TOKENS.clear()
        self.app = create_app({"TESTING": True, "SECRET_KEY": "owner-setup-test"})
        self.client = self.app.test_client()
        self.password = secrets.token_urlsafe(18)

    def tearDown(self):
        for key, value in self.original.items():
            if value is None:
                os.environ.pop(key, None)
            else:
                os.environ[key] = value
        self.temp.cleanup()

    def setup_token(self):
        page = self.client.get("/setup/owner")
        self.assertEqual(page.status_code, 200)
        body = page.get_data(as_text=True)
        token = re.search(r'name="_setup_token" value="([^"]+)"', body).group(1)
        cookie = page.headers.get("Set-Cookie", "")
        self.assertIn("nibrexo_owner_setup", cookie)
        self.assertIn("HttpOnly", cookie)
        self.assertIn("SameSite=Strict", cookie)
        self.assertIn("Path=/setup/owner", cookie)
        self.assertIn("private, no-store", page.headers.get("Cache-Control", ""))
        self.assertEqual(page.headers.get("Pragma"), "no-cache")
        self.assertEqual(page.headers.get("Expires"), "0")
        self.assertIn("Cookie", page.headers.get("Vary", ""))
        self.assertNotIn(self.password, body)
        return token

    def test_first_owner_setup_uses_existing_session_and_disables_route(self):
        token = self.setup_token()
        response = self.client.post(
            "/setup/owner",
            data={
                "_setup_token": token,
                "name": "Owner Setup Test",
                "email": "owner-setup@example.test",
                "password": self.password,
                "confirm_password": self.password,
            },
            follow_redirects=False,
        )
        self.assertEqual(response.status_code, 303)
        self.assertEqual(response.headers["Location"], "/admin/index.html")
        self.assertIn("nibrexo_session", response.headers.get("Set-Cookie", ""))
        with get_db() as db:
            owner = db.execute("SELECT id, role, status, password_hash FROM users WHERE email = ?", ("owner-setup@example.test",)).fetchone()
            team = db.execute("SELECT role, status FROM team_members WHERE user_id = ?", (owner["id"],)).fetchone()
            owners = db.execute("SELECT COUNT(*) FROM users WHERE role = 'owner'").fetchone()[0]
        self.assertEqual(owner["role"], "owner")
        self.assertEqual(owner["status"], "active")
        self.assertNotEqual(owner["password_hash"], self.password)
        self.assertEqual(team["role"], "owner")
        self.assertEqual(team["status"], "active")
        self.assertEqual(owners, 1)
        self.assertEqual(self.client.get("/api/auth/me").get_json()["data"]["user"]["role"], "owner")
        self.assertEqual(self.client.get("/api/admin/dashboard").status_code, 200)
        disabled_get = self.client.get("/setup/owner")
        disabled_post = self.client.post("/setup/owner", data={})
        try:
            self.assertEqual(disabled_get.status_code, 404)
            self.assertEqual(disabled_post.status_code, 404)
        finally:
            disabled_get.close()
            disabled_post.close()

    def test_setup_accepts_server_issued_token_when_embedded_preview_cannot_return_cookie(self):
        token = self.setup_token()
        self.client.delete_cookie("nibrexo_owner_setup", path="/setup/owner")
        self.assertIsNone(self.client.get_cookie("nibrexo_owner_setup", path="/setup/owner"))

        response = self.client.post(
            "/setup/owner",
            data={
                "_setup_token": token,
                "name": "Embedded Preview Owner",
                "email": "embedded-preview-owner@example.test",
                "password": self.password,
                "confirm_password": self.password,
            },
            headers={"Origin": "http://localhost", "Referer": "http://localhost/setup/owner"},
            follow_redirects=False,
        )
        self.assertEqual(response.status_code, 303)
        with get_db() as db:
            owner = db.execute("SELECT role, status, password_hash FROM users WHERE email = ?", ("embedded-preview-owner@example.test",)).fetchone()
            team = db.execute("SELECT role, status FROM team_members WHERE user_id = (SELECT id FROM users WHERE email = ?)", ("embedded-preview-owner@example.test",)).fetchone()
        self.assertEqual(owner["role"], "owner")
        self.assertEqual(owner["status"], "active")
        self.assertTrue(owner["password_hash"])
        self.assertNotEqual(owner["password_hash"], self.password)
        self.assertEqual(team["role"], "owner")
        self.assertEqual(team["status"], "active")

    def test_cookie_free_fallback_rejects_cross_origin_or_different_browser_context(self):
        token = self.setup_token()
        self.client.delete_cookie("nibrexo_owner_setup", path="/setup/owner")
        cross_origin = self.client.post(
            "/setup/owner",
            data={"_setup_token": token, "name": "Owner", "email": "owner@example.test", "password": self.password, "confirm_password": self.password},
            headers={"Origin": "https://untrusted.example"},
        )
        self.assertEqual(cross_origin.status_code, 400)
        with get_db() as db:
            self.assertEqual(db.execute("SELECT COUNT(*) FROM users").fetchone()[0], 0)

        page = self.client.get("/setup/owner", headers={"User-Agent": "setup-browser-a"})
        context_token = re.search(r'name="_setup_token" value="([^"]+)"', page.get_data(as_text=True)).group(1)
        self.client.delete_cookie("nibrexo_owner_setup", path="/setup/owner")
        changed_context = self.client.post(
            "/setup/owner",
            data={"_setup_token": context_token, "name": "Owner", "email": "owner@example.test", "password": self.password, "confirm_password": self.password},
            headers={"Origin": "http://localhost", "User-Agent": "setup-browser-b"},
        )
        self.assertEqual(changed_context.status_code, 400)
        with get_db() as db:
            self.assertEqual(db.execute("SELECT COUNT(*) FROM users").fetchone()[0], 0)

    def test_new_setup_page_supersedes_a_stale_bootstrap_token(self):
        first_page = self.client.get("/setup/owner")
        first_token = re.search(r'name="_setup_token" value="([^"]+)"', first_page.get_data(as_text=True)).group(1)
        second_page = self.client.get("/setup/owner")
        second_token = re.search(r'name="_setup_token" value="([^"]+)"', second_page.get_data(as_text=True)).group(1)
        self.assertNotEqual(first_token, second_token)

        stale = self.client.post(
            "/setup/owner",
            data={"_setup_token": first_token, "name": "Owner", "email": "owner@example.test", "password": self.password, "confirm_password": self.password},
            headers={"Origin": "http://localhost", "Referer": "http://localhost/setup/owner"},
        )
        self.assertEqual(stale.status_code, 400)
        with get_db() as db:
            self.assertEqual(db.execute("SELECT COUNT(*) FROM users").fetchone()[0], 0)

    def test_setup_requires_csrf_and_public_registration_stays_customer_only(self):
        invalid = self.client.post("/setup/owner", data={"name": "Owner", "email": "owner@example.test", "password": self.password, "confirm_password": self.password})
        self.assertEqual(invalid.status_code, 400)
        with get_db() as db:
            self.assertEqual(db.execute("SELECT COUNT(*) FROM users").fetchone()[0], 0)
        token = self.setup_token()
        owner = self.client.post(
            "/setup/owner",
            data={"_setup_token": token, "name": "Owner", "email": "owner@example.test", "password": self.password, "confirm_password": self.password},
            follow_redirects=False,
        )
        self.assertEqual(owner.status_code, 303)
        customer_password = secrets.token_urlsafe(18)
        customer = self.client.post(
            "/api/auth/register",
            json={"name": "Role Injection", "email": "role-injection@example.test", "password": customer_password, "role": "owner"},
        )
        self.assertEqual(customer.status_code, 201)
        self.assertEqual(customer.get_json()["data"]["user"]["role"], "customer")

    def test_setup_rate_limit_blocks_repeated_invalid_requests(self):
        for _ in range(5):
            response = self.client.post("/setup/owner", data={})
            self.assertEqual(response.status_code, 400)
        limited = self.client.post("/setup/owner", data={})
        self.assertEqual(limited.status_code, 429)
        with get_db() as db:
            self.assertEqual(db.execute("SELECT COUNT(*) FROM users").fetchone()[0], 0)

    def test_setup_route_is_disabled_in_production_mode(self):
        os.environ["NIBREXO_ENV"] = "production"
        production_test_app = create_app({"TESTING": True, "SECRET_KEY": "owner-setup-test"})
        response = production_test_app.test_client().get("/setup/owner")
        try:
            self.assertEqual(response.status_code, 404)
        finally:
            response.close()


if __name__ == "__main__":
    unittest.main()
