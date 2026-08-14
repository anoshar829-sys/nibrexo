# Nibrexo Flask/API Application

Nibrexo is a Flask + SQLite web application. Flask serves the frontend on the same origin and provides `/api/*` endpoints for authentication, customer accounts, Admin/CMS functions, settings, commerce foundations, and protected data boundaries.

The repository database starts empty at `backend/data/nibrexo.db`. It contains no Founder/Owner account, customer, product, order, license, download, or provider configuration by default.

> **Important:** `index.html` is part of a multi-file Flask/API application. It is **not** intended to be a complete standalone `file://` application. The normal site requires its companion CSS, JavaScript, image assets, and—in the case of dynamic features—the Flask backend/API. A separately generated static Homepage export can only provide static UI; it must not fake backend features.

## Architecture boundaries

### Static frontend

- HTML pages, CSS, JavaScript, and approved assets live at the project root.
- Relative links/assets are served by Flask from the application project directory.
- Static UI can render without provider credentials, but authenticated, CMS, settings, commerce, and protected-file actions require the backend/API.

### Backend/API

- `backend/app.py` is the Flask application.
- `/api/*` routes are the authority for authentication, roles, ownership, CMS content, social/contact settings, checkout state, and protected customer data.
- Browser code must use same-origin API requests; it must not contain credentials or direct database access.

### Database

- Current repository database: `backend/data/nibrexo.db`
- Migrations are forward-only and explicitly applied with `python backend/manage.py migrate`.
- Normal application, WSGI, and worker startup do **not** apply migrations automatically.
- The production application refuses to silently recreate a missing configured database.

### External provider integrations

Payment, Storage, Email, AI, CRM, Newsletter, Analytics, and provider-backed workflow actions are intentionally **not configured** until a vendor is selected and securely implemented. Registration, login, sessions, customer accounts, CMS, and site settings do not depend on those providers.

### Production deployment

This repository does not claim a live deployment, TLS endpoint, reverse proxy, process supervisor, worker supervisor, off-server backup scheduler, or configured providers. Read [`OPERATIONS.md`](OPERATIONS.md) before production deployment work.

## Development setup

```bash
python -m pip install -r backend/requirements.txt
python backend/manage.py migrate
python backend/setup_admin.py --interactive --role owner
python backend/app.py
```

The interactive Owner setup command is the **primary documented first-owner method**. It privately prompts for Founder email, Founder name, password, and password confirmation. Password input is hidden/no-echo and only a secure hash is stored.

Do not place Founder credentials in source code, frontend code, HTML, JavaScript, committed environment files, or command-line arguments.

## First Owner provisioning

An Owner account must be provisioned before the Admin Panel can be used. Public registration always creates a `customer` role and can never create an Owner/Admin role.

### Primary local operator method

Run from a real interactive terminal:

```bash
python backend/setup_admin.py --interactive --role owner
```

The command:

- validates identity and password input
- creates an active `owner` user
- creates the corresponding active `team_members` record
- hashes the password with Werkzeug
- refuses a duplicate Owner account
- never prints the password or password hash

### Development-only browser bootstrap

For a fresh local development database only, a one-time browser bootstrap route is available at:

```text
/setup/owner
```

It is available only while no Owner account exists, uses an HttpOnly SameSite-Strict setup token and basic failed-attempt rate limiting, creates only the `owner` role, and redirects through the existing session system to `/admin/index.html`. It returns `404` after the first Owner exists and is disabled whenever `NIBREXO_ENV=production`.

**Never use this browser bootstrap route for production deployment.** Production must use one of the secure operator methods below.

### Secure non-interactive operations method

For an operations environment that injects secure process/session secrets, use:

```bash
python backend/setup_admin.py --from-env --role owner
```

The command reads only these process/session secret names:

- `NIBREXO_FOUNDER_EMAIL`
- `NIBREXO_FOUNDER_NAME`
- `NIBREXO_FOUNDER_PASSWORD`

