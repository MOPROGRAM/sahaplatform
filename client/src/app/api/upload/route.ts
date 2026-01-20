export const runtime = 'edge';

import { createClient } from '@supabase/supabase-js';

export async function POST(request: Request) {
    try {
        const formData = await request.formData();
        const file = formData.get('file') as File;

        if (!file) {
            return new Response(JSON.stringify({ error: 'No file provided' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        // Validate file type and size
        if (!file.type.startsWith('image/')) {
            return new Response(JSON.stringify({ error: 'Only image files are allowed' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        if (file.size > 5 * 1024 * 1024) { // 5MB
            return new Response(JSON.stringify({ error: 'File size must be less than 5MB' }), {
                status: 400,
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

        // Upload file to Supabase Storage
        const fileName = `${Date.now()}-${file.name}`;
        const { data, error } = await supabaseAdmin.storage
            .from('ads-images')
            .upload(fileName, file);

        if (error) {
            console.error('Error uploading file:', error);
            return new Response(JSON.stringify({ error: error.message }), {
                status: 500,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        // Get public URL
        const { data: urlData } = supabaseAdmin.storage
            .from('ads-images')
            .getPublicUrl(fileName);

        return Response.json({ url: urlData.publicUrl });
    } catch (err) {
        console.error('Error in upload API:', err);
        return new Response(JSON.stringify({ error: 'Internal server error' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}