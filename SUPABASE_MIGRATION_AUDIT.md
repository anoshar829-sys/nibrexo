# Supabase Migration Audit

## Phase 1 status

| Area | Code/local status | Live Supabase | Live Vercel |
|---|---|---|---|
| Dual database abstraction | Locally tested with SQLite and mocked Psycopg behavior | Not tested | Not tested |
| PostgreSQL initial schema | Static/code inspection only | Never applied | N/A |
| Migration order 001–004 | SQLite locally applied and repeated | Never applied | N/A |
| SQL placeholder/conflict translation | Unit tested | Not tested | Not tested |
| Opaque database sessions | SQLite API tests pass | Not tested | Browser not tested |
| Login rate limiting | SQLite API tests pass; PostgreSQL SQL generation tested | Not tested | Not tested |
| Vercel entry point/API-only behavior | Import/config tests pass | N/A | Not deployed |
| Founder provisioning | SQLite tests pass; PostgreSQL path is code-only | Not executed | N/A |

## PostgreSQL schema decisions

- Application IDs, timestamps, and JSON payloads remain `TEXT` to preserve existing API and Python behavior.
- Integer feature/internal-note flags remain integers.
- PostgreSQL omits SQLite `PRAGMA`, `sqlite_master`, `executescript`, and `COLLATE NOCASE` assumptions.
- `media` is created before tables with media foreign keys.
- Case-insensitive uniqueness for user and newsletter email uses unique indexes on `LOWER(email)`.
- `002_forward_schema` uses PostgreSQL metadata and additive columns instead of SQLite table rebuilding.

## Connection decisions

- Application variable: `NIBREXO_DATABASE_URL`
- Vercel target: Supabase transaction pooler
- Migration secret: `SUPABASE_DATABASE_URL`, mapped by GitHub Actions to `NIBREXO_DATABASE_URL`
- Psycopg automatic prepared statements: disabled
- Connection lifecycle: short-lived explicit operation contexts; no global database pool

## Required live evidence

Before production readiness can be claimed:

1. Run the migration workflow against the intended Supabase project.
2. Confirm all schema objects, constraints, indexes, and migration versions.
3. Provision one Founder against that database.
4. Deploy the reviewed revision to Vercel.
5. Verify `/api/health` and sensitive-path denial.
6. Verify registration/login, cookie persistence, `/api/auth/me`, authorization, logout, and password-reset revocation on the real domain.
7. Verify rate limiting and successful-login clearing against PostgreSQL.
8. Record results without exposing secrets or credentials.

Current conclusion: implementation is locally/code verified only and is not production ready.
