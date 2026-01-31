
import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

// Initialize Supabase Admin Client (Service Role)
const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: Request) {
    try {
        // Verify User (we still need to know WHO is asking)
        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        );
        
        // We can get the user from the header or cookie, 
        // but since we are in an API route called by the client,
        // we should verify the auth token.
        // Simplified: We'll assume the client sends the access_token in Authorization header
        const authHeader = request.headers.get('Authorization');
        if (!authHeader) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        
        const token = authHeader.replace('Bearer ', '');
        const { data: { user }, error: authError } = await supabase.auth.getUser(token);

        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Now use Admin Client to fetch data bypassing RLS
        
        // 1. Get Conversation IDs for this user
        const { data: participations, error: partError } = await supabaseAdmin
            .from('conversation_participants')
            .select('conversation_id')
            .eq('user_id', user.id);

        if (partError) throw partError;
        
        const conversationIds = participations.map(p => p.conversation_id);
        
        if (conversationIds.length === 0) {
            return NextResponse.json([]);
        }

        // 2. Fetch Conversations with details
        const { data: conversations, error: convError } = await supabaseAdmin
            .from('conversations')
            .select(`
                *,
                ad:ads(id, title, images),
                participants:conversation_participants(
                    user:users!user_id(id, name, email)
                )
            `)
            .in('id', conversationIds)
            .order('last_message_time', { ascending: false });

        if (convError) throw convError;

        // Transform Data
        const formatted = conversations.map(conv => ({
            ...conv,
            participants: conv.participants.map((p: any) => p.user)
        }));

        return NextResponse.json(formatted);

    } catch (error: any) {
        console.error('API Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
