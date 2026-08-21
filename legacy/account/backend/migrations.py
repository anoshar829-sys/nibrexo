"""Small repeatable SQLite migration runner.

SQL migrations are applied once in lexical order. Python migrations support safe conditional
changes for existing SQLite databases. No migration automatically drops application data.
"""
import importlib.util
from pathlib import Path

from config import validate_production_environment
from database import get_db

MIGRATIONS_DIR = Path(__file__).resolve().parent / "migrations"


def ensure_migration_table(connection):
    connection.execute(
        """CREATE TABLE IF NOT EXISTS schema_migrations (
            version TEXT PRIMARY KEY,
            applied_at TEXT NOT NULL
        )"""
    )


def applied_versions(connection):
    return {row["version"] for row in connection.execute("SELECT version FROM schema_migrations").fetchall()}


def timestamp():
    from datetime import datetime, timezone
    return datetime.now(timezone.utc).isoformat()


def load_python_migration(path):
    spec = importlib.util.spec_from_file_location(f"nibrexo_migration_{path.stem}", path)
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


def run_migrations():
    """The sole intentional database-creation path for a production deployment."""
    validate_production_environment(require_existing_database=False)
    with get_db(allow_create=True) as connection:
        ensure_migration_table(connection)
        applied = applied_versions(connection)
        for path in sorted(MIGRATIONS_DIR.iterdir()):
            if path.suffix not in {".sql", ".py"} or path.name.startswith("_"):
                continue
            version = path.stem
            if version in applied:
                continue
            if path.suffix == ".sql":
                connection.executescript(path.read_text())
            else:
                migration = load_python_migration(path)
                migration.upgrade(connection)
            connection.execute("INSERT INTO schema_migrations (version, applied_at) VALUES (?, ?)", (version, timestamp()))
            connection.commit()


def migration_status():
    """Read status without creating a migration table during app or worker startup."""
    with get_db() as connection:
        has_table = connection.execute(
            "SELECT 1 FROM sqlite_master WHERE type = 'table' AND name = 'schema_migrations'"
        ).fetchone()
        applied = applied_versions(connection) if has_table else set()
    available = [path.stem for path in sorted(MIGRATIONS_DIR.iterdir()) if path.suffix in {".sql", ".py"} and not path.name.startswith("_")]
    return [{"version": version, "applied": version in applied} for version in available]
