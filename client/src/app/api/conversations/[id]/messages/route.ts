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

        // TODO: Fix auth
        // For now, allow all
        const userId = 'temp-user-id';

        // Create message
        const { data: message, error } = await supabase
            .from('Message')
            .insert({
                conversationId,
                senderId: userId,
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