
-- Fix Storage RLS
BEGIN;

-- Allow public read of chat_vault (or authenticated)
-- The user says "download file is html", which implies 403/404 redirection to index.html (SPA fallback)

-- Update storage policies
-- Drop existing if any
DROP POLICY IF EXISTS "Authenticated users can upload" ON storage.objects;
DROP POLICY IF EXISTS "Participants can view" ON storage.objects;
DROP POLICY IF EXISTS "Give me access" ON storage.objects;

-- Create policies
CREATE POLICY "Give me access" ON storage.objects
FOR SELECT USING (
    bucket_id = 'chat_vault' 
    AND auth.role() = 'authenticated'
);

CREATE POLICY "Authenticated users can upload" ON storage.objects
FOR INSERT WITH CHECK (
    bucket_id = 'chat_vault' 
    AND auth.role() = 'authenticated'
);

COMMIT;
