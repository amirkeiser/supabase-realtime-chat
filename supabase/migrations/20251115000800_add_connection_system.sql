-- Add connection system for matchmaking
-- Purpose: Enable users to send connection requests and establish connections for chatting
-- Tables: connection_requests, connections
-- Functions: create_connection, get_potential_matches
-- RLS: Restrict access to own requests and connections

-- ============================================================================
-- ENUMS
-- ============================================================================

-- Connection request status enum
create type connection_request_status as enum (
  'pending',
  'accepted',
  'declined'
);

-- ============================================================================
-- TABLES
-- ============================================================================

-- Connection requests table
-- Stores pending/responded connection requests between users
create table connection_requests (
  id uuid primary key default gen_random_uuid(),
  created_at timestamp with time zone not null default now(),
  sender_id uuid not null references user_profile(id) on delete cascade,
  receiver_id uuid not null references user_profile(id) on delete cascade,
  status connection_request_status not null default 'pending',
  responded_at timestamp with time zone,
  
  -- Prevent users from sending multiple requests to the same person
  constraint unique_sender_receiver unique (sender_id, receiver_id),
  -- Prevent users from sending requests to themselves
  constraint no_self_requests check (sender_id != receiver_id)
);

-- Index for faster lookups
create index idx_connection_requests_sender on connection_requests(sender_id);
create index idx_connection_requests_receiver on connection_requests(receiver_id);
create index idx_connection_requests_status on connection_requests(status);

-- Connections table
-- Stores accepted connections between users
-- User IDs are ordered (user1_id < user2_id) for consistency and to prevent duplicates
create table connections (
  id uuid primary key default gen_random_uuid(),
  created_at timestamp with time zone not null default now(),
  user1_id uuid not null references user_profile(id) on delete cascade,
  user2_id uuid not null references user_profile(id) on delete cascade,
  connection_request_id uuid not null references connection_requests(id) on delete cascade,
  chat_room_id uuid references chat_room(id) on delete set null,
  
  -- Ensure user1_id is always less than user2_id for consistency
  constraint user_id_order check (user1_id < user2_id),
  -- Ensure unique connections between users
  constraint unique_connection unique (user1_id, user2_id)
);

-- Indexes for faster lookups
create index idx_connections_user1 on connections(user1_id);
create index idx_connections_user2 on connections(user2_id);
create index idx_connections_chat_room on connections(chat_room_id);

-- Add connection_id to chat_room table
-- Links chat rooms to connections (nullable for backward compatibility with existing public rooms)
alter table chat_room
add column connection_id uuid references connections(id) on delete cascade;

create index idx_chat_room_connection on chat_room(connection_id);

-- ============================================================================
-- FUNCTIONS
-- ============================================================================

-- Helper function to check if two users are connected
create or replace function are_users_connected(user_id1 uuid, user_id2 uuid)
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1 from connections
    where (user1_id = least(user_id1, user_id2) and user2_id = greatest(user_id1, user_id2))
  );
$$;

-- Helper function to get connection between two users
create or replace function get_connection_between_users(user_id1 uuid, user_id2 uuid)
returns uuid
language sql
security definer
set search_path = public
as $$
  select id from connections
  where user1_id = least(user_id1, user_id2)
    and user2_id = greatest(user_id1, user_id2)
  limit 1;
$$;

-- Function to create a connection when request is accepted
-- This creates the connection record AND a private chat room
create or replace function create_connection(request_id uuid)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_sender_id uuid;
  v_receiver_id uuid;
  v_user1_id uuid;
  v_user2_id uuid;
  v_connection_id uuid;
  v_chat_room_id uuid;
  v_room_name text;
