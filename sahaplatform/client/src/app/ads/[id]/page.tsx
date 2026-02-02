import { Suspense } from "react";
import { adsService } from '@/lib/ads';
import { AdDetailsClientWrapper } from './AdDetailsClientWrapper';
import { Metadata } from 'next';

// Force dynamic rendering where necessary
export const dynamic = 'force-dynamic';
// export const runtime = 'edge';

// Helper to translate categories for Title/Keywords
const getCategoryName = (cat: string) => {
    const map: Record<string, string> = {
        'realestate': 'عقارات',
        'cars': 'سيارات',
        'electronics': 'إلكترونيات',
        'goods': 'سلع',
        'jobs': 'وظائف',
        'services': 'خدمات',
        'other': 'أخرى'
    };
    return map[cat] || cat;
};

// Helper to generate Structured Data (JSON-LD)
const generateJsonLd = (ad: any) => {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://saha-platform.com';
    const images = ad.images && typeof ad.images === 'string' ? JSON.parse(ad.images) : (ad.images || []);
    const imageUrl = images.length > 0 ? images[0] : `${baseUrl}/og-image.jpg`; // Fallback image

    const schema: any = {
        '@context': 'https://schema.org',
        '@type': 'Product',
        name: ad.title,
        description: ad.description,
        image: imageUrl,
        offers: {
            '@type': 'Offer',
            price: ad.price,
            priceCurrency: ad.currency || 'SAR',
            availability: 'https://schema.org/InStock',
            url: `${baseUrl}/ads/${ad.id}`
        },
        datePublished: ad.created_at
    };

    // Specific Schema Enhancements
    if (ad.category === 'cars') {
        schema['@type'] = 'Vehicle';
        schema.vehicleConfiguration = ad.title; // Approximate
    } else if (ad.category === 'jobs') {
        schema['@type'] = 'JobPosting';
        schema.datePosted = ad.created_at;
        schema.title = ad.title;
        schema.description = ad.description;
        schema.hiringOrganization = {
            '@type': 'Organization',
            name: 'Saha Platform User', // Ideally author name
            logo: `${baseUrl}/logo.png`
        };
        schema.jobLocation = {
            '@type': 'Place',
            address: {
                '@type': 'PostalAddress',
                addressLocality: ad.city_id || 'Saudi Arabia' // Ideally fetch city name
            }
        };
        // Remove offers for jobs as it's not a product
        delete schema.offers;
    } else if (ad.category === 'realestate') {
        schema['@type'] = 'RealEstateListing'; // or Product
    }

    return schema;
};

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
    const id = params.id;

    try {
        const ad = await adsService.getAd(id, true);
        if (!ad) return { title: 'الإعلان غير موجود | ساحة' };

        const images = (ad.images && typeof ad.images === 'string') ? JSON.parse(ad.images || '[]') : (ad.images || []);
        const image = images && images.length ? images[0] : undefined;
        const categoryName = getCategoryName(ad.category);

        return {
            title: `${ad.title} | ${categoryName} | منصة ساحة`,
            description: ad.description ? (typeof ad.description === 'string' ? ad.description.slice(0, 160) : '') : `إعلان ${ad.title} على منصة ساحة`,
            keywords: [categoryName, 'بيع', 'شراء', 'سوق', 'السعودية', ad.title],
            openGraph: {
                title: `${ad.title} - ${categoryName}`,
                description: ad.description || '',
                images: image ? [{ url: image }] : [],
                type: 'website',
            },
            twitter: {
                card: 'summary_large_image',
                title: `${ad.title} | ${categoryName}`,
                images: image ? [image] : undefined,
            },
        };
    } catch {
        return { title: 'ساحة - منصة الإعلانات' };
    }
}

export default async function Page({ params }: { params: { id: string } }) {
    const id = params.id;
    let jsonLd = null;

    try {
        // Fetch ad server-side for JSON-LD injection
        const ad = await adsService.getAd(id, true);
        if (ad) {
            jsonLd = generateJsonLd(ad);
        }
    } catch (error) {
        console.error("SEO Data Fetch Error:", error);
        // Continue rendering the page even if SEO data fails
    }

    return (
        <>
            {jsonLd && (
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
                />
            )}
            <Suspense fallback={<div className="p-10 text-center flex flex-col items-center gap-4">
                <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                <div className="font-bold text-text-muted">جاري التحميل...</div>
            </div>}>
                <AdDetailsClientWrapper />
            </Suspense>
        </>
    );
}
