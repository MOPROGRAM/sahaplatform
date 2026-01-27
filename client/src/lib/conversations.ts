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

        // استخدام أسماء الأعمدة الفعلية من قاعدة البيانات (snake_case)
        const { data: participantData, error: participantError } = await (supabase as any)
            .from('_conversation_participants')
            .select('conversation_id')
            .eq('user_id', user.id);

        if (participantError) {
            console.error('Error fetching conversation participants:', participantError);
            throw new Error('Failed to fetch conversations');
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
                participants:_conversation_participants(
                    user:users(id, name, email)
                )
            `)
            .in('id', conversationIds)
            .order('last_message_time', { ascending: false });

        if (conversationsError) {
            console.error('Error fetching conversations:', conversationsError);
            throw new Error('Failed to fetch conversations');
        }

        return (conversations || []).map(conv => ({
            ...conv,
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
            .from('_conversation_participants')
            .select('user:users(id, name, email)')
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

        return {
            conversation: {
                ...conversation,
                participants: transformedParticipants
            } as any,
            messages: (messages as any) || []
        };
    },

    // إنشاء محادثة جديدة أو الحصول على موجودة
    async createOrGetConversation(adId: string, participantId: string): Promise<Conversation> {
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            throw new Error('User not authenticated');
        }

        const { data: myParticipations } = await (supabase as any)
            .from('_conversation_participants')
            .select('conversation_id')
            .eq('user_id', user.id);

        const myConvIds = myParticipations?.map((p: any) => p.conversation_id) || [];

        if (myConvIds.length > 0) {
            const { data: existingConv } = await (supabase as any)
                .from('conversations')
                .select('id')
                .eq('ad_id', adId)
                .in('id', myConvIds)
                .single();

            if (existingConv) {
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
            .from('_conversation_participants')
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
            .from('_conversation_participants')
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

        return message as any;
    },

    // الاشتراك في التحديثات
    subscribeToConversation(conversationId: string, callback: (payload: any) => void): RealtimeChannel {
        return supabase
            .channel(`conversation-${conversationId}`)
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages', filter: `conversation_id=eq.${conversationId}` }, callback)
            .subscribe();
    },

    unsubscribe(channel: RealtimeChannel): void {
        supabase.removeChannel(channel);
    }
};
