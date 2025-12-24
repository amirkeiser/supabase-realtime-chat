-- Migration: Fix handle_new_user function type reference
-- Purpose: Use fully qualified type name for user_role since search_path is empty
-- Affected functions: handle_new_user()

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
    coalesce((new.raw_user_meta_data->>'role')::public.user_role, 'user'::public.user_role)
  );
  return new;
end;
$$;
