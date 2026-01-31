
-- Create calls table for WebRTC signaling
CREATE TABLE IF NOT EXISTS calls (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
    caller_id UUID REFERENCES users(id) ON DELETE CASCADE, -- Using users view or table
    receiver_id UUID REFERENCES users(id) ON DELETE CASCADE,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'ended', 'rejected')),
    offer JSONB,
    answer JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    ended_at TIMESTAMPTZ
);

-- RLS Policies for calls
ALTER TABLE calls ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Participants can view their calls" ON calls;
CREATE POLICY "Participants can view their calls" ON calls
FOR SELECT TO authenticated
USING (
    auth.uid() = caller_id OR 
    auth.uid() = receiver_id
);

DROP POLICY IF EXISTS "Participants can insert calls" ON calls;
CREATE POLICY "Participants can insert calls" ON calls
FOR INSERT TO authenticated
WITH CHECK (
    auth.uid() = caller_id
);

DROP POLICY IF EXISTS "Participants can update their calls" ON calls;
CREATE POLICY "Participants can update their calls" ON calls
FOR UPDATE TO authenticated
USING (
    auth.uid() = caller_id OR 
    auth.uid() = receiver_id
);

-- Notify for schema reload
NOTIFY pgrst, 'reload schema';
