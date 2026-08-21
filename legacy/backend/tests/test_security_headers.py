import os
import sys
import tempfile
import unittest
from pathlib import Path

BACKEND_DIR = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(BACKEND_DIR))

from app import HSTS_MAX_AGE, PERMISSIONS_POLICY, create_app
from database import init_db

CSP_REQUIRED_FRAGMENTS = ("default-src 'self'", "frame-ancestors 'self'", "script-src 'self'", "style-src 'self'")
EXISTING_HEADERS = {
    "X-Content-Type-Options": "nosniff",
    "X-Frame-Options": "SAMEORIGIN",
    "Referrer-Policy": "strict-origin-when-cross-origin",
}


class SecurityHeaderTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.original = {
            key: os.environ.get(key)
            for key in ("NIBREXO_DB_PATH", "NIBREXO_ENV", "NIBREXO_COOKIE_SECURE", "FLASK_SECRET_KEY")
        }
        os.environ["NIBREXO_DB_PATH"] = str(Path(self.temp.name) / "headers.db")
        os.environ.pop("NIBREXO_ENV", None)
        os.environ.pop("FLASK_SECRET_KEY", None)
        os.environ["NIBREXO_COOKIE_SECURE"] = "false"
        init_db()
        self.app = create_app({"TESTING": True, "SECRET_KEY": "security-header-test"})
        self.client = self.app.test_client()

    def tearDown(self):
        for key, value in self.original.items():
            if value is None:
                os.environ.pop(key, None)
            else:
                os.environ[key] = value
        self.temp.cleanup()

    def assert_common_security_headers(self, response):
        csp = response.headers.get("Content-Security-Policy", "")
        self.assertTrue(csp, "CSP header is missing")
        for fragment in CSP_REQUIRED_FRAGMENTS:
            self.assertIn(fragment, csp)
        self.assertIn("frame-ancestors 'self'", csp)
        self.assertNotIn("unsafe-inline", csp)
        self.assertNotIn("unsafe-eval", csp)
        self.assertEqual(response.headers.get("Permissions-Policy"), PERMISSIONS_POLICY)
        for header, expected in EXISTING_HEADERS.items():
            self.assertEqual(response.headers.get(header), expected)
        # Development HTTP must never receive HSTS.
        self.assertNotIn("Strict-Transport-Security", response.headers)

    def test_public_html_response_has_restrictive_csp(self):
        response = self.client.get("/")
        self.assertEqual(response.status_code, 200)
        self.assert_common_security_headers(response)
        body = response.get_data(as_text=True)
        # The pages must not rely on inline style attributes blocked by style-src 'self'.
        self.assertNotIn('style="', body)

    def test_api_response_has_restrictive_csp(self):
        response = self.client.get("/api/health")
        self.assertEqual(response.status_code, 200)
        self.assert_common_security_headers(response)

    def test_admin_html_response_has_restrictive_csp(self):
        response = self.client.get("/admin/index.html")
        self.assertEqual(response.status_code, 200)
        self.assert_common_security_headers(response)

    def test_static_css_response_has_restrictive_csp(self):
        response = self.client.get("/css/styles.css")
        self.assertEqual(response.status_code, 200)
        self.assert_common_security_headers(response)

    def test_authentication_login_response_has_restrictive_csp(self):
        response = self.client.post(
            "/api/auth/login",
            json={"email": "nobody@example.test", "password": "wrong-password"},
        )
        self.assertEqual(response.status_code, 401)
        self.assert_common_security_headers(response)

    def test_production_https_request_receives_hsts_only(self):
        os.environ["NIBREXO_ENV"] = "production"
        production_app = create_app({"TESTING": True, "SECRET_KEY": "security-header-test"})
        production_app.config["PREFERRED_URL_SCHEME"] = "https"
        client = production_app.test_client()
        response = client.get("/")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.headers.get("Strict-Transport-Security"), HSTS_MAX_AGE)
        self.assertEqual(HSTS_MAX_AGE, "max-age=31536000")
        self.assertNotIn("includeSubDomains", response.headers.get("Strict-Transport-Security", ""))
        self.assertNotIn("preload", response.headers.get("Strict-Transport-Security", ""))
        csp = response.headers.get("Content-Security-Policy", "")
        self.assertIn("frame-ancestors 'self'", csp)
        self.assertNotIn("unsafe-inline", csp)
        self.assertNotIn("unsafe-eval", csp)

        # TLS-terminating proxy scenario: plain WSGI scheme with a trusted forwarded proto.
        production_app.config["PREFERRED_URL_SCHEME"] = "http"
        proxied = client.get("/", headers={"X-Forwarded-Proto": "https"})
        self.assertEqual(proxied.headers.get("Strict-Transport-Security"), HSTS_MAX_AGE)

    def test_development_http_request_never_receives_hsts(self):
        client = self.app.test_client()
        response = client.get("/")
        self.assertEqual(response.status_code, 200)
        self.assertNotIn("Strict-Transport-Security", response.headers)
        self.assertTrue(response.headers.get("Content-Security-Policy"))

    def test_production_plain_http_request_never_receives_hsts(self):
        os.environ["NIBREXO_ENV"] = "production"
        production_app = create_app({"TESTING": True, "SECRET_KEY": "security-header-test"})
        production_app.config["PREFERRED_URL_SCHEME"] = "http"
        client = production_app.test_client()
        response = client.get("/")
        self.assertEqual(response.status_code, 200)
        self.assertNotIn("Strict-Transport-Security", response.headers)


if __name__ == "__main__":
    unittest.main()
