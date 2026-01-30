import { supabase } from './supabase';
import { RealtimeChannel } from '@supabase/supabase-js';

// أنواع البيانات للمحادثات والرسائل
export interface Conversation {
    id: string;
    last_message?: string;
    last_message_time: string;
    ad_id?: string;
    created_at: string;
    updated_at: string;
    ad?: {
        id: string;
        title: string;
        images: string;
    };
    participants: Array<{
        id: string;
        name?: string;
        email: string;
    }>;
}

export interface Message {
    id: string;
    content: string;
    messageType: string;
    fileUrl?: string;
    fileName?: string;
    fileSize?: number;
    senderId: string;
    receiverId: string;
    conversationId: string;
    isRead: boolean;
    createdAt: string;
    sender?: {
        id: string;
        name?: string;
        email: string;
    };
}

// خدمة إدارة المحادثات باستخدام Supabase مباشرة والـ Realtime
export const conversationsService = {
    // الحصول على جميع محادثات المستخدم
    async getConversations(): Promise<Conversation[]> {
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            throw new Error('User not authenticated');
        }

        // استخدام أسماء الأعمدة الفعلية من قاعدة البيانات (Prisma uses A/B for implicit M-N)
        const { data: participantData, error: participantError } = await (supabase as any)
            .from('_ConversationParticipants') 
            .select('A')
            .eq('B', user.id);

        if (participantError) {
            console.error('Error fetching conversation participants:', participantError);
            throw new Error('Failed to fetch conversations');
        }

        if (!participantData?.length) {
            return [];
        }

        const conversationIds = participantData.map((p: any) => p.A);

        // الحصول على المحادثات مع المشاركين
        const { data: conversations, error: conversationsError } = await (supabase as any)
            .from('Conversation')
            .select(`
                *,
                ad:Ad(id, title, images),
                participants:_ConversationParticipants(
                    user:User(id, name, email)
                )
            `)
            .in('id', conversationIds)
            .order('lastMessageTime', { ascending: false });

        if (conversationsError) {
            console.error('Error fetching conversations:', conversationsError);
            throw new Error('Failed to fetch conversations');
        }

        return (conversations || []).map(conv => ({
            ...conv,
            last_message: conv.lastMessage, // Map camelCase to expected interface
            last_message_time: conv.lastMessageTime,
            created_at: conv.createdAt,
            updated_at: conv.updatedAt,
            participants: conv.participants?.map((p: any) => p.user) || []
        }));
    },

    // الحصول على محادثة واحدة مع الرسائل
    async getConversation(id: string): Promise<{ conversation: Conversation; messages: Message[] } | null> {
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            throw new Error('User not authenticated');
        }

        // الحصول على المحادثة مع الإعلان والمشاركين
        const { data: conversation, error: conversationError } = await (supabase as any)
            .from('Conversation') // Changed from 'conversations' to 'Conversation'
            .select(`
                *,
                ad:Ad(id, title, images)
            `)
            .eq('id', id)
            .single();

        if (conversationError || !conversation) {
            console.error('Error fetching conversation:', conversationError);
            return null;
        }

        // الحصول على المشاركين يدوياً لضمان الدقة
        const { data: participants, error: pError } = await (supabase as any)
            .from('_ConversationParticipants')
            .select('user:User(id, name, email)')
            .eq('A', id);

        const transformedParticipants = participants?.map((p: any) => p.user) || [];

        // الحصول على الرسائل
        const { data: messages, error: messagesError } = await (supabase as any)
            .from('Message')
            .select(`
                *,
                sender:User!messages_sender_id_fkey(id, name, email)
            `)
            .eq('conversationId', id)
            .order('createdAt', { ascending: true });

        if (messagesError) {
            console.error('Error fetching messages:', messagesError);
            return null;
        }

        const mappedMessages = (messages as any || []).map((msg: any) => ({
            ...msg,
            sender_id: msg.senderId || msg.sender_id,
            receiver_id: msg.receiverId || msg.receiver_id,
            conversation_id: msg.conversationId || msg.conversation_id,
            message_type: msg.messageType || msg.message_type,
            created_at: msg.createdAt || msg.created_at,
            is_read: msg.isRead || msg.is_read
        }));

        return {
            conversation: {
                ...conversation,
                last_message: conversation.lastMessage,
                last_message_time: conversation.lastMessageTime,
                created_at: conversation.createdAt,
                updated_at: conversation.updatedAt,
                participants: transformedParticipants
            } as any,
            messages: mappedMessages
        };
    },

    // إنشاء محادثة جديدة أو الحصول على موجودة
    async createOrGetConversation(adId: string, participantId: string): Promise<Conversation> {
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            throw new Error('User not authenticated');
        }

        // الحصول على معرفات المحادثات التي يشارك فيها المستخدم الحالي
        const { data: myParticipations } = await (supabase as any)
            .from('_ConversationParticipants')
            .select('A')
            .eq('B', user.id);

        const myConvIds = myParticipations?.map((p: any) => p.A) || [];

        if (myConvIds.length > 0) {
            // أولاً: البحث عن محادثة موجودة لهذا الإعلان تحديداً
            const { data: existingAdConv } = await (supabase as any)
                .from('Conversation')
                .select('id')
                .eq('adId', adId)
                .in('id', myConvIds)
                .single();

            if (existingAdConv) {
                const fullConv = await this.getConversation(existingAdConv.id);
                if (fullConv) return fullConv.conversation;
            }

            // ثانياً: البحث عن محادثة موجودة مع نفس المعلن (لأي إعلان)
            // الحصول على معرفات المحادثات التي يشارك فيها المعلن
            const { data: advertiserParticipations } = await (supabase as any)
                .from('_ConversationParticipants')
                .select('A')
                .eq('B', participantId);

            const advertiserConvIds = advertiserParticipations?.map((p: any) => p.A) || [];

            // البحث عن تقاطع المحادثات المشتركة بين المستخدم والمعلن
            const commonConvIds = myConvIds.filter(id => advertiserConvIds.includes(id));

            if (commonConvIds.length > 0) {
                // استخدام أول محادثة مشتركة موجودة
                const { data: existingConv } = await (supabase as any)
                    .from('Conversation')
                    .select('id, adId')
                    .in('id', commonConvIds)
                    .order('updatedAt', { ascending: false }) // الأحدث أولاً
                    .limit(1)
                    .single();

                if (existingConv) {
                    const fullConv = await this.getConversation(existingConv.id);
                    if (fullConv) return fullConv.conversation;
                }
            }
        }

        // إذا لم توجد محادثة موجودة، إنشاء محادثة جديدة
        const { data: newConversation, error: createError } = await (supabase as any)
            .from('Conversation')
            .insert({ adId: adId })
            .select()
            .single();

        if (createError) throw new Error('Failed to create conversation');

        await (supabase as any)
            .from('_ConversationParticipants')
            .insert([
                { A: newConversation.id, B: user.id },
                { A: newConversation.id, B: participantId }
            ]);

        const finalConv = await this.getConversation(newConversation.id);
        if (!finalConv) throw new Error('Failed to retrieve conversation');

        return finalConv.conversation;
    },

    // إرسال رسالة
    async sendMessage(conversationId: string, content: string, messageType: string = 'text'): Promise<Message> {
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) throw new Error('User not authenticated');

        // البحث عن المشاركين في المحادثة بطرق مختلفة
        let participants: any[] = [];
        
        // الطريقة الأولى: البحث المباشر
        const { data: directParticipants } = await (supabase as any)
            .from('_ConversationParticipants')
            .select('B')
            .eq('A', conversationId)
            .neq('B', user.id);

        if (directParticipants?.length) {
            participants = directParticipants;
        } else {
            // الطريقة الثانية: البحث العكسي
            const { data: reverseParticipants } = await (supabase as any)
                .from('_ConversationParticipants')
                .select('A')
                .eq('B', conversationId)
                .neq('A', user.id);

            if (reverseParticipants?.length) {
                participants = reverseParticipants;
            } else {
                // الطريقة الثالثة: الحصول على جميع المشاركين والتصفية
                const { data: allParticipants } = await (supabase as any)
                    .from('_ConversationParticipants')
                    .select('*');
                
                // البحث عن المحادثة في جميع السجلات
                const conversationRecords = allParticipants?.filter(
                    (record: any) => record.A === conversationId || record.B === conversationId
                ) || [];
                
                // استخراج المشاركين الآخرين
                participants = conversationRecords
                    .map((record: any) => record.A === conversationId ? record.B : record.A)
                    .filter((id: string) => id !== user.id && id !== conversationId);
            }
        }

        if (!participants?.length) {
            console.error('No participants found for conversation:', conversationId);
            console.error('User ID:', user.id);
            throw new Error('Invalid conversation - no participants found');
        }

        const receiverId = participants[0];

        const { data: message, error: messageError } = await (supabase as any)
            .from('Message')
            .insert({
                content,
                messageType: messageType,
                senderId: user.id,
                receiverId: receiverId,
                conversationId: conversationId,
            })
            .select(`
                *,
                sender:User!messages_sender_id_fkey(id, name, email)
            `)
            .single();

        if (messageError) {
            console.error('Message send error:', messageError);
            throw new Error('Failed to send message');
        }

        await (supabase as any)
            .from('Conversation')
            .update({
                lastMessage: content,
                lastMessageTime: new Date().toISOString(),
            })
            .eq('id', conversationId);

        const mappedMessage = {
            ...message,
            sender_id: message.senderId,
            receiver_id: message.receiverId,
            conversation_id: message.conversationId,
            message_type: message.messageType,
            created_at: message.createdAt,
            is_read: message.isRead
        };

        return mappedMessage as any;
    },

    // الاشتراك في التحديثات
    subscribeToConversation(conversationId: string, callback: (payload: any) => void): RealtimeChannel {
        // We subscribe to the table 'Message' and filter client-side if needed, 
        // or rely on the server-side filter if it works with the specific column casing.
        // Given mixed-case issues, we'll try to filter by the exact column name 'conversationId' 
        // but the callback in ChatWindow also double-checks.
        return supabase
            .channel(`conversation-${conversationId}`)
            .on('postgres_changes', { 
                event: 'INSERT', 
                schema: 'public', 
                table: 'Message', 
                filter: `conversationId=eq.${conversationId}` 
            }, callback)
            .subscribe();
    },

    unsubscribe(channel: RealtimeChannel): void {
        supabase.removeChannel(channel);
    }
};
