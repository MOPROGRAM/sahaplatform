export const runtime = 'edge';

import { supabase } from '@/lib/supabase';

export async function GET(request: Request, { params }: { params: { id: string } }) {
    const { id } = params;

    const { data, error } = await supabase
        .from('ads')
        .select('*')
        .eq('id', id)
        .single();

    if (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }

    if (!data) {
        return Response.json({ error: 'Ad not found' }, { status: 404 });
    }

    return Response.json(data);
}