
import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const id = params.id;
        const authHeader = request.headers.get('Authorization');
        if (!authHeader) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        
        const token = authHeader.replace('Bearer ', '');
        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        );
        const { data: { user }, error: authError } = await supabase.auth.getUser(token);

        if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        // Check if user is participant
        const { data: isParticipant } = await supabaseAdmin
            .from('conversation_participants')
            .select('id')
            .eq('conversation_id', id)
            .eq('user_id', user.id)
            .single();

        if (!isParticipant) {
             return NextResponse.json({ error: 'Access denied' }, { status: 403 });
        }

        // Fetch Conversation
        const { data: conversation, error: convError } = await supabaseAdmin
            .from('conversations')
            .select(`
                *,
                ad:ads!fk_ad(id, title, images)
            `)
            .eq('id', id)
            .single();

        if (convError) throw convError;

        // Fetch Participants
        const { data: participants, error: partError } = await supabaseAdmin
            .from('conversation_participants')
            .select('user:users!fk_user(id, name, email)')
            .eq('conversation_id', id);

        if (partError) throw partError;

        // Fetch Messages
        const { data: messages, error: msgError } = await supabaseAdmin
            .from('messages')
            .select(`
                *,
                sender:users!fk_sender(id, name, email)
            `)
            .eq('conversation_id', id)
            .order('created_at', { ascending: true });

        if (msgError) throw msgError;

        return NextResponse.json({
            conversation: {
                ...conversation,
                participants: participants.map((p: any) => p.user)
            },
            messages: messages.map((m: any) => ({
                ...m,
                senderId: m.sender_id,
                receiverId: m.receiver_id,
                conversationId: m.conversation_id,
                messageType: m.message_type,
                createdAt: m.created_at,
                isRead: m.is_read
            }))
        });

    } catch (error: any) {
        console.error('API Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
