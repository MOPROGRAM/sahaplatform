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

        const { data: conversation, error } = await supabaseAdmin
            .from('conversation')
            .select(`
                id,
                adid,
                buyerid,
                sellerid,
                createdat,
                Ad:adid (
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
        if (conversation.buyerid !== user.id && conversation.sellerid !== user.id) {
            return new Response(JSON.stringify({ error: 'Unauthorized' }), {
                status: 403,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        // Get messages
        const { data: messages } = await supabaseAdmin
            .from('message')
            .select(`
                id,
                content,
                messagetype,
                createdat,
                senderid,
                users:senderid (
                    name
                )
            `)
            .eq('conversationid', conversationId)
            .order('createdat', { ascending: true });

        // Get participants
        const participants = [];
        if (conversation.buyerid) {
            const { data: buyer } = await supabaseAdmin.from('users').select('id, name, role').eq('id', conversation.buyerid).single();
            if (buyer) participants.push(buyer);
        }
        if (conversation.sellerid) {
            const { data: seller } = await supabaseAdmin.from('users').select('id, name, role').eq('id', conversation.sellerid).single();
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