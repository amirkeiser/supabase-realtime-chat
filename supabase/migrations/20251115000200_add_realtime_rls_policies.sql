-- Migration: Add RLS policies for Supabase Realtime
-- Purpose: Allow users to subscribe to and broadcast messages in rooms they are members of
-- Affected tables: realtime.messages
-- Channel naming schema: room:${roomId}:messages

-- ============================================================================
-- RLS Policies for realtime.messages table
-- ============================================================================

-- Allow authenticated users to read messages from rooms they are members of
create policy "Users can read realtime messages for their rooms"
on realtime.messages
for select
to authenticated
using (
  topic like 'room:%:messages'
  and exists (
    select 1
    from public.chat_room_member
    where chat_room_member.member_id = (select auth.uid())
    and chat_room_member.chat_room_id = split_part(topic, ':', 2)::uuid
  )
);

-- Allow authenticated users to insert presence updates for rooms they are members of
create policy "Users can insert realtime messages for their rooms"
on realtime.messages
for insert
to authenticated
with check (
  topic like 'room:%:messages'
  and exists (
    select 1
    from public.chat_room_member
    where chat_room_member.member_id = (select auth.uid())
    and chat_room_member.chat_room_id = split_part(topic, ':', 2)::uuid
  )
);

-- Add index on chat_room_id for better RLS performance (if not already exists)
create index if not exists idx_chat_room_member_chat_room_id
on public.chat_room_member
using btree (chat_room_id);

