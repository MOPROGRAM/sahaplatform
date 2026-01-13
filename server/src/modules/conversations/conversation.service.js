const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const getUserConversations = async (userId) => {
    return await prisma.conversation.findMany({
        where: {
            participants: {
                has: userId
            }
        },
        include: {
            ad: {
                select: { title: true, images: true }
            },
            messages: {
                take: 1,
                orderBy: { createdAt: 'desc' },
                include: {
                    sender: {
                        select: { name: true }
                    }
                }
            }
        },
        orderBy: { lastMessageTime: 'desc' }
    });
};

const getConversationWithMessages = async (conversationId, userId) => {
    // Check if user is participant
    const conversation = await prisma.conversation.findFirst({
        where: {
            id: conversationId,
            participants: {
                has: userId
            }
        },
        include: {
            ad: true,
            messages: {
                include: {
                    sender: {
                        select: { name: true, image: true }
                    }
                },
                orderBy: { createdAt: 'asc' }
            }
        }
    });

    if (!conversation) {
        throw new Error('Conversation not found or access denied');
    }

    return conversation;
};

const createConversation = async (participants, creatorId, adId = null) => {
    // Ensure creator is in participants
    if (!participants.includes(creatorId)) {
        participants.push(creatorId);
    }

    return await prisma.conversation.create({
        data: {
            participants,
            adId
        }
    });
};

const sendMessage = async (conversationId, senderId, content, messageType = 'text', fileUrl = null, fileName = null, fileSize = null) => {
    // Check if sender is participant
    const conversation = await prisma.conversation.findFirst({
        where: {
            id: conversationId,
            participants: {
                has: senderId
            }
        }
    });

    if (!conversation) {
        throw new Error('Conversation not found or access denied');
    }

    const message = await prisma.message.create({
        data: {
            content,
            messageType,
            fileUrl,
            fileName,
            fileSize,
            senderId,
            receiverId: conversation.participants.find(p => p !== senderId), // For now, assume 1-on-1
            conversationId
        },
        include: {
            sender: {
                select: { name: true, image: true }
            }
        }
    });

    // Update conversation last message
    await prisma.conversation.update({
        where: { id: conversationId },
        data: {
            lastMessage: content,
            lastMessageTime: new Date()
        }
    });

    return message;
};

const markMessagesAsRead = async (conversationId, userId) => {
    await prisma.message.updateMany({
        where: {
            conversationId,
            receiverId: userId,
            isRead: false
        },
        data: {
            isRead: true
        }
    });
};

module.exports = {
    getUserConversations,
    getConversationWithMessages,
    createConversation,
    sendMessage,
    markMessagesAsRead
};