Do not write their values into `.env` files that will be committed, shell history, source code, documentation, frontend files, or logs. The command targets the current repository database (`backend/data/nibrexo.db`), creates only one Owner, and reports only a safe completion or safe validation/duplicate message. Remove externally managed provisioning secrets from the execution environment when appropriate; the command does not print or persist those raw values.

## Admin access

After a real Owner/Admin account exists, authenticate through the normal account login flow. The server creates an opaque session cookie and checks the user/role server-side for every protected API. Frontend route guards and hidden controls never grant access by themselves.

Use the Admin UI only through the running Flask application origin. Opening `admin/*.html` or `account/*.html` from a static/file preview cannot supply the backend/API required for login, sessions, CMS, or settings.

## Production sequence

Read [`OPERATIONS.md`](OPERATIONS.md) before deployment work. The required sequence is:

```text
Database migration → application startup validation → WSGI server → separate worker
```

Use the production WSGI entry point after migration:

```bash
gunicorn --workers 2 --bind 0.0.0.0:5000 backend.wsgi:app
```

`backend/wsgi.py` creates the WSGI callable and never starts Flask's development server. No deployment, TLS endpoint, supervisor, or process manager is configured by this repository.

## Production configuration

Production validation requires server-side values for:

- `NIBREXO_ENV=production`
- `FLASK_SECRET_KEY` (non-default, 32+ characters)
- `NIBREXO_DB_PATH` (absolute durable-volume path; it must exist after migration)
- `NIBREXO_COOKIE_SECURE=true`
- `LICENSE_ENCRYPTION_KEY` (valid Fernet key)

The license vault also validates its version label and, when supplied, a valid previous-key map. It never generates or rotates a replacement key at startup.

```bash
python backend/manage.py readiness
python backend/manage.py migration-status
```

Readiness reports booleans only and never exposes secrets, paths, provider credentials, or encryption keys.

## Security boundaries

- Passwords use Werkzeug password hashing.
- Session cookies hold a random opaque token; only a SHA-256 token hash is stored in SQLite.
- Session records can be revoked on logout or password reset.
- API authorization is enforced server-side with customer/Admin role checks.
- Public Store, Services, Documentation, and Blog APIs expose published records only.
- A normal production web/worker start refuses a missing database rather than silently recreating an empty one.
- Production API errors are controlled and do not return stack traces or configuration details.
- No payment, storage, email, AI, CRM, newsletter, analytics, or external workflow provider is connected.
- Public social/contact links are stored in persisted `site_settings`. The public footer reads only `/api/settings/social-links`; only Owner/Admin roles may edit `/api/admin/settings/social-links`.

## Workflow worker

Queued workflow executions are processed server-side only:

```bash
python backend/worker.py --once
python backend/worker.py --interval 5 --max-attempts 3
```

The worker uses SQLite write-lock claims, lock tokens, execution idempotency, stale-job recovery, bounded retries, and blocked-provider states. It must run separately from the WSGI web process. External actions remain blocked until a real provider implementation is selected and configured.

## Migrations

```bash
python backend/manage.py migrate
python backend/manage.py migration-status
```

Migrations are forward-only. Review and back up the database before applying production migrations. The migration runner records applied versions in `schema_migrations`, preserves existing application records, and does not delete application data as part of normal startup.

## Backup and restore testing

```bash
python backend/manage.py backup --destination backend/backups
python backend/manage.py restore-test backend/backups/nibrexo-YYYYMMDDTHHMMSSZ.db --target backend/restores/restore-test.db
```

The helper produces a local SQLite file and protects against restoring over the active configured database. Production requires encryption, off-server storage, retention, and restore drills through approved infrastructure. No automated off-server backup system is claimed.

## License key rotation

`LICENSE_ENCRYPTION_KEY` is required before active encrypted license display can be enabled in production. Licenses store a hash plus ciphertext and a key version. Do not rotate automatically. Add valid previous version keys server-side, re-encrypt existing ciphertext through a controlled future rotation process, verify recovery, then retire an old key only after all affected licenses have been migrated.
