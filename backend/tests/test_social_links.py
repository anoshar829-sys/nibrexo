import os
import sys
import tempfile
import unittest
from pathlib import Path

BACKEND_DIR = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(BACKEND_DIR))

from werkzeug.security import generate_password_hash
from app import create_app, new_id, now_iso
from database import get_db, init_db


class SocialContactLinksTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.original_environment = {key: os.environ.get(key) for key in ("NIBREXO_DB_PATH", "NIBREXO_ENV", "NIBREXO_COOKIE_SECURE", "FLASK_SECRET_KEY")}
        os.environ["NIBREXO_DB_PATH"] = str(Path(self.temp.name) / "social-links.db")
        os.environ.pop("NIBREXO_ENV", None)
        os.environ.pop("FLASK_SECRET_KEY", None)
        os.environ["NIBREXO_COOKIE_SECURE"] = "false"
        init_db()
        self.app = create_app({"TESTING": True, "SECRET_KEY": "social-links-test"})
        self.clients = {name: self.app.test_client() for name in ("guest", "owner", "admin", "manager", "customer")}
        timestamp = now_iso()
        with get_db() as db:
            for name, role in (("owner", "owner"), ("admin", "admin"), ("manager", "manager"), ("customer", "customer")):
                db.execute(
                    "INSERT INTO users (id,name,email,password_hash,role,status,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?)",
                    (new_id("user"), name, f"{name}@example.test", generate_password_hash("password123"), role, "active", timestamp, timestamp),
                )
            db.commit()
        for name in ("owner", "admin", "manager", "customer"):
            response = self.clients[name].post("/api/auth/login", json={"email": f"{name}@example.test", "password": "password123"})
            self.assertEqual(response.status_code, 200)

    def tearDown(self):
        for key, value in self.original_environment.items():
            if value is None:
                os.environ.pop(key, None)
            else:
                os.environ[key] = value
        self.temp.cleanup()

    @staticmethod
    def payload(platform="instagram", value="https://example.test/instagram", enabled=True, display_order=20):
        return {"links": [{"platform": platform, "value": value, "enabled": enabled, "displayOrder": display_order}]}

    def test_owner_crud_public_response_and_restart_persistence(self):
        public_empty = self.clients["guest"].get("/api/settings/social-links")
        self.assertEqual(public_empty.status_code, 200)
        self.assertEqual(public_empty.get_json()["data"]["links"], [])

        initial_admin = self.clients["owner"].get("/api/admin/settings/social-links")
        self.assertEqual(initial_admin.status_code, 200)
        self.assertEqual([item["platform"] for item in initial_admin.get_json()["data"]["links"]], ["tiktok", "instagram", "facebook", "pinterest", "whatsapp", "email"])

        created = self.clients["owner"].patch("/api/admin/settings/social-links", json=self.payload())
        self.assertEqual(created.status_code, 200)
        saved_instagram = next(item for item in created.get_json()["data"]["links"] if item["platform"] == "instagram")
        self.assertTrue(saved_instagram["enabled"])
        self.assertEqual(saved_instagram["value"], "https://example.test/instagram")

        public_created = self.clients["guest"].get("/api/settings/social-links")
        self.assertEqual(public_created.status_code, 200)
        self.assertEqual(public_created.get_json()["data"]["links"], [{"platform": "instagram", "label": "Instagram", "href": "https://example.test/instagram", "displayOrder": 20}])
        self.assertNotIn("value", public_created.get_data(as_text=True))

        changed = self.clients["owner"].patch("/api/admin/settings/social-links", json=self.payload(value="https://example.test/instagram-updated"))
        self.assertEqual(changed.status_code, 200)
        self.assertEqual(self.clients["guest"].get("/api/settings/social-links").get_json()["data"]["links"][0]["href"], "https://example.test/instagram-updated")

        # A fresh app instance using the same database simulates a server restart.
        restarted_app = create_app({"TESTING": True, "SECRET_KEY": "social-links-restart"})
        restarted_owner = restarted_app.test_client()
        self.assertEqual(restarted_owner.post("/api/auth/login", json={"email": "owner@example.test", "password": "password123"}).status_code, 200)
        restarted_value = restarted_owner.get("/api/admin/settings/social-links").get_json()["data"]["links"]
        self.assertEqual(next(item for item in restarted_value if item["platform"] == "instagram")["value"], "https://example.test/instagram-updated")

        disabled = self.clients["owner"].patch("/api/admin/settings/social-links", json=self.payload(value="https://example.test/instagram-updated", enabled=False))
        self.assertEqual(disabled.status_code, 200)
        self.assertEqual(self.clients["guest"].get("/api/settings/social-links").get_json()["data"]["links"], [])

        removed = self.clients["owner"].patch("/api/admin/settings/social-links", json=self.payload(value="", enabled=False))
        self.assertEqual(removed.status_code, 200)
        self.assertEqual(self.clients["guest"].get("/api/settings/social-links").get_json()["data"]["links"], [])
        with get_db() as db:
            self.assertIsNone(db.execute("SELECT value_json FROM site_settings WHERE setting_key = 'social_contact_links'").fetchone())

    def test_all_platforms_public_values_and_email_mailto(self):
        links = [
            {"platform": "tiktok", "value": "https://example.test/tiktok", "enabled": True, "displayOrder": 10},
            {"platform": "instagram", "value": "https://example.test/instagram", "enabled": True, "displayOrder": 20},
            {"platform": "facebook", "value": "https://example.test/facebook", "enabled": True, "displayOrder": 30},
            {"platform": "pinterest", "value": "https://example.test/pinterest", "enabled": True, "displayOrder": 40},
            {"platform": "whatsapp", "value": "https://wa.me/1234567890", "enabled": True, "displayOrder": 50},
            {"platform": "email", "value": "hello@example.test", "enabled": True, "displayOrder": 60},
        ]
        response = self.clients["admin"].patch("/api/admin/settings/social-links", json={"links": links})
        self.assertEqual(response.status_code, 200)
        public = self.clients["guest"].get("/api/settings/social-links").get_json()["data"]["links"]
        self.assertEqual([item["platform"] for item in public], ["tiktok", "instagram", "facebook", "pinterest", "whatsapp", "email"])
        self.assertEqual(public[-1]["href"], "mailto:hello@example.test")

    def test_each_platform_change_disable_reenable_and_remove(self):
        cases = [
            ("tiktok", "https://example.test/tiktok-one", "https://example.test/tiktok-two"),
            ("instagram", "https://example.test/instagram-one", "https://example.test/instagram-two"),
            ("facebook", "https://example.test/facebook-one", "https://example.test/facebook-two"),
            ("pinterest", "https://example.test/pinterest-one", "https://example.test/pinterest-two"),
            ("whatsapp", "https://wa.me/1234567890", "https://wa.me/1987654321"),
            ("email", "hello@example.test", "support@example.test"),
        ]
        for index, (platform, original, changed) in enumerate(cases, start=1):
            order = index * 10
            created = self.clients["owner"].patch("/api/admin/settings/social-links", json=self.payload(platform, original, True, order))
            self.assertEqual(created.status_code, 200)
            public = self.clients["guest"].get("/api/settings/social-links").get_json()["data"]["links"]
            expected_original = f"mailto:{original}" if platform == "email" else original
            self.assertEqual(public, [{"platform": platform, "label": created.get_json()["data"]["links"][index - 1]["label"], "href": expected_original, "displayOrder": order}])

            updated = self.clients["owner"].patch("/api/admin/settings/social-links", json=self.payload(platform, changed, True, order))
            self.assertEqual(updated.status_code, 200)
            expected_changed = f"mailto:{changed}" if platform == "email" else changed
            self.assertEqual(self.clients["guest"].get("/api/settings/social-links").get_json()["data"]["links"][0]["href"], expected_changed)

            disabled = self.clients["owner"].patch("/api/admin/settings/social-links", json=self.payload(platform, changed, False, order))
            self.assertEqual(disabled.status_code, 200)
            self.assertEqual(self.clients["guest"].get("/api/settings/social-links").get_json()["data"]["links"], [])

            reenabled = self.clients["owner"].patch("/api/admin/settings/social-links", json=self.payload(platform, changed, True, order))
            self.assertEqual(reenabled.status_code, 200)
            self.assertEqual(self.clients["guest"].get("/api/settings/social-links").get_json()["data"]["links"][0]["href"], expected_changed)

            removed = self.clients["owner"].patch("/api/admin/settings/social-links", json=self.payload(platform, "", False, order))
            self.assertEqual(removed.status_code, 200)
            self.assertEqual(self.clients["guest"].get("/api/settings/social-links").get_json()["data"]["links"], [])

    def test_server_side_validation_and_permissions(self):
        self.assertEqual(self.clients["guest"].get("/api/admin/settings/social-links").status_code, 401)
        self.assertEqual(self.clients["customer"].get("/api/admin/settings/social-links").status_code, 403)
        self.assertEqual(self.clients["owner"].get("/api/admin/settings/social-links").status_code, 200)
        self.assertEqual(self.clients["guest"].patch("/api/admin/settings/social-links", json=self.payload()).status_code, 401)
        self.assertEqual(self.clients["customer"].patch("/api/admin/settings/social-links", json=self.payload()).status_code, 403)
        self.assertEqual(self.clients["manager"].patch("/api/admin/settings/social-links", json=self.payload()).status_code, 403)

        invalid_payloads = [
            self.payload(value="javascript:alert(1)"),
            self.payload(value="data:text/html,test"),
            self.payload(value="file:///etc/passwd"),
            self.payload(value="http://example.test/instagram"),
            self.payload(value="https://example.test/invalid link"),
            self.payload(value="https://example.test:bad/instagram"),
            self.payload(value="https://example.test\\evil/instagram"),
            self.payload(platform="whatsapp", value="https://example.test/whatsapp"),
            self.payload(platform="email", value="mailto:hello@example.test"),
            {"links": [{"platform": "instagram", "value": "https://example.test/one", "enabled": True, "displayOrder": 20}, {"platform": "instagram", "value": "https://example.test/two", "enabled": True, "displayOrder": 30}]},
        ]
        for invalid in invalid_payloads:
            response = self.clients["owner"].patch("/api/admin/settings/social-links", json=invalid)
            self.assertEqual(response.status_code, 422)
            self.assertFalse(response.get_json()["ok"])


if __name__ == "__main__":
    unittest.main()
