
ALTER TABLE public.conversation_participants 
DROP CONSTRAINT IF EXISTS fk_user;

ALTER TABLE public.conversation_participants 
ADD CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE public.messages 
DROP CONSTRAINT IF EXISTS fk_sender;

ALTER TABLE public.messages 
ADD CONSTRAINT fk_sender FOREIGN KEY (sender_id) REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE public.messages 
DROP CONSTRAINT IF EXISTS fk_conversation;

ALTER TABLE public.messages 
ADD CONSTRAINT fk_conversation FOREIGN KEY (conversation_id) REFERENCES public.conversations(id) ON DELETE CASCADE;

NOTIFY pgrst, 'reload schema';
