# Nibrexo Production Operations

This checklist targets Vercel + Supabase PostgreSQL. It does not claim that either service is currently connected.

## Runtime boundary

- Vercel hosts the static frontend and Flask Python Function.
- Supabase hosts PostgreSQL.
- There is no production Gunicorn process, PythonAnywhere/VPS backend, local SQLite volume, Redis, or secondary database.
- Vercel must not run database migrations during build or function startup.

## Pre-deployment gates

- Reviewed code is committed only after explicit approval.
- Supabase migration and runtime connection strings are stored only in their approved secret stores.
- Required Vercel variables pass `backend/config.py` validation.
- The manual migration workflow completes for the intended revision.
- Founder provisioning completes once and refuses duplicates.
- No pending migration remains before deployment promotion.

## Migration operations

The only project migration command is:

```bash
python backend/manage.py migrate
```

The GitHub workflow invokes it only after a manual dispatch and exact confirmation value. Production migration failures must leave the affected logical migration unrecorded. Never edit `schema_migrations` manually to conceal a failed migration.

## Health and authentication checks

After deployment:

1. Request `/api/health` and require HTTP 200 with database `ready`.
2. Load representative public static pages and assets.
3. Verify backend source, SQL, Markdown, and environment paths are unavailable.
4. Log in through the real Vercel domain.
5. Confirm the browser receives a host-only `Secure`, `HttpOnly`, `SameSite=Lax` cookie.
6. Confirm `/api/auth/me` returns the expected safe user.
7. Confirm the correct customer or Admin dashboard.
8. Log out and confirm `/api/auth/me` returns 401.

The old embedded-preview cookie result is not a substitute for this check.

## Login throttling

The database limiter allows five failed attempts per normalized-email/client-IP hash in 15 minutes. Subsequent requests return 429 until expiry or a successful login clears the state. Raw emails and IPs are not stored in `login_attempts`.

## Backup and recovery

`backend/backup.py` is a local SQLite development helper only and refuses PostgreSQL mode. Use approved Supabase/PostgreSQL backup, retention, and restore procedures. Verify restores in a separate environment before relying on them.

## Workflow execution

The existing worker business logic is unchanged and deferred. Do not run `backend/worker.py` as a persistent Vercel process. No cron or replacement was added. Active workflows may create queued execution rows that remain pending; current external provider adapters remain unconnected.

## Provider boundaries

Payment, Storage, Email, AI, CRM, Newsletter, Analytics, and external workflow actions remain not configured until separately selected, implemented, and verified. Checkout creates only a pending server-priced order; it does not fabricate payment or entitlement.

## Incident rules

- Revoke and rotate exposed database or cryptographic secrets through the owning platform.
- Do not print environment values while diagnosing readiness.
- Do not bypass pending migrations to restore availability.
- Do not provision a second Owner to work around an authentication issue.
- Roll back the Vercel deployment separately from database recovery; schema migrations are forward-only.
