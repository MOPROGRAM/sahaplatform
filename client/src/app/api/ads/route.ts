export const runtime = 'edge';

import { createClient } from '@supabase/supabase-js';

export async function POST(request: Request) {
    console.log('🚀 ADS API POST REQUEST RECEIVED');

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

        // Validate required fields exactly matching database schema
        console.log('📋 RECEIVED PAYLOAD:', JSON.stringify(formData, null, 2));
        console.log('📋 Payload keys:', Object.keys(formData));
        console.log('📋 Payload types:', Object.fromEntries(
            Object.entries(formData).map(([k, v]) => [k, typeof v])
        ));

        // Expected database schema for comparison
        const expectedSchema = {
            title: 'string (required)',
            description: 'string | null',
            price: 'number | null (required)',
            category: 'string | null (required)',
            location: 'string | null',
            images_urls: 'string[] | null',
            user_id: 'string (auto-added)'
        };
        console.log('🎯 EXPECTED DATABASE SCHEMA:', expectedSchema);

        const validationErrors = [];

        if (!formData.title || typeof formData.title !== 'string' || formData.title.trim() === '') {
            validationErrors.push('title is required and must be a non-empty string');
        }

        if (!formData.category || typeof formData.category !== 'string' || formData.category.trim() === '') {
            validationErrors.push('category is required and must be a non-empty string');
        }

        if (formData.price === undefined || formData.price === null || isNaN(Number(formData.price))) {
            validationErrors.push('price is required and must be a valid number');
        }

        if (validationErrors.length > 0) {
            console.error('❌ Validation errors:', validationErrors);
            return new Response(JSON.stringify({
                error: 'Validation failed',
                validation_errors: validationErrors,
                received_data: formData
            }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        console.log('✅ Validation passed');

        // Validate user ID
        if (!user.id) {
            console.error('❌ Invalid user authentication - no user ID');
            return new Response(JSON.stringify({ error: 'Invalid user authentication' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        console.log('👤 USER AUTHENTICATION DETAILS:');
        console.log('👤 User ID:', user.id);
        console.log('👤 User ID type:', typeof user.id);
        console.log('👤 User ID length:', user.id?.length);
        console.log('👤 User ID format check (UUID):', /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(user.id));

        // Optional: Verify user exists in users table (for foreign key safety)
        try {
            const { data: userCheck, error: userCheckError } = await supabaseAdmin
                .from('users')
                .select('id')
                .eq('id', user.id)
                .single();

            console.log('👤 USER TABLE CHECK:');
            console.log('👤 User exists in users table:', !!userCheck);
            console.log('👤 User check error:', userCheckError?.message);

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

        console.log('📝 FINAL DATA TO INSERT:', JSON.stringify(adData, null, 2));
        console.log('📝 Data keys:', Object.keys(adData));
        console.log('📝 Data types:', Object.fromEntries(
            Object.entries(adData).map(([k, v]) => [k, Array.isArray(v) ? `array[${v.length}]` : typeof v])
        ));
        console.log('📝 Data values preview:', Object.fromEntries(
            Object.entries(adData).map(([k, v]) => [k, Array.isArray(v) ? v.slice(0, 2) : String(v).slice(0, 50)])
        ));
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

        console.log('🔄 About to execute Supabase insert...');

        const { data: ad, error } = await supabaseAdmin
            .from('ads') // Correct table name (lowercase)
            .insert(adData)
            .select()
            .single();

        console.log('📊 Insert result - Data:', ad);
        console.log('❌ Insert result - Raw Error Object:', JSON.stringify(error, null, 2));
        console.log('❌ Insert result - Error message:', error?.message);
        console.log('❌ Insert result - Error code:', error?.code);
        console.log('❌ Insert result - Error details:', error?.details);
        console.log('❌ Insert result - Error hint:', error?.hint);

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
        console.error('💥 Full error details:', JSON.stringify(err, null, 2));

        // If it's a Supabase error, extract more details
        if (err.message && err.message.includes('supabase')) {
            console.error('💥 Supabase-specific error detected');
        }

        return new Response(JSON.stringify({
            error: 'Internal server error',
            details: err.message,
            type: err.name,
            stack: err.stack,
            troubleshooting: {
                'check_env_vars': 'Verify NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set in Cloudflare Pages',
                'check_table': 'Ensure ads table exists in Supabase database',
                'check_rls': 'Verify RLS policies allow operations on ads table',
                'check_user': 'Ensure user is properly authenticated',
                'check_schema': 'Verify data types match database schema exactly'
            }
        }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}