export const runtime = 'edge';

import { supabase } from '@/lib/supabase';

export async function GET(request: Request) {
    // Temporarily bypass auth for testing
    return Response.json({ conversations: [] });
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
            .or(`buyerId.eq.${buyerId},sellerId.eq.${buyerId}`)
            .or(`buyerId.eq.${sellerId},sellerId.eq.${sellerId}`)
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