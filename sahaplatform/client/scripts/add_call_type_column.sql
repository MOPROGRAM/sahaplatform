
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'calls' AND column_name = 'call_type') THEN
        ALTER TABLE calls ADD COLUMN call_type TEXT DEFAULT 'video' CHECK (call_type IN ('video', 'audio'));
    END IF;
END $$;
