import os
import re
import sys
import tempfile
import unittest
from pathlib import Path

BACKEND_DIR = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(BACKEND_DIR))

from database import get_db, init_db
from migrations import MIGRATIONS_DIR, available_migrations, migration_status


class EmptyCursor:
    def fetchone(self):
        return None


class FakePostgresqlConnection:
    engine = "postgresql"

    def __init__(self):
        self.statements = []

    def execute(self, sql, parameters=()):
        self.statements.append((sql, parameters))
        return EmptyCursor()


class MigrationCompatibilityTests(unittest.TestCase):
    def setUp(self):
        self.original = {key: os.environ.get(key) for key in ("NIBREXO_DATABASE_URL", "NIBREXO_DB_PATH", "NIBREXO_ENV")}
        os.environ.pop("NIBREXO_DATABASE_URL", None)
        os.environ.pop("NIBREXO_ENV", None)
        self.temp = tempfile.TemporaryDirectory()
        os.environ["NIBREXO_DB_PATH"] = str(Path(self.temp.name) / "migrations.db")

    def tearDown(self):
        for key, value in self.original.items():
            if value is None:
                os.environ.pop(key, None)
            else:
                os.environ[key] = value
        self.temp.cleanup()

    def test_engine_specific_initial_schema_and_logical_order(self):
        sqlite = available_migrations("sqlite")
        postgres = available_migrations("postgresql")
        expected = ["001_initial", "002_forward_schema", "003_site_settings", "004_login_rate_limits"]
        self.assertEqual([item["version"] for item in sqlite], expected)
        self.assertEqual([item["version"] for item in postgres], expected)
        self.assertEqual(sqlite[0]["path"].name, "001_initial.sql")
        self.assertEqual(postgres[0]["path"].name, "001_initial.pg.sql")
        self.assertEqual(postgres[1]["path"].name, "002_forward_schema.py")

    def test_postgresql_initial_schema_matches_current_tables_without_sqlite_primitives(self):
        sql = (MIGRATIONS_DIR / "001_initial.pg.sql").read_text()
        tables = re.findall(r"CREATE TABLE IF NOT EXISTS\s+(\w+)", sql, flags=re.IGNORECASE)
        self.assertEqual(len(tables), 36)
        self.assertEqual(len(tables), len(set(tables)))
        self.assertNotIn("PRAGMA", sql.upper())
        self.assertNotIn("SQLITE_MASTER", sql.upper())
        self.assertNotIn("COLLATE NOCASE", sql.upper())
        self.assertLess(tables.index("media"), tables.index("documentation_entries"))
        self.assertLess(tables.index("media"), tables.index("blog_posts"))
        self.assertIn("LOWER(email)", sql)
        self.assertIn("UNIQUE(provider, provider_event_id)", sql)
        self.assertIn("UNIQUE(user_id, product_id)", sql)

    def test_postgresql_wide_numeric_fields_preserve_sqlite_integer_range(self):
        sql = (MIGRATIONS_DIR / "001_initial.pg.sql").read_text()
        table_bodies = {
            match.group(1): match.group(2)
            for match in re.finditer(
                r"CREATE TABLE IF NOT EXISTS\s+(\w+)\s*\((.*?)\n\);",
                sql,
                flags=re.IGNORECASE | re.DOTALL,
            )
        }
        wide_fields = {
            "products": ("price_cents",),
            "product_files": ("size_bytes",),
            "media": ("size_bytes",),
            "orders": ("subtotal_cents", "discount_cents", "total_cents"),
            "order_items": ("unit_price_cents", "line_subtotal_cents"),
            "billing_records": ("amount_cents",),
            "coupons": ("discount_value", "usage_limit"),
        }
        for table, columns in wide_fields.items():
            for column in columns:
                with self.subTest(table=table, column=column):
                    self.assertRegex(table_bodies[table], rf"\b{column}\s+BIGINT\b")
                    self.assertNotRegex(table_bodies[table], rf"\b{column}\s+INTEGER\b")

        safely_bounded_integer_fields = {
            "products": "featured",
            "documentation_entries": "display_order",
            "order_items": "quantity",
            "ticket_messages": "internal_note",
            "reviews": "rating",
        }
        for table, column in safely_bounded_integer_fields.items():
            with self.subTest(table=table, column=column):
                self.assertRegex(table_bodies[table], rf"\b{column}\s+INTEGER\b")

    def test_forward_migration_postgresql_branch_never_uses_pragma_or_rebuild(self):
        import importlib.util
        path = MIGRATIONS_DIR / "002_forward_schema.py"
        spec = importlib.util.spec_from_file_location("migration_002_test", path)
        migration = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(migration)
        connection = FakePostgresqlConnection()
        migration.upgrade(connection)
        statements = "\n".join(sql for sql, _ in connection.statements)
        self.assertNotIn("PRAGMA", statements.upper())
        self.assertNotIn("SQLITE_MASTER", statements.upper())
        self.assertNotIn("RENAME TO workflow_executions_legacy", statements)
        self.assertIn("ALTER TABLE workflow_executions ADD COLUMN attempt_count", statements)
        self.assertIn("ALTER TABLE orders ADD COLUMN discount_cents BIGINT NOT NULL DEFAULT 0", statements)
        self.assertIn("ALTER TABLE order_items ADD COLUMN line_subtotal_cents BIGINT", statements)

    def test_sqlite_applies_login_rate_limit_migration_repeatably(self):
        init_db()
        init_db()
        self.assertEqual(
            [item["version"] for item in migration_status()],
            ["001_initial", "002_forward_schema", "003_site_settings", "004_login_rate_limits"],
        )
        self.assertTrue(all(item["applied"] for item in migration_status()))
        with get_db() as db:
            table = db.execute(
                "SELECT name FROM sqlite_master WHERE type='table' AND name='login_attempts'"
            ).fetchone()
            columns = {row["name"] for row in db.execute("PRAGMA table_info(login_attempts)").fetchall()}
        self.assertIsNotNone(table)
        self.assertEqual(columns, {"key_hash", "failure_count", "window_started_at", "last_failed_at"})


if __name__ == "__main__":
    unittest.main()
