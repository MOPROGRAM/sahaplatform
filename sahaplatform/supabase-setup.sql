-- Saha Platform Database Setup for Supabase
-- Run this script in Supabase SQL Editor to create all tables

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Currencies table
CREATE TABLE IF NOT EXISTS "currencies" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "name_ar" TEXT NOT NULL,
    "name_en" TEXT NOT NULL,
    "code" TEXT NOT NULL UNIQUE,
    "symbol" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Countries table
CREATE TABLE IF NOT EXISTS "countries" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "name_ar" TEXT NOT NULL,
    "name_en" TEXT NOT NULL,
    "code" TEXT NOT NULL UNIQUE,
    "phone_code" TEXT NOT NULL,
    "currency_id" TEXT NOT NULL REFERENCES "currencies"("id"),
    "flag" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Cities table
CREATE TABLE IF NOT EXISTS "cities" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "name_ar" TEXT NOT NULL,
    "name_en" TEXT NOT NULL,
    "country_id" TEXT NOT NULL REFERENCES "countries"("id"),
    "latitude" REAL,
    "longitude" REAL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Users table
CREATE TABLE IF NOT EXISTS "users" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT,
    "email" TEXT NOT NULL UNIQUE,
    "email_verified" TIMESTAMP(3),
    "image" TEXT,
    "password" TEXT,
    "role" TEXT NOT NULL DEFAULT 'USER',
    "user_type" TEXT NOT NULL DEFAULT 'SEEKER',
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "phone" TEXT,
    "phone_verified" BOOLEAN NOT NULL DEFAULT false,
    "country_id" TEXT REFERENCES "countries"("id"),
    "city_id" TEXT REFERENCES "cities"("id"),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Accounts table
CREATE TABLE IF NOT EXISTS "accounts" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "user_id" TEXT NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "provider_account_id" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT
);

-- Sessions table
CREATE TABLE IF NOT EXISTS "sessions" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "session_token" TEXT NOT NULL UNIQUE,
    "user_id" TEXT NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
    "expires" TIMESTAMP(3) NOT NULL
);

-- Verification tokens table
CREATE TABLE IF NOT EXISTS "verification_tokens" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL UNIQUE,
    "expires" TIMESTAMP(3) NOT NULL
);

-- Ads table
CREATE TABLE IF NOT EXISTS "ads" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "title_ar" TEXT,
    "title_en" TEXT,
    "description" TEXT NOT NULL,
    "description_ar" TEXT,
    "description_en" TEXT,
    "price" REAL,
    "currency_id" TEXT NOT NULL DEFAULT 'sar' REFERENCES "currencies"("id"),
    "category" TEXT NOT NULL,
    "location" TEXT,
    "address" TEXT,
    "payment_method" TEXT,
    "city_id" TEXT REFERENCES "cities"("id"),
    "latitude" REAL,
    "longitude" REAL,
    "images" TEXT NOT NULL DEFAULT '[]',
    "video" TEXT,
    "is_boosted" BOOLEAN NOT NULL DEFAULT false,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "views" INTEGER NOT NULL DEFAULT 0,
    "author_id" TEXT NOT NULL REFERENCES "users"("id"),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Conversations table
CREATE TABLE IF NOT EXISTS "conversations" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "last_message" TEXT,
    "last_message_time" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ad_id" TEXT REFERENCES "ads"("id"),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Messages table
CREATE TABLE IF NOT EXISTS "messages" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "content" TEXT NOT NULL,
    "message_type" TEXT NOT NULL DEFAULT 'text',
    "file_url" TEXT,
    "file_name" TEXT,
    "file_size" INTEGER,
    "sender_id" TEXT NOT NULL REFERENCES "users"("id"),
    "receiver_id" TEXT NOT NULL REFERENCES "users"("id"),
    "conversation_id" TEXT NOT NULL REFERENCES "conversations"("id"),
    "is_read" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Subscriptions table
CREATE TABLE IF NOT EXISTS "subscriptions" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "user_id" TEXT NOT NULL REFERENCES "users"("id"),
    "plan_name" TEXT NOT NULL,
    "plan_type" TEXT NOT NULL,
    "price" REAL NOT NULL,
    "currency_id" TEXT NOT NULL DEFAULT 'sar' REFERENCES "currencies"("id"),
    "status" TEXT NOT NULL DEFAULT 'active',
    "start_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "end_date" TIMESTAMP(3) NOT NULL,
    "auto_renew" BOOLEAN NOT NULL DEFAULT true,
    "payment_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Payments table
CREATE TABLE IF NOT EXISTS "payments" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "user_id" TEXT NOT NULL REFERENCES "users"("id"),
    "amount" REAL NOT NULL,
    "currency_id" TEXT NOT NULL REFERENCES "currencies"("id"),
    "status" TEXT NOT NULL DEFAULT 'pending',
    "payment_method" TEXT NOT NULL,
    "transaction_id" TEXT NOT NULL UNIQUE,
    "description" TEXT NOT NULL,
    "subscription_id" TEXT REFERENCES "subscriptions"("id"),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Add unique constraints
