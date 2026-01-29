-- SQL Script to Align Database Schema with Codebase (Snake Case)
-- Run this script in the Supabase SQL Editor

-- 1. Rename Tables to snake_case
ALTER TABLE IF EXISTS "Ad" RENAME TO ads;
ALTER TABLE IF EXISTS "User" RENAME TO users;
ALTER TABLE IF EXISTS "Conversation" RENAME TO conversations;
ALTER TABLE IF EXISTS "Message" RENAME TO messages;
ALTER TABLE IF EXISTS "_conversation_participants" RENAME TO conversation_participants;

-- 2. Handle City/cities conflict and Rename
-- Rename existing 'cities' to 'cities_backup' to avoid conflict, then rename 'City' to 'cities'
-- We assume 'City' contains the active data used by the app recently.
DO $$
BEGIN
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'cities') THEN
        ALTER TABLE cities RENAME TO cities_backup;
    END IF;
END $$;

ALTER TABLE IF EXISTS "City" RENAME TO cities;

-- 3. Handle Currency/currencies conflict and Rename
DO $$
BEGIN
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'currencies') THEN
        ALTER TABLE currencies RENAME TO currencies_backup;
    END IF;
END $$;

ALTER TABLE IF EXISTS "Currency" RENAME TO currencies;

-- 4. Rename Columns in 'cities' to snake_case
-- Note: Check if columns exist before renaming to avoid errors if already renamed
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'cities' AND column_name = 'nameAr') THEN
        ALTER TABLE cities RENAME COLUMN "nameAr" TO name_ar;
    END IF;
    IF EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'cities' AND column_name = 'nameEn') THEN
        ALTER TABLE cities RENAME COLUMN "nameEn" TO name_en;
    END IF;
    IF EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'cities' AND column_name = 'countryId') THEN
        ALTER TABLE cities RENAME COLUMN "countryId" TO country_id;
    END IF;
    IF EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'cities' AND column_name = 'isActive') THEN
        ALTER TABLE cities RENAME COLUMN "isActive" TO is_active;
    END IF;
    IF EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'cities' AND column_name = 'createdAt') THEN
        ALTER TABLE cities RENAME COLUMN "createdAt" TO created_at;
    END IF;
    IF EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'cities' AND column_name = 'updatedAt') THEN
        ALTER TABLE cities RENAME COLUMN "updatedAt" TO updated_at;
    END IF;
END $$;

-- 5. Rename Columns in 'currencies' to snake_case
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'currencies' AND column_name = 'nameAr') THEN
        ALTER TABLE currencies RENAME COLUMN "nameAr" TO name_ar;
    END IF;
    IF EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'currencies' AND column_name = 'nameEn') THEN
        ALTER TABLE currencies RENAME COLUMN "nameEn" TO name_en;
    END IF;
    IF EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'currencies' AND column_name = 'isActive') THEN
        ALTER TABLE currencies RENAME COLUMN "isActive" TO is_active;
    END IF;
    IF EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'currencies' AND column_name = 'createdAt') THEN
        ALTER TABLE currencies RENAME COLUMN "createdAt" TO created_at;
    END IF;
    IF EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'currencies' AND column_name = 'updatedAt') THEN
        ALTER TABLE currencies RENAME COLUMN "updatedAt" TO updated_at;
    END IF;
END $$;

-- 6. Verify Foreign Keys (Optional but good practice)
-- Ensure 'ads' table references the new 'cities' and 'currencies' tables correctly.
-- Postgres usually handles table renaming automatically for FKs.
