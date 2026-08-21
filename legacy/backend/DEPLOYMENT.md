# Nibrexo Vercel + Supabase Deployment

This document is a procedure, not evidence that production exists.

## Architecture

```text
Browser → Vercel static files and /api rewrite → Flask Function → Supabase PostgreSQL
```

Supabase is PostgreSQL only. Do not add a separate backend host or expose database credentials to browser code.

## Connection selection

Configure Vercel `NIBREXO_DATABASE_URL` with the Supabase transaction-pooler URL intended for temporary/serverless clients. Psycopg automatic prepared statements are disabled by the application.

Configure GitHub Secret `SUPABASE_DATABASE_URL` with a migration-capable direct or session-pooler URL. The migration workflow maps it to `NIBREXO_DATABASE_URL` only inside the job.

Never put either URL in source, frontend code, issue text, screenshots, or chat.

## Required Vercel environment

- `NIBREXO_ENV=production`
- `NIBREXO_DATABASE_URL`
- `FLASK_SECRET_KEY`
- `LICENSE_ENCRYPTION_KEY`
- `NIBREXO_COOKIE_SECURE=true`

`LICENSE_ENCRYPTION_KEY_VERSION` defaults safely to `fernet-v1`; previous keys, when configured, must be a valid server-side JSON map.

## Deployment order

1. Create the Supabase project and obtain the approved connection methods.
2. Configure the protected GitHub secret without printing it.
3. Review the exact commit/ref to migrate.
4. Manually dispatch `.github/workflows/migrate.yml` and enter `MIGRATE_PRODUCTION` exactly.
5. Confirm migration status lists `001_initial`, `002_forward_schema`, `003_site_settings`, and `004_login_rate_limits` as applied.
6. Provision the one Founder from an operator-controlled process after migrations:
   ```bash
   NIBREXO_ENV=production \
   NIBREXO_DATABASE_URL='managed-outside-source' \
   NIBREXO_FOUNDER_EMAIL='managed-outside-source' \
   NIBREXO_FOUNDER_NAME='managed-outside-source' \
   NIBREXO_FOUNDER_PASSWORD='managed-outside-source' \
   python backend/setup_admin.py --from-env --role owner
   ```
   Use secure environment/session injection rather than literal shell history in real operations.
7. Configure the required Vercel environment variables.
8. Deploy or promote the reviewed revision.
9. Verify static pages and confirm backend/source paths are not public.
10. Verify `/api/health`.
11. In a real top-level browser, verify login, the session cookie, `/api/auth/me`, role-specific dashboards, and logout.
12. Verify the rate-limit contract in a controlled non-customer test context.

## Vercel behavior

- `scripts/build_vercel_static.py` creates an allowlisted `public/` output.
- `/api/:path*` rewrites to `api/index.py`.
- `api/index.py` exports `app` and defaults to production, secure-cookie, API-only behavior.
- The function does not run migrations and does not serve static repository files.
- Dynamic API responses are not edge-cached.

## Fail-closed behavior

The function refuses to initialize when required production configuration is missing or invalid. It also refuses startup with pending migrations. Error responses must not contain database URLs, passwords, paths, or cryptographic keys.

## Deferred worker

No continuous worker, cron, or replacement worker is deployed in Phase 1. Existing workflow rows can queue but remain pending. This does not block authentication, customer accounts, Admin/CMS, or current commerce foundations.

## Live verification boundary

Do not mark deployment ready until both the live Supabase migration and the real Vercel-domain authentication flow have been verified. Local tests alone are insufficient.
