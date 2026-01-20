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

        // Verify JWT token using admin client
        const token = authHeader.replace('Bearer ', '');
        const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
        if (authError || !user) {
            return new Response(JSON.stringify({ error: 'Authentication required' }), {
                status: 401,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        // Check if user is part of the conversation
        const { data: conversation, error: convError } = await supabaseAdmin
            .from('conversation')
            .select('buyerid, sellerid')
            .eq('id', conversationId)
            .single();

        if (convError || !conversation) {
            return new Response(JSON.stringify({ error: 'Conversation not found' }), {
                status: 404,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        if (conversation.buyerid !== user.id && conversation.sellerid !== user.id) {
            return new Response(JSON.stringify({ error: 'Unauthorized' }), {
                status: 403,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        // Fetch messages
        const { data: messages, error: msgError } = await supabaseAdmin
            .from('message')
            .select(`
                id,
                content,
                messagetype,
                createdat,
                senderid
            `)
            .eq('conversationid', conversationId)
            .order('createdat', { ascending: true });

        // Get sender names for messages
        if (messages && messages.length > 0 && !msgError) {
            const senderIds = Array.from(new Set(messages.map(m => m.senderid)));
            const { data: users } = await supabaseAdmin
                .from('users')
                .select('id, name')
                .in('id', senderIds);

            const userMap = {};
            if (users) {
                users.forEach(user => {
                    userMap[user.id] = user.name;
                });
            }

            messages.forEach(message => {
                message.User = { name: userMap[message.senderid] || 'Unknown' };
            });
        }

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

        // Verify JWT token using admin client
        const token = authHeader.replace('Bearer ', '');
        const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
        if (authError || !user) {
            return new Response(JSON.stringify({ error: 'Authentication required' }), {
                status: 401,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        const userId = user.id;

        // Check if user is part of the conversation
        const { data: conversation, error: convError } = await supabaseAdmin
            .from('conversation')
            .select('buyerid, sellerid')
            .eq('id', conversationId)
            .single();

        if (convError || !conversation) {
            return new Response(JSON.stringify({ error: 'Conversation not found' }), {
                status: 404,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        if (conversation.buyerid !== userId && conversation.sellerid !== userId) {
            return new Response(JSON.stringify({ error: 'Unauthorized' }), {
                status: 403,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        // Create message
        const { data: message, error } = await supabaseAdmin
            .from('message')
            .insert({
                conversationid: conversationId,
                senderid: userId,
                content,
                messagetype: messageType,
            })
            .select(`
                id,
                content,
                messagetype,
                createdat,
                senderid
            `)
            .single();

        // Get sender name
        if (message && !error) {
            const { data: user } = await supabaseAdmin
                .from('users')
                .select('name')
                .eq('id', userId)
                .single();

            message.User = { name: user?.name || 'Unknown' };
        }

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