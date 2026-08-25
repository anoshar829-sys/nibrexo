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

## Profile photo uploads

Apply `migrations/20260824_profile_photo_uploads.sql` after the bootstrap migration.

That migration:

- adds `display_name` and `avatar_path` on `public.profiles`
- drops the retired fixed-catalog `avatar_id` column when present
- grants authenticated users update rights only for identity fields
- creates the public `profile-photos` storage bucket (5 MB, jpeg/png/webp)
- scopes storage write/delete to `{auth.uid()}/...` object prefixes

The app stores only the storage object path (`{user-id}/profile.{ext}`) in
`profiles.avatar_path`. Image bytes live in Supabase Storage. Uploads run through
the authenticated server action with the anon key + user session (no service role).
