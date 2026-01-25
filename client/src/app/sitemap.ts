import { MetadataRoute } from 'next'
import { supabase } from '@/lib/supabase'

export const runtime = 'edge';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    // Use the site URL from environment variables, or fallback to a placeholder
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://saha-platform.com';

    // Static routes of the application
    const mainRoutes = [
        '',
        '/ads',
        '/advertise',
        '/help',
        '/login',
    ];

    const categories = ['jobs', 'realEstate', 'cars', 'goods', 'services', 'other'];
    const categoryRoutes = categories.map(cat => `/ads?category=${cat}`);

    const staticRoutes = [...mainRoutes, ...categoryRoutes].map((route) => ({
        url: `${baseUrl}${route}`,
        lastModified: new Date(),
        changeFrequency: 'daily' as const,
        priority: route === '' ? 1 : 0.8,
    }));

    // Fetch dynamic routes (Ads) from Supabase
    try {
        const { data: ads, error } = await supabase
            .from('Ad')
            .select('id, updated_at, created_at')
            .eq('is_active', true)
            .limit(2000);

        if (error || !ads) {
            console.error('Sitemap: Error fetching ads:', error);
            return staticRoutes;
        }

        const adRoutes = ads.map((ad: any) => ({
            url: `${baseUrl}/ads/${ad.id}`,
            lastModified: new Date(ad.updated_at || ad.created_at || new Date()),
            changeFrequency: 'weekly' as const,
            priority: 0.6,
        }));

        return [...staticRoutes, ...adRoutes];
    } catch (err) {
        console.error('Sitemap: Unexpected error:', err);
        return staticRoutes;
    }
}
