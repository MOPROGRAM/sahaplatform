export const runtime = 'edge';

import { supabase } from '@/lib/supabase';

export async function GET(request: Request) {
    const url = new URL(request.url);
    const conversationId = url.pathname.split('/').pop();

    if (conversationId && conversationId !== 'conversations') {
        // Get specific conversation
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
    } else {
        // Get all conversations for user
        try {
            const { data: { user }, error: authError } = await supabase.auth.getUser();
            if (authError || !user) {
                return new Response(JSON.stringify({ error: 'Authentication required' }), {
                    status: 401,
                    headers: { 'Content-Type': 'application/json' }
                });
            }

            const { data: conversations } = await supabase
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
                .or(`buyerId.eq.${user.id},sellerId.eq.${user.id}`)
                .order('createdAt', { ascending: false });

            return Response.json({ conversations: conversations || [] });
        } catch (err) {
            return new Response(JSON.stringify({ error: 'Internal server error' }), {
                status: 500,
                headers: { 'Content-Type': 'application/json' }
            });
        }
    }
}

export async function POST(request: Request) {
    try {
        const { adId, participants } = await request.json();

        if (!adId || !participants || !Array.isArray(participants) || participants.length === 0) {
            return new Response(JSON.stringify({ error: 'Invalid request data' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        // Get authenticated user from headers or session
        // For now, assume buyerId is provided or use a default
        // TODO: Fix auth in edge runtime
        const buyerId = 'temp-user-id'; // Replace with proper auth
        const sellerId = participants[0];

        // Check if conversation already exists
        const { data: existingConversation } = await supabase
            .from('Conversation')
            .select('id')
            .eq('adId', adId)
            .eq('buyerId', buyerId)
            .eq('sellerId', sellerId)
            .single();

        if (existingConversation) {
            return Response.json(existingConversation);
        }

        // Create new conversation
        const { data: newConversation, error } = await supabase
            .from('Conversation')
            .insert({
                adId,
                buyerId,
                sellerId,
            })
            .select()
            .single();

        if (error) {
            return new Response(JSON.stringify({ error: error.message }), {
                status: 500,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        return Response.json(newConversation);
    } catch (err) {
        return new Response(JSON.stringify({ error: 'Internal server error' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}