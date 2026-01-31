
-- Fix Infinite Recursion in RLS Policies

-- 1. Create a helper function to get user's conversations securely
-- This function runs with SECURITY DEFINER to bypass RLS recursion
-- It returns all conversation_ids where the current user is a participant
CREATE OR REPLACE FUNCTION get_auth_user_conversations()
RETURNS TABLE (conversation_id UUID) 
LANGUAGE sql 
SECURITY DEFINER 
SET search_path = public
STABLE
AS $$
  SELECT conversation_id 
  FROM conversation_participants 
  WHERE user_id = auth.uid();
$$;

-- 2. Drop existing problematic policies
DROP POLICY IF EXISTS "View participants" ON conversation_participants;
DROP POLICY IF EXISTS "View messages" ON messages;
DROP POLICY IF EXISTS "View conversations" ON conversations;

-- 3. Recreate policies using the helper function

-- Conversation Participants: View if it's me OR if we share a conversation
CREATE POLICY "View participants" ON conversation_participants
FOR SELECT USING (
    user_id = auth.uid() 
    OR 
    conversation_id IN ( SELECT conversation_id FROM get_auth_user_conversations() )
);

-- Messages: View if I am in the conversation
CREATE POLICY "View messages" ON messages
FOR SELECT USING (
    conversation_id IN ( SELECT conversation_id FROM get_auth_user_conversations() )
);

-- Conversations: View if I am a participant
CREATE POLICY "View conversations" ON conversations
FOR SELECT USING (
    id IN ( SELECT conversation_id FROM get_auth_user_conversations() )
);

-- Calls: View if I am in the conversation (assuming calls table exists)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'calls') THEN
        DROP POLICY IF EXISTS "View calls" ON calls;
        CREATE POLICY "View calls" ON calls
        FOR SELECT USING (
            conversation_id IN ( SELECT conversation_id FROM get_auth_user_conversations() )
        );
    END IF;
END $$;

-- Force schema cache reload
NOTIFY pgrst, 'reload schema';
