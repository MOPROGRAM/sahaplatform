import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const runtime = 'edge';

export async function POST(request: NextRequest) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    try {
        const authHeader = request.headers.get('Authorization');
        if (!authHeader) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        
        const { data: { user }, error: authError } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));
        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const currentUserId = user.id;

        // Find Admin User by email
        // Note: We query the 'users' table which mirrors auth users
        const { data: adminUser, error: adminError } = await supabase
            .from('users') 
            .select('id')
            .eq('email', 'motwasel@yahoo.com')
            .single();

        if (adminError || !adminUser) {
            console.error('Admin user not found:', adminError);
            return NextResponse.json({ error: 'Support service unavailable' }, { status: 404 });
        }
        
        const adminId = adminUser.id;

        // Prevent admin from chatting with themselves via this route
        if (currentUserId === adminId) {
             return NextResponse.json({ error: 'Admin cannot start support chat with self' }, { status: 400 });
        }

        // Check for existing support conversation (ad_id is null)
        // 1. Get conversations for current user
        const { data: userConvs } = await supabase
            .from('conversation_participants')
            .select('conversation_id')
            .eq('user_id', currentUserId);

        const userConvIds = userConvs?.map(c => c.conversation_id) || [];

        if (userConvIds.length > 0) {
            // 2. Check if admin is in any of these
            const { data: commonConvs } = await supabase
                .from('conversation_participants')
                .select('conversation_id')
                .eq('user_id', adminId)
                .in('conversation_id', userConvIds);

            if (commonConvs && commonConvs.length > 0) {
                const commonConvIds = commonConvs.map(c => c.conversation_id);
                
                // 3. Find one with ad_id IS NULL
                const { data: existingSupportConv } = await supabase
                    .from('conversations')
                    .select('id')
                    .in('id', commonConvIds)
                    .is('ad_id', null)
                    .limit(1)
                    .single();

                if (existingSupportConv) {
                    return NextResponse.json({ conversationId: existingSupportConv.id });
                }
            }
        }

        // Create new conversation
        const { data: newConv, error: createError } = await supabase
            .from('conversations')
            .insert({ 
                ad_id: null,
                last_message_time: new Date().toISOString()
            })
            .select()
            .single();

        if (createError) {
            console.error('Error creating conversation:', createError);
            throw createError;
        }

        // Add participants
        const { error: participantsError } = await supabase
            .from('conversation_participants')
            .insert([
                { conversation_id: newConv.id, user_id: currentUserId },
                { conversation_id: newConv.id, user_id: adminId }
            ]);

        if (participantsError) {
            console.error('Error adding participants:', participantsError);
            throw participantsError;
        }

        return NextResponse.json({ conversationId: newConv.id });

    } catch (error) {
        console.error('Support chat error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
