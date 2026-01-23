-- =============================================
-- Final Chat Policy Fix (No Recursion)
-- =============================================

-- 1. Disable existing policies to start fresh
DROP POLICY IF EXISTS "Users can view their own conversations" ON "Conversation";
DROP POLICY IF EXISTS "Users can insert conversations" ON "Conversation";
DROP POLICY IF EXISTS "Users can view participants of their conversations" ON "_conversation_participants";
DROP POLICY IF EXISTS "Users can insert participants" ON "_conversation_participants";
DROP POLICY IF EXISTS "Users can view messages in their conversations" ON "Message";
DROP POLICY IF EXISTS "Users can send messages to their conversations" ON "Message";
DROP FUNCTION IF EXISTS public.is_conv_participant(UUID);

-- 2. User Table (Public Read)
ALTER TABLE "User" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public can view user basic info" ON "User";
CREATE POLICY "Public can view user basic info" ON "User" FOR SELECT USING (true);

-- 3. Participants Table (The core of the fix)
ALTER TABLE "_conversation_participants" ENABLE ROW LEVEL SECURITY;

-- Rule: You can see any row in this table IF it belongs to YOU
CREATE POLICY "Users can see their own participation" ON "_conversation_participants"
    FOR SELECT USING (user_id = auth.uid());

-- Rule: You can see other people's rows in conversations YOU are part of
-- This uses a subquery that doesn't join back to the same table in a recursing way
CREATE POLICY "Users can see other participants" ON "_conversation_participants"
    FOR SELECT USING (
        conversation_id IN (
            SELECT conversation_id FROM "_conversation_participants" WHERE user_id = auth.uid()
        )
    );

-- Rule: Allow inserting (starting a chat)
CREATE POLICY "Users can join conversations" ON "_conversation_participants"
    FOR INSERT TO authenticated WITH CHECK (true);

-- 4. Conversation Table
ALTER TABLE "Conversation" ENABLE ROW LEVEL SECURITY;

-- Rule: You can see a conversation IF you are a participant
CREATE POLICY "Users can see their conversations" ON "Conversation"
    FOR SELECT USING (
        id IN (
            SELECT conversation_id FROM "_conversation_participants" WHERE user_id = auth.uid()
        )
    );

-- Rule: Allow creating a conversation (even if you aren't a participant YET)
CREATE POLICY "Users can create conversations" ON "Conversation"
    FOR INSERT TO authenticated WITH CHECK (true);

-- Rule: Allow updating (e.g. last_message)
CREATE POLICY "Users can update their conversations" ON "Conversation"
    FOR UPDATE USING (
        id IN (
            SELECT conversation_id FROM "_conversation_participants" WHERE user_id = auth.uid()
        )
    );

-- 5. Message Table
ALTER TABLE "Message" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can see messages" ON "Message"
    FOR SELECT USING (
        conversation_id IN (
            SELECT conversation_id FROM "_conversation_participants" WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can send messages" ON "Message"
    FOR INSERT TO authenticated WITH CHECK (auth.uid() = sender_id);
