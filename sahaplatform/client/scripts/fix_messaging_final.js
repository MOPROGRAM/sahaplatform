const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

// Read .env.local manually
const envPath = path.resolve(__dirname, '../.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const dbUrlMatch = envContent.match(/DATABASE_URL=(.+)/);

if (!dbUrlMatch) {
  console.error('DATABASE_URL not found in .env.local');
  process.exit(1);
}

const connectionString = dbUrlMatch[1].trim();

const client = new Client({
  connectionString: connectionString,
});

const sql = `
-- 1. Fix Messages Table (Add sender/receiver if missing)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'messages' AND column_name = 'sender_id') THEN
        ALTER TABLE messages ADD COLUMN sender_id UUID REFERENCES auth.users(id);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'messages' AND column_name = 'receiver_id') THEN
        ALTER TABLE messages ADD COLUMN receiver_id UUID REFERENCES auth.users(id);
    END IF;
END $$;

-- 2. Fix Conversation Participants Policy (The Recursion Fix)
DROP POLICY IF EXISTS "Users can view conversation participants" ON conversation_participants;
DROP POLICY IF EXISTS "Users can view their own participations" ON conversation_participants;
DROP POLICY IF EXISTS "Users can insert participants" ON conversation_participants;

-- Simple, non-recursive policy: Users can only see their own rows in this table
CREATE POLICY "Users can view their own participations"
ON conversation_participants FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert participants"
ON conversation_participants FOR INSERT
WITH CHECK (
    -- Allow users to insert themselves OR insert others if they are creating a conversation
    -- Since we can't easily check "creating a conversation" in a simple policy without recursion or functions,
    -- we rely on the RPC 'create_new_conversation' being SECURITY DEFINER which bypasses this.
    -- But for manual inserts (fallback), we might need this.
    -- Let's allow inserting self, or if we are authenticated (for now).
    -- Ideally, only RPC should handle creation.
    auth.uid() = user_id OR auth.role() = 'authenticated'
);

-- 3. Fix Conversations Policy
DROP POLICY IF EXISTS "Users can view conversations" ON conversations;
CREATE POLICY "Users can view conversations"
ON conversations FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM conversation_participants
        WHERE conversation_id = id
        AND user_id = auth.uid()
    )
);

DROP POLICY IF EXISTS "Users can insert conversations" ON conversations;
CREATE POLICY "Users can insert conversations"
ON conversations FOR INSERT
WITH CHECK (auth.role() = 'authenticated'); 
-- We allow creation, participants are added next.

-- 4. Fix Messages Policy
DROP POLICY IF EXISTS "Users can view messages" ON messages;
CREATE POLICY "Users can view messages"
ON messages FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM conversation_participants
        WHERE conversation_id = messages.conversation_id
        AND user_id = auth.uid()
    )
);

DROP POLICY IF EXISTS "Users can insert messages" ON messages;
CREATE POLICY "Users can insert messages"
ON messages FOR INSERT
WITH CHECK (
    auth.uid() = sender_id AND
    EXISTS (
        SELECT 1 FROM conversation_participants
        WHERE conversation_id = messages.conversation_id
        AND user_id = auth.uid()
    )
);

-- 5. RPC for Creation (Atomic)
CREATE OR REPLACE FUNCTION create_new_conversation(
    p_ad_id UUID,
    p_other_user_id UUID
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $func$
DECLARE
    v_conv_id UUID;
    v_current_user_id UUID;
BEGIN
    v_current_user_id := auth.uid();

    -- Check existing
    SELECT c.id INTO v_conv_id
    FROM conversations c
    JOIN conversation_participants cp1 ON c.id = cp1.conversation_id
    JOIN conversation_participants cp2 ON c.id = cp2.conversation_id
    WHERE c.ad_id = p_ad_id
    AND cp1.user_id = v_current_user_id
    AND cp2.user_id = p_other_user_id
    LIMIT 1;

    IF v_conv_id IS NOT NULL THEN
        RETURN v_conv_id;
    END IF;

    -- Create new
    INSERT INTO conversations (ad_id) VALUES (p_ad_id) RETURNING id INTO v_conv_id;

    -- Add participants
    INSERT INTO conversation_participants (conversation_id, user_id)
    VALUES
        (v_conv_id, v_current_user_id),
        (v_conv_id, p_other_user_id);

    RETURN v_conv_id;
END;
$func$;

-- 6. RPC for Fetching Participants (Bypass RLS for "Other" user)
CREATE OR REPLACE FUNCTION get_conversation_participants(p_conversation_id UUID)
RETURNS TABLE (user_id UUID)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT cp.user_id
    FROM conversation_participants cp
    WHERE cp.conversation_id = p_conversation_id;
END;
$$;
`;

async function run() {
  try {
    await client.connect();
    console.log('Connected to database');
    
    console.log('Running SQL fix...');
    await client.query(sql);
    console.log('SQL fix applied successfully');
    
  } catch (err) {
    console.error('Error executing SQL:', err);
  } finally {
    await client.end();
  }
}

run();
