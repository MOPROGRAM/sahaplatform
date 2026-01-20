export const runtime = 'edge';

import { createClient } from '@supabase/supabase-js';

export async function GET(request: Request) {
    console.log('🚀 ADS/MY API CALLED - Starting request processing');

    try {
        // Check environment variables
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

        console.log('🔍 Environment check for ads/my:');
        console.log('NEXT_PUBLIC_SUPABASE_URL exists:', !!supabaseUrl);
        console.log('SUPABASE_SERVICE_ROLE_KEY exists:', !!supabaseServiceKey);

        if (!supabaseUrl || !supabaseServiceKey) {
            console.error('Missing Supabase environment variables for ads/my');
            return new Response(JSON.stringify({
                error: 'Server configuration error',
                details: 'Missing Supabase credentials'
            }), {
                status: 500,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        // Get authenticated user
        const authHeader = request.headers.get('Authorization');
        if (!authHeader) {
            return new Response(JSON.stringify({ error: 'Authentication required' }), {
                status: 401,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        // Create admin client for operations
        const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

        // Verify JWT token using admin client
        const token = authHeader.replace('Bearer ', '');
        console.log('Verifying JWT token for ads/my...');

        const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);

        console.log('Auth result for ads/my:', {
            hasUser: !!user,
            userId: user?.id,
            authError: authError?.message
        });

        if (authError || !user) {
            console.error('Authentication failed for ads/my:', authError);
            return new Response(JSON.stringify({
                error: 'Authentication required',
                details: authError?.message
            }), {
                status: 401,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        // Get user's ads
        console.log('📝 Fetching ads for user:', user.id);
        console.log('🔗 Using Supabase URL:', supabaseUrl);

        const { data: ads, error } = await supabaseAdmin
            .from('ads')
            .select(`
                id,
                title,
                description,
                price,
                category,
                location,
                images_urls,
                created_at
            `)
            .eq('user_id', user.id)
            .order('created_at', { ascending: false });

        console.log('📊 Query result - Data:', ads);
        console.log('❌ Query result - Error:', error);

        if (error) {
            console.error('🛑 SUPABASE ERROR - Fetching user ads:', error);
            console.error('🛑 Error message:', error.message);
            console.error('🛑 Error code:', error.code);
            console.error('🛑 Error details:', error.details);

            return new Response(JSON.stringify({
                error: 'Failed to fetch ads',
                supabase_error: error.message,
                code: error.code,
                details: error.details
            }), {
                status: 500,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        // Always return an array
        const safeAds = Array.isArray(ads) ? ads : [];
        console.log('Returning ads for user:', user.id, 'Count:', safeAds.length);
        return Response.json(safeAds);
    } catch (err) {
        console.error('💥 CRITICAL ERROR in ads/my API:', err);
        console.error('💥 Error stack:', err.stack);
        console.error('💥 Error name:', err.name);
        console.error('💥 Error message:', err.message);

        return new Response(JSON.stringify({
            error: 'Internal server error',
            details: err.message,
            type: err.name
        }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}