"""Read-only-style API contract regression checks for the final backend audit.

All records are created in a temporary SQLite database and are removed after each test.
"""
import os
import sys
import tempfile
import unittest
from pathlib import Path

BACKEND_DIR = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(BACKEND_DIR))

from werkzeug.security import generate_password_hash
from app import create_app, create_password_reset_token, new_id, now_iso
from database import get_db, init_db


class ApiContractAuditTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.original = {key: os.environ.get(key) for key in ("NIBREXO_DB_PATH", "NIBREXO_ENV", "NIBREXO_COOKIE_SECURE", "FLASK_SECRET_KEY")}
        os.environ["NIBREXO_DB_PATH"] = str(Path(self.temp.name) / "contract-audit.db")
        os.environ.pop("NIBREXO_ENV", None)
        os.environ.pop("FLASK_SECRET_KEY", None)
        os.environ["NIBREXO_COOKIE_SECURE"] = "false"
        init_db()
        self.app = create_app({"TESTING": True, "SECRET_KEY": "contract-audit"})
        self.clients = {name: self.app.test_client() for name in ("guest", "owner", "editor", "support", "customer_a", "customer_b")}
        self.users = {}
        timestamp = now_iso()
        with get_db() as db:
            for name, role in (("owner", "owner"), ("editor", "editor"), ("support", "support"), ("customer_a", "customer"), ("customer_b", "customer")):
                user_id = new_id("user")
                self.users[name] = user_id
                db.execute(
                    "INSERT INTO users (id,name,email,password_hash,role,status,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?)",
                    (user_id, name, f"{name}@example.com", generate_password_hash("password123"), role, "active", timestamp, timestamp),
                )
            db.commit()
        for name in self.users:
            response = self.clients[name].post("/api/auth/login", json={"email": f"{name}@example.com", "password": "password123"})
            self.assertEqual(response.status_code, 200)

    def tearDown(self):
        for key, value in self.original.items():
            if value is None:
                os.environ.pop(key, None)
            else:
                os.environ[key] = value
        self.temp.cleanup()

    def seed_customer_records(self):
        timestamp = now_iso()
        ids = {key: new_id(key) for key in ("category", "product", "order", "ticket", "message", "download", "license", "billing", "notification")}
        with get_db() as db:
            db.execute("INSERT INTO categories (id,name,slug,status,created_at,updated_at) VALUES (?,?,?,?,?,?)", (ids["category"], "Audit", "audit", "published", timestamp, timestamp))
            db.execute("INSERT INTO products (id,title,slug,price_cents,currency,category_id,status,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?,?)", (ids["product"], "Audit product", "audit-product", 1000, "USD", ids["category"], "published", timestamp, timestamp))
            db.execute("INSERT INTO orders (id,reference,user_id,subtotal_cents,discount_cents,total_cents,currency,payment_status,order_status,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?,?,?,?)", (ids["order"], "ORD-CONTRACT", self.users["customer_a"], 1000, 0, 1000, "USD", "pending", "pending", timestamp, timestamp))
            db.execute("INSERT INTO order_items (id,order_id,product_id,product_title_snapshot,quantity,unit_price_cents,line_subtotal_cents,currency,created_at) VALUES (?,?,?,?,?,?,?,?,?)", (new_id("order_item"), ids["order"], ids["product"], "Audit product", 1, 1000, 1000, "USD", timestamp))
            db.execute("INSERT INTO support_tickets (id,user_id,subject,created_at,updated_at) VALUES (?,?,?,?,?)", (ids["ticket"], self.users["customer_a"], "Audit ticket", timestamp, timestamp))
            db.execute("INSERT INTO ticket_messages (id,ticket_id,author_user_id,body,created_at) VALUES (?,?,?,?,?)", (new_id("ticket_message"), ids["ticket"], self.users["customer_a"], "Audit support detail", timestamp))
            db.execute("INSERT INTO messages (id,conversation_id,sender_user_id,recipient_user_id,body,created_at) VALUES (?,?,?,?,?,?)", (ids["message"], "audit-conversation", self.users["owner"], self.users["customer_a"], "Audit message", timestamp))
            db.execute("INSERT INTO downloads (id,user_id,order_id,product_id,availability,created_at) VALUES (?,?,?,?,?,?)", (ids["download"], self.users["customer_a"], ids["order"], ids["product"], "unavailable", timestamp))
            db.execute("INSERT INTO licenses (id,user_id,order_id,product_id,status,created_at) VALUES (?,?,?,?,?,?)", (ids["license"], self.users["customer_a"], ids["order"], ids["product"], "pending", timestamp))
            db.execute("INSERT INTO billing_records (id,user_id,order_id,status,created_at) VALUES (?,?,?,?,?)", (ids["billing"], self.users["customer_a"], ids["order"], "pending", timestamp))
            db.execute("INSERT INTO saved_items (id,user_id,product_id,created_at) VALUES (?,?,?,?)", (new_id("saved"), self.users["customer_a"], ids["product"], timestamp))
            db.execute("INSERT INTO notifications (id,user_id,type,title,message,created_at) VALUES (?,?,?,?,?,?)", (ids["notification"], self.users["customer_a"], "audit", "Audit", "Audit notification", timestamp))
            db.commit()
        return ids

    def test_customer_detail_contracts_enforce_ownership(self):
        ids = self.seed_customer_records()
        customer_a = self.clients["customer_a"]
        customer_b = self.clients["customer_b"]

        expected_a = {
            f"/api/customer/orders/{ids['order']}": "order",
            f"/api/customer/tickets/{ids['ticket']}": "ticket",
            f"/api/customer/messages/{ids['message']}": "message",
        }
        for path, key in expected_a.items():
            response = customer_a.get(path)
            self.assertEqual(response.status_code, 200)
            self.assertTrue(response.get_json()["ok"])
            self.assertIn(key, response.get_json()["data"])
            self.assertNotIn("password_hash", response.get_data(as_text=True))

            other = customer_b.get(path)
            self.assertEqual(other.status_code, 404)
            self.assertFalse(other.get_json()["ok"])

        for path, key in (
            ("/api/customer/orders", "orders"),
            ("/api/customer/downloads", "downloads"),
            ("/api/customer/licenses", "licenses"),
            ("/api/customer/saved-items", "savedItems"),
            ("/api/customer/billing", "billing"),
            ("/api/customer/tickets", "tickets"),
            ("/api/customer/messages", "messages"),
            ("/api/customer/notifications", "notifications"),
        ):
            own = customer_a.get(path)
            self.assertEqual(own.status_code, 200)
            self.assertTrue(own.get_json()["data"][key])
            other = customer_b.get(path)
            self.assertEqual(other.status_code, 200)
            self.assertEqual(other.get_json()["data"][key], [])
        self.assertEqual(customer_b.get(f"/api/customer/downloads/{ids['download']}/download").status_code, 404)
        self.assertEqual(self.clients["guest"].get(f"/api/customer/messages/{ids['message']}").status_code, 401)

    def test_admin_role_boundaries_and_reply_contract(self):
        ids = self.seed_customer_records()
        self.assertEqual(self.clients["guest"].get("/api/admin/dashboard").status_code, 401)
        self.assertEqual(self.clients["customer_a"].get("/api/admin/dashboard").status_code, 403)
        self.assertEqual(self.clients["editor"].get("/api/admin/products").status_code, 200)
        self.assertEqual(self.clients["support"].get("/api/admin/products").status_code, 403)
        self.assertEqual(self.clients["support"].get("/api/admin/tickets").status_code, 200)
        self.assertEqual(self.clients["editor"].get("/api/admin/tickets").status_code, 403)

        reply = self.clients["owner"].post(f"/api/admin/tickets/{ids['ticket']}/messages", json={"body": "Contract reply"})
        self.assertEqual(reply.status_code, 201)
        self.assertTrue(reply.get_json()["ok"])
        self.assertIn("messageId", reply.get_json()["data"])

    def test_password_reset_invalidates_existing_sessions_without_email_delivery(self):
        with get_db() as db:
            token = create_password_reset_token(db, self.users["customer_a"])
            db.commit()
        reset = self.clients["guest"].post("/api/auth/reset-password", json={"token": token, "password": "new-password123"})
        self.assertEqual(reset.status_code, 200)
        self.assertTrue(reset.get_json()["data"]["passwordReset"])
        self.assertEqual(self.clients["customer_a"].get("/api/customer/dashboard").status_code, 401)
        old_login = self.clients["guest"].post("/api/auth/login", json={"email": "customer_a@example.com", "password": "password123"})
        self.assertEqual(old_login.status_code, 401)
        new_login = self.clients["guest"].post("/api/auth/login", json={"email": "customer_a@example.com", "password": "new-password123"})
        self.assertEqual(new_login.status_code, 200)
        self.assertEqual(self.clients["guest"].post("/api/auth/reset-password", json={"token": token, "password": "another-password123"}).status_code, 400)

    def test_content_contract_statuses_and_error_codes(self):
        owner = self.clients["owner"]
        category = owner.post("/api/admin/categories", json={"name": "Audit category", "slug": "audit-category", "status": "Draft"})
        # Direct API callers must send canonical lower-case status; the frontend normalizes UI values before sending.
        self.assertEqual(category.status_code, 422)
        created = owner.post("/api/admin/categories", json={"name": "Audit category", "slug": "audit-category", "status": "draft"})
        self.assertEqual(created.status_code, 201)
        duplicate = owner.post("/api/admin/categories", json={"name": "Audit category", "slug": "audit-category", "status": "draft"})
        self.assertEqual(duplicate.status_code, 409)

        category_id = created.get_json()["data"]["id"]
        product = owner.post("/api/admin/products", json={"title": "Audit product", "slug": "audit-product", "categoryId": category_id, "priceCents": 1000, "currency": "USD", "status": "draft"})
        self.assertEqual(product.status_code, 201)
        product_id = product.get_json()["data"]["product"]["id"]
        listed = owner.get("/api/admin/products").get_json()["data"]["products"]
        listed_product = next(item for item in listed if item["id"] == product_id)
        self.assertEqual(listed_product["categoryId"], category_id)

        method_error = owner.post("/api/admin/automations", json={})
        self.assertEqual(method_error.status_code, 405)
        self.assertEqual(method_error.get_json()["error"]["message"], "Method not allowed.")
        self.assertEqual(owner.get("/api/admin/orders/missing-order").status_code, 404)

    def test_internal_automation_form_and_workflow_contracts(self):
        owner = self.clients["owner"]
        form = owner.post("/api/admin/forms", json={"name": "Audit form", "fields": [{"id": "email-1", "type": "Email", "label": "Email", "required": True}]})
        self.assertEqual(form.status_code, 201)
        self.assertIn(form.get_json()["data"]["id"], [item["id"] for item in owner.get("/api/admin/forms").get_json()["data"]["forms"]])

        workflow = owner.post("/api/admin/workflows", json={"name": "Audit workflow", "status": "draft", "nodes": [{"id": "trigger-1", "type": "Trigger", "label": "customer.registered", "configuration": {"event": "customer.registered"}}]})
        self.assertEqual(workflow.status_code, 201)
        self.assertIn(workflow.get_json()["data"]["id"], [item["id"] for item in owner.get("/api/admin/workflows").get_json()["data"]["workflows"]])


if __name__ == "__main__":
    unittest.main()
