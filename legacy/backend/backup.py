"""Safe SQLite backup/restore helpers for operations use.

Backups created here are local SQLite files only. Encrypt them and store them off-server
through approved infrastructure before treating them as production backups.
"""
import sqlite3
from datetime import datetime, timezone
from pathlib import Path

from database import database_engine, database_path


def require_sqlite_backup_mode():
    if database_engine() != "sqlite":
        raise RuntimeError("The built-in backup helper supports local SQLite databases only.")


def _open_existing_read_only_database(path):
    resolved = Path(path).expanduser().resolve()
    if not resolved.is_file():
        raise RuntimeError("Database source is unavailable.")
    return sqlite3.connect(f"{resolved.as_uri()}?mode=ro", uri=True)


def create_backup(destination_dir):
    require_sqlite_backup_mode()
    source_path = database_path()
    destination = Path(destination_dir)
    destination.mkdir(parents=True, exist_ok=True)
    stamp = datetime.now(timezone.utc).strftime("%Y%m%dT%H%M%SZ")
    backup_path = destination / f"nibrexo-{stamp}.db"
    if source_path.expanduser().resolve() == backup_path.resolve():
        raise RuntimeError("Backup destination must be separate from the source database.")
    source = _open_existing_read_only_database(source_path)
    target = sqlite3.connect(backup_path)
    try:
        source.backup(target)
    finally:
        target.close()
        source.close()
    return backup_path


def restore_to_test_database(backup_path, target_path):
    require_sqlite_backup_mode()
    source = Path(backup_path).expanduser()
    target = Path(target_path).expanduser()
    active_database = database_path().expanduser().resolve()
    if not source.is_file():
        raise RuntimeError("Backup source is unavailable.")
    if source.resolve() == target.resolve() or target.resolve() == active_database:
        raise RuntimeError("Restore target must be a separate test database.")
    target.parent.mkdir(parents=True, exist_ok=True)
    source_db = _open_existing_read_only_database(source)
    target_db = sqlite3.connect(target)
    try:
        source_db.backup(target_db)
    finally:
        target_db.close()
        source_db.close()
    return target
