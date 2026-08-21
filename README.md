# Nibrexo

Nibrexo is a visual-first digital product platform. This repository now uses a Next.js foundation so later work can add authentication, products, orders, licensing, downloads, customer accounts, and admin tools.

## Architecture

```text
Browser → Vercel / Next.js (App Router) → Supabase PostgreSQL + Auth
```

The previous Flask/Python serverless runtime is **not** used. It lives under `legacy/` as reference only and is not a Vercel entrypoint.

## Phase 1 — Foundation

This phase includes:

- Next.js App Router with TypeScript
- Homepage using the established Nibrexo visual language
- Reusable layout and homepage components
- Supabase client helpers (no business schema yet)
- `GET /api/health` — application health, no database dependency
- `GET /api/health/db` — separate Supabase connectivity check
- Security headers and environment-variable-based configuration

It does **not** include login, checkout, products, licensing, or admin features.

## Local development

```bash
cp .env.example .env.local
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Required environment placeholders (no secrets in source control):

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

Without those values the site and `/api/health` still run. `/api/health/db` returns `503` with `"database": "unconfigured"` until Supabase credentials are supplied locally.

## Scripts

```bash
npm install     # install dependencies
npm run dev     # development server
npm run build   # production build
npm start       # production server (after build)
```

## Verification

| Check | Expected |
|---|---|
| `GET /` | Homepage renders |
| `GET /api/health` | `{ "ok": true, "application": "nibrexo" }` |
| `GET /api/health/db` | `200` when Supabase is configured; `503` when it is not |

## Deployment

Deploy the Next.js app directly to Vercel. The project root has `package.json` and `next.config.ts` only — no `requirements.txt`, `.python-version`, or Python `/api` function.

Set `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` in the Vercel project environment.

## Visual reference reused

- Logo and brand marks in `assets/` (copied to `public/assets/`)
- Color tokens, type hierarchy, and layout language from `css/styles.css`
- Homepage copy and structural sections from `index.html`
