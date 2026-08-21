"""SQLite-backed workflow worker.

Run with `python backend/worker.py --once` or supervise it with an operations process.
The worker never executes provider actions in browser code.
"""
import argparse
import secrets
import sqlite3
import time
from datetime import datetime, timedelta, timezone

from config import validate_production_environment
from database import get_db
from migrations import migration_status
from workflows import execute_workflow


def now_iso():
    return datetime.now(timezone.utc).isoformat()


def claim_next_execution(max_attempts=3, stale_minutes=10):
    """Atomically claim one runnable execution for exactly one worker."""
    lock_token = secrets.token_urlsafe(24)
    stale_before = (datetime.now(timezone.utc) - timedelta(minutes=stale_minutes)).isoformat()
    try:
        with get_db() as db:
            # Serialize competing SQLite writers before selecting a queued row.
            db.execute("BEGIN IMMEDIATE")
            # Recover stale running jobs safely before claiming new work.
            db.execute(
                """UPDATE workflow_executions
                   SET status = CASE WHEN attempt_count >= ? THEN 'failed' ELSE 'queued' END,
                       error_summary = CASE WHEN attempt_count >= ? THEN 'Workflow worker attempts exhausted.' ELSE 'Recovered stale workflow execution.' END,
                       locked_at = NULL, lock_token = NULL, updated_at = ?
                   WHERE status = 'running' AND locked_at < ?""",
                (max_attempts, max_attempts, now_iso(), stale_before),
            )
            row = db.execute(
                """SELECT * FROM workflow_executions
                   WHERE status IN ('queued','failed')
                     AND (next_retry_at IS NULL OR next_retry_at <= ?)
                     AND attempt_count < ?
                   ORDER BY created_at ASC LIMIT 1""",
                (now_iso(), max_attempts),
            ).fetchone()
            if not row:
                db.commit()
                return None
            timestamp = now_iso()
            updated = db.execute(
                """UPDATE workflow_executions
                   SET status='running', attempt_count=attempt_count+1, last_attempt_at=?, locked_at=?, lock_token=?, updated_at=?
                   WHERE id=? AND status IN ('queued','failed')""",
                (timestamp, timestamp, lock_token, timestamp, row["id"]),
            )
            if updated.rowcount != 1:
                db.commit()
                return None
            db.commit()
            return {"id": row["id"], "lock_token": lock_token}
    except sqlite3.OperationalError as exc:
        # A contending worker should retry on its next interval, never execute a duplicate.
        if "locked" in str(exc).lower():
            return None
        raise


def process_once(max_attempts=3):
    job = claim_next_execution(max_attempts=max_attempts)
    if not job:
        return {"processed": False}
    result = execute_workflow(job["id"], job["lock_token"])
    if result.get("state") == "failed":
        with get_db() as db:
            row = db.execute("SELECT attempt_count FROM workflow_executions WHERE id = ?", (job["id"],)).fetchone()
            attempts = row["attempt_count"] if row else max_attempts
            if attempts < max_attempts:
                retry_at = (datetime.now(timezone.utc) + timedelta(seconds=60 * attempts)).isoformat()
                db.execute(
                    "UPDATE workflow_executions SET status='queued', next_retry_at=?, lock_token=NULL, locked_at=NULL, updated_at=? WHERE id=?",
                    (retry_at, now_iso(), job["id"]),
                )
                db.commit()
    return {"processed": True, "result": result}


def main():
    parser = argparse.ArgumentParser(description="Nibrexo workflow worker")
    parser.add_argument("--once", action="store_true")
    parser.add_argument("--interval", type=int, default=5)
    parser.add_argument("--max-attempts", type=int, default=3)
    args = parser.parse_args()
    if args.max_attempts < 1:
        raise SystemExit("--max-attempts must be at least 1.")
    validate_production_environment()
    if any(not item["applied"] for item in migration_status()):
        raise SystemExit("Pending database migrations. Run `python backend/manage.py migrate` before starting the worker.")
    if args.once:
        print(process_once(args.max_attempts))
        return
    while True:
        process_once(args.max_attempts)
        time.sleep(max(1, args.interval))


if __name__ == "__main__":
    main()
