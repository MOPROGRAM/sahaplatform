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
            console.error('❌ MISSING SUPABASE ENVIRONMENT VARIABLES FOR ADS/MY');
            console.error('NEXT_PUBLIC_SUPABASE_URL:', !!supabaseUrl);
            console.error('SUPABASE_SERVICE_ROLE_KEY:', !!supabaseServiceKey);

            return new Response(JSON.stringify({
                error: 'Server configuration error: Missing Supabase credentials',
                details: 'Please set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in Cloudflare Pages Environment Variables',
                setup_instructions: {
                    step1: 'Go to Cloudflare Pages Dashboard',
                    step2: 'Select your Saha Platform project',
                    step3: 'Go to Settings > Environment variables',
                    step4: 'Add these variables:',
                    variables: {
                        NEXT_PUBLIC_SUPABASE_URL: 'your_supabase_project_url',
                        SUPABASE_SERVICE_ROLE_KEY: 'your_supabase_service_role_key'
                    }
                }
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

        // First check if ads table exists and is accessible
        console.log('🔍 Checking if ads table exists for ads/my...');
        const { data: tableCheck, error: tableError } = await supabaseAdmin
            .from('ads')
            .select('id')
            .limit(1);

        if (tableError) {
            console.error('❌ ADS TABLE ACCESS ERROR FOR ADS/MY:', tableError);
            return new Response(JSON.stringify({
                error: 'Database table access error',
                details: 'Unable to access ads table. Please check if the table exists in Supabase.',
                supabase_error: tableError.message,
                code: tableError.code,
                possible_solutions: [
                    '1. Check if ads table exists in Supabase dashboard',
                    '2. Verify RLS policies allow service role access',
                    '3. Check if service role key has correct permissions'
                ]
            }), {
                status: 500,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        console.log('✅ Ads table is accessible for ads/my');

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
            console.error('🛑 Error hint:', error.hint);

            // Check for common issues
            let additional_help = '';
            if (error.message?.includes('permission denied')) {
                additional_help = 'RLS Policy Issue: Check if ads table allows SELECT for authenticated users';
            } else if (error.message?.includes('does not exist')) {
                additional_help = 'Table Missing: Create ads table in Supabase or run migrations';
            }

            return new Response(JSON.stringify({
                error: 'Failed to fetch ads',
                supabase_error: error.message,
                code: error.code,
                details: error.details,
                hint: error.hint,
                additional_help: additional_help,
                user_id: user.id,
                troubleshooting: {
                    '1_check_table': 'Verify ads table exists in Supabase dashboard',
                    '2_check_rls': 'Check RLS policies allow SELECT for authenticated users',
                    '3_check_user': 'Verify user exists and has ads',
                    '4_check_fields': 'Ensure field names match database schema'
                }
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