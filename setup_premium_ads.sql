-- ========================================
-- Premium Ads & Notification System
-- ========================================
-- Run this in Supabase SQL Editor
-- ========================================

-- 1. Create Premium Ad Requests table
CREATE TABLE IF NOT EXISTS "PremiumAdRequest" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "user_id" UUID REFERENCES "User"("id") ON DELETE CASCADE,
    "ad_id" UUID REFERENCES "Ad"("id") ON DELETE CASCADE,
    "plan_type" TEXT NOT NULL, -- 'basic', 'premium', 'featured'
    "duration_days" INTEGER NOT NULL DEFAULT 30,
    "price" DECIMAL(10,2) NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'approved', 'rejected', 'paid'
    "payment_method" TEXT, -- 'bank_transfer', 'credit_card', 'cash'
    "payment_proof" TEXT, -- URL to payment screenshot
    "admin_notes" TEXT,
    "created_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    "approved_at" TIMESTAMP WITH TIME ZONE,
    "expires_at" TIMESTAMP WITH TIME ZONE
);

-- 2. Create Notifications table
CREATE TABLE IF NOT EXISTS "Notification" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "user_id" UUID REFERENCES "User"("id") ON DELETE CASCADE,
    "type" TEXT NOT NULL, -- 'premium_request', 'message', 'ad_approved', etc.
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "link" TEXT,
    "is_read" BOOLEAN DEFAULT false,
    "created_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Create Admin Settings table
CREATE TABLE IF NOT EXISTS "AdminSettings" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "key" TEXT UNIQUE NOT NULL,
    "value" TEXT NOT NULL,
    "description" TEXT,
    "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Insert default admin settings
INSERT INTO "AdminSettings" ("key", "value", "description") VALUES
('contact_email', 'motwasel@yahoo.com', 'Admin contact email'),
('contact_phone', '+966582003887', 'Admin contact phone'),
('contact_whatsapp', '+966582003887', 'Admin WhatsApp number'),
('premium_basic_price', '100', 'Basic premium ad price (SAR)'),
('premium_featured_price', '250', 'Featured premium ad price (SAR)'),
('premium_vip_price', '500', 'VIP premium ad price (SAR)')
ON CONFLICT ("key") DO UPDATE SET "value" = EXCLUDED."value";

-- 5. Enable RLS
ALTER TABLE "PremiumAdRequest" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Notification" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "AdminSettings" ENABLE ROW LEVEL SECURITY;

-- 6. RLS Policies for PremiumAdRequest
DROP POLICY IF EXISTS "Users can view their own premium requests" ON "PremiumAdRequest";
CREATE POLICY "Users can view their own premium requests" ON "PremiumAdRequest"
    FOR SELECT 
    USING (auth.uid() = "user_id");

DROP POLICY IF EXISTS "Users can create premium requests" ON "PremiumAdRequest";
CREATE POLICY "Users can create premium requests" ON "PremiumAdRequest"
    FOR INSERT 
    WITH CHECK (auth.uid() = "user_id");

DROP POLICY IF EXISTS "Users can update their pending requests" ON "PremiumAdRequest";
CREATE POLICY "Users can update their pending requests" ON "PremiumAdRequest"
    FOR UPDATE 
    USING (auth.uid() = "user_id" AND "status" = 'pending');

-- 7. RLS Policies for Notification
DROP POLICY IF EXISTS "Users can view their own notifications" ON "Notification";
CREATE POLICY "Users can view their own notifications" ON "Notification"
    FOR SELECT 
    USING (auth.uid() = "user_id");

DROP POLICY IF EXISTS "Users can update their own notifications" ON "Notification";
CREATE POLICY "Users can update their own notifications" ON "Notification"
    FOR UPDATE 
    USING (auth.uid() = "user_id");

-- 8. RLS Policies for AdminSettings (public read)
DROP POLICY IF EXISTS "Anyone can view admin settings" ON "AdminSettings";
CREATE POLICY "Anyone can view admin settings" ON "AdminSettings"
    FOR SELECT 
    USING (true);

-- 9. Create indexes
CREATE INDEX IF NOT EXISTS "idx_premium_request_user_id" ON "PremiumAdRequest"("user_id");
CREATE INDEX IF NOT EXISTS "idx_premium_request_status" ON "PremiumAdRequest"("status");
CREATE INDEX IF NOT EXISTS "idx_notification_user_id" ON "Notification"("user_id");
CREATE INDEX IF NOT EXISTS "idx_notification_is_read" ON "Notification"("is_read");

-- 10. Create function to notify admin of new premium request
CREATE OR REPLACE FUNCTION notify_admin_premium_request()
RETURNS TRIGGER AS $$
BEGIN
    -- This would integrate with email/WhatsApp service
    -- For now, we'll just log it
    RAISE NOTICE 'New premium ad request: % for user %', NEW.id, NEW.user_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 11. Create trigger
DROP TRIGGER IF EXISTS on_premium_request_created ON "PremiumAdRequest";
CREATE TRIGGER on_premium_request_created
    AFTER INSERT ON "PremiumAdRequest"
    FOR EACH ROW
    EXECUTE FUNCTION notify_admin_premium_request();

-- ========================================
-- DONE! ✅
-- ========================================
-- Premium ads system is ready
-- Next: Implement email/WhatsApp integration
-- ========================================
