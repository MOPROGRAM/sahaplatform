-- Fix Foreign Keys and Reload Schema
-- 1. Fix Messages Foreign Key (point to public.users)
ALTER TABLE messages 
DROP CONSTRAINT IF EXISTS fk_sender;

ALTER TABLE messages 
ADD CONSTRAINT fk_sender 
FOREIGN KEY (sender_id) 
REFERENCES users(id) ON DELETE CASCADE;

-- 2. Fix Participants Foreign Key (point to public.users)
ALTER TABLE conversation_participants 
DROP CONSTRAINT IF EXISTS fk_user;

ALTER TABLE conversation_participants 
ADD CONSTRAINT fk_user 
FOREIGN KEY (user_id) 
REFERENCES users(id) ON DELETE CASCADE;

-- 3. Notify PostgREST to reload schema
NOTIFY pgrst, 'reload schema';
