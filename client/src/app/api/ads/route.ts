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
        if (!formData.title || !formData.category || formData.price === undefined) {
            return new Response(JSON.stringify({
                error: 'Missing required fields',
                received: { title: !!formData.title, category: !!formData.category, price: formData.price }
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

        // Prepare ad data with safe defaults
        const adData = {
            title: String(formData.title).trim(),
            description: formData.description ? String(formData.description).trim() : '',
            price: Number(formData.price) || 0,
            currencyId: 'sar',
            category: String(formData.category),
            location: formData.enableLocation && formData.location ? String(formData.location).trim() : null,
            address: formData.address ? String(formData.address).trim() : '',
            images: JSON.stringify(Array.isArray(formData.imageUrls) ? formData.imageUrls : []),
            authorId: user.id,
        };

        console.log('Creating ad with data:', adData);

        // Insert ad
        const { data: ad, error } = await supabaseAdmin
            .from('Ad')
            .insert(adData)
            .select()
            .single();

        if (error) {
            console.error('Error creating ad:', error);
            return new Response(JSON.stringify({ error: error.message }), {
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