export const runtime = 'edge';

import { createClient } from '@supabase/supabase-js';

export async function GET(request: Request) {
    try {
        // Create admin client for server-side operations
        const supabaseAdmin = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!
        );

        const url = new URL(request.url);
        const conversationId = url.pathname.split('/').pop();

        if (conversationId && conversationId !== 'conversations') {
            // Get authenticated user for specific conversation
            const authHeader = request.headers.get('Authorization');
            if (!authHeader) {
                return new Response(JSON.stringify({ error: 'Authentication required' }), {
                    status: 401,
                    headers: { 'Content-Type': 'application/json' }
                });
            }

            // Create user client to verify token
            const supabaseUser = createClient(
                process.env.NEXT_PUBLIC_SUPABASE_URL!,
                process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
            );
            supabaseUser.auth.setAuth(authHeader.replace('Bearer ', ''));

            const { data: { user }, error: authError } = await supabaseUser.auth.getUser();
            if (authError || !user) {
                return new Response(JSON.stringify({ error: 'Authentication required' }), {
                    status: 401,
                    headers: { 'Content-Type': 'application/json' }
                });
            }

            // Get specific conversation
            const { data: conversation, error } = await supabaseAdmin
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

            // Check if user is part of the conversation
            if (conversation.buyerId !== user.id && conversation.sellerId !== user.id) {
                return new Response(JSON.stringify({ error: 'Unauthorized' }), {
                    status: 403,
                    headers: { 'Content-Type': 'application/json' }
                });
            }

            // Get messages
            const { data: messages } = await supabaseAdmin
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
                const { data: buyer } = await supabaseAdmin.from('User').select('id, name, role').eq('id', conversation.buyerId).single();
                if (buyer) participants.push(buyer);
            }
            if (conversation.sellerId) {
                const { data: seller } = await supabaseAdmin.from('User').select('id, name, role').eq('id', conversation.sellerId).single();
                if (seller) participants.push(seller);
            }

            return Response.json({
                ...conversation,
                messages: messages || [],
                participants,
                ad: conversation.Ad
            });
        } else {
            // Get all conversations for user (requires auth token in header)
            const authHeader = request.headers.get('Authorization');
            if (!authHeader) {
                return new Response(JSON.stringify({ error: 'Authentication required' }), {
                    status: 401,
                    headers: { 'Content-Type': 'application/json' }
                });
            }

            // Create client with user token
            const supabaseUser = createClient(
                process.env.NEXT_PUBLIC_SUPABASE_URL!,
                process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
            );
            supabaseUser.auth.setAuth(authHeader.replace('Bearer ', ''));

            const { data: { user }, error: authError } = await supabaseUser.auth.getUser();
            if (authError || !user) {
                return new Response(JSON.stringify({ error: 'Authentication required' }), {
                    status: 401,
                    headers: { 'Content-Type': 'application/json' }
                });
            }

            const { data: conversations } = await supabaseAdmin
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
        }
    } catch (err) {
        return new Response(JSON.stringify({ error: 'Internal server error' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
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

        // Get authenticated user
        const authHeader = request.headers.get('Authorization');
        if (!authHeader) {
            return new Response(JSON.stringify({ error: 'Authentication required' }), {
                status: 401,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        // Create admin client for operations
        const supabaseAdmin = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!
        );

        // Create user client to verify token
        const supabaseUser = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        );
        supabaseUser.auth.setAuth(authHeader.replace('Bearer ', ''));

        const { data: { user }, error: authError } = await supabaseUser.auth.getUser();
        if (authError || !user) {
            return new Response(JSON.stringify({ error: 'Authentication required' }), {
                status: 401,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        const buyerId = user.id;
        const sellerId = participants[0];

        // Check if conversation already exists
        const { data: existingConversation } = await supabaseAdmin
            .from('Conversation')
            .select('id')
            .eq('adId', adId)
            .or(`buyerId.eq.${buyerId},sellerId.eq.${buyerId}`)
            .or(`buyerId.eq.${sellerId},sellerId.eq.${sellerId}`)
            .single();

        if (existingConversation) {
            return Response.json(existingConversation);
        }

        // Create new conversation
        const { data: newConversation, error } = await supabaseAdmin
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