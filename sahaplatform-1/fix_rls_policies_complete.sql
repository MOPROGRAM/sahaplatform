-- ========================================
-- FINAL COMPLETE DATABASE SETUP
-- ========================================
-- Run this AFTER fix_database_safe.sql
-- This adds all missing RLS policies
-- ========================================

-- 1. Add INSERT policy for Conversation
DROP POLICY IF EXISTS "Users can create conversations" ON "Conversation";
CREATE POLICY "Users can create conversations" ON "Conversation"
    FOR INSERT 
    WITH CHECK (true);

-- 2. Add UPDATE policy for Conversation  
DROP POLICY IF EXISTS "Users can update their conversations" ON "Conversation";
CREATE POLICY "Users can update their conversations" ON "Conversation"
    FOR UPDATE 
    USING (
        EXISTS (
            SELECT 1 FROM "_conversation_participants" 
            WHERE "_conversation_participants"."conversation_id" = "Conversation"."id" 
            AND "_conversation_participants"."user_id" = auth.uid()
        )
    );

-- 3. Enable RLS and add policies for _conversation_participants
ALTER TABLE "_conversation_participants" ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can add participants" ON "_conversation_participants";
CREATE POLICY "Users can add participants" ON "_conversation_participants"
    FOR INSERT 
    WITH CHECK (true);

DROP POLICY IF EXISTS "Users can view participants" ON "_conversation_participants";
CREATE POLICY "Users can view participants" ON "_conversation_participants"
    FOR SELECT 
    USING (
        "user_id" = auth.uid() OR
        EXISTS (
            SELECT 1 FROM "_conversation_participants" cp
            WHERE cp."conversation_id" = "_conversation_participants"."conversation_id"
            AND cp."user_id" = auth.uid()
        )
    );

-- 4. Add UPDATE policy for Message (mark as read)
DROP POLICY IF EXISTS "Users can update messages" ON "Message";
CREATE POLICY "Users can update messages" ON "Message"
    FOR UPDATE 
    USING (
        "receiver_id" = auth.uid() OR
        EXISTS (
            SELECT 1 FROM "_conversation_participants" 
            WHERE "_conversation_participants"."conversation_id" = "Message"."conversation_id" 
            AND "_conversation_participants"."user_id" = auth.uid()
        )
    );

-- 5. Add RLS policies for Ad table (if not exists)
ALTER TABLE "Ad" ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view active ads" ON "Ad";
CREATE POLICY "Anyone can view active ads" ON "Ad"
    FOR SELECT 
    USING ("is_active" = true);

DROP POLICY IF EXISTS "Users can create ads" ON "Ad";
CREATE POLICY "Users can create ads" ON "Ad"
    FOR INSERT 
    TO authenticated
    WITH CHECK (auth.uid() = "author_id");

DROP POLICY IF EXISTS "Users can update their own ads" ON "Ad";
CREATE POLICY "Users can update their own ads" ON "Ad"
    FOR UPDATE 
    USING (auth.uid() = "author_id");

DROP POLICY IF EXISTS "Users can delete their own ads" ON "Ad";
CREATE POLICY "Users can delete their own ads" ON "Ad"
    FOR DELETE 
    USING (auth.uid() = "author_id");

-- 6. Add RLS policies for User table
ALTER TABLE "User" ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view all profiles" ON "User";
CREATE POLICY "Users can view all profiles" ON "User"
    FOR SELECT 
    USING (true);

DROP POLICY IF EXISTS "Users can update their own profile" ON "User";
CREATE POLICY "Users can update their own profile" ON "User"
    FOR UPDATE 
    USING (auth.uid() = "id");

DROP POLICY IF EXISTS "Users can delete their own profile" ON "User";
CREATE POLICY "Users can delete their own profile" ON "User"
    FOR DELETE 
    USING (auth.uid() = "id");

-- ========================================
-- DONE! ✅
-- ========================================
-- All RLS policies are now in place
-- Your platform is ready for production!
-- ========================================
