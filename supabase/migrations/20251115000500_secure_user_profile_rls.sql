-- Migration: Secure user_profile table with RLS policies
-- Purpose: Prevent users from escalating privileges or modifying other users' data
-- Affected tables: user_profile

-- Enable RLS on user_profile (if not already enabled)
alter table user_profile enable row level security;

-- Drop existing policy if it exists (from previous migration)
drop policy if exists "Admins can view all profiles" on user_profile;

-- SELECT policies
-- Users can view their own profile
create policy "Users can view own profile"
on user_profile
for select
to authenticated
using (auth.uid() = id);

-- Admins can view all profiles
create policy "Admins can view all profiles"
on user_profile
for select
to authenticated
using (
  exists (
    select 1 
    from user_profile 
    where id = auth.uid() 
    and role = 'admin'
  )
);

-- UPDATE policies
-- Users can update their own profile BUT NOT the role column
create policy "Users can update own profile except role"
on user_profile
for update
to authenticated
using (auth.uid() = id)
with check (
  auth.uid() = id 
  and role = (select role from user_profile where id = auth.uid()) -- role cannot change
);

-- Only admins can update user roles
create policy "Admins can update any profile"
on user_profile
for update
to authenticated
using (
  exists (
    select 1 
    from user_profile 
    where id = auth.uid() 
    and role = 'admin'
  )
)
with check (
  exists (
    select 1 
    from user_profile 
    where id = auth.uid() 
    and role = 'admin'
  )
);

-- INSERT policy
-- Users can only insert their own profile (handled by trigger, but adding for completeness)
create policy "Users can insert own profile"
on user_profile
for insert
to authenticated
with check (auth.uid() = id and role = 'user');

-- DELETE policy
-- No one can delete profiles (not even admins, for data integrity)
-- If deletion is needed, admins should use soft delete (add deleted_at column later)

-- Add comments for documentation
comment on policy "Users can view own profile" on user_profile is 
  'Users can read their own profile data';
comment on policy "Admins can view all profiles" on user_profile is 
  'Admins can read all user profiles';
comment on policy "Users can update own profile except role" on user_profile is 
  'Users can update their profile but cannot change their role';
comment on policy "Admins can update any profile" on user_profile is 
  'Admins can update any profile including roles';
comment on policy "Users can insert own profile" on user_profile is 
  'Users can only create their own profile with user role';

