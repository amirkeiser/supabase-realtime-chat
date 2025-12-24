-- Migration: Add RLS policies for message table
-- Purpose: Allow users to read/write messages in rooms they are members of

-- SELECT: Users can read messages in rooms they're members of
CREATE POLICY "Users can read messages in their rooms"
ON public.message
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.chat_room_member
    WHERE chat_room_member.chat_room_id = message.chat_room_id
    AND chat_room_member.member_id = auth.uid()
  )
);

-- INSERT: Users can send messages to rooms they're members of (as themselves)
CREATE POLICY "Users can send messages to their rooms"
ON public.message
FOR INSERT
TO authenticated
WITH CHECK (
  author_id = auth.uid()
  AND EXISTS (
    SELECT 1 FROM public.chat_room_member
    WHERE chat_room_member.chat_room_id = message.chat_room_id
    AND chat_room_member.member_id = auth.uid()
  )
);
