export const runtime = 'edge';

import { supabase } from '@/lib/supabase';

export async function GET(request: Request, { params }: { params: { id: string } }) {
    const conversationId = params.id;

    try {
        const { data: conversation, error } = await supabase
            .from('Conversation')
            .select(`
                id,
                adId,
                buyerId,
                sellerId,
                createdAt,
                Ad:adId (
                    id,
                    title
                )
            `)
            .eq('id', conversationId)
            .single();

        if (error || !conversation) {
            return new Response(JSON.stringify({ error: 'Conversation not found' }), {
                status: 404,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        // Get messages
        const { data: messages } = await supabase
            .from('Message')
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
            .eq('conversationId', conversationId)
            .order('createdAt', { ascending: true });

        // Get participants
        const participants = [];
        if (conversation.buyerId) {
            const { data: buyer } = await supabase.from('User').select('id, name, role').eq('id', conversation.buyerId).single();
            if (buyer) participants.push(buyer);
        }
        if (conversation.sellerId) {
            const { data: seller } = await supabase.from('User').select('id, name, role').eq('id', conversation.sellerId).single();
            if (seller) participants.push(seller);
        }

        return Response.json({
            ...conversation,
            messages: messages || [],
            participants,
            ad: conversation.Ad
        });
    } catch (err) {
        return new Response(JSON.stringify({ error: 'Internal server error' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}