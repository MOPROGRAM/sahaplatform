-- Fix RLS Infinite Recursion with Security Definer Helper

-- 0. Helper Function to break recursion
CREATE OR REPLACE FUNCTION is_participant_of(_conversation_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1
        FROM conversation_participants
        WHERE conversation_id = _conversation_id
        AND user_id = auth.uid()
    );
END;
$$;

-- 1. Fix conversation_participants
DROP POLICY IF EXISTS "View participants" ON conversation_participants;
CREATE POLICY "View participants" ON conversation_participants
FOR SELECT USING (
    is_participant_of(conversation_id)
);

-- 2. Fix conversations
DROP POLICY IF EXISTS "View conversations" ON conversations;
CREATE POLICY "View conversations" ON conversations
FOR SELECT USING (
    is_participant_of(id)
);

-- 3. Fix messages
DROP POLICY IF EXISTS "View messages" ON messages;
CREATE POLICY "View messages" ON messages
FOR SELECT USING (
    is_participant_of(conversation_id)
);

-- 4. Fix Insert Policy for messages
DROP POLICY IF EXISTS "Insert messages" ON messages;
CREATE POLICY "Insert messages" ON messages
FOR INSERT WITH CHECK (
    auth.uid() = sender_id AND
    is_participant_of(conversation_id)
);
