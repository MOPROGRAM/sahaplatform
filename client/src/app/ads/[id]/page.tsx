import { Suspense } from "react";
import { adsService } from '@/lib/ads';
import nextDynamic from 'next/dynamic';

// Force dynamic rendering where necessary
export const dynamic = 'force-dynamic';
export const runtime = 'edge';

const AdDetailsWrapperClient = nextDynamic(() => import('./AdDetailsClientWrapper').then(m => m.AdDetailsClientWrapper), { ssr: false });

export async function generateMetadata({ params }: { params: { id: string } }) {
    const id = params.id;

    try {
        const ad = await adsService.getAd(id, true);
        if (!ad) return { title: 'Ad not found' };

        const images = (ad.images && typeof ad.images === 'string') ? JSON.parse(ad.images || '[]') : (ad.images || []);
        const image = images && images.length ? images[0] : undefined;

        return {
            title: ad.title,
            description: ad.description ? (typeof ad.description === 'string' ? ad.description.slice(0, 160) : '') : '',
            openGraph: {
                title: ad.title,
                description: ad.description || '',
                images: image ? [{ url: image }] : [],
            },
            twitter: {
                card: 'summary_large_image',
                title: ad.title,
                images: image ? [image] : undefined,
            },
        } as any;
    } catch {
        return { title: 'Ad' };
    }
}

export default function Page() {
    return (
        <Suspense fallback={<div className="p-10 text-center">جاري التحميل...</div>}>
            <AdDetailsWrapperClient />
        </Suspense>
    );
}