-- Migration: Create trigger to auto-create user_profile on auth.users insert
-- Purpose: Automatically create a row in public.user_profile when a new user signs up
-- Affected tables: auth.users (trigger), public.user_profile (insert)

-- Create the trigger function that will insert into user_profile
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  -- Insert a new row into public.user_profile with the new user's id
  insert into public.user_profile (id, name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'name', new.email)
  );
  return new;
end;
$$;

-- Create the trigger on auth.users table
-- This trigger fires after a new user is inserted into auth.users
create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();

