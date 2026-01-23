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

        // نحصل على المحادثات من خلال جدول المشاركين بطريقة مبسطة
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

        const conversationIds = participantData.map(p => p.conversation_id);

        // الحصول على المحادثات
        const { data: conversations, error: conversationsError } = await (supabase as any)
            .from('Conversation')
            .select(`
                *,
                ad:Ad(id, title, images)
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

        // الحصول على المحادثة مع الإعلان والمشاركين
        const { data: conversation, error: conversationError } = await (supabase as any)
            .from('Conversation')
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
            .from('_conversation_participants')
            .select('user:User(id, name, email)')
            .eq('conversation_id', id);

        const transformedParticipants = participants?.map((p: any) => p.user) || [];

        // الحصول على الرسائل
        const { data: messages, error: messagesError } = await (supabase as any)
            .from('Message')
            .select(`
                *,
                sender:sender_id(id, name, email)
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

        // 1. البحث عن محادثة موجودة لهذا الإعلان يشارك فيها المستخدم
        const { data: myParticipations } = await (supabase as any)
            .from('_conversation_participants')
            .select('conversation_id')
            .eq('user_id', user.id);

        const myConvIds = myParticipations?.map(p => p.conversation_id) || [];

        if (myConvIds.length > 0) {
            const { data: existingConv } = await (supabase as any)
                .from('Conversation')
                .select('id')
                .eq('ad_id', adId)
                .in('id', myConvIds)
                .single();

            if (existingConv) {
                const fullConv = await this.getConversation(existingConv.id);
                if (fullConv) return fullConv.conversation;
            }
        }

        // 2. إنشاء محادثة جديدة إذا لم توجد
        const { data: newConversation, error: createError } = await (supabase as any)
            .from('Conversation')
            .insert({ ad_id: adId })
            .select()
            .single();

        if (createError) {
            console.error('Error creating conversation:', createError);
            throw new Error('Failed to create conversation');
        }

        // 3. إضافة المشاركين
        await (supabase as any)
            .from('_conversation_participants')
            .insert([
                { conversation_id: newConversation.id, user_id: user.id },
                { conversation_id: newConversation.id, user_id: participantId }
            ]);

        const finalConv = await this.getConversation(newConversation.id);
        if (!finalConv) throw new Error('Failed to retrieve newly created conversation');

        return finalConv.conversation;
    },

    // إرسال رسالة
    async sendMessage(conversationId: string, content: string, messageType: string = 'text'): Promise<Message> {
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            throw new Error('User not authenticated');
        }

        // الحصول على المشارك الآخر
        const { data: participants, error: participantsError } = await (supabase as any)
            .from('_conversation_participants')
            .select('user_id')
            .eq('conversation_id', conversationId)
            .neq('user_id', user.id);

        if (participantsError || !participants?.length) {
            throw new Error('Cannot send message: invalid conversation');
        }

        const receiverId = participants[0].user_id;

        // إدراج الرسالة
        const { data: message, error: messageError } = await (supabase as any)
            .from('Message')
            .insert({
                content,
                message_type: messageType,
                sender_id: user.id,
                receiver_id: receiverId,
                conversation_id: conversationId,
            })
            .select(`
                *,
                sender:sender_id(id, name, email)
            `)
            .single();

        if (messageError) {
            console.error('Error sending message:', messageError);
            throw new Error('Failed to send message');
        }

        // تحديث آخر رسالة في المحادثة
        await (supabase as any)
            .from('Conversation')
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

        const { error } = await (supabase as any)
            .from('Message')
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
                    table: 'Message',
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