# Nibrexo Production Operations Readiness

This is an operations procedure and a pre-deployment checklist. It is **not** evidence that a production deployment, TLS endpoint, supervisor, backup scheduler, or external provider has been configured.

## Required production startup order

Complete any backup pre-flight first, then use this order exactly:

1. **Database migration**
   ```bash
   python backend/manage.py migrate
   ```
   This is the only intentional production path that can create a new configured SQLite database. It applies forward-only migrations and records each applied version.
2. **Application startup validation**
   The WSGI import validates production configuration, requires an existing database file, and refuses to start if migrations are pending. It does **not** run migrations automatically.
3. **WSGI server**
   ```bash
   gunicorn --workers 2 --bind 0.0.0.0:5000 backend.wsgi:app
   ```
   `backend/wsgi.py` is the production WSGI entry point. This repository does not choose or configure a supervisor/process manager.
4. **Separate worker process**
   ```bash
   python backend/worker.py --interval 5 --max-attempts 3
   ```
   Start it only after migration and web application startup checks succeed.

Do not use `python backend/app.py` / Flask's development server in production.

## Production environment validation

Set these values server-side only; never place their values in browser code, logs, or source control:

- `NIBREXO_ENV=production`
- `FLASK_SECRET_KEY` — explicit, non-default, at least 32 characters
- `NIBREXO_DB_PATH` — an **absolute** path on an operator-provisioned durable volume
- `NIBREXO_COOKIE_SECURE=true`
- `LICENSE_ENCRYPTION_KEY` — a valid Fernet key

Versioned license support is also validated without exposing any key material:

- `LICENSE_ENCRYPTION_KEY_VERSION` — optional only because the safe default is `fernet-v1`; use an explicit valid label for production operations
- `LICENSE_ENCRYPTION_PREVIOUS_KEYS` — optional JSON object of previous version labels to valid Fernet keys; use only for a controlled rotation

The application does not generate a replacement license key, rotate a key, reset a database, or recreate a missing production database at startup. A durable volume cannot be proven by application code; its persistence is an operator/deployment requirement.

Use:

```bash
python backend/manage.py readiness
python backend/manage.py migration-status
```

`readiness` returns booleans only. It never returns paths, environment values, secrets, provider credentials, or encryption keys.

## WSGI

Use a real WSGI process manager/server in production. Gunicorn is listed in `requirements.txt` and the command above demonstrates the entry point, but no production process manager configuration is included in this repository.

`backend/wsgi.py` only constructs the Flask WSGI callable. It does not call `app.run()` and does not run a development server.

## Worker operations and duplicate-safety boundary

```bash
python backend/worker.py --once
python backend/worker.py --interval 5 --max-attempts 3
```

- The worker is separate from the web process.
- It refuses to start if any migration is pending.
- It atomically claims queued jobs with a SQLite write lock plus a per-execution lock token.
- Duplicate internal events and request retries use unique idempotency keys; one workflow/event pair produces one execution record.
- A worker can only complete, fail, or block the execution that still holds its token.
- Stale running jobs can be recovered; retries are bounded by `--max-attempts` and failures are recorded.
- External actions remain `blocked` when their provider is not configured. They are never reported as completed merely because an adapter exists.
- SQLite is suitable only within its write-lock limits. For future provider actions, a selected provider adapter must support provider-side idempotency before activation; that provider-specific work is intentionally pending.

No supervisor, scheduler, or worker service is configured here.

## Migration procedure

1. Create and validate a backup before changing a production database.
2. Restore that backup to a separate test database.
3. Verify representative Users, Products, Orders, Licenses, Documentation, Blog, Workflows, and Activity Logs in the restore.
4. Run `python backend/manage.py migrate` against the configured production path.
5. Run `python backend/manage.py migration-status` and confirm every version is applied.
6. Start/restart the WSGI process, then the separate worker process.
7. Verify `/api/health` and authorized `/api/admin/readiness`.

Migrations are forward-only and repeatable. Recovery is restoring the validated backup if a migration fails; automatic rollback is not claimed.

## Backup and restore readiness

The repository provides a safe local SQLite backup/restore-test helper:

```bash
python backend/manage.py backup --destination /secure/backup/staging
python backend/manage.py restore-test /secure/backup/staging/nibrexo-YYYYMMDDTHHMMSSZ.db --target /secure/restore-test/nibrexo-restore.db
```

The helper rejects a missing source database and refuses to restore over the active configured database. Its output is a **local plaintext SQLite backup**. It does **not** encrypt, copy off-server, retain snapshots, or schedule itself.

Required production policy to configure outside this repository:

- Encrypt backups at rest
- Store copies off-server / in approved durable backup infrastructure
- Define retention and deletion policy
- Perform regular restore verification into a separate test location

No automated encrypted off-server backup scheduler is configured or claimed.

## HTTPS and session cookies

HTTPS is mandatory in production for authentication, sessions, Admin access, future payments, encrypted licenses, and protected downloads. TLS must be provided by the deployment platform or reverse proxy.

With `NIBREXO_COOKIE_SECURE=true`, the server issues the opaque session cookie with `Secure`, `HttpOnly`, and `SameSite=Lax`. Do not enable that flag for plain local HTTP development. This repository does not claim that HTTPS is currently active.

## Provider boundaries

Until a vendor is selected, configured, implemented, and successfully contacted by the server, each of these must remain **NOT_CONFIGURED**:

- Payment
- Storage
- Email
- AI
- CRM
- Newsletter
- Analytics

Current boundaries:

- Checkout may create only a server-priced **pending** order; it is not a paid order and creates no entitlement.
- Payment webhooks reject unconfigured payment providers. Only verified provider events may mark an order paid.
- Storage uploads and private download delivery reject unavailable storage. No fake signed URLs are generated.
- Password reset delivery reports that no email was sent when email is unavailable.
- AI, CRM, newsletter, and external analytics do not fabricate replies, synchronization, subscriptions, or delivery.
- Provider-dependent workflow actions become `blocked`, not completed.

## Public/private and error boundaries

- Public APIs expose published public content only.
- Customer APIs require an authenticated owner of the requested data.
- Admin APIs enforce authorized server-side roles.
- Private files require authenticated ownership, a paid order, an active license, and configured storage before any download access can be returned.
- The frontend server rejects backend source, database, environment, SQL, and operations-file paths.
- Production API failures use controlled error responses without stack traces, filesystem paths, database paths, environment values, provider secrets, or encryption keys.

This document does not replace the later Founder-only Admin security-hardening phase.
