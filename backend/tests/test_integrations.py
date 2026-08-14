import os
import sys
import tempfile
import unittest
from pathlib import Path

BACKEND_DIR = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(BACKEND_DIR))

from cryptography.fernet import Fernet
from werkzeug.security import generate_password_hash
from app import create_app, finalize_verified_payment, new_id, now_iso
from database import get_db, init_db
from events import emit_event
from workflows import execute_workflow, queue_workflows_for_event
from worker import claim_next_execution, process_once
from license_vault import get_license_vault


PROVIDER_ENVIRONMENT_KEYS = [
    "PAYMENT_PROVIDER", "PAYMENT_SECRET",
    "STORAGE_PROVIDER", "STORAGE_BUCKET", "STORAGE_ACCESS_KEY", "STORAGE_SECRET_KEY",
    "EMAIL_PROVIDER", "EMAIL_API_KEY", "EMAIL_FROM",
    "AI_PROVIDER", "AI_API_KEY", "AI_MODEL",
    "CRM_PROVIDER", "CRM_API_KEY",
    "NEWSLETTER_PROVIDER", "NEWSLETTER_API_KEY",
    "ANALYTICS_PROVIDER", "ANALYTICS_KEY",
]


class IntegrationBoundaryTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.original_environment = {key: os.environ.get(key) for key in [
            "NIBREXO_DB_PATH", "NIBREXO_COOKIE_SECURE", "NIBREXO_ENV", "FLASK_SECRET_KEY",
            "LICENSE_ENCRYPTION_KEY", "LICENSE_ENCRYPTION_KEY_VERSION", "LICENSE_ENCRYPTION_PREVIOUS_KEYS",
            *PROVIDER_ENVIRONMENT_KEYS,
        ]}
        os.environ["NIBREXO_DB_PATH"] = str(Path(self.temp.name) / "test.db")
        os.environ["NIBREXO_COOKIE_SECURE"] = "false"
        os.environ.pop("NIBREXO_ENV", None)
        os.environ.pop("FLASK_SECRET_KEY", None)
        for key in ["LICENSE_ENCRYPTION_KEY", "LICENSE_ENCRYPTION_KEY_VERSION", "LICENSE_ENCRYPTION_PREVIOUS_KEYS", *PROVIDER_ENVIRONMENT_KEYS]:
            os.environ.pop(key, None)
        init_db()
        self.app = create_app({"TESTING": True, "SECRET_KEY": "test-secret"})
        self.client = self.app.test_client()
        timestamp = now_iso()
        with get_db() as db:
            db.execute("INSERT INTO users (id,name,email,password_hash,role,status,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?)", (new_id("user"), "Admin", "admin@example.com", generate_password_hash("password123"), "admin", "active", timestamp, timestamp))
            db.commit()
        self.client.post("/api/auth/login", json={"email": "admin@example.com", "password": "password123"})

    def tearDown(self):
        for key, value in self.original_environment.items():
            if value is None:
                os.environ.pop(key, None)
            else:
                os.environ[key] = value
        self.temp.cleanup()

    def test_verified_payment_finalization_is_idempotent(self):
        timestamp = now_iso()
        with get_db() as db:
            customer_id = new_id("user")
            product_id = new_id("product")
            order_id = new_id("order")
            db.execute("INSERT INTO users (id,name,email,password_hash,role,status,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?)", (customer_id, "Customer", "customer@example.com", generate_password_hash("password123"), "customer", "active", timestamp, timestamp))
            db.execute("INSERT INTO products (id,title,slug,price_cents,currency,status,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?)", (product_id, "Product", "product", 1000, "USD", "published", timestamp, timestamp))
            db.execute("INSERT INTO orders (id,reference,user_id,subtotal_cents,discount_cents,total_cents,currency,payment_status,order_status,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?,?,?,?)", (order_id, "ORD-TEST", customer_id, 1000, 0, 1000, "USD", "pending", "pending", timestamp, timestamp))
            db.execute("INSERT INTO order_items (id,order_id,product_id,product_title_snapshot,quantity,unit_price_cents,line_subtotal_cents,currency,created_at) VALUES (?,?,?,?,?,?,?,?,?)", (new_id("order_item"), order_id, product_id, "Product", 1, 1000, 1000, "USD", timestamp))
            db.commit()
        with get_db() as db:
            self.assertTrue(finalize_verified_payment(db, order_id, "sandbox", "pay_ref", "event_1"))
            db.commit()
        with get_db() as db:
            self.assertFalse(finalize_verified_payment(db, order_id, "sandbox", "pay_ref", "event_1"))
            licenses = db.execute("SELECT COUNT(*) AS count FROM licenses WHERE order_id = ?", (order_id,)).fetchone()["count"]
            events = db.execute("SELECT COUNT(*) AS count FROM payment_events WHERE provider = 'sandbox' AND provider_event_id = 'event_1'").fetchone()["count"]
            self.assertEqual(licenses, 1)
            self.assertEqual(events, 1)

    def test_workflow_queue_is_idempotent_and_blocks_unconfigured_actions(self):
        timestamp = now_iso()
        with get_db() as db:
            workflow_id = new_id("workflow")
            db.execute("INSERT INTO workflows (id, name, status, definition_json, created_at, updated_at) VALUES (?, ?, 'active', ?, ?, ?)", (workflow_id, "Email workflow", '{"nodes":[{"type":"Email","configuration":{"recipient":"person@example.com"}}]}', timestamp, timestamp))
            db.commit()
        event_id = emit_event("customer.registered", {"userId": "test-user"}, idempotency_key="workflow-event")
        self.assertEqual(queue_workflows_for_event(event_id, "customer.registered"), [workflow_id])
        self.assertEqual(queue_workflows_for_event(event_id, "customer.registered"), [])
        with get_db() as db:
            execution_id = db.execute("SELECT id FROM workflow_executions WHERE workflow_id = ?", (workflow_id,)).fetchone()["id"]
        self.assertEqual(execute_workflow(execution_id)["state"], "locked")
        claim = claim_next_execution(max_attempts=3)
        self.assertIsNotNone(claim)
        result = execute_workflow(claim["id"], claim["lock_token"])
        self.assertFalse(result["ok"])
        self.assertEqual(result["state"], "blocked")

    def test_worker_claim_lock_prevents_duplicate_execution(self):
        timestamp = now_iso()
        with get_db() as db:
            workflow_id = new_id("workflow")
            db.execute("INSERT INTO workflows (id, name, status, definition_json, created_at, updated_at) VALUES (?, ?, 'active', ?, ?, ?)", (workflow_id, "Internal workflow", '{"nodes":[{"type":"Trigger","configuration":{}}]}', timestamp, timestamp))
            db.commit()
        event_id = emit_event("customer.registered", {"userId": "lock-user"}, idempotency_key="lock-event")
        queue_workflows_for_event(event_id, "customer.registered")
        first_claim = claim_next_execution(max_attempts=3)
        self.assertIsNotNone(first_claim)
        self.assertIsNone(claim_next_execution(max_attempts=3))
        self.assertEqual(execute_workflow(first_claim["id"], "incorrect-lock")["state"], "locked")
        self.assertEqual(execute_workflow(first_claim["id"], first_claim["lock_token"])["state"], "completed")
        self.assertFalse(process_once(max_attempts=3)["processed"])
        with get_db() as db:
            execution = db.execute("SELECT status, attempt_count FROM workflow_executions WHERE id = ?", (first_claim["id"],)).fetchone()
            self.assertEqual(execution["status"], "completed")
            self.assertEqual(execution["attempt_count"], 1)
            self.assertEqual(db.execute("SELECT COUNT(*) AS count FROM workflow_executions WHERE workflow_id = ?", (workflow_id,)).fetchone()["count"], 1)

    def test_stale_worker_restart_invalidates_old_lock_before_reclaim(self):
        timestamp = now_iso()
        with get_db() as db:
            workflow_id = new_id("workflow")
            db.execute("INSERT INTO workflows (id, name, status, definition_json, created_at, updated_at) VALUES (?, ?, 'active', ?, ?, ?)", (workflow_id, "Restart workflow", '{"nodes":[{"type":"Trigger","configuration":{}}]}', timestamp, timestamp))
            db.commit()
        event_id = emit_event("customer.registered", {"userId": "restart-user"}, idempotency_key="restart-event")
        queue_workflows_for_event(event_id, "customer.registered")
        first_claim = claim_next_execution(max_attempts=3)
        self.assertIsNotNone(first_claim)
        with get_db() as db:
            db.execute("UPDATE workflow_executions SET locked_at = '2000-01-01T00:00:00+00:00' WHERE id = ?", (first_claim["id"],))
            db.commit()
        restart_claim = claim_next_execution(max_attempts=3)
        self.assertIsNotNone(restart_claim)
        self.assertEqual(restart_claim["id"], first_claim["id"])
        self.assertNotEqual(restart_claim["lock_token"], first_claim["lock_token"])
        self.assertEqual(execute_workflow(first_claim["id"], first_claim["lock_token"])["state"], "locked")
        self.assertEqual(execute_workflow(restart_claim["id"], restart_claim["lock_token"])["state"], "completed")
        with get_db() as db:
            execution = db.execute("SELECT status, attempt_count FROM workflow_executions WHERE id = ?", (restart_claim["id"],)).fetchone()
            self.assertEqual(execution["status"], "completed")
            self.assertEqual(execution["attempt_count"], 2)

    def test_worker_records_failures_and_stops_after_max_attempts(self):
        timestamp = now_iso()
        with get_db() as db:
            workflow_id = new_id("workflow")
            db.execute("INSERT INTO workflows (id, name, status, definition_json, created_at, updated_at) VALUES (?, ?, 'active', ?, ?, ?)", (workflow_id, "Invalid workflow", "{", timestamp, timestamp))
            db.commit()
        event_id = emit_event("customer.registered", {"userId": "failure-user"}, idempotency_key="failure-event")
        queue_workflows_for_event(event_id, "customer.registered")
        for attempt in range(1, 4):
            result = process_once(max_attempts=3)
            self.assertTrue(result["processed"])
            self.assertEqual(result["result"]["state"], "failed")
            with get_db() as db:
                execution = db.execute("SELECT id, status, attempt_count, error_summary FROM workflow_executions WHERE workflow_id = ?", (workflow_id,)).fetchone()
                self.assertEqual(execution["attempt_count"], attempt)
                self.assertEqual(execution["error_summary"], "Workflow action failed.")
                if attempt < 3:
                    self.assertEqual(execution["status"], "queued")
                    db.execute("UPDATE workflow_executions SET next_retry_at = ? WHERE id = ?", (now_iso(), execution["id"]))
                    db.commit()
                else:
                    self.assertEqual(execution["status"], "failed")
        self.assertIsNone(claim_next_execution(max_attempts=3))

    def test_worker_claims_queued_execution_and_records_blocked_provider(self):
        timestamp = now_iso()
        with get_db() as db:
            workflow_id = new_id("workflow")
            db.execute("INSERT INTO workflows (id, name, status, definition_json, created_at, updated_at) VALUES (?, ?, 'active', ?, ?, ?)", (workflow_id, "Worker Email", '{"nodes":[{"type":"Email","configuration":{"recipient":"person@example.com"}}]}', timestamp, timestamp))
            db.commit()
        event_id = emit_event("customer.registered", {"userId": "worker-user"}, idempotency_key="worker-event")
        queue_workflows_for_event(event_id, "customer.registered")
        result = process_once(max_attempts=3)
        self.assertTrue(result["processed"])
        self.assertEqual(result["result"]["state"], "blocked")
        with get_db() as db:
            execution = db.execute("SELECT status, attempt_count, lock_token FROM workflow_executions WHERE workflow_id = ?", (workflow_id,)).fetchone()
            self.assertEqual(execution["status"], "blocked")
            self.assertEqual(execution["attempt_count"], 1)
            self.assertIsNone(execution["lock_token"])

    def test_license_vault_encrypts_and_customer_retrieves_owned_key(self):
        os.environ["LICENSE_ENCRYPTION_KEY"] = Fernet.generate_key().decode("utf-8")
        os.environ["LICENSE_ENCRYPTION_KEY_VERSION"] = "test-v1"
        timestamp = now_iso()
        with get_db() as db:
            customer_id = new_id("user")
            product_id = new_id("product")
            order_id = new_id("order")
            db.execute("INSERT INTO users (id,name,email,password_hash,role,status,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?)", (customer_id, "Customer", "licensed@example.com", generate_password_hash("password123"), "customer", "active", timestamp, timestamp))
            db.execute("INSERT INTO products (id,title,slug,price_cents,currency,status,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?)", (product_id, "Licensed Product", "licensed-product", 1000, "USD", "published", timestamp, timestamp))
            db.execute("INSERT INTO orders (id,reference,user_id,subtotal_cents,discount_cents,total_cents,currency,payment_status,order_status,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?,?,?,?)", (order_id, "ORD-LICENSE", customer_id, 1000, 0, 1000, "USD", "pending", "pending", timestamp, timestamp))
            db.execute("INSERT INTO order_items (id,order_id,product_id,product_title_snapshot,quantity,unit_price_cents,line_subtotal_cents,currency,created_at) VALUES (?,?,?,?,?,?,?,?,?)", (new_id("order_item"), order_id, product_id, "Licensed Product", 1, 1000, 1000, "USD", timestamp))
            db.commit()
        with get_db() as db:
            self.assertTrue(finalize_verified_payment(db, order_id, "sandbox", "pay-license", "event-license"))
            db.commit()
        with get_db() as db:
            license_row = db.execute("SELECT key_hash, key_ciphertext, key_version FROM licenses WHERE order_id = ?", (order_id,)).fetchone()
            self.assertTrue(license_row["key_hash"])
            self.assertTrue(license_row["key_ciphertext"])
            self.assertEqual(license_row["key_version"], "test-v1")
            self.assertNotIn("LIC-", license_row["key_ciphertext"])
        self.client.post("/api/auth/login", json={"email": "licensed@example.com", "password": "password123"})
        response = self.client.get("/api/customer/licenses")
        self.assertEqual(response.status_code, 200)
        license_data = response.get_json()["data"]["licenses"][0]
        self.assertEqual(license_data["key_version"], "test-v1")
        self.assertTrue(license_data["licenseKey"].startswith("LIC-"))

    def test_license_key_rotation_supports_previous_version(self):
        old_key = Fernet.generate_key().decode("utf-8")
        new_key = Fernet.generate_key().decode("utf-8")
        os.environ["LICENSE_ENCRYPTION_KEY"] = old_key
        os.environ["LICENSE_ENCRYPTION_KEY_VERSION"] = "v1"
        first_vault = get_license_vault()
        issued = first_vault.issue()
        os.environ["LICENSE_ENCRYPTION_KEY"] = new_key
        os.environ["LICENSE_ENCRYPTION_KEY_VERSION"] = "v2"
        os.environ["LICENSE_ENCRYPTION_PREVIOUS_KEYS"] = '{"v1": "' + old_key + '"}'
        rotated_vault = get_license_vault()
        self.assertEqual(rotated_vault.reveal(issued["ciphertext"], issued["version"]), issued["plaintext"])

    def test_provider_statuses_are_honest_when_unconfigured(self):
        response = self.client.get("/api/admin/integrations/status")
        self.assertEqual(response.status_code, 200)
        statuses = {item["id"]: item["status"] for item in response.get_json()["data"]["integrations"]}
        self.assertEqual(statuses["authentication"], "connected")
        for provider in ("payment", "storage", "email", "ai", "crm", "newsletter", "analytics"):
            self.assertEqual(statuses[provider], "not_configured")

    def test_unconfigured_provider_routes_do_not_fake_success(self):
        self.assertEqual(self.client.post("/api/newsletter/subscribe", json={"email": "person@example.com", "marketingConsent": True}).status_code, 503)
        self.assertEqual(self.client.post("/api/webhooks/payment/test", json={}).status_code, 503)
        self.assertEqual(self.client.post("/api/auth/forgot-password", json={"email": "person@example.com"}).status_code, 503)
        analytics = self.client.post("/api/analytics/events", json={"eventType": "page_view", "payload": {"page": "/"}})
        self.assertEqual(analytics.status_code, 202)
        self.assertTrue(analytics.get_json()["data"]["localRecorded"])
        self.assertEqual(analytics.get_json()["data"]["externalDelivery"], "not_configured")


if __name__ == "__main__":
    unittest.main()
