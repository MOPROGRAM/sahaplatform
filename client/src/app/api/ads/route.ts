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

        // Create user client to verify token
        const supabaseUser = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        );
        supabaseUser.auth.setAuth(authHeader.replace('Bearer ', ''));

        const { data: { user }, error: authError } = await supabaseUser.auth.getUser();
        if (authError || !user) {
            return new Response(JSON.stringify({ error: 'Authentication required' }), {
                status: 401,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        // Validate required fields
        if (!formData.title || !formData.category || !formData.price) {
            return new Response(JSON.stringify({ error: 'Missing required fields' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        // Prepare ad data
        const adData = {
            title: formData.title,
            description: formData.description,
            price: Number(formData.price),
            currencyId: 'sar',
            category: formData.category,
            location: formData.enableLocation ? formData.location : null,
            address: formData.address,
            images: JSON.stringify(formData.imageUrls || []),
            authorId: user.id,
        };

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