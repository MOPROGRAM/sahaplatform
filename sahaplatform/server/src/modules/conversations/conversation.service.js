const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const getUserConversations = async (userId) => {
    return await prisma.conversation.findMany({
        where: {
            participants: {
                some: {
                    id: userId
                }
            }
        },
        include: {
            participants: {
                select: { id: true, name: true, image: true }
            },
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
    const conversation = await prisma.conversation.findFirst({
        where: {
            id: conversationId,
            participants: {
                some: {
                    id: userId
                }
            }
        },
        include: {
            ad: true,
            participants: {
                select: { id: true, name: true, image: true, role: true }
            },
            messages: {
                include: {
                    sender: {
                        select: { id: true, name: true, image: true }
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

const createConversation = async (participantIds, creatorId, adId = null) => {
    // Ensure creator is in participants
    if (!participantIds.includes(creatorId)) {
        participantIds.push(creatorId);
    }

    // Check if conversation already exists for these participants and ad
    const existing = await prisma.conversation.findFirst({
        where: {
            adId,
            AND: participantIds.map(id => ({
                participants: { some: { id } }
            }))
        }
    });

    if (existing) return existing;

    return await prisma.conversation.create({
        data: {
            adId,
            participants: {
                connect: participantIds.map(id => ({ id }))
            }
        },
        include: {
            participants: true
        }
    });
};

const sendMessage = async (conversationId, senderId, content, messageType = 'text', fileUrl = null, fileName = null, fileSize = null) => {
    const conversation = await prisma.conversation.findFirst({
        where: {
            id: conversationId,
            participants: {
                some: {
                    id: senderId
                }
            }
        },
        include: {
            participants: true
        }
    });

    if (!conversation) {
        throw new Error('Conversation not found or access denied');
    }

    const receiver = conversation.participants.find(p => p.id !== senderId);

    const message = await prisma.message.create({
        data: {
            content,
            messageType,
            fileUrl,
            fileName,
            fileSize,
            senderId,
            receiverId: receiver ? receiver.id : senderId,
            conversationId
        },
        include: {
            sender: {
                select: { id: true, name: true, image: true }
            }
        }
    });

    await prisma.conversation.update({
        where: { id: conversationId },
        data: {
            lastMessage: messageType === 'text' ? content : `Sent a ${messageType}`,
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