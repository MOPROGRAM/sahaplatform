const express = require('express');
const router = express.Router();
const conversationService = require('./conversation.service');
const authMiddleware = require('../../middleware/auth');

// Get user's conversations
router.get('/', authMiddleware, async (req, res) => {
    try {
        const userId = req.user.id;
        const conversations = await conversationService.getUserConversations(userId);
        res.json(conversations);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get conversation by ID with messages
router.get('/:id', authMiddleware, async (req, res) => {
    try {
        const conversationId = req.params.id;
        const userId = req.user.id;
        const conversation = await conversationService.getConversationWithMessages(conversationId, userId);
        res.json(conversation);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Create new conversation
router.post('/', authMiddleware, async (req, res) => {
    try {
        const { participants, adId } = req.body;
        const creatorId = req.user.id;
        const conversation = await conversationService.createConversation(participants, creatorId, adId);
        res.status(201).json(conversation);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Send message in conversation
router.post('/:id/messages', authMiddleware, async (req, res) => {
    try {
        const { content, messageType, fileUrl, fileName, fileSize } = req.body;
        const conversationId = req.params.id;
        const senderId = req.user.id;

        const message = await conversationService.sendMessage(
            conversationId,
            senderId,
            content,
            messageType,
            fileUrl,
            fileName,
            fileSize
        );
        res.status(201).json(message);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Mark messages as read
router.put('/:id/read', authMiddleware, async (req, res) => {
    try {
        const conversationId = req.params.id;
        const userId = req.user.id;
        await conversationService.markMessagesAsRead(conversationId, userId);
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;