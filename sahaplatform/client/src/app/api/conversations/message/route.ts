
import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: Request) {
    try {
        const authHeader = request.headers.get('Authorization');
        if (!authHeader) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        
        const token = authHeader.replace('Bearer ', '');
        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        );
        const { data: { user }, error: authError } = await supabase.auth.getUser(token);

        if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const body = await request.json();
        const { conversationId, content, messageType, metadata, receiverId } = body;

        // Insert Message using Admin
        const { data: message, error: msgError } = await supabaseAdmin
            .from('messages')
            .insert({
                content,
                message_type: messageType,
                sender_id: user.id,
                receiver_id: receiverId,
                conversation_id: conversationId,
                ...metadata
            })
            .select(`
                *,
                sender:users!sender_id(id, name, email)
            `)
            .single();

        if (msgError) throw msgError;

        // Update conversation last message
        await supabaseAdmin
            .from('conversations')
            .update({
                last_message: content,
                last_message_time: new Date().toISOString(),
            })
            .eq('id', conversationId);

        return NextResponse.json(message);

    } catch (error: any) {
        console.error('API Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
