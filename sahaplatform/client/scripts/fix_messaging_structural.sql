
-- Fix relationships linking to public.users and public.ads

-- 1. conversation_participants -> public.users
ALTER TABLE public.conversation_participants 
DROP CONSTRAINT IF EXISTS fk_user;

ALTER TABLE public.conversation_participants 
ADD CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;

-- 2. messages -> public.users
ALTER TABLE public.messages 
DROP CONSTRAINT IF EXISTS fk_sender;

ALTER TABLE public.messages 
ADD CONSTRAINT fk_sender FOREIGN KEY (sender_id) REFERENCES public.users(id) ON DELETE CASCADE;

-- 3. conversations -> public.ads
ALTER TABLE public.conversations 
DROP CONSTRAINT IF EXISTS fk_ad;

ALTER TABLE public.conversations 
ADD CONSTRAINT fk_ad FOREIGN KEY (ad_id) REFERENCES public.ads(id) ON DELETE CASCADE;

NOTIFY pgrst, 'reload schema';
