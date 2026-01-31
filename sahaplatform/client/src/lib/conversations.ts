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
            const { data: { session } } = await supabase.auth.getSession();

            if (!session) {
                throw new Error('User not authenticated');
            }

            // Use API Route to bypass RLS issues
            const response = await fetch('/api/conversations', {
                headers: {
                    'Authorization': `Bearer ${session.access_token}`
                }
            });

            if (!response.ok) {
                console.error('API Error fetching conversations:', await response.text());
                return [];
            }

            const conversations = await response.json();

            return (conversations || []).map((conv: any) => ({
                ...conv,
                last_message: conv.last_message,
                last_message_time: conv.last_message_time,
                created_at: conv.created_at,
                updated_at: conv.updated_at,
                participants: conv.participants || []
            }));
        } catch (error) {
            console.error('Unexpected error fetching conversations:', error);
            return [];
        }
    },

    // الحصول على محادثة واحدة مع الرسائل
    async getConversation(id: string): Promise<{ conversation: Conversation; messages: Message[] } | null> {
        const { data: { session } } = await supabase.auth.getSession();

        if (!session) {
            throw new Error('User not authenticated');
        }

        // Use API Route
        const response = await fetch(`/api/conversations/${id}`, {
            headers: {
                'Authorization': `Bearer ${session.access_token}`
            }
        });

        if (!response.ok) {
            console.error('API Error fetching conversation:', await response.text());
            return null;
        }

        const data = await response.json();
        return data;
    },

    // إنشاء محادثة جديدة أو الحصول على موجودة
    async createOrGetConversation(adId: string, participantId: string): Promise<Conversation> {
        // ... (Keep existing logic or migrate to API if needed. Creating is usually less RLS-prone than selecting)
        // For now, we keep this as is because 'insert' usually works if 'insert' policy is simple (auth.uid() = user_id)
        // But if 'create_new_conversation' RPC is used, it's safer.
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('User not authenticated');

        try {
            const { data: convId, error: rpcError } = await (supabase as any)
                .rpc('create_new_conversation', {
                    p_ad_id: adId,
                    p_other_user_id: participantId
                });

            if (!rpcError && convId) {
                const fullConv = await this.getConversation(convId);
                if (fullConv) return fullConv.conversation;
            }
        } catch (e) {
            console.warn('RPC create_new_conversation failed:', e);
        }

        // Fallback logic requires selecting participants, which might fail RLS.
        // Let's rely on RPC primarily. If RPC fails, we might need a new API route for creation too.
        // However, let's wait and see if get/send is enough.
        
        // Actually, let's fix the fallback to use the API for checking existence if needed?
        // No, let's leave creation for now.
        
        // ... (rest of original function)
        const { data: myParticipations } = await (supabase as any)
            .from('conversation_participants')
            .select('conversation_id')
            .eq('user_id', user.id);
            
        // ... (The rest of the function continues as before, assuming simple RLS works for 'select where user_id=uid')
        // We will return the original implementation for the rest of this function in a moment if we don't replace it all.
        // To be safe, I will replace the whole function content in the tool call to ensure I don't break it.
        
        const myConvIds = myParticipations?.map((p: any) => p.conversation_id) || [];
        if (myConvIds.length > 0) {
            const { data: candidates } = await (supabase as any)
                .from('conversations')
                .select('id')
                .eq('ad_id', adId)
                .in('id', myConvIds);

            if (candidates && candidates.length > 0) {
                // Use API to check detailed participation if needed, but here we just need ID.
                // Assuming RLS allows seeing "my" participations.
                 const candidateIds = candidates.map((c: any) => c.id);
                 
                 // This query 'select conversation_id where user_id = participantId' might FAIL if I can't see other users' rows.
                 // This IS a problem point.
                 // We should move Create logic to API too.
            }
        }
        
        // Let's create an API route for creating conversation too? 
        // Yes, to be consistent.
        // I will make a separate tool call to create POST /api/conversations/create
        
        // For now, let's just return the existing logic but knowing it might be fragile.
        // Wait, I can't leave it fragile. The user wants it FIXED.
        
        // I'll assume for this edit I am only changing getConversations and getConversation and sendMessage.
        // I will change sendMessage to use API.
        
        // ...
        return await this.createOrGetConversationAPI(adId, participantId);
    },
    
    // New helper using API
    async createOrGetConversationAPI(adId: string, participantId: string): Promise<Conversation> {
         const { data: { session } } = await supabase.auth.getSession();
         if (!session) throw new Error('User not authenticated');
         
         const response = await fetch('/api/conversations/create', {
             method: 'POST',
             headers: {
                 'Content-Type': 'application/json',
                 'Authorization': `Bearer ${session.access_token}`
             },
             body: JSON.stringify({ adId, participantId })
         });
         
         if (!response.ok) {
             throw new Error(await response.text());
         }
         
         return await response.json();
    },

    // إرسال رسالة
    async sendMessage(conversationId: string, content: string, messageType: string = 'text', metadata: any = {}): Promise<Message> {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
            // Try refresh
             const { data: refreshData } = await supabase.auth.refreshSession();
             if (!refreshData.session) throw new Error('User not authenticated');
        }

        // We need to resolve receiverId? 
        // The API route I created expects 'receiverId' in body.
        // So I still need to know who I am sending to.
        // But getConversation() (via API) returns participants!
        // So the UI should pass it? 
        // No, sendMessage signature doesn't take receiverId.
        
        // I should fetch the conversation first to find the receiver?
        // Or update the API route to find the receiver automatically?
        // My API route `POST /api/conversations/message` takes `receiverId`.
        
        // Let's update the API route logic to find receiver if not provided?
        // No, better to find it here using the trusted `getConversation` API.
        
        const fullConv = await this.getConversation(conversationId);
        if (!fullConv) throw new Error('Conversation not found');
        
        const user = session?.user || (await supabase.auth.getUser()).data.user;
        const receiver = fullConv.conversation.participants.find(p => p.id !== user!.id);
        
        if (!receiver) throw new Error('No receiver found');
        
        const response = await fetch('/api/conversations/message', {
            method: 'POST',
             headers: {
                 'Content-Type': 'application/json',
                 'Authorization': `Bearer ${session?.access_token}`
             },
             body: JSON.stringify({
                 conversationId,
                 content,
                 messageType,
                 metadata,
                 receiverId: receiver.id
             })
        });

        if (!response.ok) {
            throw new Error(await response.text());
        }

        return await response.json();
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
