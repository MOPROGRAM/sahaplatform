import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { sendPushNotification } from '@/lib/push-sender';

export const runtime = 'edge';
export const dynamic = 'force-dynamic';

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Configure VAPID keys
const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY;

// Send push notification
export async function POST(request: NextRequest) {
  if (!vapidPublicKey || !vapidPrivateKey) {
     return NextResponse.json(
        { error: 'VAPID keys not configured' },
        { status: 500 }
      );
  }

  try {
    const { userId, title, body, data = {} } = await request.json();

    if (!userId || !title) {
      return NextResponse.json(
        { error: 'Missing userId or title' },
        { status: 400 }
      );
    }

    // Get user's push subscription
    const { data: subscriptionData, error: subscriptionError } = await supabase
      .from('push_subscriptions')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (subscriptionError || !subscriptionData) {
      return NextResponse.json(
        { error: 'User not subscribed to push notifications' },
        { status: 404 }
      );
    }

    const subscription = subscriptionData.subscription;

    // Store notification in database FIRST
    const { error: notificationError } = await supabase
      .from('notifications')
      .insert({
        user_id: userId,
        title,
        message: body,
        type: 'push',
        data: data,
        is_read: false,
        created_at: new Date().toISOString()
      });

    if (notificationError) {
      console.error('Failed to store notification:', notificationError);
    }

    // Send push notification using Edge-compatible custom sender
    // Note: Payload is not sent due to encryption complexity in Edge. 
    // SW will fetch details or show generic message.
    try {
      await sendPushNotification(
        subscription,
        null, // No payload
        {
            publicKey: vapidPublicKey,
            privateKey: vapidPrivateKey,
            subject: 'mailto:support@sahaplatform.com'
        }
      );

      return NextResponse.json({
        success: true,
        message: 'Push notification sent successfully'
      });

    } catch (pushError: any) {
      // Handle specific push errors
      if (pushError.message === 'Subscription expired') {
        // Subscription expired, remove it
        await supabase
          .from('push_subscriptions')
          .delete()
          .eq('user_id', userId);

        return NextResponse.json(
          { error: 'Subscription expired and removed' },
          { status: 410 }
        );
      }

      console.error('Push notification failed:', pushError);
      return NextResponse.json(
        { error: 'Failed to send push notification', details: pushError.message },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('Send notification error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Broadcast notification to multiple users
export async function PUT(request: NextRequest) {
  if (!vapidPublicKey || !vapidPrivateKey) {
     return NextResponse.json(
        { error: 'VAPID keys not configured' },
        { status: 500 }
      );
  }

  try {
    const { userIds, title, body, data = {} } = await request.json();

    if (!userIds || !Array.isArray(userIds) || !title) {
      return NextResponse.json(
        { error: 'Missing userIds or title' },
        { status: 400 }
      );
    }

    let successCount = 0;

    // Get all subscriptions for the users
    const { data: subscriptions, error } = await supabase
      .from('push_subscriptions')
      .select('*')
      .in('user_id', userIds);

    if (error) {
      return NextResponse.json(
        { error: 'Failed to fetch subscriptions' },
        { status: 500 }
      );
    }

    // Store notifications first
    const notificationsToInsert = userIds.map(uid => ({
        user_id: uid,
        title,
        message: body,
        type: 'push',
        data: data,
        is_read: false,
        created_at: new Date().toISOString()
    }));
    
    await supabase.from('notifications').insert(notificationsToInsert);

    // Send notifications to all subscribers
    for (const subscriptionData of subscriptions || []) {
      try {
        await sendPushNotification(
          subscriptionData.subscription,
          null,
          {
            publicKey: vapidPublicKey,
            privateKey: vapidPrivateKey,
            subject: 'mailto:support@sahaplatform.com'
          }
        );

        successCount++;

      } catch (e) {
        console.error(`Failed to send to user ${subscriptionData.user_id}`, e);
      }
    }

    return NextResponse.json({
      success: true,
      successCount,
      total: userIds.length
    });

  } catch (error) {
    console.error('Broadcast error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}