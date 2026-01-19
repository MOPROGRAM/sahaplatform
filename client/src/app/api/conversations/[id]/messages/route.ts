export const runtime = 'edge';

import { supabase } from '@/lib/supabase';

export async function POST(request: Request, { params }: { params: { id: string } }) {
    const conversationId = params.id;

    try {
        const { content, messageType = 'text' } = await request.json();

        if (!content) {
            return new Response(JSON.stringify({ error: 'Content is required' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        // Get authenticated user
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            return new Response(JSON.stringify({ error: 'Authentication required' }), {
                status: 401,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        // Verify user is part of conversation
        const { data: conversation } = await supabase
            .from('Conversation')
            .select('buyerId, sellerId')
            .eq('id', conversationId)
            .single();

        if (!conversation || (conversation.buyerId !== user.id && conversation.sellerId !== user.id)) {
            return new Response(JSON.stringify({ error: 'Access denied' }), {
                status: 403,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        // Create message
        const { data: message, error } = await supabase
            .from('Message')
            .insert({
                conversationId,
                senderId: user.id,
                content,
                messageType,
            })
            .select(`
                id,
                content,
                messageType,
                createdAt,
                senderId,
                User:senderId (
                    name
                )
            `)
            .single();

        if (error) {
            return new Response(JSON.stringify({ error: error.message }), {
                status: 500,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        return Response.json(message);
    } catch (err) {
        return new Response(JSON.stringify({ error: 'Internal server error' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}