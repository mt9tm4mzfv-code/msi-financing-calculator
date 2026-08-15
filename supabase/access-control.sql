-- MSI Financing Calculator — Access Control RLS
-- Scope: login + Give Access / Revoke Access only.
-- Calculator logic is not changed.

-- RLS must remain enabled.
alter table public.app_users enable row level security;

-- Private helper prevents recursive RLS checks when determining whether
-- the signed-in user is an administrator.
create schema if not exists private;

create or replace function private.is_admin()
returns boolean
language sql
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.app_users
    where id = auth.uid()
      and role = 'admin'
  );
$$;

revoke all on function private.is_admin() from public;
grant usage on schema private to authenticated;
grant execute on function private.is_admin() to authenticated;

-- Users may read their own profile.
drop policy if exists "Users can read own profile" on public.app_users;
create policy "Users can read own profile"
on public.app_users
for select
to authenticated
using ((select auth.uid()) = id);

-- Admins may read all profiles.
drop policy if exists "Admins can read all profiles" on public.app_users;
create policy "Admins can read all profiles"
on public.app_users
for select
to authenticated
using ((select private.is_admin()));

-- Admins may give/revoke access by changing ONLY is_active.
drop policy if exists "Admins can update user access" on public.app_users;
create policy "Admins can update user access"
on public.app_users
for update
to authenticated
using ((select private.is_admin()))
with check ((select private.is_admin()));

-- Restrict authenticated users to the single column required for
-- Give Access / Revoke Access. This prevents the browser client from
-- changing role, email, id, or other profile fields through UPDATE.
revoke update on table public.app_users from authenticated;
grant update (is_active) on table public.app_users to authenticated;

-- No INSERT or DELETE policies are intentionally added.
