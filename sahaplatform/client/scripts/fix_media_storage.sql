
-- Ensure chat_vault bucket exists and is private (secure)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('chat_vault', 'chat_vault', false, 52428800, ARRAY['image/png', 'image/jpeg', 'image/gif', 'image/webp', 'video/mp4', 'video/webm', 'audio/webm', 'audio/mp3', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'])
ON CONFLICT (id) DO UPDATE SET 
    public = false,
    file_size_limit = 52428800,
    allowed_mime_types = ARRAY['image/png', 'image/jpeg', 'image/gif', 'image/webp', 'video/mp4', 'video/webm', 'audio/webm', 'audio/mp3', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];

-- Storage Policies for chat_vault

-- Policy: Authenticated users can upload files to their own conversation folders
-- We assume the path structure is: conversation_id/filename
-- We check if the user is a participant of the conversation_id
DROP POLICY IF EXISTS "Users can upload to their conversations" ON storage.objects;
CREATE POLICY "Users can upload to their conversations" ON storage.objects
FOR INSERT TO authenticated
WITH CHECK (
    bucket_id = 'chat_vault' AND
    (storage.foldername(name))[1] IN (
        SELECT conversation_id::text 
        FROM conversation_participants 
        WHERE user_id = auth.uid()
    )
);

-- Policy: Participants can view files in their conversations
DROP POLICY IF EXISTS "Participants can view files" ON storage.objects;
CREATE POLICY "Participants can view files" ON storage.objects
FOR SELECT TO authenticated
USING (
    bucket_id = 'chat_vault' AND
    (storage.foldername(name))[1] IN (
        SELECT conversation_id::text 
        FROM conversation_participants 
        WHERE user_id = auth.uid()
    )
);

-- Ensure messages table has multimedia columns
ALTER TABLE messages ADD COLUMN IF NOT EXISTS file_url TEXT;
ALTER TABLE messages ADD COLUMN IF NOT EXISTS file_path TEXT;
ALTER TABLE messages ADD COLUMN IF NOT EXISTS file_type TEXT;
ALTER TABLE messages ADD COLUMN IF NOT EXISTS file_size INTEGER;
ALTER TABLE messages ADD COLUMN IF NOT EXISTS duration INTEGER;
ALTER TABLE messages ADD COLUMN IF NOT EXISTS file_name TEXT;

-- Reload Schema
NOTIFY pgrst, 'reload schema';