begin
  -- Get request details and verify it's pending
  select sender_id, receiver_id
  into v_sender_id, v_receiver_id
  from connection_requests
  where id = request_id
    and status = 'pending'
    and receiver_id = auth.uid();
  
  if not found then
    raise exception 'Connection request not found or not pending';
  end if;
  
  -- Order user IDs (lower ID goes to user1_id)
  v_user1_id := least(v_sender_id, v_receiver_id);
  v_user2_id := greatest(v_sender_id, v_receiver_id);
  
  -- Check if connection already exists
  if exists (
    select 1 from connections
    where user1_id = v_user1_id and user2_id = v_user2_id
  ) then
    raise exception 'Connection already exists';
  end if;
  
  -- Create chat room name (e.g., "Chat: Alice & Bob")
  select 'Connection Chat'
  into v_room_name;
  
  -- Create private chat room
  insert into chat_room (name, is_public)
  values (v_room_name, false)
  returning id into v_chat_room_id;
  
  -- Create connection
  insert into connections (user1_id, user2_id, connection_request_id, chat_room_id)
  values (v_user1_id, v_user2_id, request_id, v_chat_room_id)
  returning id into v_connection_id;
  
  -- Update chat_room with connection_id
  update chat_room
  set connection_id = v_connection_id
  where id = v_chat_room_id;
  
  -- Update request status
  update connection_requests
  set status = 'accepted',
      responded_at = now()
  where id = request_id;
  
  -- Add both users to the chat room
  insert into chat_room_member (member_id, chat_room_id)
  values 
    (v_sender_id, v_chat_room_id),
    (v_receiver_id, v_chat_room_id);
  
  return v_connection_id;
end;
$$;

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================

-- Enable RLS on new tables
alter table connection_requests enable row level security;
alter table connections enable row level security;

-- Connection Requests Policies

-- Users can view requests where they are sender or receiver
create policy "Users can view own connection requests"
on connection_requests for select
to authenticated
using (auth.uid() = sender_id or auth.uid() = receiver_id);

-- Users can send connection requests to approved users (not themselves)
create policy "Users can send connection requests"
on connection_requests for insert
to authenticated
with check (
  auth.uid() = sender_id
  and sender_id != receiver_id
  and exists (
    select 1 from user_profile
    where id = receiver_id
      and profile_status = 'approved'
  )
);

-- Only receivers can update requests (to accept/decline)
create policy "Receivers can update connection requests"
on connection_requests for update
to authenticated
using (auth.uid() = receiver_id)
with check (auth.uid() = receiver_id);

-- Users can delete their sent pending requests
create policy "Users can delete own pending requests"
on connection_requests for delete
to authenticated
using (auth.uid() = sender_id and status = 'pending');

-- Connections Policies

-- Users can view connections they are part of
create policy "Users can view own connections"
on connections for select
to authenticated
using (auth.uid() = user1_id or auth.uid() = user2_id);

-- Only the create_connection function can insert connections (security definer)
-- This ensures connections are created properly with chat rooms
create policy "System can create connections"
on connections for insert
to authenticated
with check (false); -- Block direct inserts, must use create_connection()

-- Users can delete their own connections (to "unmatch")
create policy "Users can delete own connections"
on connections for delete
to authenticated
using (auth.uid() = user1_id or auth.uid() = user2_id);

-- Update chat_room RLS policies to allow access for connected users

-- Users can view chat rooms they're members of OR connection-based rooms they're part of
drop policy if exists "Authenticated users can read public rooms" on chat_room;

create policy "Users can view accessible rooms"
on chat_room for select
to authenticated
using (
  is_public = true
  or exists (
    select 1 from chat_room_member
    where chat_room_member.chat_room_id = chat_room.id
      and chat_room_member.member_id = auth.uid()
  )
  or exists (
    select 1 from connections
    where connections.chat_room_id = chat_room.id
      and (connections.user1_id = auth.uid() or connections.user2_id = auth.uid())
  )
);

-- Update chat_room_member policies to allow system to add users to connection rooms
-- Keep existing policies and add one for connection-based rooms
create policy "System can add users to connection rooms"
on chat_room_member for insert
to authenticated
with check (
  exists (
    select 1 from connections
    where connections.chat_room_id = chat_room_member.chat_room_id
      and (connections.user1_id = member_id or connections.user2_id = member_id)
  )
);

