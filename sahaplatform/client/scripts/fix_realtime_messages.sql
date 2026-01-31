
-- Ensure tables are in the publication for Realtime
BEGIN;
  -- Remove first to avoid errors if already there (or just add)
  -- Safer to just DROP and RE-ADD or use ALTER PUBLICATION ... ADD TABLE
  -- We'll try to add, if it fails it might be because it's already there, but we want to be sure.
  
  -- Enable replication on tables (required for Realtime)
  ALTER TABLE messages REPLICA IDENTITY FULL;
  ALTER TABLE conversations REPLICA IDENTITY FULL;
  ALTER TABLE conversation_participants REPLICA IDENTITY FULL;

  -- Add to publication
  ALTER PUBLICATION supabase_realtime ADD TABLE messages;
  ALTER PUBLICATION supabase_realtime ADD TABLE conversations;
  ALTER PUBLICATION supabase_realtime ADD TABLE conversation_participants;
COMMIT;

-- Optimize RLS for Messages to ensure Realtime works smoothly
-- We'll drop the existing SELECT policy and recreate it to be sure
DROP POLICY IF EXISTS "View messages" ON messages;

CREATE POLICY "View messages" ON messages
FOR SELECT USING (
    -- Direct participant check
    auth.uid() IN (
        SELECT user_id 
        FROM conversation_participants 
        WHERE conversation_id = messages.conversation_id
    )
);

-- Ensure authenticated users can view participants (needed for the subquery above to work efficiently? No, RLS inside RLS applies)
-- Actually, for the subquery `SELECT user_id FROM conversation_participants` to work, 
-- the user must be able to SELECT from conversation_participants.

DROP POLICY IF EXISTS "View participants" ON conversation_participants;
CREATE POLICY "View participants" ON conversation_participants
FOR SELECT USING (
    -- User can see rows where they are the user
    user_id = auth.uid() 
    OR 
    -- OR where they are in the same conversation
    conversation_id IN (
        SELECT conversation_id 
        FROM conversation_participants 
        WHERE user_id = auth.uid()
    )
);

-- Force schema cache reload
NOTIFY pgrst, 'reload schema';
