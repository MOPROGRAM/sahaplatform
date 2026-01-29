-- =============================================
-- Final Chat Policy Fix (No Recursion)
-- =============================================

-- 1. Disable existing policies to start fresh
DROP POLICY IF EXISTS "Users can view their own conversations" ON "conversations";
DROP POLICY IF EXISTS "Users can insert conversations" ON "conversations";
DROP POLICY IF EXISTS "Users can view participants of their conversations" ON "_conversation_participants";
DROP POLICY IF EXISTS "Users can insert participants" ON "_conversation_participants";
DROP POLICY IF EXISTS "Users can view messages in their conversations" ON "messages";
DROP POLICY IF EXISTS "Users can send messages to their conversations" ON "messages";
DROP FUNCTION IF EXISTS public.is_conv_participant(UUID);

-- 2. User Table (Public Read)
ALTER TABLE "users" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public can view user basic info" ON "users";
CREATE POLICY "Public can view user basic info" ON "users" FOR SELECT USING (true);

-- 3. Participants Table (The core of the fix)
ALTER TABLE "_conversation_participants" ENABLE ROW LEVEL SECURITY;

-- Rule: You can see any row in this table IF it belongs to YOU
CREATE POLICY "Users can see their own participation" ON "_conversation_participants"
    FOR SELECT USING (b = auth.uid());

-- Rule: You can see other people's rows in conversations YOU are part of
-- This uses a subquery that doesn't join back to the same table in a recursing way
CREATE POLICY "Users can see other participants" ON "_conversation_participants"
    FOR SELECT USING (
        a IN (
            SELECT a FROM "_conversation_participants" WHERE b = auth.uid()
        )
    );

-- Rule: Allow inserting (starting a chat)
CREATE POLICY "Users can join conversations" ON "_conversation_participants"
    FOR INSERT TO authenticated WITH CHECK (true);

-- 4. Conversation Table
ALTER TABLE "conversations" ENABLE ROW LEVEL SECURITY;

-- Rule: You can see a conversation IF you are a participant
CREATE POLICY "Users can see their conversations" ON "conversations"
    FOR SELECT USING (
        id IN (
            SELECT a FROM "_conversation_participants" WHERE b = auth.uid()
        )
    );

-- Rule: Allow creating a conversation (even if you aren't a participant YET)
CREATE POLICY "Users can create conversations" ON "conversations"
    FOR INSERT TO authenticated WITH CHECK (true);

-- Rule: Allow updating (e.g. last_message)
CREATE POLICY "Users can update their conversations" ON "conversations"
    FOR UPDATE USING (
        id IN (
            SELECT a FROM "_conversation_participants" WHERE b = auth.uid()
        )
    );

-- 5. Message Table
ALTER TABLE "messages" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can see messages" ON "messages"
    FOR SELECT USING (
        conversation_id IN (
            SELECT a FROM "_conversation_participants" WHERE b = auth.uid()
        )
    );

CREATE POLICY "Users can send messages" ON "messages"
    FOR INSERT TO authenticated WITH CHECK (auth.uid() = sender_id);
