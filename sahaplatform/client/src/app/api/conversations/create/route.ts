
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
        const { adId, participantId } = body;

        // Use RPC to create/get conversation
        const { data: convId, error: rpcError } = await supabaseAdmin
            .rpc('create_new_conversation', {
                p_ad_id: adId,
                p_other_user_id: participantId
            });

        if (rpcError) {
             console.warn('RPC create_new_conversation failed, trying manual logic:', rpcError);
        }

        let conversationId = convId;

        // Fallback Manual Logic if RPC failed or didn't return ID
        if (!conversationId) {
             // 1. Check existing
             const { data: myParticipations } = await supabaseAdmin
                .from('conversation_participants')
                .select('conversation_id')
                .eq('user_id', user.id);
             
             const myConvIds = myParticipations?.map((p: any) => p.conversation_id) || [];
             
             if (myConvIds.length > 0) {
                 const { data: candidates } = await supabaseAdmin
                    .from('conversations')
                    .select('id')
                    .eq('ad_id', adId)
                    .in('id', myConvIds);
                 
                 const candidateIds = candidates?.map((c: any) => c.id) || [];
                 if (candidateIds.length > 0) {
                     const { data: common } = await supabaseAdmin
                        .from('conversation_participants')
                        .select('conversation_id')
                        .eq('user_id', participantId)
                        .in('conversation_id', candidateIds)
                        .limit(1)
                        .maybeSingle();
                     
                     if (common) conversationId = common.conversation_id;
                 }
             }
        }

        // 2. Create New if not found
        if (!conversationId) {
            const { data: newConversation, error: createError } = await supabaseAdmin
                .from('conversations')
                .insert({ ad_id: adId })
                .select()
                .single();
            
            if (createError) throw createError;
            conversationId = newConversation.id;

            // Add Participants
            const { error: partError } = await supabaseAdmin
                .from('conversation_participants')
                .insert([
                    { conversation_id: conversationId, user_id: user.id },
                    { conversation_id: conversationId, user_id: participantId }
                ]);
            
            if (partError) {
                // Rollback
                await supabaseAdmin.from('conversations').delete().eq('id', conversationId);
                throw partError;
            }
        }

        // Return Full Conversation
        const { data: conversation, error: convError } = await supabaseAdmin
            .from('conversations')
            .select(`
                *,
                ad:ads(id, title, images)
            `)
            .eq('id', conversationId)
            .single();
            
        if (convError) throw convError;

        const { data: participants } = await supabaseAdmin
            .from('conversation_participants')
            .select('user:users!user_id(id, name, email)')
            .eq('conversation_id', conversationId);

        return NextResponse.json({
            ...conversation,
            participants: participants?.map((p: any) => p.user) || []
        });

    } catch (error: any) {
        console.error('API Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
