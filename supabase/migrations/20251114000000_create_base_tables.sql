-- Migration: Create base tables
-- Purpose: Create the core tables for the application
-- This must run before all other migrations

-- ============================================================================
-- user_profile table
-- ============================================================================
create table if not exists public.user_profile (
  id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamp with time zone not null default now(),
  name varchar not null,
  image_url varchar
);

-- ============================================================================
-- chat_room table
-- ============================================================================
create table if not exists public.chat_room (
  id uuid primary key default gen_random_uuid(),
  created_at timestamp with time zone not null default now(),
  name varchar not null,
  is_public boolean not null default false
);

-- ============================================================================
-- chat_room_member table
-- ============================================================================
create table if not exists public.chat_room_member (
  created_at timestamp with time zone not null default now(),
  member_id uuid not null references public.user_profile(id) on delete cascade,
  chat_room_id uuid not null references public.chat_room(id) on delete cascade,
  primary key (member_id, chat_room_id)
);

-- ============================================================================
-- message table
-- ============================================================================
create table if not exists public.message (
  id uuid primary key default gen_random_uuid(),
  created_at timestamp with time zone not null default now(),
  text text not null,
  chat_room_id uuid not null references public.chat_room(id) on delete cascade,
  author_id uuid not null references public.user_profile(id) on delete cascade
);

-- ============================================================================
-- Enable RLS on all tables
-- ============================================================================
alter table public.user_profile enable row level security;
alter table public.chat_room enable row level security;
alter table public.chat_room_member enable row level security;
alter table public.message enable row level security;

-- ============================================================================
-- Indexes for performance
-- ============================================================================
create index if not exists idx_message_chat_room_id on public.message(chat_room_id);
create index if not exists idx_message_author_id on public.message(author_id);
create index if not exists idx_message_created_at on public.message(created_at desc);
