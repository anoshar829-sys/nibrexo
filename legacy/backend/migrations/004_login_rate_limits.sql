-- Hashed login throttling state shared by SQLite and PostgreSQL.
CREATE TABLE IF NOT EXISTS login_attempts (
  key_hash TEXT PRIMARY KEY,
  failure_count INTEGER NOT NULL DEFAULT 0 CHECK (failure_count >= 0),
  window_started_at TEXT NOT NULL,
  last_failed_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_login_attempts_last_failed_at ON login_attempts(last_failed_at);
