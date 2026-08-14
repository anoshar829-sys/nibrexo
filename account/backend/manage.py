import argparse
from pathlib import Path

import json

from backup import create_backup, restore_to_test_database
from config import readiness
from migrations import migration_status, run_migrations


def main():
    parser = argparse.ArgumentParser(description="Nibrexo backend operations")
    subparsers = parser.add_subparsers(dest="command", required=True)
    subparsers.add_parser("migrate")
    subparsers.add_parser("migration-status")
    subparsers.add_parser("readiness")
    backup_parser = subparsers.add_parser("backup")
    backup_parser.add_argument("--destination", default="backend/backups")
    restore_parser = subparsers.add_parser("restore-test")
    restore_parser.add_argument("backup")
    restore_parser.add_argument("--target", default="backend/restores/restore-test.db")
    args = parser.parse_args()

    if args.command == "migrate":
        run_migrations()
        print("Migrations applied.")
    elif args.command == "migration-status":
        for item in migration_status():
            print(f"{item['version']}: {'applied' if item['applied'] else 'pending'}")
    elif args.command == "readiness":
        print(json.dumps(readiness(), indent=2))
    elif args.command == "backup":
        print(create_backup(args.destination))
    elif args.command == "restore-test":
        print(restore_to_test_database(args.backup, args.target))


if __name__ == "__main__":
    main()
