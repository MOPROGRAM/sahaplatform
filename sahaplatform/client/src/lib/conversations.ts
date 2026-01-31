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


        // الحصول على المشاركين يدوياً لضمان الدقة (باستخدام RPC لتجاوز RLS)
        const { data: participantRows, error: pError } = await (supabase as any)
            .rpc('get_conversation_participants', { p_conversation_id: id });

        let transformedParticipants: any[] = [];

        if (participantRows && participantRows.length > 0) {
            const userIds = participantRows.map((p: any) => p.user_id);
            const { data: usersData } = await (supabase as any)
                .from('users')
                .select('id, name, email')
                .in('id', userIds);
            
            transformedParticipants = usersData || [];
        }

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

        // محاولة استخدام RPC لإنشاء المحادثة بشكل ذري (Atomic)
        try {
            console.log(`Attempting to create conversation via RPC for ad ${adId} with user ${participantId}`);
            const { data: convId, error: rpcError } = await (supabase as any)
                .rpc('create_new_conversation', {
                    p_ad_id: adId,
                    p_other_user_id: participantId
                });

            if (!rpcError && convId) {
                console.log(`Conversation created/found via RPC: ${convId}`);
                const fullConv = await this.getConversation(convId);
                if (fullConv) return fullConv.conversation;
            } else {
                 console.warn('RPC create_new_conversation failed or not found, falling back to manual logic:', rpcError);
            }
        } catch (e) {
            console.warn('Error calling create_new_conversation RPC:', e);
        }

        // Fallback: المنطق اليدوي (للتوافق في حال لم يتم تشغيل SQL RPC)
        const { data: myParticipations } = await (supabase as any)
            .from('conversation_participants')
            .select('conversation_id')
            .eq('user_id', user.id);

        const myConvIds = myParticipations?.map((p: any) => p.conversation_id) || [];

        if (myConvIds.length > 0) {
            // البحث عن محادثات لنفس الإعلان أنا مشارك فيها
            const { data: candidates } = await (supabase as any)
                .from('conversations')
                .select('id')
                .eq('ad_id', adId)
                .in('id', myConvIds);

            if (candidates && candidates.length > 0) {
                const candidateIds = candidates.map((c: any) => c.id);
                
                // التحقق من أن الطرف الآخر مشارك أيضاً في إحدى هذه المحادثات
                const { data: common } = await (supabase as any)
                    .from('conversation_participants')
                    .select('conversation_id')
                    .eq('user_id', participantId)
                    .in('conversation_id', candidateIds)
                    .limit(1)
                    .maybeSingle();

                if (common) {
                    const fullConv = await this.getConversation(common.conversation_id);
                    if (fullConv) return fullConv.conversation;
                }
            }
        }

        const { data: newConversation, error: createError } = await (supabase as any)
            .from('conversations')
            .insert({ ad_id: adId })
            .select()
            .single();

        if (createError) throw new Error('Failed to create conversation');

        // إضافة المشاركين فوراً
        const { error: participantsError } = await (supabase as any)
            .from('conversation_participants')
            .insert([
                { conversation_id: newConversation.id, user_id: user.id },
                { conversation_id: newConversation.id, user_id: participantId }
            ]);
            
        if (participantsError) {
             console.error('Failed to add participants, rolling back conversation:', participantsError);
             // محاولة حذف المحادثة الفارغة لتجنب المشاكل
             await (supabase as any).from('conversations').delete().eq('id', newConversation.id);
             throw new Error('Failed to add participants to conversation');
        }

        const finalConv = await this.getConversation(newConversation.id);
        if (!finalConv) throw new Error('Failed to retrieve conversation');

        return finalConv.conversation;
    },

    // إرسال رسالة
    async sendMessage(conversationId: string, content: string, messageType: string = 'text', metadata: any = {}): Promise<Message> {
        let { data: { user }, error: authError } = await supabase.auth.getUser();

        // Check for "Session issued in the future" or other auth errors and try to refresh
        if (authError && (authError.message.includes('future') || authError.status === 403)) {
            console.warn('Auth error detected (possibly future session), refreshing session...', authError);
            const { data: refreshData } = await supabase.auth.refreshSession();
            if (refreshData.user) {
                user = refreshData.user;
            }
        }

        if (!user) throw new Error('User not authenticated');

        console.log(`Sending message to conversation ${conversationId} from ${user.id}`);

        // Ensure I am a participant (Fix for broken/migrated conversations)
        const { data: myParticipation } = await (supabase as any)
            .from('conversation_participants')
            .select('user_id')
            .eq('conversation_id', conversationId)
            .eq('user_id', user.id)
            .maybeSingle();

        if (!myParticipation) {
            console.log(`Current user ${user.id} is NOT a participant in conversation ${conversationId}. Adding self...`);
            const { error: addSelfError } = await (supabase as any)
                .from('conversation_participants')
                .insert({ conversation_id: conversationId, user_id: user.id });
            
            if (addSelfError) {
                console.error('Failed to add self to conversation:', addSelfError);
            }
        }

        // Use RPC to fetch participants to avoid RLS recursion issues
        let participants: any[] = [];
        const { data: rpcParticipants, error: rpcError } = await (supabase as any)
            .rpc('get_conversation_participants', { p_conversation_id: conversationId });

        if (!rpcError && rpcParticipants) {
             participants = rpcParticipants.filter((p: any) => p.user_id !== user!.id);
        } else {
             // Fallback to standard select (might fail if RLS is strict)
             console.warn('RPC get_conversation_participants failed, falling back to direct select:', rpcError);
             const { data: tableParticipants } = await (supabase as any)
                .from('conversation_participants')
                .select('user_id')
                .eq('conversation_id', conversationId)
                .neq('user_id', user.id);
             
             if (tableParticipants) participants = tableParticipants;
        }

        let receiverId: string | null = null;

        if (participants && participants.length > 0) {
            receiverId = participants[0].user_id;
        } else {
            console.warn(`No other participants found in conversation ${conversationId}. Attempting to resolve receiver...`);
            
            // محاولة إصلاح المحادثة باستنتاج المستقبل
            try {
                // 1. جلب تفاصيل المحادثة لمعرفة الإعلان
                const { data: conversation } = await (supabase as any)
                    .from('conversations')
                    .select('ad_id')
                    .eq('id', conversationId)
                    .single();

                if (conversation && conversation.ad_id) {
                    console.log(`Found conversation ad_id: ${conversation.ad_id}`);
                    // 2. جلب تفاصيل الإعلان لمعرفة صاحب الإعلان
                    const { data: ad } = await (supabase as any)
                        .from('ads')
                        .select('author_id')
                        .eq('id', conversation.ad_id)
                        .single();

                    if (ad) {
                        console.log(`Found ad author_id: ${ad.author_id}`);
                        if (user.id !== ad.author_id) {
                            // إذا لم أكن صاحب الإعلان، فالمستقبل هو صاحب الإعلان
                            receiverId = ad.author_id;
                        } else {
                            // إذا كنت صاحب الإعلان، نبحث عن رسالة سابقة لمعرفة الطرف الآخر
                            const { data: lastMsg } = await (supabase as any)
                                .from('messages')
                                .select('sender_id')
                                .eq('conversation_id', conversationId)
                                .neq('sender_id', user.id)
                                .order('created_at', { ascending: false })
                                .limit(1)
                                .single();
                            
                            if (lastMsg) {
                                receiverId = lastMsg.sender_id;
                            }
                        }
                    } else {
                        console.warn(`Ad not found for id: ${conversation.ad_id}`);
                    }
                } else {
                    console.warn(`Conversation or ad_id not found for conversation: ${conversationId}`);
                }

                // محاولة أخيرة: البحث عن أي رسالة من طرف آخر
                if (!receiverId) {
                     const { data: anyMsg } = await (supabase as any)
                        .from('messages')
                        .select('sender_id')
                        .eq('conversation_id', conversationId)
                        .neq('sender_id', user.id)
                        .limit(1)
                        .maybeSingle();
                     
                     if (anyMsg) {
                         console.log(`Found receiver from existing messages: ${anyMsg.sender_id}`);
                         receiverId = anyMsg.sender_id;
                     }
                }

                if (receiverId) {
                    console.log(`Resolved missing receiverId: ${receiverId}. Repairing conversation...`);
                    // إضافة المشارك المفقود إلى المحادثة
                    const { error: insertError } = await (supabase as any)
                        .from('conversation_participants')
                        .insert({ conversation_id: conversationId, user_id: receiverId });
                    
                    if (insertError) {
                        console.error('Error inserting participant during repair:', insertError);
                        // Even if insert fails (e.g. RLS), we proceed if we have receiverId
                    }
                }
            } catch (err) {
                console.error('Error resolving receiver:', err);
            }
        }

        if (!receiverId) {
            console.error(`No other participants found in conversation ${conversationId}`);
            const { count } = await (supabase as any)
                .from('conversation_participants')
                .select('*', { count: 'exact', head: true })
                .eq('conversation_id', conversationId);
            console.log(`Total participants in conversation: ${count}`);
            throw new Error('Invalid conversation: No other participants found. Please try creating a new conversation.');
        }

        console.log(`Resolved receiverId: ${receiverId}`);

        const { data: message, error: messageError } = await (supabase as any)
            .from('messages')
            .insert({
                content,
                message_type: messageType,
                sender_id: user.id,
                receiver_id: receiverId,
                conversation_id: conversationId,
                ...metadata
            })
            .select(`
                *,
                sender:users!sender_id(id, name, email)
            `)
            .single();

        if (messageError) {
            console.error('Error inserting message:', messageError);
            throw new Error(`Failed to send message: ${messageError.message}`);
        }

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
