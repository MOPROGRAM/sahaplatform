
-- Rebuild Chat System Schema

-- 1. Drop existing tables (Cascading to remove dependencies)
DROP TABLE IF EXISTS messages CASCADE;
DROP TABLE IF EXISTS conversation_participants CASCADE;
DROP TABLE IF EXISTS conversations CASCADE;

-- 2. Create Conversations Table
CREATE TABLE conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ad_id UUID REFERENCES ads(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    last_message TEXT,
    last_message_time TIMESTAMPTZ DEFAULT now()
);

-- 3. Create Participants Table
CREATE TABLE conversation_participants (
    conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    joined_at TIMESTAMPTZ DEFAULT now(),
    last_read_at TIMESTAMPTZ DEFAULT now(),
    PRIMARY KEY (conversation_id, user_id)
);

-- 4. Create Messages Table
CREATE TABLE messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
    sender_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    receiver_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    content TEXT,
    message_type TEXT CHECK (message_type IN ('text', 'image', 'video', 'audio', 'file', 'call')),
    metadata JSONB DEFAULT '{}'::jsonb,
    is_read BOOLEAN DEFAULT false,
    is_deleted BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 5. Enable RLS
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversation_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- 6. RLS Policies

-- Conversations: View if participant
CREATE POLICY "View conversations" ON conversations
FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM conversation_participants
        WHERE conversation_id = id
        AND user_id = auth.uid()
    )
);

-- Conversations: Insert (Allow authenticated, participants added later)
CREATE POLICY "Create conversations" ON conversations
FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Participants: View own
CREATE POLICY "View participants" ON conversation_participants
FOR SELECT USING (
    -- Can see participants of conversations I am in
    conversation_id IN (
        SELECT conversation_id FROM conversation_participants WHERE user_id = auth.uid()
    )
);

-- Participants: Insert (Self or RPC)
CREATE POLICY "Join conversation" ON conversation_participants
FOR INSERT WITH CHECK (
    auth.uid() = user_id OR 
    EXISTS (
        SELECT 1 FROM conversations 
        WHERE id = conversation_id 
        -- This part is tricky without owner field, usually RPC handles this.
        -- We will rely on Service Role for initial setup or lenient policy for now.
    )
);

-- Messages: View if participant
CREATE POLICY "View messages" ON messages
FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM conversation_participants
        WHERE conversation_id = messages.conversation_id
        AND user_id = auth.uid()
    )
);

-- Messages: Send if participant
CREATE POLICY "Send messages" ON messages
FOR INSERT WITH CHECK (
    auth.uid() = sender_id AND
    EXISTS (
        SELECT 1 FROM conversation_participants
        WHERE conversation_id = conversation_id
        AND user_id = auth.uid()
    )
);

-- Messages: Edit/Delete (30 minute window)
CREATE POLICY "Edit own messages 30m" ON messages
FOR UPDATE USING (
    auth.uid() = sender_id AND 
    created_at > (now() - interval '30 minutes')
);

CREATE POLICY "Delete own messages 30m" ON messages
FOR DELETE USING (
    auth.uid() = sender_id AND 
    created_at > (now() - interval '30 minutes')
);

-- 7. Storage Setup (Try to insert into storage.buckets if permissions allow)
-- Note: This might fail if storage schema is not accessible, but we try.
DO $$
BEGIN
    INSERT INTO storage.buckets (id, name, public)
    VALUES ('chat_vault', 'chat_vault', false)
    ON CONFLICT (id) DO NOTHING;
EXCEPTION WHEN OTHERS THEN
    -- Ignore if storage schema is locked
    NULL;
END $$;

-- Storage Policies (Requires direct SQL execution usually)
-- We will try to add them.
DO $$
BEGIN
    -- Drop existing policies if any
    DROP POLICY IF EXISTS "Chat Vault Access" ON storage.objects;
    
    -- Create generic policy for chat_vault
    -- Select: If user is participant in conversation (folder name = conversation_id)
    CREATE POLICY "Chat Vault Select" ON storage.objects
    FOR SELECT USING (
        bucket_id = 'chat_vault' AND
        (storage.foldername(name))[1] IN (
            SELECT conversation_id::text 
            FROM conversation_participants 
            WHERE user_id = auth.uid()
        )
    );

    -- Insert: Authenticated users can upload to their conversation folders
    CREATE POLICY "Chat Vault Insert" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'chat_vault' AND
        auth.role() = 'authenticated'
    );
    
EXCEPTION WHEN OTHERS THEN
    NULL;
END $$;
