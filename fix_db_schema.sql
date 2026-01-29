-- Rename columns in Supabase tables to match the code expectations
-- Run this in the Supabase SQL Editor

-- 1. Fix User table column names to snake_case
-- Rename createdAt to created_at
DO $$ BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'User' AND column_name = 'createdAt') THEN
        ALTER TABLE "User" RENAME COLUMN "createdAt" TO "created_at";
    END IF;
END $$;

-- Rename updatedAt to updated_at and make it nullable
DO $$ BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'User' AND column_name = 'updatedAt') THEN
        ALTER TABLE "User" RENAME COLUMN "updatedAt" TO "updated_at";
        ALTER TABLE "User" ALTER COLUMN "updated_at" DROP NOT NULL;
    ELSIF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'User' AND column_name = 'updated_at') THEN
        ALTER TABLE "User" ALTER COLUMN "updated_at" DROP NOT NULL;
    END IF;
END $$;

-- Rename userType to user_type
DO $$ BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'User' AND column_name = 'userType') THEN
        ALTER TABLE "User" RENAME COLUMN "userType" TO "user_type";
    END IF;
END $$;

-- 2. Fix Ad table column names to snake_case
-- Rename createdAt to created_at
DO $$ BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'Ad' AND column_name = 'createdAt') THEN
        ALTER TABLE "Ad" RENAME COLUMN "createdAt" TO "created_at";
    END IF;
END $$;

-- Rename updatedAt to updated_at
DO $$ BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'Ad' AND column_name = 'updatedAt') THEN
        ALTER TABLE "Ad" RENAME COLUMN "updatedAt" TO "updated_at";
    END IF;
END $$;

-- Rename isActive to is_active
DO $$ BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'Ad' AND column_name = 'isActive') THEN
        ALTER TABLE "Ad" RENAME COLUMN "isActive" TO "is_active";
    END IF;
END $$;

-- Rename isBoosted to is_boosted
DO $$ BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'Ad' AND column_name = 'isBoosted') THEN
        ALTER TABLE "Ad" RENAME COLUMN "isBoosted" TO "is_boosted";
    END IF;
END $$;

-- Rename cityId to city_id
DO $$ BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'Ad' AND column_name = 'cityId') THEN
        ALTER TABLE "Ad" RENAME COLUMN "cityId" TO "city_id";
    END IF;
END $$;

-- Rename currencyId to currency_id
DO $$ BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'Ad' AND column_name = 'currencyId') THEN
        ALTER TABLE "Ad" RENAME COLUMN "currencyId" TO "currency_id";
    END IF;
END $$;

-- 3. Change user reference column to author_id
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'Ad' AND column_name = 'userId') THEN
        ALTER TABLE "Ad" RENAME COLUMN "userId" TO "author_id";
    ELSIF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'Ad' AND column_name = 'user_id') THEN
        ALTER TABLE "Ad" RENAME COLUMN "user_id" TO "author_id";
    END IF;
END $$;

-- 4. Fix Storage Policies for images bucket
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
CREATE POLICY "Public Access" ON storage.objects 
FOR ALL 
USING (bucket_id = 'images')
WITH CHECK (bucket_id = 'images');
