import hashlib
import json
import uuid
from datetime import datetime, timezone

from database import get_db
from integrations.base import ProviderUnavailable
from integrations.ai import get_ai_provider
from integrations.crm import get_crm_provider
from integrations.email import get_email_provider
from integrations.newsletter import get_newsletter_provider


def now_iso():
    return datetime.now(timezone.utc).isoformat()


def queue_workflows_for_event(event_id, event_type):
    """Queue matching active workflows exactly once without executing browser-side actions."""
    with get_db() as db:
        workflows = db.execute("SELECT id FROM workflows WHERE status = 'active'").fetchall()
        created = []
        for workflow in workflows:
            execution_key = hashlib.sha256(f"{workflow['id']}:{event_id}".encode()).hexdigest()
            inserted = db.execute(
                "INSERT OR IGNORE INTO workflow_executions (id, workflow_id, event_id, execution_key, status, created_at, updated_at) VALUES (?, ?, ?, ?, 'queued', ?, ?)",
                (f"workflow_execution_{uuid.uuid4().hex}", workflow["id"], event_id, execution_key, now_iso(), now_iso()),
            )
            if inserted.rowcount == 1:
                created.append(workflow["id"])
        db.commit()
    return created


def _record_provider_result(db, provider, operation, status, summary):
    db.execute(
        "INSERT INTO provider_usage_logs (id, provider, operation, status, safe_summary, created_at) VALUES (?, ?, ?, ?, ?, ?)",
        (f"provider_log_{uuid.uuid4().hex}", provider, operation, status, summary, now_iso()),
    )


def _finish_execution(db, execution_id, lock_token, state, summary=None):
    """Release only the claim held by this worker; never overwrite a newer claim."""
    result = db.execute(
        """UPDATE workflow_executions
           SET status=?, error_summary=?, next_retry_at=NULL, lock_token=NULL, locked_at=NULL, updated_at=?
           WHERE id=? AND status='running' AND lock_token=?""",
        (state, summary, now_iso(), execution_id, lock_token),
    )
    return result.rowcount == 1


def execute_workflow(execution_id, lock_token=None):
    """Execute one claimed definition on the server.

    A valid current worker lock is mandatory. Provider actions that have no real server-side
    implementation remain blocked rather than being reported as completed.
    """
    with get_db() as db:
        execution = db.execute("SELECT * FROM workflow_executions WHERE id = ?", (execution_id,)).fetchone()
        if not execution:
            return {"ok": False, "state": "not_found", "message": "Workflow execution not found."}
        if (
            not lock_token
            or execution["status"] != "running"
            or execution["lock_token"] != lock_token
        ):
            return {"ok": False, "state": "locked", "message": "Workflow execution is held by another worker."}

        workflow = db.execute("SELECT * FROM workflows WHERE id = ?", (execution["workflow_id"],)).fetchone()
        if not workflow:
            updated = _finish_execution(db, execution_id, lock_token, "failed", "Workflow definition not found.")
            db.commit()
            if not updated:
                return {"ok": False, "state": "locked", "message": "Workflow execution is held by another worker."}
            return {"ok": False, "state": "failed", "message": "Workflow definition not found."}

        try:
            definition = json.loads(workflow["definition_json"] or "{}")
            nodes = definition.get("nodes", [])
            if not isinstance(nodes, list):
                raise ValueError("Workflow definition has invalid nodes.")
            for node in nodes:
                action = node.get("type")
                config = node.get("configuration") or {}
                if action == "Email":
                    get_email_provider().send_email("workflow.email", config.get("recipient", ""), "workflow.email", config)
                elif action in {"CRM", "Tag Contact", "Update Contact"}:
                    get_crm_provider().record_event(config.get("contact", ""), "workflow.action")
                elif action == "Newsletter":
                    get_newsletter_provider().subscribe(config.get("email", ""), bool(config.get("marketingConsent", False)))
                elif action == "AI":
                    get_ai_provider().respond(config.get("instructions", ""), config.get("prompt", ""))
                elif action == "Trigger":
                    # The matching event has already been recorded and claimed internally.
                    continue
                else:
                    # Conditions, delays, notifications, tasks, and unknown actions need a
                    # real server-side executor before they may be reported as completed.
                    raise ProviderUnavailable("Workflow action is not configured.")
            updated = _finish_execution(db, execution_id, lock_token, "completed")
            db.commit()
            if not updated:
                return {"ok": False, "state": "locked", "message": "Workflow execution is held by another worker."}
            return {"ok": True, "state": "completed"}
        except ProviderUnavailable as exc:
            message = str(exc)
            updated = _finish_execution(db, execution_id, lock_token, "blocked", message)
            if updated:
                _record_provider_result(db, "workflow", "external_action", "blocked", message)
            db.commit()
            if not updated:
                return {"ok": False, "state": "locked", "message": "Workflow execution is held by another worker."}
            return {"ok": False, "state": "blocked", "message": message}
        except Exception:
            updated = _finish_execution(db, execution_id, lock_token, "failed", "Workflow action failed.")
            db.commit()
            if not updated:
                return {"ok": False, "state": "locked", "message": "Workflow execution is held by another worker."}
            return {"ok": False, "state": "failed", "message": "Workflow action failed."}
