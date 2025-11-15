-- Migration: Add trigger to broadcast new messages to realtime
-- Purpose: Automatically send message data to realtime channel when inserted
-- Affected tables: public.message (trigger)
-- Channel naming: room:${roomId}:messages

-- Create the trigger function that broadcasts new messages
create or replace function public.broadcast_new_message()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  author_name text;
  author_image_url text;
begin
  -- Get author information from user_profile
  select 
    public.user_profile.name,
    public.user_profile.image_url
  into 
    author_name,
    author_image_url
  from public.user_profile
  where public.user_profile.id = new.author_id;

  -- Broadcast to the room's realtime channel
  perform realtime.send(
    jsonb_build_object(
      'id', new.id,
      'text', new.text,
      'created_at', new.created_at,
      'author_id', new.author_id,
      'author_name', author_name,
      'author_image_url', author_image_url
    ),
    TG_OP,
    'room:' || new.chat_room_id::text || ':messages',
    true
  );

  return new;
end;
$$;

-- Create trigger on message table
create trigger on_message_created
  after insert on public.message
  for each row
  execute function public.broadcast_new_message();

