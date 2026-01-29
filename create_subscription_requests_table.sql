-- ========================================
-- Subscription Requests Table
-- ========================================
-- Run this in Supabase SQL Editor
-- ========================================

CREATE TABLE IF NOT EXISTS "subscription_requests" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "user_id" UUID REFERENCES "User"("id") ON DELETE SET NULL,
    "user_name" TEXT NOT NULL,
    "user_email" TEXT NOT NULL,
    "user_phone" TEXT,
    "package_name" TEXT NOT NULL,
    "package_price" TEXT NOT NULL,
    "message" TEXT,
    "status" TEXT DEFAULT 'pending', -- 'pending', 'contacted', 'completed', 'cancelled'
    "created_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE "subscription_requests" ENABLE ROW LEVEL SECURITY;

-- RLS Policies
DROP POLICY IF EXISTS "Users can view their own requests" ON "subscription_requests";
CREATE POLICY "Users can view their own requests" ON "subscription_requests"
    FOR SELECT 
    USING (auth.uid() = "user_id" OR "user_email" = auth.email());

DROP POLICY IF EXISTS "Anyone can create subscription requests" ON "subscription_requests";
CREATE POLICY "Anyone can create subscription requests" ON "subscription_requests"
    FOR INSERT 
    WITH CHECK (true);

-- Create index
CREATE INDEX IF NOT EXISTS "idx_subscription_requests_email" ON "subscription_requests"("user_email");
CREATE INDEX IF NOT EXISTS "idx_subscription_requests_status" ON "subscription_requests"("status");

-- ========================================
-- DONE! ✅
-- ========================================
