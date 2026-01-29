-- =============================================
-- Fix Ad Table Policies and Schema
-- =============================================

-- Enable RLS on Ad table
ALTER TABLE "Ad" ENABLE ROW LEVEL SECURITY;

-- 1. Anyone can view active ads
DROP POLICY IF EXISTS "Public can view active ads" ON "Ad";
CREATE POLICY "Public can view active ads" ON "Ad"
    FOR SELECT
    USING (is_active = true);

-- 2. Users can view their own ads (even if inactive)
DROP POLICY IF EXISTS "Users can view their own ads" ON "Ad";
CREATE POLICY "Users can view their own ads" ON "Ad"
    FOR SELECT
    USING (auth.uid() = author_id);

-- 3. Authenticated users can create ads
DROP POLICY IF EXISTS "Authenticated users can create ads" ON "Ad";
CREATE POLICY "Authenticated users can create ads" ON "Ad"
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = author_id);

-- 4. Users can update their own ads
DROP POLICY IF EXISTS "Users can update their own ads" ON "Ad";
CREATE POLICY "Users can update their own ads" ON "Ad"
    FOR UPDATE
    TO authenticated
    USING (auth.uid() = author_id)
    WITH CHECK (auth.uid() = author_id);

-- 5. Users can delete their own ads
DROP POLICY IF EXISTS "Users can delete their own ads" ON "Ad";
CREATE POLICY "Users can delete their own ads" ON "Ad"
    FOR DELETE
    TO authenticated
    USING (auth.uid() = author_id);

-- 6. Admins can do everything
DROP POLICY IF EXISTS "Admins have full access to ads" ON "Ad";
CREATE POLICY "Admins have full access to ads" ON "Ad"
    FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM "User"
            WHERE "User".id = auth.uid() 
            AND "User".role = 'ADMIN'
        )
    );

-- =============================================
-- Fix Cities and Currencies (Allow Public Read)
-- =============================================

ALTER TABLE "cities" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public can view cities" ON "cities";
CREATE POLICY "Public can view cities" ON "cities" FOR SELECT USING (true);

ALTER TABLE "currencies" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public can view currencies" ON "currencies";
CREATE POLICY "Public can view currencies" ON "currencies" FOR SELECT USING (true);
