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
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            throw new Error('User not authenticated');
        }

        // نحصل على المحادثات من خلال جدول المشاركين بطريقة مبسطة
        const { data: participantData, error: participantError } = await (supabase as any)
            .from('_conversation_participants')
            .select('a')
            .eq('b', user.id);

        if (participantError) {
            console.error('Error fetching conversation participants:', participantError);
            throw new Error('Failed to fetch conversations');
        }

        if (!participantData?.length) {
            return [];
        }

        const conversationIds = participantData.map(p => p.a);

        // الحصول على المحادثات
        const { data: conversations, error: conversationsError } = await supabase
            .from('conversations')
            .select(`
                *,
                ad:ads(id, title, images)
            `)
            .in('id', conversationIds)
            .order('last_message_time', { ascending: false });

        if (conversationsError) {
            console.error('Error fetching conversations:', conversationsError);
            throw new Error('Failed to fetch conversations');
        }

        return (conversations || []).map(conv => ({
            ...(conv as any),
            participants: [] // سنحصل عليهم لاحقاً إذا لزم الأمر
        }));
    },

    // الحصول على محادثة واحدة مع الرسائل
    async getConversation(id: string): Promise<{ conversation: Conversation; messages: Message[] } | null> {
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            throw new Error('User not authenticated');
        }

        // التحقق من أن المستخدم مشارك في المحادثة
        const { data: participantCheck, error: participantError } = await supabase
            .from('_conversation_participants')
            .select('conversation_id')
            .eq('a', id)
            .eq('b', user.id)
            .single();

        if (participantError || !participantCheck) {
            throw new Error('Access denied to this conversation');
        }

        // الحصول على المحادثة
        const { data: conversation, error: conversationError } = await supabase
            .from('conversations')
            .select(`
                *,
                ad:ads(id, title, images),
                participants:users(id, name, email)
            `)
            .eq('id', id)
            .single();

        if (conversationError) {
            console.error('Error fetching conversation:', conversationError);
            return null;
        }

        // الحصول على الرسائل
        const { data: messages, error: messagesError } = await supabase
            .from('messages')
            .select(`
                *,
                sender:users(id, name, email)
            `)
            .eq('conversation_id', id)
            .order('created_at', { ascending: true });

        if (messagesError) {
            console.error('Error fetching messages:', messagesError);
            return null;
        }

        return {
            conversation: conversation as any,
            messages: (messages as any) || []
        };
    },

    // إنشاء محادثة جديدة أو الحصول على موجودة
    async createOrGetConversation(adId: string, participantId: string): Promise<Conversation> {
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            throw new Error('User not authenticated');
        }

        // البحث عن محادثة موجودة بين المستخدمين لهذا الإعلان
        const { data: existingConversation, error: searchError } = await supabase
            .from('conversations')
            .select(`
                *,
                participants:users(id, name, email)
            `)
            .eq('ad_id', adId)
            .single();

        if (existingConversation && !searchError) {
            // التحقق من أن المستخدم مشارك
            const isParticipant = existingConversation.participants?.some(p => p.id === user.id);
            if (isParticipant) {
                return existingConversation as any;
            }
        }

        // إنشاء محادثة جديدة
        const { data: newConversation, error: createError } = await supabase
            .from('conversations')
            .insert({
                ad_id: adId,
            })
            .select(`
                *,
                ad:ads(id, title, images)
            `)
            .single();

        if (createError) {
            console.error('Error creating conversation:', createError);
            throw new Error('Failed to create conversation');
        }

        // إضافة المشاركين
        const participants = [
            { a: newConversation.id, b: user.id },
            { a: newConversation.id, b: participantId }
        ];

        const { error: participantsError } = await supabase
            .from('_conversation_participants')
            .insert(participants);

        if (participantsError) {
            console.error('Error adding participants:', participantsError);
        }

        return newConversation as any;
    },

    // إرسال رسالة
    async sendMessage(conversationId: string, content: string, messageType: string = 'text'): Promise<Message> {
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            throw new Error('User not authenticated');
        }

        // الحصول على المشارك الآخر
        const { data: participants, error: participantsError } = await supabase
            .from('_conversation_participants')
            .select('b')
            .eq('a', conversationId)
            .neq('b', user.id);

        if (participantsError || !participants?.length) {
            throw new Error('Cannot send message: invalid conversation');
        }

        const receiverId = participants[0].b;

        // إدراج الرسالة
        const { data: message, error: messageError } = await supabase
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
                sender:users(id, name, email)
            `)
            .single();

        if (messageError) {
            console.error('Error sending message:', messageError);
            throw new Error('Failed to send message');
        }

        // تحديث آخر رسالة في المحادثة
        await supabase
            .from('conversations')
            .update({
                last_message: content,
                last_message_time: new Date().toISOString(),
            })
            .eq('id', conversationId);

        return message as any;
    },

    // وضع علامة كمقروء
    async markAsRead(messageIds: string[]): Promise<void> {
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            throw new Error('User not authenticated');
        }

        const { error } = await supabase
            .from('messages')
            .update({ is_read: true })
            .in('id', messageIds)
            .eq('receiver_id', user.id);

        if (error) {
            console.error('Error marking messages as read:', error);
        }
    },

    // الاشتراك في التحديثات ال实时 للمحادثة
    subscribeToConversation(conversationId: string, callback: (payload: any) => void): RealtimeChannel {
        const channel = supabase
            .channel(`conversation-${conversationId}`)
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'messages',
                    filter: `conversation_id=eq.${conversationId}`,
                },
                callback
            )
            .subscribe();

        return channel;
    },

    // إلغاء الاشتراك
    unsubscribe(channel: RealtimeChannel): void {
        supabase.removeChannel(channel);
    }
};