ALTER TABLE "accounts" ADD CONSTRAINT "accounts_provider_provider_account_id_key" UNIQUE ("provider", "provider_account_id");
ALTER TABLE "verification_tokens" ADD CONSTRAINT "verification_tokens_identifier_token_key" UNIQUE ("identifier", "token");
ALTER TABLE "cities" ADD CONSTRAINT "cities_name_country_id_key" UNIQUE ("name", "country_id");

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS "accounts_user_id_idx" ON "accounts"("user_id");
CREATE INDEX IF NOT EXISTS "sessions_session_token_idx" ON "sessions"("session_token");
CREATE INDEX IF NOT EXISTS "sessions_user_id_idx" ON "sessions"("user_id");
CREATE INDEX IF NOT EXISTS "ads_author_id_idx" ON "ads"("author_id");
CREATE INDEX IF NOT EXISTS "ads_category_idx" ON "ads"("category");
CREATE INDEX IF NOT EXISTS "ads_city_id_idx" ON "ads"("city_id");
CREATE INDEX IF NOT EXISTS "messages_sender_id_idx" ON "messages"("sender_id");
CREATE INDEX IF NOT EXISTS "messages_receiver_id_idx" ON "messages"("receiver_id");
CREATE INDEX IF NOT EXISTS "messages_conversation_id_idx" ON "messages"("conversation_id");
CREATE INDEX IF NOT EXISTS "subscriptions_user_id_idx" ON "subscriptions"("user_id");
CREATE INDEX IF NOT EXISTS "payments_user_id_idx" ON "payments"("user_id");

-- Add conversation participants (many-to-many relationship)
CREATE TABLE IF NOT EXISTS "_conversation_participants" (
    "a" TEXT NOT NULL REFERENCES "conversations"("id") ON DELETE CASCADE,
    "b" TEXT NOT NULL REFERENCES "users"("id") ON DELETE CASCADE
);

-- Unique constraint for conversation participants
ALTER TABLE "_conversation_participants" ADD CONSTRAINT "_conversation_participants_ab_unique" UNIQUE ("a", "b");
ALTER TABLE "_conversation_participants" ADD CONSTRAINT "_conversation_participants_ba_unique" UNIQUE ("b", "a");

-- Indexes for conversation participants
CREATE INDEX IF NOT EXISTS "_conversation_participants_a_idx" ON "_conversation_participants"("a");
CREATE INDEX IF NOT EXISTS "_conversation_participants_b_idx" ON "_conversation_participants"("b");

-- Enable Row Level Security (RLS) for all tables
ALTER TABLE "currencies" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "countries" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "cities" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "users" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "accounts" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "sessions" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "verification_tokens" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ads" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "conversations" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "messages" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "subscriptions" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "payments" ENABLE ROW LEVEL SECURITY;

-- Basic RLS policies (allow read for authenticated users, full access for service role)
-- These are basic policies - you may need to adjust based on your requirements

-- Currencies: public read
CREATE POLICY "currencies_select" ON "currencies" FOR SELECT USING (true);

-- Countries: public read
CREATE POLICY "countries_select" ON "countries" FOR SELECT USING (true);

-- Cities: public read
CREATE POLICY "cities_select" ON "cities" FOR SELECT USING (true);

-- Users: authenticated users can read all, own profile full access
CREATE POLICY "users_select" ON "users" FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "users_insert" ON "users" FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "users_update" ON "users" FOR UPDATE USING (auth.uid() = id);

-- Accounts: service role only
CREATE POLICY "accounts_all" ON "accounts" USING (auth.role() = 'service_role');

-- Sessions: service role only
CREATE POLICY "sessions_all" ON "sessions" USING (auth.role() = 'service_role');

-- Verification tokens: service role only
CREATE POLICY "verification_tokens_all" ON "verification_tokens" USING (auth.role() = 'service_role');

-- Ads: public read access, authenticated users full access for own ads
CREATE POLICY "ads_select" ON "ads" FOR SELECT USING (true);
CREATE POLICY "ads_insert" ON "ads" FOR INSERT WITH CHECK (auth.uid() = author_id);
CREATE POLICY "ads_update" ON "ads" FOR UPDATE USING (auth.uid() = author_id);
CREATE POLICY "ads_delete" ON "ads" FOR DELETE USING (auth.uid() = author_id);

-- Conversations: participants can access
CREATE POLICY "conversations_select" ON "conversations" FOR SELECT USING (
    EXISTS (SELECT 1 FROM "_conversation_participants" WHERE "a" = conversations.id AND "b" = auth.uid())
);
CREATE POLICY "conversations_insert" ON "conversations" FOR INSERT WITH CHECK (true);
CREATE POLICY "conversations_update" ON "conversations" FOR UPDATE USING (
    EXISTS (SELECT 1 FROM "_conversation_participants" WHERE "a" = conversations.id AND "b" = auth.uid())
);

-- Messages: participants can access
CREATE POLICY "messages_select" ON "messages" FOR SELECT USING (
    sender_id = auth.uid() OR receiver_id = auth.uid()
);
CREATE POLICY "messages_insert" ON "messages" FOR INSERT WITH CHECK (sender_id = auth.uid());

-- Subscriptions: own subscriptions
CREATE POLICY "subscriptions_select" ON "subscriptions" FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "subscriptions_insert" ON "subscriptions" FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "subscriptions_update" ON "subscriptions" FOR UPDATE USING (auth.uid() = user_id);

-- Payments: own payments
CREATE POLICY "payments_select" ON "payments" FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "payments_insert" ON "payments" FOR INSERT WITH CHECK (auth.uid() = user_id);