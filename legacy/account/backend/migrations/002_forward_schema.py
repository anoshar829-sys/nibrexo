"""Forward-only compatibility columns/tables for early SQLite backend databases."""


def ensure_column(connection, table, column, definition):
    columns = {row["name"] for row in connection.execute(f"PRAGMA table_info({table})").fetchall()}
    if column not in columns:
        connection.execute(f"ALTER TABLE {table} ADD COLUMN {column} {definition}")


def rebuild_workflow_executions(connection):
    row = connection.execute("SELECT sql FROM sqlite_master WHERE type='table' AND name='workflow_executions'").fetchone()
    if not row or all(token in (row["sql"] or "") for token in ["blocked", "attempt_count", "lock_token"]):
        return
    connection.execute("ALTER TABLE workflow_executions RENAME TO workflow_executions_legacy")
    connection.execute("""CREATE TABLE workflow_executions (
      id TEXT PRIMARY KEY,
      workflow_id TEXT NOT NULL,
      event_id TEXT,
      execution_key TEXT NOT NULL UNIQUE,
      status TEXT NOT NULL DEFAULT 'queued' CHECK (status IN ('queued','running','completed','failed','blocked','cancelled')),
      error_summary TEXT,
      attempt_count INTEGER NOT NULL DEFAULT 0,
      last_attempt_at TEXT,
      next_retry_at TEXT,
      locked_at TEXT,
      lock_token TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      FOREIGN KEY (workflow_id) REFERENCES workflows(id) ON DELETE CASCADE,
      FOREIGN KEY (event_id) REFERENCES integration_events(id) ON DELETE SET NULL
    )""")
    legacy_columns = {row["name"] for row in connection.execute("PRAGMA table_info(workflow_executions_legacy)").fetchall()}
    select = ", ".join([
        "id", "workflow_id", "event_id", "execution_key", "status", "error_summary",
        "0 AS attempt_count", "NULL AS last_attempt_at", "NULL AS next_retry_at", "NULL AS locked_at", "NULL AS lock_token",
        "created_at", "updated_at",
    ])
    if legacy_columns:
        connection.execute(f"INSERT INTO workflow_executions (id, workflow_id, event_id, execution_key, status, error_summary, attempt_count, last_attempt_at, next_retry_at, locked_at, lock_token, created_at, updated_at) SELECT {select} FROM workflow_executions_legacy")
    connection.execute("DROP TABLE workflow_executions_legacy")


def upgrade(connection):
    ensure_column(connection, "products", "featured", "INTEGER NOT NULL DEFAULT 0")
    ensure_column(connection, "products", "metadata_json", "TEXT")
    ensure_column(connection, "media", "visibility", "TEXT NOT NULL DEFAULT 'private'")
    ensure_column(connection, "orders", "discount_cents", "INTEGER NOT NULL DEFAULT 0")
    ensure_column(connection, "orders", "payment_reference", "TEXT")
    ensure_column(connection, "orders", "checkout_idempotency_key", "TEXT")
    ensure_column(connection, "order_items", "product_title_snapshot", "TEXT")
    ensure_column(connection, "order_items", "line_subtotal_cents", "INTEGER")
    ensure_column(connection, "licenses", "key_ciphertext", "TEXT")
    ensure_column(connection, "licenses", "key_version", "TEXT")
    rebuild_workflow_executions(connection)
