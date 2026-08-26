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

## Profile row resilience

Apply `migrations/20260826_profiles_row_resilience.sql` after the bootstrap migration
(and after the photo-upload migration when photos are in use).

That migration:

- backfills a `customer` profile for every `auth.users` row missing from `public.profiles`
  (`ON CONFLICT DO NOTHING` — existing rows and roles are never overwritten)
- promotes the earliest verified user to `owner` only when no owner exists
- replaces `handle_auth_user_profile()` so email verification also **inserts** a missing
  profile (server-assigned role only), then updates email / first-owner promotion
- re-binds the create/verify triggers on `auth.users`
- keeps client `INSERT`/`DELETE` revoked; roles remain non-client-controlled

### Recommended apply order

1. `20260822_profiles_owner_bootstrap.sql`
2. `20260824_profile_photo_uploads.sql`
3. `20260826_profiles_row_resilience.sql`
