import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import webpush from 'web-push';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Configure web-push
// Note: In production, these keys should be strictly checked
const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY;

if (vapidPublicKey && vapidPrivateKey) {
  webpush.setVapidDetails(
    'mailto:support@sahaplatform.com',
    vapidPublicKey,
    vapidPrivateKey
  );
}

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

    // Prepare notification payload
    const payload = JSON.stringify({
      title,
      body,
      icon: '/icon-192x192.png',
      badge: '/icon-72x72.png',
      tag: 'saha-notification',
      data: {
        ...data,
        url: data.url || '/notifications',
        timestamp: new Date().toISOString()
      }
    });

    // Send push notification
    try {
      await webpush.sendNotification(
        subscription,
        payload
      );

      // Store notification in database
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

      return NextResponse.json({
        success: true,
        message: 'Push notification sent successfully'
      });

    } catch (pushError: any) {
      // Handle specific push errors
      if (pushError.statusCode === 410) {
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
        { error: 'Failed to send push notification' },
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
    let failureCount = 0;

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

    // Send notifications to all subscribers
    for (const subscriptionData of subscriptions || []) {
      try {
        const payload = JSON.stringify({
          title,
          body,
          icon: '/icon-192x192.png',
          badge: '/icon-72x72.png',
          tag: 'saha-broadcast',
          data: {
            ...data,
            url: data.url || '/notifications',
            timestamp: new Date().toISOString()
          }
        });

        await webpush.sendNotification(
          subscriptionData.subscription,
          payload
        );

        successCount++;

        // Store notification in database
        await supabase
          .from('notifications')
          .insert({
            user_id: subscriptionData.user_id,
            title,
            message: body,
            type: 'push',
            data: data,
            is_read: false,
            created_at: new Date().toISOString()
          });

      } catch (pushError: any) {
        failureCount++;
        
        // Handle expired subscriptions
        if (pushError.statusCode === 410) {
          await supabase
            .from('push_subscriptions')
            .delete()
            .eq('user_id', subscriptionData.user_id);
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Broadcast completed',
      successCount,
      failureCount,
      total: subscriptions?.length || 0
    });

  } catch (error) {
    console.error('Broadcast error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}