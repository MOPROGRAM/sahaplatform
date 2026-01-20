export const runtime = 'edge';

import { createClient } from '@supabase/supabase-js';

export async function GET(request: Request, { params }: { params: { id: string } }) {
    const conversationId = params.id;

    try {
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

        // Check if user is part of the conversation
        const { data: conversation, error: convError } = await supabaseAdmin
            .from('Conversation')
            .select('buyerId, sellerId')
            .eq('id', conversationId)
            .single();

        if (convError || !conversation) {
            return new Response(JSON.stringify({ error: 'Conversation not found' }), {
                status: 404,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        if (conversation.buyerId !== user.id && conversation.sellerId !== user.id) {
            return new Response(JSON.stringify({ error: 'Unauthorized' }), {
                status: 403,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        // Fetch messages
        const { data: messages, error: msgError } = await supabaseAdmin
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

        if (msgError) {
            return new Response(JSON.stringify({ error: msgError.message }), {
                status: 500,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        return Response.json(messages);
    } catch (err) {
        return new Response(JSON.stringify({ error: 'Internal server error' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}

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

        const userId = user.id;

        // Check if user is part of the conversation
        const { data: conversation, error: convError } = await supabaseAdmin
            .from('Conversation')
            .select('buyerId, sellerId')
            .eq('id', conversationId)
            .single();

        if (convError || !conversation) {
            return new Response(JSON.stringify({ error: 'Conversation not found' }), {
                status: 404,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        if (conversation.buyerId !== userId && conversation.sellerId !== userId) {
            return new Response(JSON.stringify({ error: 'Unauthorized' }), {
                status: 403,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        // Create message
        const { data: message, error } = await supabaseAdmin
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