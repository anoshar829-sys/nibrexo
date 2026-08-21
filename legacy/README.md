# Legacy reference (not deployed)

This directory holds the previous Flask/Python Vercel runtime and related backend code.

It is kept only as a historical reference. Vercel must not treat these files as the application:

- no root `requirements.txt`
- no root `.python-version`
- no root `/api/*.py` serverless entrypoint

The production application is the Next.js App Router at the repository root (`package.json`, `next.config.ts`, `app/`).
