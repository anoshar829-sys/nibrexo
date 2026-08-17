"""Database compatibility layer for local SQLite and production PostgreSQL."""
import os
import re
import sqlite3
from pathlib import Path

try:
    import psycopg
    from psycopg.rows import dict_row
except ImportError:  # SQLite development can still report a controlled configuration error.
    psycopg = None
    dict_row = None


BASE_DIR = Path(__file__).resolve().parent
DEFAULT_DB_PATH = BASE_DIR / "data" / "nibrexo.db"
SCHEMA_PATH = BASE_DIR / "schema.sql"


def production_environment():
    return os.environ.get("NIBREXO_ENV") == "production"


def database_url():
    return str(os.environ.get("NIBREXO_DATABASE_URL", "")).strip()


def database_engine():
    return "postgresql" if database_url() else "sqlite"


def database_path():
    return Path(os.environ.get("NIBREXO_DB_PATH", DEFAULT_DB_PATH)).expanduser()


def _translate_qmark_placeholders(sql):
    """Translate bind markers without changing question marks in SQL literals/comments."""
    output = []
    index = 0
    state = "normal"
    dollar_tag = None
    while index < len(sql):
        char = sql[index]
        following = sql[index + 1] if index + 1 < len(sql) else ""

        if state == "normal":
            if char == "'":
                state = "single"
                output.append(char)
            elif char == '"':
                state = "double"
                output.append(char)
            elif char == "-" and following == "-":
                state = "line_comment"
                output.extend((char, following))
                index += 1
            elif char == "/" and following == "*":
                state = "block_comment"
                output.extend((char, following))
                index += 1
            elif char == "$":
                match = re.match(r"\$[A-Za-z_][A-Za-z0-9_]*\$|\$\$", sql[index:])
                if match:
                    dollar_tag = match.group(0)
                    state = "dollar"
                    output.append(dollar_tag)
                    index += len(dollar_tag) - 1
                else:
                    output.append(char)
            elif char == "?":
                output.append("%s")
            else:
                output.append(char)
        elif state == "single":
            output.append(char)
            if char == "'":
                if following == "'":
                    output.append(following)
                    index += 1
                else:
                    state = "normal"
        elif state == "double":
            output.append(char)
            if char == '"':
                if following == '"':
                    output.append(following)
                    index += 1
                else:
                    state = "normal"
        elif state == "line_comment":
            output.append(char)
            if char == "\n":
                state = "normal"
        elif state == "block_comment":
            output.append(char)
            if char == "*" and following == "/":
                output.append(following)
                index += 1
                state = "normal"
        elif state == "dollar":
            if dollar_tag and sql.startswith(dollar_tag, index):
                output.append(dollar_tag)
                index += len(dollar_tag) - 1
                dollar_tag = None
                state = "normal"
            else:
                output.append(char)
        index += 1
    return "".join(output)


def _translate_insert_or_ignore(sql):
    match = re.match(r"^(\s*)INSERT\s+OR\s+IGNORE\s+INTO\b", sql, flags=re.IGNORECASE)
    if not match:
        return sql
    translated = re.sub(
        r"^(\s*)INSERT\s+OR\s+IGNORE\s+INTO\b",
        r"\1INSERT INTO",
        sql,
        count=1,
        flags=re.IGNORECASE,
    )
    trailing_semicolon = translated.rstrip().endswith(";")
    body = translated.rstrip()
    if trailing_semicolon:
        body = body[:-1].rstrip()
    returning = re.search(r"\s+RETURNING\s+", body, flags=re.IGNORECASE)
    if returning:
        body = f"{body[:returning.start()]} ON CONFLICT DO NOTHING{body[returning.start():]}"
    else:
        body = f"{body} ON CONFLICT DO NOTHING"
    return f"{body};" if trailing_semicolon else body


def translate_sql(sql, engine="postgresql"):
    """Translate the small, audited SQLite runtime-SQL surface for PostgreSQL."""
    if engine != "postgresql":
        return sql
    if sql.strip().upper() == "BEGIN IMMEDIATE":
        sql = "BEGIN"
    # This transformation must not return early: placeholders still need conversion.
    sql = _translate_insert_or_ignore(sql)
    return _translate_qmark_placeholders(sql)


class DatabaseConnection:
    def __init__(self, raw_connection, engine):
        self.raw_connection = raw_connection
        self.engine = engine

    def execute(self, sql, parameters=()):
        statement = translate_sql(sql, self.engine)
        return self.raw_connection.execute(statement, parameters)

    def begin_write(self):
        if self.engine == "sqlite":
            self.raw_connection.execute("BEGIN IMMEDIATE")
        # Psycopg starts a transaction automatically on the first statement.

    def commit(self):
        self.raw_connection.commit()

    def rollback(self):
        self.raw_connection.rollback()

    def close(self):
        self.raw_connection.close()

    def execute_script(self, script):
        if self.engine == "sqlite":
            return self.raw_connection.executescript(script)
        return self.raw_connection.execute(script, prepare=False)

    def __enter__(self):
        return self

    def __exit__(self, exc_type, exc_value, traceback):
        try:
            if exc_type is None:
                self.raw_connection.commit()
            else:
                self.raw_connection.rollback()
        finally:
            self.raw_connection.close()
        return False


def _sqlite_connection(*, allow_create=None):
    path = database_path()
    if allow_create is None:
        allow_create = not production_environment()
    if path.exists() and not path.is_file():
        raise sqlite3.OperationalError("Configured database is unavailable.")
    if not path.exists():
        if not allow_create:
            raise sqlite3.OperationalError("Configured database is unavailable.")
        path.parent.mkdir(parents=True, exist_ok=True)
    connection = sqlite3.connect(path)
    connection.row_factory = sqlite3.Row
    connection.execute("PRAGMA foreign_keys = ON")
    return DatabaseConnection(connection, "sqlite")


def _postgresql_connection():
    if psycopg is None:
        raise RuntimeError("PostgreSQL support is not installed.")
    connection = psycopg.connect(
        database_url(),
        row_factory=dict_row,
        prepare_threshold=None,
        connect_timeout=10,
    )
    return DatabaseConnection(connection, "postgresql")


def get_db(*, allow_create=None):
    """Return a short-lived connection for one explicit application operation."""
    if database_engine() == "postgresql":
        return _postgresql_connection()
    if production_environment():
        raise RuntimeError("Production requires NIBREXO_DATABASE_URL.")
    return _sqlite_connection(allow_create=allow_create)


def ensure_column(connection, table, column, definition):
    if connection.engine == "postgresql":
        row = connection.execute(
            """SELECT 1 FROM information_schema.columns
               WHERE table_schema = current_schema() AND table_name = ? AND column_name = ?""",
            (table, column),
        ).fetchone()
        if not row:
            connection.execute(f"ALTER TABLE {table} ADD COLUMN {column} {definition}")
        return
    existing = {row["name"] for row in connection.execute(f"PRAGMA table_info({table})").fetchall()}
    if column not in existing:
        connection.execute(f"ALTER TABLE {table} ADD COLUMN {column} {definition}")


def migrate_workflow_execution_states(connection):
    if connection.engine != "sqlite":
        return
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
    from migrations import run_migrations
    run_migrations()


if psycopg is not None:
    DatabaseError = (sqlite3.Error, psycopg.Error)
    IntegrityError = (sqlite3.IntegrityError, psycopg.IntegrityError)
    OperationalError = (sqlite3.OperationalError, psycopg.OperationalError)
else:
    DatabaseError = sqlite3.Error
    IntegrityError = sqlite3.IntegrityError
    OperationalError = sqlite3.OperationalError
