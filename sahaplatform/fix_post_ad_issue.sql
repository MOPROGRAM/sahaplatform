-- ==========================================
-- SAHA PLATFORM - Post Ad Fixes
-- ==========================================

-- 1. Ensure Columns Exist
ALTER TABLE ads ADD COLUMN IF NOT EXISTS views INTEGER DEFAULT 0;
ALTER TABLE ads ADD COLUMN IF NOT EXISTS author_id UUID REFERENCES auth.users(id);
ALTER TABLE ads ADD COLUMN IF NOT EXISTS city_id UUID REFERENCES cities(id);

-- 2. Fix increment_ad_views function
-- Drop first to avoid overload ambiguity
DROP FUNCTION IF EXISTS increment_ad_views(UUID);
DROP FUNCTION IF EXISTS increment_ad_views(text);

CREATE OR REPLACE FUNCTION increment_ad_views(ad_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE ads
  SET views = COALESCE(views, 0) + 1
  WHERE id = ad_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Ensure RLS policies for ads
ALTER TABLE ads ENABLE ROW LEVEL SECURITY;

-- Allow insert if authenticated
DROP POLICY IF EXISTS "Users can create ads" ON ads;
CREATE POLICY "Users can create ads" ON ads
FOR INSERT TO authenticated
WITH CHECK (auth.uid() = author_id);

-- Allow update if owner
DROP POLICY IF EXISTS "Users can update own ads" ON ads;
CREATE POLICY "Users can update own ads" ON ads
FOR UPDATE TO authenticated
USING (auth.uid() = author_id)
WITH CHECK (auth.uid() = author_id);

-- Allow select for everyone (active ads)
DROP POLICY IF EXISTS "Public can view active ads" ON ads;
CREATE POLICY "Public can view active ads" ON ads
FOR SELECT
USING (is_active = true OR auth.uid() = author_id);

-- 4. Storage Policies
-- Ensure 'images' bucket exists (this usually requires superuser, so we assume it exists or use UI)
-- We focus on policies

DROP POLICY IF EXISTS "Public Access" ON storage.objects;
CREATE POLICY "Public Access" ON storage.objects 
FOR SELECT 
USING (bucket_id = 'images');

DROP POLICY IF EXISTS "Authenticated Upload" ON storage.objects;
CREATE POLICY "Authenticated Upload" ON storage.objects 
FOR INSERT 
TO authenticated 
WITH CHECK (bucket_id = 'images');

DROP POLICY IF EXISTS "Users can update own images" ON storage.objects;
CREATE POLICY "Users can update own images" ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'images' AND owner = auth.uid());

DROP POLICY IF EXISTS "Users can delete own images" ON storage.objects;
CREATE POLICY "Users can delete own images" ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'images' AND owner = auth.uid());
