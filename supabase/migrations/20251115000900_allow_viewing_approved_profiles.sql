-- Allow users to view approved profiles for matchmaking
-- Purpose: Update RLS policy so users can see other approved users as potential matches
-- Previous behavior: Users could only view their own profile
-- New behavior: Users can view their own profile AND any approved profile

-- Drop the restrictive policy
drop policy if exists "Users can view own profile" on user_profile;

-- Recreate with expanded access
-- Users can view:
-- 1. Their own profile (any status)
-- 2. Any approved profile (for matchmaking)
create policy "Users can view own and approved profiles"
on user_profile
for select
to authenticated
using (
  auth.uid() = id 
  or profile_status = 'approved'
);

comment on policy "Users can view own and approved profiles" on user_profile is 
  'Users can view their own profile and any approved profiles for matchmaking';

