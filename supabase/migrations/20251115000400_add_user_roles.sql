-- Migration: Add role-based access control
-- Purpose: Add user roles (user, admin) to enable role-based access
-- Affected tables: user_profile

-- Create user_role enum
create type user_role as enum ('user', 'admin');

-- Add role column to user_profile with default 'user'
alter table user_profile
add column role user_role not null default 'user';

-- Update the handle_new_user function to set role
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  -- Insert a new row into public.user_profile with the new user's id
  insert into public.user_profile (id, name, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'name', new.email),
    coalesce((new.raw_user_meta_data->>'role')::user_role, 'user')
  );
  return new;
end;
$$;

-- Create helper function to check if current user is admin
create or replace function public.is_admin()
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
begin
  return exists (
    select 1 
    from public.user_profile 
    where id = auth.uid() 
    and role = 'admin'
  );
end;
$$;

-- Add RLS policy for admin access to user_profile
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

-- Add comment for documentation
comment on column user_profile.role is 'User role: user (default) or admin';
comment on function public.is_admin() is 'Returns true if the current authenticated user is an admin';

