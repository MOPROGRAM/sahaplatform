export const runtime = 'edge';

import { createClient } from '@supabase/supabase-js';

export async function GET(request: Request) {
    try {
        // Create admin client for server-side operations
        const supabaseAdmin = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!
        );

        // Get all conversations for user (requires auth token in header)
        const authHeader = request.headers.get('Authorization');
        if (!authHeader) {
            return new Response(JSON.stringify({ error: 'Authentication required' }), {
                status: 401,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        // Verify JWT token using admin client
        const token = authHeader.replace('Bearer ', '');
        const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
        if (authError || !user) {
            return new Response(JSON.stringify({ error: 'Authentication required' }), {
                status: 401,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        const { data: conversations } = await supabaseAdmin
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
            .or(`buyerid.eq.${user.id},sellerid.eq.${user.id}`)
            .order('createdat', { ascending: false });

        return Response.json({ conversations: conversations || [] });
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

        // Verify JWT token using admin client
        const token = authHeader.replace('Bearer ', '');
        const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
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
            .from('conversation')
            .select('id')
            .eq('adid', adId)
            .or(`buyerid.eq.${buyerId},sellerid.eq.${buyerId}`)
            .or(`buyerid.eq.${sellerId},sellerid.eq.${sellerId}`)
            .single();

        if (existingConversation) {
            return Response.json(existingConversation);
        }

        // Create new conversation
        const { data: newConversation, error } = await supabaseAdmin
            .from('conversation')
            .insert({
                adid: adId,
                buyerid: buyerId,
                sellerid: sellerId,
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