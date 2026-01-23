-- ========================================
-- Fix Conversation RLS Policies
-- ========================================
-- This adds missing INSERT and UPDATE policies
-- Run this in Supabase SQL Editor
-- ========================================

-- 1. Add INSERT policy for Conversation
DROP POLICY IF EXISTS "Users can create conversations" ON "Conversation";
CREATE POLICY "Users can create conversations" ON "Conversation"
    FOR INSERT 
    WITH CHECK (true);  -- Any authenticated user can create a conversation

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

-- 3. Add INSERT policy for _conversation_participants
ALTER TABLE "_conversation_participants" ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can add participants" ON "_conversation_participants";
CREATE POLICY "Users can add participants" ON "_conversation_participants"
    FOR INSERT 
    WITH CHECK (true);  -- Allow adding participants when creating conversations

-- 4. Add SELECT policy for _conversation_participants
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

-- 5. Add UPDATE policy for Message (mark as read)
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

-- ========================================
-- DONE! ✅
-- ========================================
-- Conversation creation should now work!
-- ========================================
