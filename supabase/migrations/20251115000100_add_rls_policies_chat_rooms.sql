-- Migration: Add RLS policies for chat_room and chat_room_member tables
-- Purpose: Allow users to manage their own memberships and read public rooms
-- Affected tables: public.chat_room, public.chat_room_member

-- ============================================================================
-- RLS Policies for chat_room_member table
-- ============================================================================

-- Allow authenticated users to read their own membership rows
create policy "Users can read their own memberships"
on public.chat_room_member
for select
to authenticated
using ( (select auth.uid()) = member_id );

-- Allow authenticated users to add themselves to public chat rooms
create policy "Users can join public rooms"
on public.chat_room_member
for insert
to authenticated
with check (
  (select auth.uid()) = member_id
  and
  exists (
    select 1
    from public.chat_room
    where chat_room.id = chat_room_id
    and chat_room.is_public = true
  )
);

-- Allow authenticated users to remove themselves from rooms
create policy "Users can remove themselves from rooms"
on public.chat_room_member
for delete
to authenticated
using ( (select auth.uid()) = member_id );

-- ============================================================================
-- RLS Policies for chat_room table
-- ============================================================================

-- Allow authenticated users to read all public rooms
create policy "Users can read public rooms"
on public.chat_room
for select
to authenticated
using ( is_public = true );

-- Add index on member_id for better RLS performance
create index if not exists idx_chat_room_member_member_id
on public.chat_room_member
using btree (member_id);

-- Add index on is_public for better RLS performance
create index if not exists idx_chat_room_is_public
on public.chat_room
using btree (is_public);

