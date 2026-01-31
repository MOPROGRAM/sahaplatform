-- 1. Fix Foreign Keys (As requested)
ALTER TABLE public.conversation_participants DROP CONSTRAINT IF EXISTS fk_user;
ALTER TABLE public.conversation_participants 
    ADD CONSTRAINT fk_user 
    FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE public.messages DROP CONSTRAINT IF EXISTS fk_sender;
ALTER TABLE public.messages 
    ADD CONSTRAINT fk_sender 
    FOREIGN KEY (sender_id) REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE public.messages DROP CONSTRAINT IF EXISTS fk_conversation;
ALTER TABLE public.messages 
    ADD CONSTRAINT fk_conversation 
    FOREIGN KEY (conversation_id) REFERENCES public.conversations(id) ON DELETE CASCADE;

-- 2. Ensure Multimedia Columns in messages
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'messages' AND column_name = 'file_url') THEN
        ALTER TABLE public.messages ADD COLUMN file_url TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'messages' AND column_name = 'file_type') THEN
        ALTER TABLE public.messages ADD COLUMN file_type TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'messages' AND column_name = 'duration') THEN
        ALTER TABLE public.messages ADD COLUMN duration INTEGER; -- Duration in seconds
    END IF;
END $$;

-- 3. Notify Schema Reload
NOTIFY pgrst, 'reload schema';
