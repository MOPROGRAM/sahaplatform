
-- Create message_edits table to store edit history
CREATE TABLE IF NOT EXISTS message_edits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    message_id UUID REFERENCES messages(id) ON DELETE CASCADE,
    old_content TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on message_edits
ALTER TABLE message_edits ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view edits for messages they are part of (sender or receiver)
-- This requires a join with messages and conversation_participants, which might be expensive.
-- For simplicity, let's allow participants of the conversation to view edits.
DROP POLICY IF EXISTS "Participants can view edit history" ON message_edits;
CREATE POLICY "Participants can view edit history" ON message_edits
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM messages m
            JOIN conversation_participants cp ON m.conversation_id = cp.conversation_id
            WHERE m.id = message_edits.message_id
            AND cp.user_id = auth.uid()
        )
    );

-- Update edit_message RPC to log history
CREATE OR REPLACE FUNCTION edit_message(
    p_message_id UUID,
    p_new_content TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_created_at TIMESTAMPTZ;
    v_sender_id UUID;
    v_old_content TEXT;
BEGIN
    SELECT created_at, sender_id, content INTO v_created_at, v_sender_id, v_old_content
    FROM messages WHERE id = p_message_id;

    -- Validation
    IF v_sender_id != auth.uid() THEN
        RAISE EXCEPTION 'Not authorized';
    END IF;

    IF NOW() - v_created_at > INTERVAL '60 minutes' THEN
        RAISE EXCEPTION 'Edit time window expired';
    END IF;

    -- Log old content to history
    INSERT INTO message_edits (message_id, old_content)
    VALUES (p_message_id, v_old_content);

    -- Update message
    UPDATE messages
    SET content = p_new_content,
        is_edited = TRUE,
        edited_at = NOW()
    WHERE id = p_message_id;

    RETURN TRUE;
END;
$$;
