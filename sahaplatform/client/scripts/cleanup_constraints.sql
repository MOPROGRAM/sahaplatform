
-- Drop conflicting/duplicate constraints
-- 1. conversations -> ads
ALTER TABLE public.conversations DROP CONSTRAINT IF EXISTS conversations_ad_id_fkey;

-- 2. conversation_participants -> auth.users (old)
ALTER TABLE public.conversation_participants DROP CONSTRAINT IF EXISTS conversation_participants_user_id_fkey;

-- 3. messages -> conversations (duplicate)
ALTER TABLE public.messages DROP CONSTRAINT IF EXISTS messages_conversation_id_fkey;

-- 4. messages -> auth.users (old sender)
ALTER TABLE public.messages DROP CONSTRAINT IF EXISTS messages_sender_id_fkey;

-- 5. messages -> auth.users (old receiver)
ALTER TABLE public.messages DROP CONSTRAINT IF EXISTS messages_receiver_id_fkey;

-- 6. Add fk_receiver to public.users for consistency
ALTER TABLE public.messages 
DROP CONSTRAINT IF EXISTS fk_receiver;

ALTER TABLE public.messages 
ADD CONSTRAINT fk_receiver FOREIGN KEY (receiver_id) REFERENCES public.users(id) ON DELETE SET NULL;

-- Reload Schema
NOTIFY pgrst, 'reload schema';
