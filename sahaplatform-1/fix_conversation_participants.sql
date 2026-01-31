-- =============================================
-- Fix Conversation Participants Table
-- =============================================

-- إنشاء الجدول الوسيط للمحادثات والمشاركين
CREATE TABLE IF NOT EXISTS "_ConversationParticipants" (
    "A" TEXT NOT NULL REFERENCES "Conversation"(id) ON DELETE CASCADE,
    "B" TEXT NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
    PRIMARY KEY ("A", "B")
);

-- إنشاء الفهارس للسرعة
CREATE INDEX IF NOT EXISTS "ConversationParticipants_A_idx" ON "_ConversationParticipants"("A");
CREATE INDEX IF NOT EXISTS "ConversationParticipants_B_idx" ON "_ConversationParticipants"("B");

-- تمكين RLS (Row Level Security)
ALTER TABLE "_ConversationParticipants" ENABLE ROW LEVEL SECURITY;

-- سياسات الأمان
CREATE POLICY "Users can view conversation participants" 
    ON "_ConversationParticipants" 
    FOR SELECT 
    USING (
        "B" = auth.uid() 
        OR "A" IN (
            SELECT id FROM "Conversation" 
            WHERE id IN (
                SELECT "A" FROM "_ConversationParticipants" WHERE "B" = auth.uid()
            )
        )
    );

CREATE POLICY "Users can add participants to their conversations" 
    ON "_ConversationParticipants" 
    FOR INSERT 
    WITH CHECK (
        "B" = auth.uid() 
        OR EXISTS (
            SELECT 1 FROM "_ConversationParticipants" 
            WHERE "A" = "_ConversationParticipants"."A" AND "B" = auth.uid()
        )
    );

CREATE POLICY "Users can remove themselves from conversations" 
    ON "_ConversationParticipants" 
    FOR DELETE 
    USING ("B" = auth.uid());

-- إضافة عينة بيانات للتحقق
INSERT INTO "_ConversationParticipants" ("A", "B") 
SELECT c.id, c."userId" 
FROM "Conversation" c 
WHERE NOT EXISTS (
    SELECT 1 FROM "_ConversationParticipants" cp 
    WHERE cp."A" = c.id AND cp."B" = c."userId"
)
LIMIT 10;

-- التحقق من النتائج
SELECT 
    COUNT(*) as total_conversations,
    COUNT(DISTINCT "A") as unique_conversations,
    COUNT(DISTINCT "B") as unique_users
FROM "_ConversationParticipants";

\echo '✅ Conversation participants table fixed successfully!';