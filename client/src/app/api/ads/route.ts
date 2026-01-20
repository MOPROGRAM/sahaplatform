export const runtime = 'edge';

import { createClient } from '@supabase/supabase-js';

export async function POST(request: Request) {
    console.log('🚀 ADS API CALLED - Starting request processing');

    try {
        // Check environment variables
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

        console.log('🔍 Environment check:');
        console.log('NEXT_PUBLIC_SUPABASE_URL exists:', !!supabaseUrl);
        console.log('NEXT_PUBLIC_SUPABASE_URL value:', supabaseUrl ? 'SET' : 'NOT SET');
        console.log('SUPABASE_SERVICE_ROLE_KEY exists:', !!supabaseServiceKey);
        console.log('SUPABASE_SERVICE_ROLE_KEY value:', supabaseServiceKey ? 'SET' : 'NOT SET');

        if (!supabaseUrl || !supabaseServiceKey) {
            console.error('❌ MISSING SUPABASE ENVIRONMENT VARIABLES');
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

        const formData = await request.json();

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
        console.log('Verifying JWT token...');

        const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);

        console.log('Auth result:', {
            hasUser: !!user,
            userId: user?.id,
            authError: authError?.message
        });

        if (authError || !user) {
            console.error('Authentication failed:', authError);
            return new Response(JSON.stringify({
                error: 'Authentication required',
                details: authError?.message
            }), {
                status: 401,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        // Validate required fields
        console.log('Received formData:', formData);

        if (!formData.title || !formData.category || formData.price === undefined || formData.price === null) {
            return new Response(JSON.stringify({
                error: 'Missing required fields',
                received: {
                    title: formData.title,
                    category: formData.category,
                    price: formData.price,
                    hasTitle: !!formData.title,
                    hasCategory: !!formData.category,
                    hasPrice: formData.price !== undefined && formData.price !== null
                }
            }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        // Validate user ID
        if (!user.id) {
            console.error('❌ Invalid user authentication - no user ID');
            return new Response(JSON.stringify({ error: 'Invalid user authentication' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        console.log('✅ User authenticated:', user.id);

        // Optional: Verify user exists in users table (for foreign key safety)
        try {
            const { data: userCheck, error: userCheckError } = await supabaseAdmin
                .from('users')
                .select('id')
                .eq('id', user.id)
                .single();

            if (userCheckError && !userCheckError.message.includes('No rows found')) {
                console.warn('⚠️ Could not verify user in users table:', userCheckError.message);
            } else {
                console.log('✅ User verified in users table');
            }
        } catch (verifyError) {
            console.warn('⚠️ User verification skipped:', verifyError);
        }

        // Prepare ad data according to database schema
        const adData = {
            title: String(formData.title).trim(),
            description: formData.description ? String(formData.description).trim() : null,
            price: Number(formData.price) || 0,
            category: String(formData.category),
            location: formData.location ? String(formData.location).trim() : null,
            images_urls: formData.imageUrls && Array.isArray(formData.imageUrls) ? formData.imageUrls : null,
            user_id: user.id, // Correct field name
        };

        // Test with minimal data first (without user_id to check foreign key)
        const testAdData = {
            title: String(formData.title).trim(),
            category: String(formData.category),
            price: Number(formData.price) || 0,
        };

        console.log('🧪 Testing insert with minimal data (no user_id):', JSON.stringify(testAdData, null, 2));

        const { data: testAd, error: testInsertError } = await supabaseAdmin
            .from('ads')
            .insert(testAdData)
            .select()
            .single();

        console.log('🧪 Minimal insert result:', { data: testAd, error: testInsertError });

        // If minimal insert failed, stop here
        if (testInsertError) {
            console.error('🛑 Minimal insert failed, stopping...');
            // Clean up the test record if it was created
            if (testAd?.id) {
                await supabaseAdmin.from('ads').delete().eq('id', testAd.id);
            }
        }

        console.log('📝 Creating ad with data:', JSON.stringify(adData, null, 2));
        console.log('👤 User ID:', user.id);
        console.log('📋 Form data received:', JSON.stringify(formData, null, 2));
        console.log('🔗 Supabase URL:', supabaseUrl);

        // First, let's test if we can read from the table
        console.log('🧪 Testing table access...');
        const { data: testData, error: testError } = await supabaseAdmin
            .from('ads')
            .select('id')
            .limit(1);

        console.log('🧪 Table test result:', { data: testData, error: testError });

        // First check if ads table exists and is accessible
        console.log('🔍 Checking if ads table exists...');
        const { data: tableCheck, error: tableError } = await supabaseAdmin
            .from('ads')
            .select('id')
            .limit(1);

        if (tableError) {
            console.error('❌ ADS TABLE ACCESS ERROR:', tableError);
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

        console.log('✅ Ads table is accessible');

        // Insert ad into correct table
        console.log('💾 Attempting to insert into ads table...');

        const { data: ad, error } = await supabaseAdmin
            .from('ads') // Correct table name (lowercase)
            .insert(adData)
            .select()
            .single();

        console.log('📊 Insert result - Data:', ad);
        console.log('❌ Insert result - Error:', error);

        if (error) {
            console.error('🛑 SUPABASE ERROR - Creating ad:', error);
            console.error('🛑 Error message:', error.message);
            console.error('🛑 Error code:', error.code);
            console.error('🛑 Error details:', error.details);
            console.error('🛑 Error hint:', error.hint);
            console.error('🛑 Ad data that caused error:', adData);

            // Check for common issues
            let additional_help = '';
            if (error.message?.includes('permission denied')) {
                additional_help = 'RLS Policy Issue: Check if ads table allows INSERT for authenticated users';
            } else if (error.message?.includes('does not exist')) {
                additional_help = 'Table Missing: Create ads table in Supabase or run migrations';
            } else if (error.message?.includes('foreign key')) {
                additional_help = 'Foreign Key Error: User ID may not exist in users table';
            }

            // Return detailed error for debugging
            return new Response(JSON.stringify({
                error: 'Failed to create ad',
                supabase_error: error.message,
                code: error.code,
                details: error.details,
                hint: error.hint,
                additional_help: additional_help,
                ad_data: adData,
                troubleshooting: {
                    '1_check_table': 'Verify ads table exists in Supabase dashboard',
                    '2_check_rls': 'Check RLS policies allow INSERT for authenticated users',
                    '3_check_user': 'Verify user exists in auth.users table',
                    '4_check_fields': 'Ensure all field types match database schema'
                }
            }), {
                status: 500,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        return Response.json(ad);
    } catch (err) {
        console.error('💥 CRITICAL ERROR in ads API:', err);
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