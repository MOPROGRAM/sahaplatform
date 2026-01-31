CREATE OR REPLACE FUNCTION restore_conversation(
    p_conversation_id UUID
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    UPDATE conversation_participants
    SET deleted_at = NULL
    WHERE conversation_id = p_conversation_id
    AND user_id = auth.uid();
END;
$$;
