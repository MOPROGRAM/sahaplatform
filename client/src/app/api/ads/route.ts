export const runtime = 'edge';

import { createClient } from '@supabase/supabase-js';

export async function POST(request: Request) {
    try {
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
        const supabaseAdmin = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!
        );

        // Verify JWT token using admin client
        const token = authHeader.replace('Bearer ', '');
        const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
        if (authError || !user) {
            return new Response(JSON.stringify({ error: 'Authentication required' }), {
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
            return new Response(JSON.stringify({ error: 'Invalid user authentication' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        // Prepare minimal ad data with required fields only
        const adData: any = {
            title: String(formData.title).trim(),
            description: formData.description ? String(formData.description).trim() : '',
            price: Number(formData.price) || 0,
            category: String(formData.category),
            authorId: user.id,
        };

        // Add optional fields if they exist
        if (formData.location) adData.location = String(formData.location).trim();
        if (formData.address) adData.address = String(formData.address).trim();
        if (formData.imageUrls && Array.isArray(formData.imageUrls)) {
            adData.images = JSON.stringify(formData.imageUrls);
        } else {
            adData.images = '[]';
        }

        console.log('Creating ad with data:', adData);

        // Insert ad
        const { data: ad, error } = await supabaseAdmin
            .from('Ad')
            .insert(adData)
            .select()
            .single();

        if (error) {
            console.error('Error creating ad:', error);
            console.error('Error details:', JSON.stringify(error, null, 2));

            // Return more specific error message
            let errorMessage = 'Failed to create ad';
            if (error.message?.includes('foreign key')) {
                errorMessage = 'Invalid data: foreign key constraint failed';
            } else if (error.message?.includes('unique')) {
                errorMessage = 'Data already exists';
            } else if (error.message?.includes('null')) {
                errorMessage = 'Required field is missing';
            }

            return new Response(JSON.stringify({
                error: errorMessage,
                details: error.message,
                code: error.code
            }), {
                status: 500,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        return Response.json(ad);
    } catch (err) {
        console.error('Error in ads API:', err);
        return new Response(JSON.stringify({ error: 'Internal server error' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}