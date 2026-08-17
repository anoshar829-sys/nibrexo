# Nibrexo

Nibrexo is a visual-first digital product platform with customer accounts, an Admin/CMS interface, commerce foundations, licensing, and server-side authorization.

## Architecture

Production target:

```text
Browser → Vercel static frontend → Flask Vercel Function → Supabase PostgreSQL
```

Vercel serves the existing HTML, CSS, JavaScript, and approved assets. Same-origin `/api/*` requests are rewritten to `api/index.py`, which exports the existing Flask application. Supabase supplies PostgreSQL only; browser code never connects directly to the database.

Local development and the fast regression suite continue to use SQLite.

## Local development

```bash
python -m pip install -r requirements.txt
python backend/manage.py migrate
python backend/setup_admin.py --interactive --role owner
python backend/app.py
```

`backend/requirements.txt` is the authoritative dependency list. Root `requirements.txt` delegates to it so Vercel and local development install the same versions.

## Production status

Phase 1 contains the Vercel entry point, dual SQLite/PostgreSQL database layer, PostgreSQL schema, migrations, database-backed login throttling, and a manual GitHub migration workflow. It has not been connected to Supabase or deployed to Vercel.

Do not treat local tests as live deployment verification. See:

- [`backend/README.md`](backend/README.md)
- [`backend/DEPLOYMENT.md`](backend/DEPLOYMENT.md)
- [`backend/OPERATIONS.md`](backend/OPERATIONS.md)
- [`SUPABASE_MIGRATION_AUDIT.md`](SUPABASE_MIGRATION_AUDIT.md)
