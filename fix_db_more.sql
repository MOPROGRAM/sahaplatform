-- Add missing columns and fix schema inconsistencies
-- Run this in Supabase SQL Editor

-- 1. Add phone and email to Ad table if they don't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'Ad' AND column_name = 'phone') THEN
        ALTER TABLE "Ad" ADD COLUMN "phone" TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'Ad' AND column_name = 'email') THEN
        ALTER TABLE "Ad" ADD COLUMN "email" TEXT;
    END IF;
END $$;

-- 2. Ensure User table has phone and verified status
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'User' AND column_name = 'phone') THEN
        ALTER TABLE "User" ADD COLUMN "phone" TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'User' AND column_name = 'verified') THEN
        ALTER TABLE "User" ADD COLUMN "verified" BOOLEAN DEFAULT false;
    END IF;
END $$;

-- 3. Fix Storage Buckets (Make images bucket public)
-- Note: Supabase Storage configuration usually needs to be done via API or Dashboard,
-- but we can try to set the public flag if we have permissions.
-- INSERT INTO storage.buckets (id, name, public) 
-- VALUES ('images', 'images', true) 
-- ON CONFLICT (id) DO UPDATE SET public = true;

-- 4. Re-verify Storage Policies for public access to images
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
CREATE POLICY "Public Access" ON storage.objects 
FOR SELECT 
USING (bucket_id = 'images');

DROP POLICY IF EXISTS "Authenticated Upload" ON storage.objects;
CREATE POLICY "Authenticated Upload" ON storage.objects 
FOR INSERT 
TO authenticated 
WITH CHECK (bucket_id = 'images');

-- 6. Re-create or fix Conversation-related tables with correct column names
-- Using UUID for IDs to match Supabase Auth and latest schema expectations

-- Conversation Table
CREATE TABLE IF NOT EXISTS "Conversation" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "last_message" TEXT,
    "last_message_time" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    "ad_id" UUID REFERENCES "Ad"("id") ON DELETE SET NULL,
    "created_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Message Table
CREATE TABLE IF NOT EXISTS "Message" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "content" TEXT NOT NULL,
    "message_type" TEXT DEFAULT 'text',
    "sender_id" UUID REFERENCES "User"("id") ON DELETE CASCADE,
    "receiver_id" UUID REFERENCES "User"("id") ON DELETE CASCADE,
    "conversation_id" UUID REFERENCES "Conversation"("id") ON DELETE CASCADE,
    "is_read" BOOLEAN DEFAULT false,
    "created_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    "file_url" TEXT,
    "file_name" TEXT,
    "file_size" INTEGER
);

-- Participants Join Table
CREATE TABLE IF NOT EXISTS "_conversation_participants" (
    "conversation_id" UUID REFERENCES "Conversation"("id") ON DELETE CASCADE,
    "user_id" UUID REFERENCES "User"("id") ON DELETE CASCADE,
    PRIMARY KEY ("conversation_id", "user_id")
);

-- RLS for conversations
ALTER TABLE "Conversation" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own conversations" ON "Conversation"
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM "_conversation_participants" 
            WHERE "_conversation_participants"."conversation_id" = "Conversation"."id" 
            AND "_conversation_participants"."user_id" = auth.uid()
        )
    );

-- RLS for messages
ALTER TABLE "Message" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view messages in their conversations" ON "Message"
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM "_conversation_participants" 
            WHERE "_conversation_participants"."conversation_id" = "Message"."conversation_id" 
            AND "_conversation_participants"."user_id" = auth.uid()
        )
    );

CREATE POLICY "Users can send messages to their conversations" ON "Message"
    FOR INSERT WITH CHECK (
        auth.uid() = "sender_id" AND
        EXISTS (
            SELECT 1 FROM "_conversation_participants" 
            WHERE "_conversation_participants"."conversation_id" = "Message"."conversation_id" 
            AND "_conversation_participants"."user_id" = auth.uid()
        )
    );
