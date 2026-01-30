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
    message_type: string;
    file_url?: string;
    file_name?: string;
    file_size?: number;
    sender_id: string;
    receiver_id: string;
    conversation_id: string;
    is_read: boolean;
    created_at: string;
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
        try {
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) {
                throw new Error('User not authenticated');
            }

            // استخدام أسماء الأعمدة الفعلية من قاعدة البيانات
            const { data: participantData, error: participantError } = await (supabase as any)
                .from('conversation_participants')
                .select('conversation_id')
                .eq('user_id', user.id);

            if (participantError) {
                console.error('Error fetching conversation participants:', participantError);
                return [];
            }

            if (!participantData?.length) {
                return [];
            }

            const conversationIds = participantData.map((p: any) => p.conversation_id);

            // الحصول على المحادثات مع المشاركين
            const { data: conversations, error: conversationsError } = await (supabase as any)
                .from('conversations')
                .select(`
                    *,
                    ad:ads(id, title, images),
                    participants:conversation_participants(
                        user:users!user_id(id, name, email)
                    )
                `)
                .in('id', conversationIds)
                .order('last_message_time', { ascending: false });

            if (conversationsError) {
                console.error('Error fetching conversations:', conversationsError);
                return [];
            }

            return (conversations || []).map((conv: any) => ({
                ...conv,
                last_message: conv.last_message,
                last_message_time: conv.last_message_time,
                created_at: conv.created_at,
                updated_at: conv.updated_at,
                participants: conv.participants?.map((p: any) => p.user) || []
            }));
        } catch (error) {
            console.error('Unexpected error fetching conversations:', error);
            return [];
        }
    },

    // الحصول على محادثة واحدة مع الرسائل
    async getConversation(id: string): Promise<{ conversation: Conversation; messages: Message[] } | null> {
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            throw new Error('User not authenticated');
        }

        // الحصول على المحادثة مع الإعلان والمشاركين
        const { data: conversation, error: conversationError } = await (supabase as any)
            .from('conversations')
            .select(`
                *,
                ad:ads(id, title, images)
            `)
            .eq('id', id)
            .single();

        if (conversationError || !conversation) {
            console.error('Error fetching conversation:', conversationError);
            return null;
        }

        // الحصول على المشاركين يدوياً لضمان الدقة
        const { data: participants, error: pError } = await (supabase as any)
            .from('conversation_participants')
            .select('user:users!user_id(id, name, email)')
            .eq('conversation_id', id);

        const transformedParticipants = participants?.map((p: any) => p.user) || [];

        // الحصول على الرسائل
        const { data: messages, error: messagesError } = await (supabase as any)
            .from('messages')
            .select(`
                *,
                sender:users!sender_id(id, name, email)
            `)
            .eq('conversation_id', id)
            .order('created_at', { ascending: true });

        if (messagesError) {
            console.error('Error fetching messages:', messagesError);
            return null;
        }

        const mappedMessages = (messages as any || []).map((msg: any) => ({
            ...msg,
            senderId: msg.sender_id,
            receiverId: msg.receiver_id,
            conversationId: msg.conversation_id,
            messageType: msg.message_type,
            createdAt: msg.created_at,
            isRead: msg.is_read
        }));

        return {
            conversation: {
                ...conversation,
                last_message: conversation.last_message,
                last_message_time: conversation.last_message_time,
                created_at: conversation.created_at,
                updated_at: conversation.updated_at,
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

        const { data: myParticipations } = await (supabase as any)
            .from('conversation_participants')
            .select('conversation_id')
            .eq('user_id', user.id);

        const myConvIds = myParticipations?.map((p: any) => p.conversation_id) || [];

        if (myConvIds.length > 0) {
            // Fix: Check if adId exists to avoid bad requests
            if (!adId) throw new Error('Ad ID is required');

            // Find conversation for this ad that I am a participant in
            const { data: existingConv, error: findError } = await (supabase as any)
                .from('conversations')
                .select('id')
                .eq('ad_id', adId)
                .in('id', myConvIds)
                .maybeSingle(); // Use maybeSingle to avoid 406 on no rows

            if (!findError && existingConv) {
                const fullConv = await this.getConversation(existingConv.id);
                if (fullConv) return fullConv.conversation;
            }
        }

        const { data: newConversation, error: createError } = await (supabase as any)
            .from('conversations')
            .insert({ ad_id: adId })
            .select()
            .single();

        if (createError) throw new Error('Failed to create conversation');

        await (supabase as any)
            .from('conversation_participants')
            .insert([
                { conversation_id: newConversation.id, user_id: user.id },
                { conversation_id: newConversation.id, user_id: participantId }
            ]);

        const finalConv = await this.getConversation(newConversation.id);
        if (!finalConv) throw new Error('Failed to retrieve conversation');

        return finalConv.conversation;
    },

    // إرسال رسالة
    async sendMessage(conversationId: string, content: string, messageType: string = 'text'): Promise<Message> {
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) throw new Error('User not authenticated');

        const { data: participants } = await (supabase as any)
            .from('conversation_participants')
            .select('user_id')
            .eq('conversation_id', conversationId)
            .neq('user_id', user.id);

        if (!participants?.length) throw new Error('Invalid conversation');

        const receiverId = participants[0].user_id;

        const { data: message, error: messageError } = await (supabase as any)
            .from('messages')
            .insert({
                content,
                message_type: messageType,
                sender_id: user.id,
                receiver_id: receiverId,
                conversation_id: conversationId,
            })
            .select(`
                *,
                sender:users!sender_id(id, name, email)
            `)
            .single();

        if (messageError) throw new Error('Failed to send message');

        await (supabase as any)
            .from('conversations')
            .update({
                last_message: content,
                last_message_time: new Date().toISOString(),
            })
            .eq('id', conversationId);

        return message as Message;
    },

    // تحديد الرسائل كمقروءة
    async markAsRead(conversationId: string): Promise<void> {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        await (supabase as any)
            .from('messages')
            .update({ is_read: true })
            .eq('conversation_id', conversationId)
            .eq('receiver_id', user.id)
            .eq('is_read', false);
    },

    // الاشتراك في التحديثات
    subscribeToConversation(conversationId: string, callback: (payload: any) => void): RealtimeChannel {
        return supabase
            .channel(`conversation-${conversationId}`)
            .on('postgres_changes', {
                event: '*',
                schema: 'public',
                table: 'messages',
                filter: `conversation_id=eq.${conversationId}`
            }, callback)
            .subscribe();
    },

    unsubscribe(channel: RealtimeChannel): void {
        supabase.removeChannel(channel);
    }
};
