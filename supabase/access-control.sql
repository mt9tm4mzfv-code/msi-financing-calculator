-- MSI Financing Calculator — Access Control RLS
-- Run this in Supabase SQL Editor.
-- Expected app_users columns:
-- id uuid primary key references auth.users(id)
-- email text
-- name text
-- role text default 'sales_agent'
-- is_active boolean default true
-- expires_at timestamptz null
-- created_at timestamptz default now()

alter table public.app_users enable row level security;

-- Users may read their own profile.
drop policy if exists "Users can read own profile" on public.app_users;
create policy "Users can read own profile"
on public.app_users
for select
to authenticated
using (id = auth.uid());

-- Admins may read all profiles so the admin panel can show every user.
drop policy if exists "Admins can read all profiles" on public.app_users;
create policy "Admins can read all profiles"
on public.app_users
for select
to authenticated
using (
  exists (
    select 1
    from public.app_users admin_user
    where admin_user.id = auth.uid()
      and admin_user.role = 'admin'
  )
);

-- Admins may update user access status.
-- The admin check is evaluated against the admin's own app_users row.
-- Do not disable RLS to implement Give Access / Revoke Access.
drop policy if exists "Admins can update user access" on public.app_users;
create policy "Admins can update user access"
on public.app_users
for update
to authenticated
using (
  exists (
    select 1
    from public.app_users admin_user
    where admin_user.id = auth.uid()
      and admin_user.role = 'admin'
  )
)
with check (
  exists (
    select 1
    from public.app_users admin_user
    where admin_user.id = auth.uid()
      and admin_user.role = 'admin'
  )
);

-- INSERT/DELETE policies are intentionally not added here.
