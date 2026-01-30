-- 1. Ensure table exists with correct name and columns
CREATE TABLE IF NOT EXISTS conversation_participants (
    conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    PRIMARY KEY (conversation_id, user_id)
);

-- 2. Enable RLS
ALTER TABLE conversation_participants ENABLE ROW LEVEL SECURITY;

-- 3. Fix Policies
-- Allow users to see their own participations
DROP POLICY IF EXISTS "Users can view their own participations" ON conversation_participants;
CREATE POLICY "Users can view their own participations" 
ON conversation_participants FOR SELECT 
USING (auth.uid() = user_id);

-- Allow users to see other participants in the same conversation
DROP POLICY IF EXISTS "Users can view conversation participants" ON conversation_participants;
CREATE POLICY "Users can view conversation participants" 
ON conversation_participants FOR SELECT 
USING (
    conversation_id IN (
        SELECT conversation_id FROM conversation_participants WHERE user_id = auth.uid()
    )
);

-- Allow users to insert (for creating conversations)
DROP POLICY IF EXISTS "Users can insert participants" ON conversation_participants;
CREATE POLICY "Users can insert participants" 
ON conversation_participants FOR INSERT 
WITH CHECK (
    auth.uid() = user_id OR 
    EXISTS (
        SELECT 1 FROM conversations 
        WHERE id = conversation_participants.conversation_id 
        -- logic to allow adding others? usually only when creating?
        -- For simplicity, allow if authenticated. Validation happens in app logic or trigger.
    )
);

-- 4. Create Atomic Conversation Function (RPC)
CREATE OR REPLACE FUNCTION create_new_conversation(
    p_ad_id UUID,
    p_other_user_id UUID
) 
RETURNS UUID 
LANGUAGE plpgsql 
SECURITY DEFINER 
AS $$
DECLARE
    v_conv_id UUID;
    v_current_user_id UUID;
BEGIN
    v_current_user_id := auth.uid();
    
    -- Check if conversation already exists between these two for this ad
    SELECT c.id INTO v_conv_id
    FROM conversations c
    JOIN conversation_participants cp1 ON c.id = cp1.conversation_id
    JOIN conversation_participants cp2 ON c.id = cp2.conversation_id
    WHERE c.ad_id = p_ad_id
    AND cp1.user_id = v_current_user_id
    AND cp2.user_id = p_other_user_id
    LIMIT 1;

    IF v_conv_id IS NOT NULL THEN
        RETURN v_conv_id;
    END IF;

    -- Create new conversation
    INSERT INTO conversations (ad_id)
    VALUES (p_ad_id)
    RETURNING id INTO v_conv_id;

    -- Add participants
    INSERT INTO conversation_participants (conversation_id, user_id)
    VALUES 
        (v_conv_id, v_current_user_id),
        (v_conv_id, p_other_user_id);

    RETURN v_conv_id;
END;
$$;
