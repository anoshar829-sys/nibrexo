"""Forward-only migration runner for SQLite development and PostgreSQL production."""
import importlib.util
from datetime import datetime, timezone
from pathlib import Path

from config import validate_database_environment
from database import database_engine, get_db

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
    return datetime.now(timezone.utc).isoformat()


def load_python_migration(path):
    spec = importlib.util.spec_from_file_location(f"nibrexo_migration_{path.stem}", path)
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


def _migration_descriptor(path):
    name = path.name
    if name.startswith("_"):
        return None
    if name.endswith(".pg.sql"):
        return name[:-7], "postgresql", "sql"
    if name.endswith(".sql"):
        return name[:-4], "shared", "sql"
    if name.endswith(".py"):
        return name[:-3], "shared", "python"
    return None


def available_migrations(engine=None):
    """Return one implementation for each logical migration version."""
    selected_engine = engine or database_engine()
    choices = {}
    for path in sorted(MIGRATIONS_DIR.iterdir()):
        descriptor = _migration_descriptor(path)
        if not descriptor:
            continue
        version, target, migration_type = descriptor
        choices.setdefault(version, {})[target] = (path, migration_type)

    migrations = []
    for version in sorted(choices):
        implementations = choices[version]
        implementation = implementations.get(selected_engine) or implementations.get("shared")
        if implementation is None:
            raise RuntimeError(f"Migration {version} has no implementation for {selected_engine}.")
        path, migration_type = implementation
        migrations.append({"version": version, "path": path, "type": migration_type})
    return migrations


def _quoted_sql_literal(value):
    return "'" + str(value).replace("'", "''") + "'"


def _apply_sql_migration(connection, migration):
    version = migration["version"]
    applied_at = timestamp()
    script = migration["path"].read_text(encoding="utf-8")
    if connection.engine == "sqlite":
        # sqlite3.executescript commits any pending transaction, so include the version
        # record in the same explicit script transaction to avoid partial application.
        combined = (
            "BEGIN IMMEDIATE;\n"
            f"{script.rstrip()}\n"
            "INSERT INTO schema_migrations (version, applied_at) VALUES "
            f"({_quoted_sql_literal(version)}, {_quoted_sql_literal(applied_at)});\n"
            "COMMIT;\n"
        )
        try:
            connection.execute_script(combined)
        except Exception:
            connection.rollback()
            raise
        return

    try:
        connection.execute_script(script)
        connection.execute(
            "INSERT INTO schema_migrations (version, applied_at) VALUES (?, ?)",
            (version, applied_at),
        )
        connection.commit()
    except Exception:
        connection.rollback()
        raise


def _apply_python_migration(connection, migration):
    try:
        connection.begin_write()
        module = load_python_migration(migration["path"])
        module.upgrade(connection)
        connection.execute(
            "INSERT INTO schema_migrations (version, applied_at) VALUES (?, ?)",
            (migration["version"], timestamp()),
        )
        connection.commit()
    except Exception:
        connection.rollback()
        raise


def run_migrations():
    """Apply pending migrations explicitly; normal application startup never calls this."""
    validate_database_environment()
    with get_db(allow_create=True) as connection:
        ensure_migration_table(connection)
        connection.commit()
        applied = applied_versions(connection)
        for migration in available_migrations(connection.engine):
            if migration["version"] in applied:
                continue
            if migration["type"] == "sql":
                _apply_sql_migration(connection, migration)
            else:
                _apply_python_migration(connection, migration)
            applied.add(migration["version"])


def _migration_table_exists(connection):
    if connection.engine == "postgresql":
        return bool(connection.execute("SELECT to_regclass('schema_migrations') AS name").fetchone()["name"])
    return bool(
        connection.execute(
            "SELECT 1 FROM sqlite_master WHERE type = 'table' AND name = 'schema_migrations'"
        ).fetchone()
    )


def migration_status():
    """Read migration status without creating schema state during application startup."""
    with get_db() as connection:
        applied = applied_versions(connection) if _migration_table_exists(connection) else set()
        engine = connection.engine
    return [
        {"version": migration["version"], "applied": migration["version"] in applied}
        for migration in available_migrations(engine)
    ]
