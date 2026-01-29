-- Add Reporting and Rating functionality
-- Run this in Supabase SQL Editor

-- 1. Create Ad Reports table
CREATE TABLE IF NOT EXISTS "ad_reports" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "ad_id" UUID NOT NULL REFERENCES "ads"("id") ON DELETE CASCADE,
    "reporter_id" UUID NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
    "reason" TEXT NOT NULL,
    "details" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "created_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Create User Ratings table
CREATE TABLE IF NOT EXISTS "user_ratings" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "seller_id" UUID NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
    "buyer_id" UUID NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
    "rating" INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    "comment" TEXT,
    "created_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE("seller_id", "buyer_id") -- One rating per buyer-seller pair
);

-- 3. Enable RLS
ALTER TABLE "ad_reports" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "user_ratings" ENABLE ROW LEVEL SECURITY;

-- 4. RLS Policies for ad_reports
-- Users can insert their own reports
CREATE POLICY "user_report_insert" ON "ad_reports" 
FOR INSERT WITH CHECK (auth.uid() = reporter_id);

-- Only admins (role = 'ADMIN') can see all reports
-- Note: Assuming role is in users table or JWT
CREATE POLICY "admin_report_select" ON "ad_reports" 
FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM users 
        WHERE id = auth.uid() AND role = 'ADMIN'
    )
);

-- 5. RLS Policies for user_ratings
-- Everyone can view ratings
CREATE POLICY "rating_select_public" ON "user_ratings" 
FOR SELECT USING (true);

-- Authenticated users can rate sellers
CREATE POLICY "rating_insert_own" ON "user_ratings" 
FOR INSERT WITH CHECK (auth.uid() = buyer_id);

-- Users can update their own ratings
CREATE POLICY "rating_update_own" ON "user_ratings" 
FOR UPDATE USING (auth.uid() = buyer_id);

-- 6. Add Rating columns to users table for quick access
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "avg_rating" REAL DEFAULT 0;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "ratings_count" INTEGER DEFAULT 0;

-- 7. Trigger to update user rating stats automatically
CREATE OR REPLACE FUNCTION update_user_rating_stats()
RETURNS TRIGGER AS $$
BEGIN
    IF (TG_OP = 'INSERT' OR TG_OP = 'UPDATE' OR TG_OP = 'DELETE') THEN
        UPDATE users
        SET 
            avg_rating = (SELECT COALESCE(AVG(rating), 0) FROM user_ratings WHERE seller_id = COALESCE(NEW.seller_id, OLD.seller_id)),
            ratings_count = (SELECT COUNT(*) FROM user_ratings WHERE seller_id = COALESCE(NEW.seller_id, OLD.seller_id))
        WHERE id = COALESCE(NEW.seller_id, OLD.seller_id);
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_user_rating_trigger
AFTER INSERT OR UPDATE OR DELETE ON user_ratings
FOR EACH ROW EXECUTE FUNCTION update_user_rating_stats();
