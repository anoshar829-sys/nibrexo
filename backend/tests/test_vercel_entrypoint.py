import importlib.util
import json
import os
import subprocess
import sys
import tempfile
import types
import unittest
from pathlib import Path

from flask import Flask

BACKEND_DIR = Path(__file__).resolve().parents[1]
PROJECT_ROOT = BACKEND_DIR.parent
sys.path.insert(0, str(BACKEND_DIR))

from app import create_app
from database import init_db


class VercelArchitectureTests(unittest.TestCase):
    def setUp(self):
        self.original = {
            key: os.environ.get(key)
            for key in ("NIBREXO_DATABASE_URL", "NIBREXO_DB_PATH", "NIBREXO_ENV", "NIBREXO_API_ONLY", "NIBREXO_COOKIE_SECURE")
        }
        os.environ.pop("NIBREXO_DATABASE_URL", None)
        os.environ.pop("NIBREXO_ENV", None)
        os.environ.pop("NIBREXO_API_ONLY", None)
        os.environ["NIBREXO_COOKIE_SECURE"] = "false"
        self.temp = tempfile.TemporaryDirectory()
        os.environ["NIBREXO_DB_PATH"] = str(Path(self.temp.name) / "vercel-test.db")
        init_db()

    def tearDown(self):
        for key, value in self.original.items():
            if value is None:
                os.environ.pop(key, None)
            else:
                os.environ[key] = value
        self.temp.cleanup()

    def test_root_requirements_delegate_to_authoritative_backend_manifest(self):
        root_requirements = (PROJECT_ROOT / "requirements.txt").read_text()
        backend_requirements = (BACKEND_DIR / "requirements.txt").read_text()
        self.assertIn("-r backend/requirements.txt", root_requirements)
        self.assertIn("psycopg[binary]", backend_requirements)
        self.assertNotIn("gunicorn", backend_requirements.lower())

    def test_vercel_configuration_routes_api_without_shadowing_static_output(self):
        config = json.loads((PROJECT_ROOT / "vercel.json").read_text())
        self.assertIsNone(config["framework"])
        self.assertEqual(config["outputDirectory"], "public")
        self.assertEqual(config["buildCommand"], "python scripts/build_vercel_static.py")
        self.assertIn(
            {"source": "/api/:path*", "destination": "/api/index.py"},
            config["rewrites"],
        )
        self.assertIn("api/index.py", config["functions"])
        self.assertFalse(any(item["source"] == "/:path*" for item in config["rewrites"]))

    def test_static_builder_copies_allowlist_and_excludes_source(self):
        script_path = PROJECT_ROOT / "scripts" / "build_vercel_static.py"
        spec = importlib.util.spec_from_file_location("nibrexo_static_builder_test", script_path)
        builder = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(builder)

        with tempfile.TemporaryDirectory() as project_temp:
            root = Path(project_temp)
            for name in ("index.html", "404.html", "about.html"):
                (root / name).write_text(name)
            fixtures = {
                "account": ("login.html",),
                "account/assets": ("logo.png",),
                "admin": ("index.html",),
                "assets": ("logo.png",),
                "css": ("styles.css",),
                "js": ("app.js",),
                "legal": ("privacy.html",),
                "store": ("index.html",),
                "upload": ("guide.pdf", "image.png", "private.md"),
            }
            for directory, names in fixtures.items():
                path = root / directory
                path.mkdir(parents=True, exist_ok=True)
                for name in names:
                    (path / name).write_text(name)
            (root / "backend").mkdir()
            (root / "backend" / "app.py").write_text("secret source")
            output = root / "public"
            copied = builder.build_static(root, output)
            self.assertIn("index.html", copied)
            self.assertIn("account/login.html", copied)
            self.assertTrue((output / "js/app.js").is_file())
            self.assertFalse((output / "backend/app.py").exists())
            self.assertFalse((output / "upload/private.md").exists())

    def test_api_only_mode_never_serves_frontend_files(self):
        os.environ["NIBREXO_API_ONLY"] = "true"
        app = create_app({"TESTING": True, "SECRET_KEY": "api-only-test"})
        client = app.test_client()
        responses = [
            client.get("/"),
            client.get("/index.html"),
            client.get("/setup/owner"),
            client.get("/api/health"),
        ]
        try:
            self.assertEqual([response.status_code for response in responses], [404, 404, 404, 200])
        finally:
            for response in responses:
                response.close()

    def test_api_index_exports_flask_app_and_sets_fail_safe_defaults(self):
        fake_module = types.ModuleType("app")
        fake_flask_app = Flask("vercel-entrypoint-test")
        fake_module.create_app = lambda: fake_flask_app
        previous_app_module = sys.modules.get("app")
        previous_values = {key: os.environ.get(key) for key in ("NIBREXO_ENV", "NIBREXO_COOKIE_SECURE", "NIBREXO_API_ONLY")}
        try:
            sys.modules["app"] = fake_module
            for key in previous_values:
                os.environ.pop(key, None)
            path = PROJECT_ROOT / "api" / "index.py"
            spec = importlib.util.spec_from_file_location("nibrexo_vercel_entrypoint_test", path)
            module = importlib.util.module_from_spec(spec)
            spec.loader.exec_module(module)
            self.assertIs(module.app, fake_flask_app)
            self.assertEqual(os.environ["NIBREXO_ENV"], "production")
            self.assertEqual(os.environ["NIBREXO_COOKIE_SECURE"], "true")
            self.assertEqual(os.environ["NIBREXO_API_ONLY"], "true")
        finally:
            if previous_app_module is None:
                sys.modules.pop("app", None)
            else:
                sys.modules["app"] = previous_app_module
            for key, value in previous_values.items():
                if value is None:
                    os.environ.pop(key, None)
                else:
                    os.environ[key] = value

    def test_api_index_rejects_explicit_insecure_invariants(self):
        fake_module = types.ModuleType("app")
        fake_module.create_app = lambda: Flask("should-not-be-created")
        previous_app_module = sys.modules.get("app")
        invariant_keys = ("NIBREXO_ENV", "NIBREXO_COOKIE_SECURE", "NIBREXO_API_ONLY")
        previous_values = {key: os.environ.get(key) for key in invariant_keys}
        insecure_values = {
            "NIBREXO_ENV": "development",
            "NIBREXO_COOKIE_SECURE": "false",
            "NIBREXO_API_ONLY": "false",
        }
        try:
            sys.modules["app"] = fake_module
            for index, (key, insecure_value) in enumerate(insecure_values.items()):
                with self.subTest(key=key):
                    os.environ.update({
                        "NIBREXO_ENV": "production",
                        "NIBREXO_COOKIE_SECURE": "true",
                        "NIBREXO_API_ONLY": "true",
                    })
                    os.environ[key] = insecure_value
                    path = PROJECT_ROOT / "api" / "index.py"
                    spec = importlib.util.spec_from_file_location(f"nibrexo_vercel_insecure_{index}", path)
                    module = importlib.util.module_from_spec(spec)
                    with self.assertRaisesRegex(RuntimeError, "Vercel production configuration"):
                        spec.loader.exec_module(module)
        finally:
            if previous_app_module is None:
                sys.modules.pop("app", None)
            else:
                sys.modules["app"] = previous_app_module
            for key, value in previous_values.items():
                if value is None:
                    os.environ.pop(key, None)
                else:
                    os.environ[key] = value

    def test_migration_workflow_pins_production_code_to_main(self):
        workflow = (PROJECT_ROOT / ".github" / "workflows" / "migrate.yml").read_text()
        self.assertIn("workflow_dispatch:", workflow)
        self.assertIn('CONFIRMATION\" != \"MIGRATE_PRODUCTION', workflow)
        self.assertIn('GITHUB_REF\" != \"refs/heads/main', workflow)
        self.assertIn("ref: main", workflow)
        self.assertIn("persist-credentials: false", workflow)
        self.assertIn("git rev-parse HEAD", workflow)
        self.assertNotIn("\n  push:", workflow)
        self.assertNotIn("\n  pull_request:", workflow)
        self.assertNotIn("inputs.ref", workflow)

    def test_real_api_index_import_fails_closed_without_required_secrets(self):
        environment = os.environ.copy()
        for key in (
            "NIBREXO_ENV", "NIBREXO_DATABASE_URL", "FLASK_SECRET_KEY",
            "LICENSE_ENCRYPTION_KEY", "NIBREXO_COOKIE_SECURE",
        ):
            environment.pop(key, None)
        result = subprocess.run(
            [sys.executable, "-c", "import api.index"],
            cwd=PROJECT_ROOT,
            env=environment,
            capture_output=True,
            text=True,
            timeout=20,
        )
        self.assertNotEqual(result.returncode, 0)
        self.assertIn("Required production configuration", result.stderr)


if __name__ == "__main__":
    unittest.main()
