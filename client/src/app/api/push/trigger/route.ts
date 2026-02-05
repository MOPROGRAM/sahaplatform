import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { sendPushNotification } from '@/lib/push-sender';

export const runtime = 'edge';
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const { receiverId, type } = await request.json();

    if (!receiverId) {
      return NextResponse.json({ error: 'Receiver ID is required' }, { status: 400 });
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Get push subscriptions for the user
    const { data: subscriptions } = await supabase
      .from('push_subscriptions')
      .select('*')
      .eq('user_id', receiverId);

    if (!subscriptions || subscriptions.length === 0) {
      return NextResponse.json({ message: 'No subscriptions found' });
    }

    const vapidKeys = {
      publicKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
      privateKey: process.env.VAPID_PRIVATE_KEY!,
      subject: process.env.VAPID_SUBJECT!
    };

    const results = await Promise.allSettled(
      subscriptions.map(async (sub) => {
        const subscriptionData = typeof sub.data === 'string' ? JSON.parse(sub.data) : sub.data;
        
        try {
          // Send "Tickle" notification (payload: null)
          // The Service Worker will fetch the details from /api/notifications/latest
          await sendPushNotification(subscriptionData, null, vapidKeys);
          return { status: 'fulfilled', id: sub.id };
        } catch (error: any) {
          if (error.message === 'Subscription expired') {
            await supabase.from('push_subscriptions').delete().eq('id', sub.id);
          }
          throw error;
        }
      })
    );

    return NextResponse.json({ 
      success: true, 
      results: results.map(r => r.status) 
    });

  } catch (error: any) {
    console.error('Trigger error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
