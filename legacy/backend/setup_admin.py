"""Secure operator-only first-admin setup. Never expose this as a production route."""
import argparse
import getpass
import os
import re
import sys

from werkzeug.security import generate_password_hash

from app import new_id, now_iso
from config import validate_database_environment
from database import database_engine, get_db, init_db, production_environment
from migrations import migration_status

EMAIL_RE = re.compile(r"^[^\s@]+@[^\s@]+\.[^\s@]+$")

FOUNDER_ENVIRONMENT_KEYS = (
    "NIBREXO_FOUNDER_EMAIL",
    "NIBREXO_FOUNDER_NAME",
    "NIBREXO_FOUNDER_PASSWORD",
)


def founder_values_from_environment():
    values = {key: os.environ.get(key) for key in FOUNDER_ENVIRONMENT_KEYS}
    if not all(values.values()):
        raise RuntimeError("Founder provisioning secrets are unavailable in this process.")
    return (
        values["NIBREXO_FOUNDER_EMAIL"],
        values["NIBREXO_FOUNDER_NAME"],
        values["NIBREXO_FOUNDER_PASSWORD"],
    )


def provision_founder_from_environment():
    """Provision one Founder from process-injected secrets against the selected database."""
    if production_environment() and database_engine() != "postgresql":
        raise RuntimeError("Production Founder provisioning requires PostgreSQL configuration.")
    validate_database_environment()
    email, name, password = founder_values_from_environment()
    return create_operator(email, name, password, "owner")


def validate_identity(email, name):
    normalized_email = str(email or "").strip().lower()
    normalized_name = str(name or "").strip()
    if not normalized_name:
        raise ValueError("Founder name is required.")
    if not EMAIL_RE.fullmatch(normalized_email):
        raise ValueError("Enter a valid Founder email address.")
    return normalized_email, normalized_name


def validate_password(password, confirmation):
    if len(password or "") < 8:
        raise ValueError("Password must contain at least 8 characters.")
    if password != confirmation:
        raise ValueError("Passwords do not match.")


def _prepare_database_for_provisioning():
    if database_engine() == "sqlite":
        init_db()
        return
    validate_database_environment()
    pending = [item["version"] for item in migration_status() if not item["applied"]]
    if pending:
        raise RuntimeError("Founder provisioning requires all database migrations to be applied first.")


def create_operator(email, name, password, role="owner"):
    """Create one operator without exposing or returning password material."""
    email, name = validate_identity(email, name)
    validate_password(password, password)
    _prepare_database_for_provisioning()
    timestamp = now_iso()
    with get_db() as db:
        db.begin_write()
        if db.engine == "postgresql":
            # Serialize this one-time check/insert without requiring a permanent schema lock.
            db.execute("LOCK TABLE users IN SHARE ROW EXCLUSIVE MODE")
        if db.execute("SELECT 1 FROM users WHERE email = ?", (email,)).fetchone():
            raise ValueError("An account with this email already exists.")
        if role == "owner" and db.execute("SELECT 1 FROM users WHERE role = 'owner' LIMIT 1").fetchone():
            raise ValueError("An owner account already exists. No duplicate Founder account was created.")
        user_id = new_id("user")
        db.execute(
            "INSERT INTO users (id, name, email, password_hash, role, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, 'active', ?, ?)",
            (user_id, name, email, generate_password_hash(password), role, timestamp, timestamp),
        )
        db.execute(
            "INSERT INTO team_members (id, user_id, role, status, created_at) VALUES (?, ?, ?, 'active', ?)",
            (new_id("team"), user_id, role, timestamp),
        )
        db.commit()
    return {"id": user_id, "role": role}


def prompt_founder_identity():
    if not sys.stdin.isatty():
        raise RuntimeError("Interactive setup requires a local terminal. Do not pass Founder credentials through non-interactive input.")
    while True:
        try:
            email = input("Founder email: ")
            name = input("Founder name: ")
        except (EOFError, KeyboardInterrupt):
            raise RuntimeError("Interactive input ended before Founder account creation. No account was created.")
        try:
            return validate_identity(email, name)
        except ValueError as exc:
            print(str(exc), file=sys.stderr)


def prompt_password():
    try:
        password = getpass.getpass("Founder password: ")
        confirmation = getpass.getpass("Confirm Founder password: ")
    except (EOFError, KeyboardInterrupt):
        raise RuntimeError("Interactive input ended before Founder account creation. No account was created.")
    validate_password(password, confirmation)
    return password


def main(argv=None):
    parser = argparse.ArgumentParser(description="Create the first Nibrexo owner/admin account.")
    mode = parser.add_mutually_exclusive_group()
    mode.add_argument("--interactive", action="store_true", help="Prompt privately for Founder email, name, and password.")
    mode.add_argument("--from-env", action="store_true", help="Provision the one Founder owner from secure process/session secrets.")
    parser.add_argument("--email")
    parser.add_argument("--name")
    parser.add_argument("--role", choices=["owner", "admin"], default="owner")
    args = parser.parse_args(argv)

    try:
        if args.from_env:
            if args.email or args.name:
                parser.error("--from-env reads Founder identity from secure process/session secrets; do not combine it with --email or --name.")
            if args.role != "owner":
                parser.error("--from-env provisions the Founder owner role only.")
            result = provision_founder_from_environment()
        elif args.interactive:
            if args.email or args.name:
                parser.error("--interactive prompts for Founder email and name; do not combine it with --email or --name.")
            email, name = prompt_founder_identity()
            password = prompt_password()
            result = create_operator(email, name, password, args.role)
        else:
            if not args.email or not args.name:
                parser.error("--email and --name are required unless --interactive or --from-env is used.")
            email, name = validate_identity(args.email, args.name)
            if not sys.stdin.isatty():
                raise RuntimeError("Password confirmation requires a local terminal. Use --interactive from an operator terminal.")
            password = prompt_password()
            result = create_operator(email, name, password, args.role)
    except (RuntimeError, ValueError) as exc:
        message = str(exc)
        if "owner account already exists" in message.lower():
            message = "Owner account already exists."
        sys.exit(message)

    if result["role"] == "owner":
        print("Founder account created successfully. Remove provisioning secrets from the execution environment when appropriate.")
    else:
        print("Administrator account created. Keep credentials private.")


if __name__ == "__main__":
    main()
