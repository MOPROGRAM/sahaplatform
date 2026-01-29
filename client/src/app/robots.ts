import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://saha-platform.com';

    return {
        rules: {
            userAgent: '*',
            allow: '/',
            disallow: ['/admin/', '/dashboard/', '/settings/', '/messages/', '/notifications/'],
        },
        sitemap: `${baseUrl}/sitemap.xml`,
    }
}
