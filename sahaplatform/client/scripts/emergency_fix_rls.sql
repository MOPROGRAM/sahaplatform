-- Emergency RLS Fix: Permissive Access for Authenticated Users
-- CAUTION: This allows any authenticated user to read/write all chat data.
-- Use only for debugging/emergency fixes.

-- 1. Conversations
DROP POLICY IF EXISTS "View conversations" ON conversations;
DROP POLICY IF EXISTS "Create conversations" ON conversations;
DROP POLICY IF EXISTS "Permissive conversations select" ON conversations;
DROP POLICY IF EXISTS "Permissive conversations insert" ON conversations;
DROP POLICY IF EXISTS "Permissive conversations update" ON conversations;

CREATE POLICY "Permissive conversations select" ON conversations 
FOR SELECT TO authenticated USING (true);

CREATE POLICY "Permissive conversations insert" ON conversations 
FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Permissive conversations update" ON conversations 
FOR UPDATE TO authenticated USING (true);

-- 2. Participants
DROP POLICY IF EXISTS "View participants" ON conversation_participants;
DROP POLICY IF EXISTS "Join conversation" ON conversation_participants;
DROP POLICY IF EXISTS "Permissive participants select" ON conversation_participants;
DROP POLICY IF EXISTS "Permissive participants insert" ON conversation_participants;

CREATE POLICY "Permissive participants select" ON conversation_participants 
FOR SELECT TO authenticated USING (true);

CREATE POLICY "Permissive participants insert" ON conversation_participants 
FOR INSERT TO authenticated WITH CHECK (true);

-- 3. Messages
DROP POLICY IF EXISTS "View messages" ON messages;
DROP POLICY IF EXISTS "Send messages" ON messages;
DROP POLICY IF EXISTS "Insert messages" ON messages;
DROP POLICY IF EXISTS "Edit own messages 30m" ON messages;
DROP POLICY IF EXISTS "Delete own messages 30m" ON messages;
DROP POLICY IF EXISTS "Permissive messages select" ON messages;
DROP POLICY IF EXISTS "Permissive messages insert" ON messages;
DROP POLICY IF EXISTS "Permissive messages update" ON messages;

CREATE POLICY "Permissive messages select" ON messages 
FOR SELECT TO authenticated USING (true);

CREATE POLICY "Permissive messages insert" ON messages 
FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Permissive messages update" ON messages 
FOR UPDATE TO authenticated USING (true);
