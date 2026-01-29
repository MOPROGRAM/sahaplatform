import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';

export async function POST(request: NextRequest) {
    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    try {
        const { adId, days, userId } = await request.json();

        if (!adId || !days || !userId) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // Check daily promoted ad limit (max 40 active promoted ads)
        const { count, error: countError } = await supabase
            .from('ads')
            .select('*', { count: 'exact', head: true })
            .eq('is_boosted', true)
            .gt('boosted_until', new Date().toISOString());
        
        if (countError) throw countError;
        
        if ((count || 0) >= 40) {
            return NextResponse.json({ 
                error: 'Daily promotion limit reached. Please try again later.',
                code: 'LIMIT_REACHED'
            }, { status: 429 });
        }

        const cost = parseInt(days) * 1; // 1 point per day

        // Get user points
        const { data: user, error: userError } = await supabase
            .from('users')
            .select('points')
            .eq('id', userId)
            .single();

        if (userError || !user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        if ((user.points || 0) < cost) {
            return NextResponse.json({ error: 'Insufficient points' }, { status: 400 });
        }

        // 1. Deduct points
        const { error: updateError } = await supabase
            .from('users')
            .update({ points: (user.points || 0) - cost })
            .eq('id', userId);

        if (updateError) throw updateError;

        // 2. Update Ad
        // Calculate new expiry. If already boosted and future, add days. Else now + days.
        const { data: ad } = await supabase.from('ads').select('boosted_until').eq('id', adId).single();
        
        let newExpiry = new Date();
        if (ad?.boosted_until && new Date(ad.boosted_until) > new Date()) {
             newExpiry = new Date(ad.boosted_until);
        }
        newExpiry.setDate(newExpiry.getDate() + parseInt(days));

        const { error: adError } = await supabase
            .from('ads')
            .update({ 
                is_boosted: true, 
                boosted_until: newExpiry.toISOString() 
            })
            .eq('id', adId);

        if (adError) {
            // Refund points if ad update fails
            await supabase.from('users').update({ points: user.points }).eq('id', userId);
            throw adError;
        }

        return NextResponse.json({ success: true, newPoints: (user.points || 0) - cost });

    } catch (error: any) {
        console.error('Promotion error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
