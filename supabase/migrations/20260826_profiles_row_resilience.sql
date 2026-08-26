-- Profile row resilience: backfill missing profiles and harden auth triggers.
-- Apply after 20260822_profiles_owner_bootstrap.sql (and after 20260824_profile_photo_uploads.sql when using photos).
-- Idempotent: safe to re-run. Does not overwrite existing profile rows or roles.
-- Clients still cannot insert/update roles; inserts remain security-definer only.

-- ---------------------------------------------------------------------------
-- 1) Backfill: every auth user without a profiles row gets a customer row.
--    Existing profiles (including owner/admin) are left untouched.
-- ---------------------------------------------------------------------------
insert into public.profiles (id, email, role)
select u.id, u.email, 'customer'
from auth.users as u
where not exists (
  select 1 from public.profiles as p where p.id = u.id
)
on conflict (id) do nothing;

-- If the project still has no owner, promote the earliest verified user only.
-- Never demotes an existing owner; no-op when an owner already exists.
update public.profiles
set role = 'owner', updated_at = now()
where id = (
  select u.id
  from auth.users as u
  where u.email_confirmed_at is not null
  order by u.email_confirmed_at asc, u.created_at asc
  limit 1
)
and not exists (select 1 from public.profiles where role = 'owner');

-- ---------------------------------------------------------------------------
-- 2) Harden handle_auth_user_profile:
--    - INSERT: same owner/customer assignment as bootstrap
--    - UPDATE (email verified): ensure a profile row exists (insert if missing),
--      then update email / possible first-owner promotion without overwriting
--      an existing non-customer role
-- ---------------------------------------------------------------------------
create or replace function public.handle_auth_user_profile()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  assigned_role text := 'customer';
begin
  perform pg_advisory_xact_lock(87236401);

  if tg_op = 'INSERT' then
    if new.email_confirmed_at is not null
       and not exists (select 1 from public.profiles where role = 'owner') then
      assigned_role := 'owner';
    end if;

    begin
      insert into public.profiles (id, email, role)
      values (new.id, new.email, assigned_role);
    exception
      when unique_violation then
        insert into public.profiles (id, email, role)
        values (new.id, new.email, 'customer')
        on conflict (id) do nothing;
    end;

    return new;
  end if;

  if tg_op = 'UPDATE'
     and new.email_confirmed_at is not null
     and old.email_confirmed_at is null then
    -- Ensure a row exists for users who somehow lack one (pre-bootstrap, deleted row, etc.).
    if not exists (select 1 from public.profiles where id = new.id) then
      if not exists (select 1 from public.profiles where role = 'owner') then
        assigned_role := 'owner';
      else
        assigned_role := 'customer';
      end if;

      begin
        insert into public.profiles (id, email, role)
        values (new.id, new.email, assigned_role);
      exception
        when unique_violation then
          insert into public.profiles (id, email, role)
          values (new.id, new.email, 'customer')
          on conflict (id) do nothing;
      end;
    end if;

    update public.profiles
    set
      email = new.email,
      updated_at = now(),
      role = case
        when role = 'customer'
             and not exists (select 1 from public.profiles as existing where existing.role = 'owner')
        then 'owner'
        else role
      end
    where id = new.id;
  end if;

  return new;
end;
$$;

-- Re-bind triggers so they always call the current function definition.
drop trigger if exists on_auth_user_created_profile on auth.users;
create trigger on_auth_user_created_profile
  after insert on auth.users
  for each row execute function public.handle_auth_user_profile();

drop trigger if exists on_auth_user_verified_profile on auth.users;
create trigger on_auth_user_verified_profile
  after update of email_confirmed_at on auth.users
  for each row execute function public.handle_auth_user_profile();

-- Clients remain select-only for table-level DML (identity column updates granted elsewhere).
revoke insert, delete on public.profiles from anon, authenticated;
grant select on public.profiles to authenticated;
