import os
import sys
import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch

BACKEND_DIR = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(BACKEND_DIR))

import database
from database import DatabaseConnection, database_engine, get_db, translate_sql


class FakeRawConnection:
    def __init__(self):
        self.executions = []
        self.commits = 0
        self.rollbacks = 0
        self.closed = 0

    def execute(self, sql, parameters=(), **kwargs):
        self.executions.append((sql, parameters, kwargs))
        return self

    def fetchone(self):
        return {"value": 1}

    def commit(self):
        self.commits += 1

    def rollback(self):
        self.rollbacks += 1

    def close(self):
        self.closed += 1


class DatabaseAbstractionTests(unittest.TestCase):
    def setUp(self):
        self.original = {key: os.environ.get(key) for key in ("NIBREXO_DATABASE_URL", "NIBREXO_DB_PATH", "NIBREXO_ENV")}
        os.environ.pop("NIBREXO_DATABASE_URL", None)
        os.environ.pop("NIBREXO_ENV", None)
        self.temp = tempfile.TemporaryDirectory()
        os.environ["NIBREXO_DB_PATH"] = str(Path(self.temp.name) / "database.db")

    def tearDown(self):
        for key, value in self.original.items():
            if value is None:
                os.environ.pop(key, None)
            else:
                os.environ[key] = value
        self.temp.cleanup()

    def test_sqlite_engine_rows_commit_and_rollback(self):
        self.assertEqual(database_engine(), "sqlite")
        with get_db() as db:
            self.assertEqual(db.engine, "sqlite")
            db.execute("CREATE TABLE sample (id TEXT PRIMARY KEY, value TEXT)")
            db.execute("INSERT INTO sample (id, value) VALUES (?, ?)", ("one", "saved"))
        with get_db() as db:
            row = db.execute("SELECT id, value FROM sample WHERE id = ?", ("one",)).fetchone()
            self.assertEqual(row["value"], "saved")
            with self.assertRaises(RuntimeError):
                with get_db() as failing:
                    failing.execute("INSERT INTO sample (id, value) VALUES (?, ?)", ("two", "rolled-back"))
                    raise RuntimeError("rollback")
            self.assertIsNone(db.execute("SELECT id FROM sample WHERE id = ?", ("two",)).fetchone())

    def test_postgresql_engine_selection_and_connection_options(self):
        os.environ["NIBREXO_DATABASE_URL"] = "postgresql://user:secret@db.example.test:6543/nibrexo"
        fake = FakeRawConnection()
        with patch.object(database.psycopg, "connect", return_value=fake) as connect:
            with get_db() as db:
                self.assertEqual(db.engine, "postgresql")
                db.execute("SELECT ? AS value", (1,))
        self.assertEqual(database_engine(), "postgresql")
        self.assertEqual(fake.executions[0][0], "SELECT %s AS value")
        self.assertEqual(fake.commits, 1)
        self.assertEqual(fake.closed, 1)
        self.assertIsNone(connect.call_args.kwargs["prepare_threshold"])
        self.assertIs(connect.call_args.kwargs["row_factory"], database.dict_row)
        self.assertEqual(connect.call_args.kwargs["connect_timeout"], 10)

    def test_connection_context_rolls_back_postgresql_errors(self):
        fake = FakeRawConnection()
        with self.assertRaises(ValueError):
            with DatabaseConnection(fake, "postgresql"):
                raise ValueError("failure")
        self.assertEqual(fake.rollbacks, 1)
        self.assertEqual(fake.commits, 0)
        self.assertEqual(fake.closed, 1)

    def test_placeholder_translation_ignores_literals_comments_and_dollar_quotes(self):
        sql = "SELECT ?, '?' AS literal, \"?\" AS identifier, $$?$$ AS body -- ?\n/* ? */ WHERE id = ?"
        translated = translate_sql(sql)
        self.assertEqual(translated.count("%s"), 2)
        self.assertIn("'?'", translated)
        self.assertIn('"?"', translated)
        self.assertIn("$$?$$", translated)
        self.assertIn("-- ?", translated)
        self.assertIn("/* ? */", translated)

    def test_insert_or_ignore_translation_also_converts_placeholders(self):
        translated = translate_sql(
            "INSERT OR IGNORE INTO integration_events (id, idempotency_key) VALUES (?, ?)"
        )
        self.assertEqual(
            translated,
            "INSERT INTO integration_events (id, idempotency_key) VALUES (%s, %s) ON CONFLICT DO NOTHING",
        )
        self.assertNotIn("?", translated)

    def test_production_never_falls_back_to_sqlite(self):
        os.environ["NIBREXO_ENV"] = "production"
        os.environ.pop("NIBREXO_DATABASE_URL", None)
        with self.assertRaisesRegex(RuntimeError, "requires NIBREXO_DATABASE_URL"):
            get_db()


if __name__ == "__main__":
    unittest.main()
