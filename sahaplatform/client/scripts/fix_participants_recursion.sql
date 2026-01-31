-- 1. Helper function to get conversations for the current user (Bypassing RLS)
CREATE OR REPLACE FUNCTION get_auth_user_conversations()
RETURNS TABLE (conversation_id UUID)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    RETURN QUERY
    SELECT cp.conversation_id
    FROM conversation_participants cp
    WHERE cp.user_id = auth.uid();
END;
$$;

-- 2. Fix conversation_participants policies
ALTER TABLE conversation_participants ENABLE ROW LEVEL SECURITY;

-- Drop potentially recursive policies
DROP POLICY IF EXISTS "Authenticated users can view conversation participants" ON conversation_participants;
DROP POLICY IF EXISTS "Users can view conversation participants" ON conversation_participants;
DROP POLICY IF EXISTS "View participants" ON conversation_participants;
DROP POLICY IF EXISTS "Users can view their own participations" ON conversation_participants;
DROP POLICY IF EXISTS "p_select_participants" ON conversation_participants;

-- Safe Policy:
-- 1. User can see their own rows
-- 2. User can see rows for conversations they are part of (using the helper function)

CREATE POLICY "View conversation participants"
  ON conversation_participants FOR SELECT
  USING (
    user_id = auth.uid() 
    OR 
    conversation_id IN ( SELECT conversation_id FROM get_auth_user_conversations() )
  );

-- Insert Policy (allow users to add themselves or others if they are already in the conversation)
DROP POLICY IF EXISTS "Authenticated users can add participants to their conversations" ON conversation_participants;
CREATE POLICY "Insert conversation participants"
  ON conversation_participants FOR INSERT
  WITH CHECK (
    -- Can add self (joining)
    user_id = auth.uid() 
    OR 
    -- Can add others if I am already in the conversation
    conversation_id IN ( SELECT conversation_id FROM get_auth_user_conversations() )
  );

-- Force schema cache reload
NOTIFY pgrst, 'reload schema';
