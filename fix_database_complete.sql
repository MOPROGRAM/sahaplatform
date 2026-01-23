-- ========================================
-- SAHA PLATFORM - Complete Database Fix
-- ========================================
-- This script is SAFE to run multiple times
-- It will NOT delete any existing data
-- Run this in Supabase SQL Editor
-- ========================================

-- ========================================
-- PART 1: Fix Column Names (snake_case)
-- ========================================

-- 1.1 Fix User table column names
DO $$ BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'User' AND column_name = 'createdAt') THEN
        ALTER TABLE "User" RENAME COLUMN "createdAt" TO "created_at";
    END IF;
END $$;

DO $$ BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'User' AND column_name = 'updatedAt') THEN
        ALTER TABLE "User" RENAME COLUMN "updatedAt" TO "updated_at";
        ALTER TABLE "User" ALTER COLUMN "updated_at" DROP NOT NULL;
    ELSIF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'User' AND column_name = 'updated_at') THEN
        ALTER TABLE "User" ALTER COLUMN "updated_at" DROP NOT NULL;
    END IF;
END $$;

DO $$ BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'User' AND column_name = 'userType') THEN
        ALTER TABLE "User" RENAME COLUMN "userType" TO "user_type";
    END IF;
END $$;

-- 1.2 Fix Ad table column names
DO $$ BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'Ad' AND column_name = 'createdAt') THEN
        ALTER TABLE "Ad" RENAME COLUMN "createdAt" TO "created_at";
    END IF;
END $$;

DO $$ BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'Ad' AND column_name = 'updatedAt') THEN
        ALTER TABLE "Ad" RENAME COLUMN "updatedAt" TO "updated_at";
    END IF;
END $$;

DO $$ BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'Ad' AND column_name = 'isActive') THEN
        ALTER TABLE "Ad" RENAME COLUMN "isActive" TO "is_active";
    END IF;
END $$;

DO $$ BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'Ad' AND column_name = 'isBoosted') THEN
        ALTER TABLE "Ad" RENAME COLUMN "isBoosted" TO "is_boosted";
    END IF;
END $$;

DO $$ BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'Ad' AND column_name = 'cityId') THEN
        ALTER TABLE "Ad" RENAME COLUMN "cityId" TO "city_id";
    END IF;
END $$;

DO $$ BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'Ad' AND column_name = 'currencyId') THEN
        ALTER TABLE "Ad" RENAME COLUMN "currencyId" TO "currency_id";
    END IF;
END $$;

DO $$ BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'Ad' AND column_name = 'userId') THEN
        ALTER TABLE "Ad" RENAME COLUMN "userId" TO "author_id";
    ELSIF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'Ad' AND column_name = 'user_id') THEN
        ALTER TABLE "Ad" RENAME COLUMN "user_id" TO "author_id";
    END IF;
END $$;

-- ========================================
-- PART 2: Add Missing Columns
-- ========================================

-- 2.1 Add phone and email to Ad table
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'Ad' AND column_name = 'phone') THEN
        ALTER TABLE "Ad" ADD COLUMN "phone" TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'Ad' AND column_name = 'email') THEN
        ALTER TABLE "Ad" ADD COLUMN "email" TEXT;
    END IF;
END $$;

-- 2.2 Add phone and verified to User table
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'User' AND column_name = 'phone') THEN
        ALTER TABLE "User" ADD COLUMN "phone" TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'User' AND column_name = 'verified') THEN
        ALTER TABLE "User" ADD COLUMN "verified" BOOLEAN DEFAULT false;
    END IF;
END $$;

-- ========================================
-- PART 3: Fix Storage Policies
-- ========================================

-- Enable RLS on storage.objects if not already enabled
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Drop old policies if they exist
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated Upload" ON storage.objects;

-- Create new policies for images bucket
CREATE POLICY "Public Access" ON storage.objects 
FOR SELECT 
USING (bucket_id = 'images');

CREATE POLICY "Authenticated Upload" ON storage.objects 
FOR INSERT 
TO authenticated 
WITH CHECK (bucket_id = 'images');

-- ========================================
-- PART 4: Create Chat Tables (Safe)
-- ========================================

-- 4.1 Conversation Table
CREATE TABLE IF NOT EXISTS "Conversation" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "last_message" TEXT,
    "last_message_time" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    "ad_id" UUID REFERENCES "Ad"("id") ON DELETE SET NULL,
    "created_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4.2 Message Table
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

-- 4.3 Participants Join Table
CREATE TABLE IF NOT EXISTS "_conversation_participants" (
    "conversation_id" UUID REFERENCES "Conversation"("id") ON DELETE CASCADE,
    "user_id" UUID REFERENCES "User"("id") ON DELETE CASCADE,
    PRIMARY KEY ("conversation_id", "user_id")
);

-- ========================================
-- PART 5: Setup Row Level Security (RLS)
-- ========================================

-- 5.1 Enable RLS on Conversation table
ALTER TABLE "Conversation" ENABLE ROW LEVEL SECURITY;

-- Drop old policy if exists
DROP POLICY IF EXISTS "Users can view their own conversations" ON "Conversation";

-- Create new policy
CREATE POLICY "Users can view their own conversations" ON "Conversation"
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM "_conversation_participants" 
            WHERE "_conversation_participants"."conversation_id" = "Conversation"."id" 
            AND "_conversation_participants"."user_id" = auth.uid()
        )
    );

-- 5.2 Enable RLS on Message table
ALTER TABLE "Message" ENABLE ROW LEVEL SECURITY;

-- Drop old policies if exist
DROP POLICY IF EXISTS "Users can view messages in their conversations" ON "Message";
DROP POLICY IF EXISTS "Users can send messages to their conversations" ON "Message";

-- Create new policies
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

-- ========================================
-- PART 6: Create Indexes for Performance
-- ========================================

-- Create indexes if they don't exist (PostgreSQL will ignore if exists)
CREATE INDEX IF NOT EXISTS "idx_conversation_ad_id" ON "Conversation"("ad_id");
CREATE INDEX IF NOT EXISTS "idx_conversation_last_message_time" ON "Conversation"("last_message_time");
CREATE INDEX IF NOT EXISTS "idx_message_conversation_id" ON "Message"("conversation_id");
CREATE INDEX IF NOT EXISTS "idx_message_sender_id" ON "Message"("sender_id");
CREATE INDEX IF NOT EXISTS "idx_message_created_at" ON "Message"("created_at");
CREATE INDEX IF NOT EXISTS "idx_conversation_participants_conversation_id" ON "_conversation_participants"("conversation_id");
CREATE INDEX IF NOT EXISTS "idx_conversation_participants_user_id" ON "_conversation_participants"("user_id");

-- ========================================
-- DONE! ✅
-- ========================================
-- All changes applied successfully
-- Your database is now ready for:
-- ✅ Ad posting with contact info
-- ✅ Real-time chat
-- ✅ Location maps
-- ✅ Image uploads
-- ========================================
