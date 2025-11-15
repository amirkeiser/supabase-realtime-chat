-- Migration: Fix infinite recursion in user_profile RLS policies
-- Purpose: Use is_admin() function instead of subqueries to avoid recursion
-- Affected tables: user_profile

-- Drop all existing policies
drop policy if exists "Users can view own profile" on user_profile;
drop policy if exists "Admins can view all profiles" on user_profile;
drop policy if exists "Users can update own profile except role" on user_profile;
drop policy if exists "Admins can update any profile" on user_profile;
drop policy if exists "Users can insert own profile" on user_profile;

-- SELECT policies
create policy "Users can view own profile"
on user_profile
for select
to authenticated
using (auth.uid() = id);

create policy "Admins can view all profiles"
on user_profile
for select
to authenticated
using (is_admin());

-- UPDATE policies
-- Users can update their own profile, but we'll use a trigger to prevent role changes
create policy "Users can update own profile"
on user_profile
for update
to authenticated
using (auth.uid() = id)
with check (auth.uid() = id);

create policy "Admins can update any profile"
on user_profile
for update
to authenticated
using (is_admin())
with check (is_admin());

-- Add trigger to prevent non-admins from changing roles
create or replace function prevent_role_escalation()
returns trigger
language plpgsql
as $$
begin
  -- If role is being changed and user is not admin, block it
  if new.role is distinct from old.role then
    if not public.is_admin() then
      raise exception 'Only admins can change user roles';
    end if;
  end if;
  return new;
end;
$$;

create trigger enforce_role_changes
  before update on user_profile
  for each row
  execute function prevent_role_escalation();

-- INSERT policy
create policy "Users can insert own profile"
on user_profile
for insert
to authenticated
with check (auth.uid() = id and role = 'user');

