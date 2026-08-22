# Supabase

Browser and server clients live in `lib/supabase/`.

Public environment variables only:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` (or `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`)

Do not put a service-role key in public env or browser code.

## Required before the first real signup

Apply `migrations/20260822_profiles_owner_bootstrap.sql` in the Supabase SQL editor.

That migration:

- creates `public.profiles`
- assigns `owner` only to the first verified account
- uses an advisory lock and a unique owner index against race conditions
- blocks clients from inserting or updating roles
