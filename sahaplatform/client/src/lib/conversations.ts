import { supabase } from './supabase';
import { RealtimeChannel } from '@supabase/supabase-js';

// Types
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
    duration?: number;
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

// Service using API Routes to bypass RLS
export const conversationsService = {
    // Get all conversations
    async getConversations(showDeleted: boolean = false): Promise<Conversation[]> {
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) throw new Error('User not authenticated');

            const response = await fetch(`/api/conversations?deleted=${showDeleted}`, {
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

    // Get single conversation
    async getConversation(id: string): Promise<{ conversation: Conversation; messages: Message[] } | null> {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) throw new Error('User not authenticated');

        // Check if using API route or direct Supabase
        // Falling back to direct Supabase for reliability with new columns
        const { data: conversation, error: convError } = await supabase
            .from('conversations')
            .select(`
                *,
                ad:ads(id, title, images),
                participants:conversation_participants(
                    user:users(id, name, email)
                )
            `)
            .eq('id', id)
            .single();

        if (convError) {
             // Fallback to API if RLS fails direct access
             const response = await fetch(`/api/conversations/${id}`, {
                headers: { 'Authorization': `Bearer ${session.access_token}` }
            });
            if (!response.ok) return null;
            return await response.json();
        }

        // Fetch messages including new fields
        const { data: messages, error: msgError } = await supabase
            .from('messages')
            .select('*')
            .eq('conversation_id', id)
            .order('created_at', { ascending: true });

        if (msgError) return null;

        // Transform participants structure
        const formattedConversation = {
            ...conversation,
            participants: conversation.participants.map((p: any) => p.user)
        };

        return { conversation: formattedConversation, messages: messages || [] };
    },

    // Create or Get Conversation (Smart Routing with RPC)
    async createOrGetConversation(adId: string, participantId: string): Promise<Conversation> {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) throw new Error('User not authenticated');
        
        // Use the new RPC to prevent duplicates atomically
        const { data, error } = await supabase.rpc('get_or_create_conversation', {
            p_ad_id: adId,
            p_user_id: session.user.id,
            p_other_user_id: participantId
        });

        if (error) {
            console.error('RPC Error:', error);
            // Fallback to old API method if RPC fails
            const response = await fetch('/api/conversations/create', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${session.access_token}`
                },
                body: JSON.stringify({ adId, participantId })
            });
            if (!response.ok) throw new Error(await response.text());
            return await response.json();
        }

        // Fetch the full conversation details
        const { conversation } = await this.getConversation(data.id) as any;
        return conversation;
    },

    // Send Message with File Handling
    async sendMessage(conversationId: string, content: string, messageType: string = 'text', metadata: any = {}, receiverId?: string): Promise<Message> {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) throw new Error('User not authenticated');

        // Use API route to bypass RLS and ensure reliability
        const response = await fetch('/api/conversations/message', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${session.access_token}`
            },
            body: JSON.stringify({
                conversationId,
                content,
                messageType,
                metadata,
                receiverId
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            let errorMessage = 'Failed to send message';
            try {
                const errorJson = JSON.parse(errorText);
                errorMessage = errorJson.error || errorMessage;
            } catch (e) {
                errorMessage = errorText;
            }
            throw new Error(errorMessage);
        }

        return await response.json();
    },

    // Upload File to Supabase Storage (with 25MB Limit)
    async uploadFile(file: File, conversationId: string): Promise<{ file_url: string; file_name: string; file_size: number; file_type: string }> {
        // 25MB Limit Check
        if (file.size > 25 * 1024 * 1024) {
            throw new Error(document.documentElement.lang === 'ar' ? 'حجم الملف يتجاوز 25 ميجابايت' : 'File size exceeds 25MB');
        }

        const { data: { session } } = await supabase.auth.getSession();
        if (!session) throw new Error('User not authenticated');

        // Sanitize filename
        const fileExt = file.name.split('.').pop();
        const safeFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
        const filePath = `${conversationId}/${Date.now()}-${safeFileName}`;
        
        const { error: uploadError } = await supabase.storage
            .from('chat_vault')
            .upload(filePath, file);

        if (uploadError) throw uploadError;

        const { data } = await supabase.storage
            .from('chat_vault')
            .createSignedUrl(filePath, 31536000, {
                download: file.name
            });

        if (!data?.signedUrl) throw new Error('Failed to generate signed URL');

        return {
            file_url: data.signedUrl,
            file_name: file.name,
            file_size: file.size,
            file_type: file.type
        };
    },

    // Mark as Read (RPC)
    async markAsRead(conversationId: string): Promise<void> {
        await supabase.rpc('mark_messages_read', { p_conversation_id: conversationId });
    },

    // Soft Delete Conversation
    async deleteConversation(conversationId: string): Promise<void> {
        const { error } = await supabase.rpc('soft_delete_conversation', { p_conversation_id: conversationId });
        if (error) throw error;
    },

    // Restore Conversation
    async restoreConversation(conversationId: string): Promise<void> {
        const { error } = await supabase.rpc('restore_conversation', { p_conversation_id: conversationId });
        if (error) throw error;
    },

    // Edit Message
    async editMessage(messageId: string, newContent: string): Promise<void> {
        const { error } = await supabase.rpc('edit_message', { 
            p_message_id: messageId, 
            p_new_content: newContent 
        });
        if (error) throw error;
    },

    // Delete Message
    async deleteMessage(messageId: string): Promise<void> {
        const { error } = await supabase.rpc('delete_message', { p_message_id: messageId });
        if (error) throw error;
    },

    // Realtime Subscription
    subscribeToConversation(conversationId: string, callback: (payload: any) => void) {
        return supabase
            .channel(`conversation:${conversationId}`)
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'messages',
                    filter: `conversation_id=eq.${conversationId}`
                },
                callback
            )
            .subscribe();
    },

    unsubscribe(channel: RealtimeChannel) {
        supabase.removeChannel(channel);
    }
};
