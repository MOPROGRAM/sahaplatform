
-- Ensure tables are in the publication for Realtime
BEGIN;
  -- Enable replication on tables (required for Realtime)
  ALTER TABLE messages REPLICA IDENTITY FULL;
  ALTER TABLE conversations REPLICA IDENTITY FULL;
  ALTER TABLE conversation_participants REPLICA IDENTITY FULL;

  -- Add to publication safely
  DO $$
  BEGIN
      IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'messages') THEN
          ALTER PUBLICATION supabase_realtime ADD TABLE messages;
      END IF;
      
      IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'conversations') THEN
          ALTER PUBLICATION supabase_realtime ADD TABLE conversations;
      END IF;
      
      IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'conversation_participants') THEN
          ALTER PUBLICATION supabase_realtime ADD TABLE conversation_participants;
      END IF;
  END
  $$;
COMMIT;

-- Optimize RLS for Messages to ensure Realtime works smoothly
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

DROP POLICY IF EXISTS "View participants" ON conversation_participants;
CREATE POLICY "View participants" ON conversation_participants
FOR SELECT USING (
    user_id = auth.uid() 
    OR 
    conversation_id IN (
        SELECT conversation_id 
        FROM conversation_participants 
        WHERE user_id = auth.uid()
    )
);

-- Force schema cache reload
NOTIFY pgrst, 'reload schema';
