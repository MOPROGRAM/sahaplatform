import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const runtime = 'edge';
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!; // Use Service Role to bypass RLS if needed, or Anon if using getUser
  
  // We need to identify the user. 
  // Since this is called by SW, we don't have cookies in the same way, 
  // BUT the SW fetch *should* include cookies if same-origin.
  // However, in Edge Runtime/SW context, auth might be tricky.
  // Alternative: Pass user_id as query param? insecure.
  // Best practice: The SW request includes cookies. supabase.auth.getUser() should work if headers are passed.
  
  const supabase = createClient(supabaseUrl, supabaseKey);

  // Attempt to get user from auth header or cookies
  // For simplicity in this specific "latest" endpoint which is often public/protected by cookies:
  // We will assume the request has the necessary cookies.
  
  // Create a client that uses the request headers (cookies)
  const supabaseWithAuth = createClient(supabaseUrl, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    auth: {
      persistSession: false,
    },
    global: {
      headers: {
        cookie: request.headers.get('cookie') || '',
      },
    },
  });

  const { data: { user } } = await supabaseWithAuth.auth.getUser();

  if (!user) {
    return NextResponse.json({ 
      title: 'Saha Platform', 
      message: 'You have new activity',
      data: { url: '/login' }
    });
  }

  // 1. Check for unread messages (High Priority)
  const { data: messages } = await supabase
    .from('messages')
    .select('*, sender:users!messages_sender_id_fkey(name)')
    .eq('receiver_id', user.id)
    .eq('is_read', false)
    .order('created_at', { ascending: false })
    .limit(1);

  if (messages && messages.length > 0) {
    const msg = messages[0];
    const senderName = msg.sender?.name || 'Someone';
    return NextResponse.json({
      title: `New message from ${senderName}`,
      message: msg.content.substring(0, 50) + (msg.content.length > 50 ? '...' : ''),
      data: { url: `/messages?id=${msg.conversation_id}` }
    });
  }

  // 2. Check for recent Ad updates (System Alerts) - Last 5 minutes
  const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
  
  const { data: ads } = await supabase
    .from('ads')
    .select('title, is_active')
    .eq('author_id', user.id)
    .gt('updated_at', fiveMinutesAgo)
    .order('updated_at', { ascending: false })
    .limit(1);

  if (ads && ads.length > 0) {
    const ad = ads[0];
    const status = ad.is_active ? 'approved' : 'updated';
    return NextResponse.json({
      title: 'Ad Status Update',
      message: `Your ad "${ad.title}" has been ${status}.`,
      data: { url: '/ads/my' }
    });
  }

  // 3. Fallback
  return NextResponse.json({
    title: 'Saha Platform',
    message: 'You have new notifications',
    data: { url: '/notifications' }
  });
}
