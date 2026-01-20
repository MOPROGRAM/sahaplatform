export const runtime = 'edge';

import { createClient } from '@supabase/supabase-js';

export async function GET(request: Request) {
    try {
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

        // Get user's ads
        const { data: ads, error } = await supabaseAdmin
            .from('Ad')
            .select(`
                id,
                title,
                description,
                price,
                currencyId,
                category,
                location,
                address,
                images,
                isActive,
                views,
                createdAt,
                updatedAt
            `)
            .eq('authorId', user.id)
            .order('createdAt', { ascending: false });

        if (error) {
            console.error('Error fetching user ads:', error);
            return new Response(JSON.stringify({ error: error.message }), {
                status: 500,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        // Always return an array
        return Response.json({ ads: Array.isArray(ads) ? ads : [] });
    } catch (err) {
        console.error('Error in ads/my API:', err);
        return new Response(JSON.stringify({ error: 'Internal server error' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}