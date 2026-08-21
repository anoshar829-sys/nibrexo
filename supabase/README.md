# Supabase

Phase 1 only establishes the connection foundation.

- Browser and server clients live in `lib/supabase/`.
- Credentials come from `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
- Application tables, RLS policies, auth flows, and Storage are not created in this phase.

`migrations/` is reserved for later schema work.
