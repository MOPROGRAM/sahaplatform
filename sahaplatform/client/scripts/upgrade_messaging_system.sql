-- 1. Add Soft Delete to Conversation Participants
ALTER TABLE conversation_participants 
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ DEFAULT NULL;

-- 2. Add Read Receipts and Edit Tracking to Messages
ALTER TABLE messages 
ADD COLUMN IF NOT EXISTS read_at TIMESTAMPTZ DEFAULT NULL,
ADD COLUMN IF NOT EXISTS is_edited BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS edited_at TIMESTAMPTZ DEFAULT NULL,
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ DEFAULT NULL;

-- 3. RPC to Get or Create Conversation (Prevents Duplicates)
CREATE OR REPLACE FUNCTION get_or_create_conversation(
    p_ad_id UUID,
    p_user_id UUID,
    p_other_user_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_conversation_id UUID;
    v_result JSONB;
BEGIN
    -- Check for existing conversation for this ad between these two users
    SELECT c.id INTO v_conversation_id
    FROM conversations c
    JOIN conversation_participants cp1 ON c.id = cp1.conversation_id
    JOIN conversation_participants cp2 ON c.id = cp2.conversation_id
    WHERE c.ad_id = p_ad_id
    AND cp1.user_id = p_user_id
    AND cp2.user_id = p_other_user_id
    LIMIT 1;

    -- If exists, restore if deleted and return
    IF v_conversation_id IS NOT NULL THEN
        -- Restore for current user if soft deleted
        UPDATE conversation_participants 
        SET deleted_at = NULL 
        WHERE conversation_id = v_conversation_id AND user_id = p_user_id;

        SELECT jsonb_build_object(
            'id', c.id,
            'is_new', false
        ) INTO v_result
        FROM conversations c WHERE c.id = v_conversation_id;
        
        RETURN v_result;
    END IF;

    -- If not exists, create new conversation
    INSERT INTO conversations (ad_id)
    VALUES (p_ad_id)
    RETURNING id INTO v_conversation_id;

    -- Add participants
    INSERT INTO conversation_participants (conversation_id, user_id)
    VALUES 
        (v_conversation_id, p_user_id),
        (v_conversation_id, p_other_user_id);

    SELECT jsonb_build_object(
        'id', v_conversation_id,
        'is_new', true
    ) INTO v_result;

    RETURN v_result;
END;
$$;

-- 4. RPC to Soft Delete Conversation
CREATE OR REPLACE FUNCTION soft_delete_conversation(
    p_conversation_id UUID
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    UPDATE conversation_participants
    SET deleted_at = NOW()
    WHERE conversation_id = p_conversation_id
    AND user_id = auth.uid();
END;
$$;

-- 5. RPC to Mark Messages as Read
CREATE OR REPLACE FUNCTION mark_messages_read(
    p_conversation_id UUID
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    UPDATE messages
    SET is_read = TRUE,
        read_at = NOW()
    WHERE conversation_id = p_conversation_id
    AND sender_id != auth.uid()
    AND is_read = FALSE;
END;
$$;

-- 6. RPC to Edit Message (Time Limited 60 mins)
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
BEGIN
    SELECT created_at, sender_id INTO v_created_at, v_sender_id
    FROM messages WHERE id = p_message_id;

    -- Validation
    IF v_sender_id != auth.uid() THEN
        RAISE EXCEPTION 'Not authorized';
    END IF;

    IF NOW() - v_created_at > INTERVAL '60 minutes' THEN
        RAISE EXCEPTION 'Edit time window expired';
    END IF;

    UPDATE messages
    SET content = p_new_content,
        is_edited = TRUE,
        edited_at = NOW()
    WHERE id = p_message_id;

    RETURN TRUE;
END;
$$;

-- 7. RPC to Delete Message (Time Limited 60 mins)
CREATE OR REPLACE FUNCTION delete_message(
    p_message_id UUID
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_created_at TIMESTAMPTZ;
    v_sender_id UUID;
BEGIN
    SELECT created_at, sender_id INTO v_created_at, v_sender_id
    FROM messages WHERE id = p_message_id;

    IF v_sender_id != auth.uid() THEN
        RAISE EXCEPTION 'Not authorized';
    END IF;

    IF NOW() - v_created_at > INTERVAL '60 minutes' THEN
        RAISE EXCEPTION 'Delete time window expired';
    END IF;

    -- Soft delete the message content
    UPDATE messages
    SET content = 'This message was deleted',
        deleted_at = NOW()
    WHERE id = p_message_id;

    RETURN TRUE;
END;
$$;
