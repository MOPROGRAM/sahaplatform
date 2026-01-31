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
    async getConversations(): Promise<Conversation[]> {
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) throw new Error('User not authenticated');

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

    // Get single conversation
    async getConversation(id: string): Promise<{ conversation: Conversation; messages: Message[] } | null> {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) throw new Error('User not authenticated');

        const response = await fetch(`/api/conversations/${id}`, {
            headers: {
                'Authorization': `Bearer ${session.access_token}`
            }
        });

        if (!response.ok) {
            console.error('API Error fetching conversation:', await response.text());
            return null;
        }

        return await response.json();
    },

    // Create or Get Conversation (Smart Routing)
    async createOrGetConversation(adId: string, participantId: string): Promise<Conversation> {
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
            const errorText = await response.text();
            throw new Error(`Failed to create/get conversation: ${errorText}`);
        }
        
        return await response.json();
    },

    // Send Message
    async sendMessage(conversationId: string, content: string, messageType: string = 'text', metadata: any = {}): Promise<Message> {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
             // Try to refresh session
             const { data: { session: newSession }, error } = await supabase.auth.refreshSession();
             if (error || !newSession) throw new Error('User not authenticated');
        }
        const currentSession = (await supabase.auth.getSession()).data.session;

        const response = await fetch('/api/conversations/message', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${currentSession?.access_token}`
            },
            body: JSON.stringify({
                conversationId,
                content,
                messageType,
                metadata
            })
        });

        if (!response.ok) {
            throw new Error(await response.text());
        }

        return await response.json();
    },

    // Upload File to Supabase Storage
    async uploadFile(file: File, conversationId: string): Promise<{ file_url: string; file_name: string; file_size: number; file_type: string }> {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) throw new Error('User not authenticated');

        // Sanitize filename
        const fileExt = file.name.split('.').pop();
        const safeFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
        const filePath = `${conversationId}/${Date.now()}-${safeFileName}`;
        
        const { error: uploadError } = await supabase.storage
            .from('chat_vault')
            .upload(filePath, file);

        if (uploadError) {
            throw uploadError;
        }

        // Generate Signed URL (valid for 1 year = 31536000 seconds)
        // Since we want these links to be persistent in the chat history
        const { data } = await supabase.storage
            .from('chat_vault')
            .createSignedUrl(filePath, 31536000, {
                download: file.name
            });

        const signedUrl = data?.signedUrl;

        if (!signedUrl) throw new Error('Failed to generate signed URL');

        return {
            file_url: signedUrl,
            file_name: file.name,
            file_size: file.size,
            file_type: file.type
        };
    },

    // Mark as Read
    async markAsRead(conversationId: string): Promise<void> {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return;

        await supabase
            .from('messages')
            .update({ is_read: true })
            .eq('conversation_id', conversationId)
            .neq('sender_id', session.user.id);
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
