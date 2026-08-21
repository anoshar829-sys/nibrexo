import os
import sqlite3
from pathlib import Path


class ManagedConnection(sqlite3.Connection):
    """Commit/rollback like sqlite3's context manager, then always close the connection."""
    def __exit__(self, exc_type, exc_value, traceback):
        try:
            return super().__exit__(exc_type, exc_value, traceback)
        finally:
            self.close()


BASE_DIR = Path(__file__).resolve().parent
DEFAULT_DB_PATH = BASE_DIR / "data" / "nibrexo.db"
SCHEMA_PATH = BASE_DIR / "schema.sql"


def production_environment():
    return os.environ.get("NIBREXO_ENV") == "production"


def database_path():
    return Path(os.environ.get("NIBREXO_DB_PATH", DEFAULT_DB_PATH)).expanduser()


def get_db(*, allow_create=None):
    """Open the configured SQLite database without silently recreating production data.

    Only the explicit migration path may create a database in production. Normal web and
    worker access refuses a missing or invalid production path so an incorrect mount cannot
    become an empty replacement database after restart.
    """
    path = database_path()
    if allow_create is None:
        allow_create = not production_environment()

    if path.exists() and not path.is_file():
        raise sqlite3.OperationalError("Configured database is unavailable.")
    if not path.exists():
        if not allow_create:
            raise sqlite3.OperationalError("Configured database is unavailable.")
        path.parent.mkdir(parents=True, exist_ok=True)

    connection = sqlite3.connect(path, factory=ManagedConnection)
    connection.row_factory = sqlite3.Row
    connection.execute("PRAGMA foreign_keys = ON")
    return connection


def ensure_column(connection, table, column, definition):
    existing = {row["name"] for row in connection.execute(f"PRAGMA table_info({table})").fetchall()}
    if column not in existing:
        connection.execute(f"ALTER TABLE {table} ADD COLUMN {column} {definition}")


def migrate_workflow_execution_states(connection):
    row = connection.execute("SELECT sql FROM sqlite_master WHERE type = 'table' AND name = 'workflow_executions'").fetchone()
    if not row or "blocked" in (row["sql"] or ""):
        return
    connection.execute("ALTER TABLE workflow_executions RENAME TO workflow_executions_legacy")
    connection.execute("""CREATE TABLE workflow_executions (
      id TEXT PRIMARY KEY,
      workflow_id TEXT NOT NULL,
      event_id TEXT,
      execution_key TEXT NOT NULL UNIQUE,
      status TEXT NOT NULL DEFAULT 'queued' CHECK (status IN ('queued','running','completed','failed','blocked','cancelled')),
      error_summary TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      FOREIGN KEY (workflow_id) REFERENCES workflows(id) ON DELETE CASCADE,
      FOREIGN KEY (event_id) REFERENCES integration_events(id) ON DELETE SET NULL
    )""")
    connection.execute("INSERT INTO workflow_executions (id, workflow_id, event_id, execution_key, status, error_summary, created_at, updated_at) SELECT id, workflow_id, event_id, execution_key, status, error_summary, created_at, updated_at FROM workflow_executions_legacy")
    connection.execute("DROP TABLE workflow_executions_legacy")


def init_db():
    # Migration runner preserves existing data and records applied versions.
    from migrations import run_migrations
    run_migrations()
