import os
import sys
import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch

BACKEND_DIR = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(BACKEND_DIR))

from werkzeug.security import generate_password_hash
from app import create_app, new_id, now_iso
from database import get_db, init_db


class BackendFoundationTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        os.environ["NIBREXO_DB_PATH"] = str(Path(self.temp.name) / "test.db")
        os.environ["NIBREXO_COOKIE_SECURE"] = "false"
        init_db()
        self.app = create_app({"TESTING": True, "SECRET_KEY": "test-secret"})
        self.client = self.app.test_client()

    def tearDown(self):
        self.temp.cleanup()
        os.environ.pop("NIBREXO_DB_PATH", None)

    def register(self, email="customer@example.com", password="password123"):
        return self.client.post("/api/auth/register", json={"name": "Customer", "email": email, "password": password})

    def create_admin(self):
        timestamp = now_iso()
        with get_db() as db:
            user_id = new_id("user")
            db.execute(
                "INSERT INTO users (id,name,email,password_hash,role,status,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?)",
                (user_id, "Administrator", "admin@example.com", generate_password_hash("password123"), "admin", "active", timestamp, timestamp),
            )
            db.commit()
        return user_id

    def admin_login(self):
        return self.client.post("/api/auth/login", json={"email": "admin@example.com", "password": "password123"})

    def test_registration_login_logout_and_protected_customer_route(self):
        response = self.register()
        self.assertEqual(response.status_code, 201)
        self.assertEqual(response.get_json()["data"]["user"]["role"], "customer")
        self.assertEqual(self.client.get("/api/auth/me").status_code, 200)
        self.assertEqual(self.client.get("/api/customer/dashboard").status_code, 200)
        self.assertEqual(self.client.post("/api/auth/logout").status_code, 200)
        self.assertEqual(self.client.get("/api/customer/dashboard").status_code, 401)

    def test_https_development_preview_session_cookie_is_secure_cross_site(self):
        self.create_admin()
        preview_login = self.client.post(
            "/api/auth/login",
            json={"email": "admin@example.com", "password": "password123"},
            headers={"X-Forwarded-Proto": "https"},
        )
        self.assertEqual(preview_login.status_code, 200)
        cookie = preview_login.headers.get("Set-Cookie", "")
        self.assertIn("Secure", cookie)
        self.assertIn("HttpOnly", cookie)
        self.assertIn("SameSite=None", cookie)
        self.assertNotIn("Partitioned", cookie)

        local_login = self.client.post("/api/auth/login", json={"email": "admin@example.com", "password": "password123"})
        self.assertEqual(local_login.status_code, 200)
        local_cookie = local_login.headers.get("Set-Cookie", "")
        self.assertIn("SameSite=Lax", local_cookie)
        self.assertNotIn("Partitioned", local_cookie)

        with patch.dict(os.environ, {"E2B_SANDBOX": "true"}, clear=False):
            embedded_preview_login = self.client.post(
                "/api/auth/login",
                json={"email": "admin@example.com", "password": "password123"},
                environ_overrides={"REMOTE_ADDR": "10.12.0.10"},
            )
        self.assertEqual(embedded_preview_login.status_code, 200)
        embedded_cookie = embedded_preview_login.headers.get("Set-Cookie", "")
        self.assertIn("Secure", embedded_cookie)
        self.assertIn("SameSite=None", embedded_cookie)
        self.assertNotIn("Partitioned", embedded_cookie)

    def test_embedded_preview_form_transport_uses_existing_session_and_redirects_by_role(self):
        customer_registration = self.client.post(
            "/api/auth/register",
            data={"name": "Form Customer", "email": "form-customer@example.com", "password": "password123"},
            follow_redirects=False,
        )
        self.assertEqual(customer_registration.status_code, 303)
        self.assertEqual(customer_registration.headers["Location"], "/account/dashboard.html")
        self.assertIn("nibrexo_session", customer_registration.headers.get("Set-Cookie", ""))
        self.client.post("/api/auth/logout")
        customer_login = self.client.post("/api/auth/login", data={"email": "form-customer@example.com", "password": "password123"}, follow_redirects=False)
        self.assertEqual(customer_login.status_code, 303)
        self.assertEqual(customer_login.headers["Location"], "/account/dashboard.html")

        self.create_admin()
        admin_login = self.client.post("/api/auth/login", data={"email": "admin@example.com", "password": "password123"}, follow_redirects=False)
        self.assertEqual(admin_login.status_code, 303)
        self.assertEqual(admin_login.headers["Location"], "/admin/index.html")

    def test_customer_cannot_access_admin_and_admin_can_manage_content(self):
        self.register()
        self.assertEqual(self.client.get("/api/admin/dashboard").status_code, 403)
        self.client.post("/api/auth/logout")
        self.create_admin()
        self.assertEqual(self.admin_login().status_code, 200)
        category = self.client.post("/api/admin/categories", json={"name": "Templates", "slug": "templates", "status": "draft"})
        self.assertEqual(category.status_code, 201)
        product = self.client.post("/api/admin/products", json={"title": "Approved Product", "slug": "approved-product", "priceCents": 1000, "currency": "USD", "status": "draft"})
        self.assertEqual(product.status_code, 201)
        service = self.client.post("/api/admin/services", json={"name": "Brand Identity", "slug": "brand-identity", "status": "draft"})
        self.assertEqual(service.status_code, 201)
        dashboard = self.client.get("/api/admin/dashboard")
        self.assertEqual(dashboard.status_code, 200)
        self.assertEqual(dashboard.get_json()["data"]["products"], 1)
        activity = self.client.get("/api/admin/activity")
        self.assertEqual(activity.status_code, 200)
        self.assertGreaterEqual(len(activity.get_json()["data"]["activity"]), 3)

    def test_dashboard_returns_only_real_empty_state_data(self):
        self.create_admin()
        self.admin_login()
        response = self.client.get("/api/admin/dashboard?period=30d")
        self.assertEqual(response.status_code, 200)
        data = response.get_json()["data"]
        dashboard = data["dashboard"]
        self.assertEqual(dashboard["period"], "30d")
        self.assertEqual(dashboard["revenue"]["totalCents"], 0)
        self.assertEqual(dashboard["revenue"]["series"], [])
        self.assertEqual(dashboard["orders"]["total"], 0)
        self.assertEqual(dashboard["customers"]["recent"], [])
        self.assertEqual(dashboard["products"]["top"], [])
        self.assertEqual(dashboard["recentOrders"], [])
        self.assertEqual(dashboard["recentActivity"], [])
        self.assertEqual(self.client.get("/api/admin/dashboard?period=invalid").status_code, 422)

    def test_cms_publish_flow_updates_public_apis(self):
        self.create_admin()
        self.admin_login()
        category = self.client.post("/api/admin/categories", json={"name": "Templates", "slug": "templates", "status": "published"})
        category_id = category.get_json()["data"]["id"]
        created = self.client.post("/api/admin/products", json={"title": "Visual Communication Pack", "slug": "visual-communication-pack", "shortDescription": "Approved short description", "description": "Approved full description", "priceCents": 1000, "currency": "USD", "categoryId": category_id, "status": "draft"})
        product = created.get_json()["data"]["product"]
        self.assertEqual(self.client.get("/api/products").get_json()["data"]["products"], [])
        updated = self.client.patch(f"/api/admin/products/{product['id']}", json={"title": "Visual Communication Pack", "slug": "visual-communication-pack", "shortDescription": "Approved short description", "description": "Approved full description", "priceCents": 1000, "currency": "USD", "categoryId": category_id, "status": "published"})
        self.assertEqual(updated.status_code, 200)
        public_products = self.client.get("/api/products").get_json()["data"]["products"]
        self.assertEqual(len(public_products), 1)
        self.assertEqual(self.client.get("/api/products/visual-communication-pack").status_code, 200)
        self.assertEqual(self.client.delete(f"/api/admin/products/{product['id']}").status_code, 200)
        self.assertEqual(self.client.get("/api/products").get_json()["data"]["products"], [])

        service = self.client.post("/api/admin/services", json={"name": "Brand Identity", "slug": "brand-identity", "shortDescription": "Approved service summary", "status": "published"})
        self.assertEqual(service.status_code, 201)
        self.assertEqual(self.client.get("/api/services/brand-identity").status_code, 200)

        documentation = self.client.post("/api/admin/documentation", json={"title": "Getting Started", "slug": "getting-started", "summary": "Approved documentation summary", "content": "Approved documentation content", "status": "published"})
        self.assertEqual(documentation.status_code, 201)
        self.assertEqual(self.client.get("/api/docs/getting-started").status_code, 200)

        post = self.client.post("/api/admin/blog", json={"title": "Visual Updates", "slug": "visual-updates", "excerpt": "Approved excerpt", "content": "Approved blog content", "status": "published"})
        self.assertEqual(post.status_code, 201)
        self.assertEqual(self.client.get("/api/blog/visual-updates").status_code, 200)

    def test_pending_checkout_is_idempotent_and_creates_no_entitlement(self):
        self.create_admin()
        self.admin_login()
        product = self.client.post("/api/admin/products", json={"title": "Checkout Product", "slug": "checkout-product", "priceCents": 2500, "currency": "USD", "status": "published"})
        product_id = product.get_json()["data"]["product"]["id"]
        self.client.post("/api/auth/logout")
        self.register("checkout@example.com")
        headers = {"Idempotency-Key": "checkout-test-key"}
        checkout = self.client.post("/api/checkout", json={"items": [{"productId": product_id, "quantity": 2}]}, headers=headers)
        self.assertEqual(checkout.status_code, 201)
        order = checkout.get_json()["data"]["order"]
        self.assertEqual(order["paymentStatus"], "pending")
        self.assertEqual(order["totalCents"], 5000)
        repeated = self.client.post("/api/checkout", json={"items": [{"productId": product_id, "quantity": 2}]}, headers=headers)
        self.assertEqual(repeated.status_code, 200)
        self.assertEqual(repeated.get_json()["data"]["order"]["id"], order["id"])
        self.assertEqual(len(self.client.get("/api/customer/orders").get_json()["data"]["orders"]), 1)
        self.assertEqual(self.client.get("/api/customer/licenses").get_json()["data"]["licenses"], [])
        self.assertEqual(self.client.get("/api/customer/downloads").get_json()["data"]["downloads"], [])

    def test_customer_ownership_for_saved_items_and_tickets(self):
        self.create_admin()
        self.admin_login()
        product = self.client.post("/api/admin/products", json={"title": "Published Product", "slug": "published-product", "priceCents": 1000, "currency": "USD", "status": "published"})
        product_id = product.get_json()["data"]["product"]["id"]
        self.client.post("/api/auth/logout")
        self.register("owner@example.com")
        self.assertEqual(self.client.post(f"/api/customer/saved-items/{product_id}").status_code, 201)
        self.assertEqual(len(self.client.get("/api/customer/saved-items").get_json()["data"]["savedItems"]), 1)
        ticket = self.client.post("/api/customer/tickets", json={"subject": "Need help", "message": "Details"})
        self.assertEqual(ticket.status_code, 201)
        ticket_id = ticket.get_json()["data"]["ticketId"]
        self.assertEqual(len(self.client.get("/api/customer/tickets").get_json()["data"]["tickets"]), 1)
        self.client.post("/api/auth/logout")
        self.register("other-customer@example.com")
        self.assertEqual(self.client.get(f"/api/customer/tickets/{ticket_id}").status_code, 404)

    def test_public_private_source_and_route_boundaries(self):
        self.assertEqual(self.client.get("/api/products").status_code, 200)
        self.assertEqual(self.client.get("/api/customer/downloads").status_code, 401)
        self.assertEqual(self.client.get("/api/admin/dashboard").status_code, 401)
        for path in ("/backend/app.py", "/backend/database.py", "/backend/data/nibrexo.db", "/backend/schema.sql", "/.env"):
            response = self.client.get(path)
            try:
                self.assertEqual(response.status_code, 404)
            finally:
                response.close()


if __name__ == "__main__":
    unittest.main()
