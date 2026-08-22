-- Minimum server-side role foundation for Nibrexo.
-- Apply this in the Supabase SQL editor BEFORE the first real signup.
-- Roles are never accepted from the client.

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text,
  role text not null default 'customer' check (role in ('customer', 'owner', 'admin')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists profiles_single_owner_idx
  on public.profiles (role)
  where role = 'owner';

alter table public.profiles enable row level security;

drop policy if exists profiles_select_own on public.profiles;
create policy profiles_select_own
  on public.profiles
  for select
  to authenticated
  using (auth.uid() = id);

revoke insert, update, delete on public.profiles from anon, authenticated;
grant select on public.profiles to authenticated;

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

drop trigger if exists on_auth_user_created_profile on auth.users;
create trigger on_auth_user_created_profile
  after insert on auth.users
  for each row execute function public.handle_auth_user_profile();

drop trigger if exists on_auth_user_verified_profile on auth.users;
create trigger on_auth_user_verified_profile
  after update of email_confirmed_at on auth.users
  for each row execute function public.handle_auth_user_profile();

insert into public.profiles (id, email, role)
select id, email, 'customer'
from auth.users
on conflict (id) do nothing;

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
