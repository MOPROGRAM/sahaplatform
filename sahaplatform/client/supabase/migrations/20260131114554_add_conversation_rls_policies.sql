-- Enable RLS for conversations, messages, and conversation_participants if not already enabled
ALTER TABLE IF EXISTS conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS conversation_participants ENABLE ROW LEVEL SECURITY;

-- Policy for conversations table
-- Allow authenticated users to SELECT conversations they are a participant in
DROP POLICY IF EXISTS "Authenticated users can view their conversations" ON conversations;
CREATE POLICY "Authenticated users can view their conversations"
  ON conversations FOR SELECT
  USING (
    auth.uid() IN (
      SELECT user_id
      FROM conversation_participants
      WHERE conversation_id = conversations.id
    )
  );

-- Allow authenticated users to INSERT new conversations
DROP POLICY IF EXISTS "Authenticated users can create conversations" ON conversations;
CREATE POLICY "Authenticated users can create conversations"
  ON conversations FOR INSERT
  WITH CHECK (true); -- Further checks are done in the application logic (e.g., create_new_conversation RPC)

-- Policy for conversation_participants table
-- Allow authenticated users to SELECT participants of conversations they are part of
DROP POLICY IF EXISTS "Authenticated users can view conversation participants" ON conversation_participants;
CREATE POLICY "Authenticated users can view conversation participants"
  ON conversation_participants FOR SELECT
  USING (
    auth.uid() IN (
      SELECT user_id
      FROM conversation_participants AS cp_inner
      WHERE cp_inner.conversation_id = conversation_participants.conversation_id
    )
  );

-- Allow authenticated users to INSERT participants (when creating new conversation or repairing)
DROP POLICY IF EXISTS "Authenticated users can add participants to their conversations" ON conversation_participants;
CREATE POLICY "Authenticated users can add participants to their conversations"
  ON conversation_participants FOR INSERT
  WITH CHECK (
    auth.uid() IN (
      SELECT user_id
      FROM conversation_participants AS cp_inner
      WHERE cp_inner.conversation_id = conversation_participants.conversation_id
    ) OR conversation_participants.user_id = auth.uid()
  );

-- Policy for messages table
-- Allow authenticated users to SELECT messages in conversations they are part of
DROP POLICY IF EXISTS "Authenticated users can view messages in their conversations" ON messages;
CREATE POLICY "Authenticated users can view messages in their conversations"
  ON messages FOR SELECT
  USING (
    auth.uid() IN (
      SELECT user_id
      FROM conversation_participants
      WHERE conversation_id = messages.conversation_id
    )
  );

-- Allow authenticated users to INSERT messages in conversations they are part of
DROP POLICY IF EXISTS "Authenticated users can send messages in their conversations" ON messages;
CREATE POLICY "Authenticated users can send messages in their conversations"
  ON messages FOR INSERT
  WITH CHECK (
    auth.uid() IN (
      SELECT user_id
      FROM conversation_participants
      WHERE conversation_id = messages.conversation_id
    ) AND messages.sender_id = auth.uid()
  );