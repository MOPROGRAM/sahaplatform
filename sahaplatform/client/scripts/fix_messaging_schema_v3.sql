
-- 1. Add missing message_type column
ALTER TABLE messages ADD COLUMN IF NOT EXISTS message_type TEXT DEFAULT 'text';

-- 2. Update get_conversation_participants to be SECURITY DEFINER (Bypass RLS)
CREATE OR REPLACE FUNCTION get_conversation_participants(p_conversation_id UUID)
RETURNS TABLE (user_id UUID)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    -- Security Check: Ensure the caller is a participant in the conversation
    IF NOT EXISTS (
        SELECT 1 FROM conversation_participants 
        WHERE conversation_id = p_conversation_id 
        AND user_id = auth.uid()
    ) THEN
        -- If not a participant, return nothing (or raise error)
        RETURN;
    END IF;

    -- Return all participants
    RETURN QUERY
    SELECT cp.user_id
    FROM conversation_participants cp
    WHERE cp.conversation_id = p_conversation_id;
END;
$$;

-- 3. Cleanup duplicate policies (optional but good practice)
DROP POLICY IF EXISTS "p_select_participants" ON conversation_participants;
-- Keep "Users can view their own participations" as it is safe for basic listing
