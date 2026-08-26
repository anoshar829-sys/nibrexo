-- Profile photo uploads: identity fields + storage.
-- Apply in the Supabase SQL editor after 20260822_profiles_owner_bootstrap.sql.
-- Roles remain server-assigned; clients may only update their own display name and photo path.

-- Identity columns used by the app (display_name may already exist from earlier bootstrap).
alter table public.profiles
  add column if not exists display_name text;

alter table public.profiles
  add column if not exists avatar_path text;

-- Fixed catalog avatars are retired; drop the old column when present.
alter table public.profiles
  drop column if exists avatar_id;

-- Authenticated users may update only non-role identity fields on their own row.
grant update (display_name, avatar_path, updated_at) on public.profiles to authenticated;

drop policy if exists profiles_update_own_identity on public.profiles;
create policy profiles_update_own_identity
  on public.profiles
  for update
  to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- Public-read profile photo bucket. Objects live under {auth.uid()}/...
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'profile-photos',
  'profile-photos',
  true,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists profile_photos_select_public on storage.objects;
create policy profile_photos_select_public
  on storage.objects
  for select
  to public
  using (bucket_id = 'profile-photos');

drop policy if exists profile_photos_insert_own on storage.objects;
create policy profile_photos_insert_own
  on storage.objects
  for insert
  to authenticated
  with check (
    bucket_id = 'profile-photos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists profile_photos_update_own on storage.objects;
create policy profile_photos_update_own
  on storage.objects
  for update
  to authenticated
  using (
    bucket_id = 'profile-photos'
    and (storage.foldername(name))[1] = auth.uid()::text
  )
  with check (
    bucket_id = 'profile-photos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists profile_photos_delete_own on storage.objects;
create policy profile_photos_delete_own
  on storage.objects
  for delete
  to authenticated
  using (
    bucket_id = 'profile-photos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
