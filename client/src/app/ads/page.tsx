"use client";

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { adsService } from '@/lib/ads';
import { useLanguage } from '@/lib/language-context';
import { useFilterStore } from '@/store/useFilterStore';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import AdCard from '@/components/AdCard';
import LoadingSpinner from '@/components/LoadingSpinner';

type Filters = {
    limit?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    category?: string;
    search?: string;
    location?: string;
    type?: string;
    priceRange?: string;
    hasMedia?: boolean;
};

interface Ad {
    id: string;
    title: string;
    description: string;
    price: number | null;
    category: string;
    location: string | null;
    images: string;
    phone?: string;
    email?: string;
    latitude?: number;
    longitude?: number;
    author_id: string;
    created_at: string;
    author?: {
        id: string;
        name?: string;
        email: string;
    };
    city?: {
        id: string;
        name: string;
        name_ar?: string;
        name_en?: string;
    };
    currency?: {
        id: string;
        code: string;
        symbol: string;
        name: string;
    };
}

function AdsContent() {
    const { language } = useLanguage();
    const searchParams = useSearchParams();
    const router = useRouter();
    const searchQueryParam = searchParams.get('search');
    const categoryParam = searchParams.get('category');
    const { category, tags, setCategory, toggleTag, resetFilters } = useFilterStore();

    const [ads, setAds] = useState<Ad[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState(searchQueryParam || '');
    const [showAllAds, setShowAllAds] = useState(true); // Show ads without media

    // Sync filters with URL on mount
    useEffect(() => {
        if (categoryParam && categoryParam !== category) {
            setCategory(categoryParam);
        }
    }, [categoryParam, category, setCategory]);

    const fetchAds = useCallback(async () => {
        setLoading(true);
        try {
            const filters: Filters = {
                limit: 50,
                sortBy: 'created_at',
                sortOrder: 'desc'
            };
            // Filter by category if specified
            if (category) {
                filters.category = category;
            }

            // Search in title and description
            if (searchQuery) {
                filters.search = searchQuery;
            }

            // Location filter from tags
            const regions = ['الرياض', 'جدة', 'الدمام', 'مكة', 'المدينة'];
            const selectedRegions = tags.filter(tag => regions.includes(tag));
            if (selectedRegions.length > 0) {
                filters.location = selectedRegions.join(',');
            }

            // Type filter from tags
            const types = ['سكني', 'تجاري', 'إيجار', 'بيع', 'استثمار'];
            const selectedTypes = tags.filter(tag => types.includes(tag));
            if (selectedTypes.length > 0) {
                filters.type = selectedTypes.join(',');
            }

            // Price filter from tags
            const priceRanges = {
                'أقل من 50k': { min: 0, max: 50000 },
                '50k - 200k': { min: 50000, max: 200000 },
                '200k - 500k': { min: 200000, max: 500000 },
                '500k+': { min: 500000, max: Infinity }
            };
            const selectedPrices = tags.filter(tag => tag in priceRanges);
            if (selectedPrices.length > 0) {
                const priceFilters = selectedPrices.map(tag => {
                    const range = priceRanges[tag as keyof typeof priceRanges];
                    return `${range.min}-${range.max}`;
                });
                filters.priceRange = priceFilters.join(',');
            }

            // Filter ads based on media availability
            if (!showAllAds) {
                filters.hasMedia = true;
            }

            const data = await adsService.getAds(filters);
            // Ensure data is always an array
            setAds(Array.isArray(data as any) ? (data as any) : []);
        } catch (error) {
            console.error('Failed to fetch ads:', error);
            setAds([]);
        } finally {
            setLoading(false);
        }
    }, [category, tags, searchQuery, showAllAds]);

    useEffect(() => {
        setSearchQuery(searchQueryParam || '');
    }, [searchQueryParam]);

    useEffect(() => {
        fetchAds();
    }, [fetchAds]);

    return (
        <div className="min-h-screen bg-[#f0f2f5] flex flex-col" dir={language === 'ar' ? 'rtl' : 'ltr'}>
            <Header />

            {/* Simple Result Info */}
            <main className="max-w-7xl mx-auto w-full p-3 flex-1">
                {/* Result Info */}
                <div className="flex items-center justify-between mb-6 px-1 border-b border-gray-200 pb-4">
                    <div className="flex items-center gap-3">
                        <div className="w-1.5 h-6 bg-primary rounded-full"></div>
                        <h1 className="text-[18px] font-black uppercase text-secondary tracking-tight">
                            {category ? `${category}` : 'Global Marketplace'}
                            <span className="text-[12px] font-medium text-text-muted mr-4 bg-card/10 px-3 py-1 rounded-full uppercase italic">
                                {ads.length} listings identified
                            </span>
                        </h1>
                    </div>
                </div>

                {loading ? (
                    <div className="flex items-center justify-center p-20">
                        <LoadingSpinner size={48} />
                    </div>
                ) : ads.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-5 gap-4">
                        {ads.map((ad) => (
                            <AdCard
                                key={ad.id}
                                id={ad.id}
                                title={ad.title}
                                price={ad.price}
                                currency="ريال"
                                location={ad.location}
                                images={ad.images ? JSON.parse(ad.images) : []}
                                createdAt={ad.created_at}
                                category={ad.category}
                                language={language}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="text-center p-20 bg-white border border-dashed border-gray-300 rounded-lg">
                        <div className="text-text-muted font-black uppercase text-sm italic tracking-widest">No matching listings in the matrix</div>
                        <button onClick={() => { resetFilters(); router.push('/ads'); }} className="mt-4 text-primary font-bold hover:underline">Clear all filters</button>
                    </div>
                )}
            </main>
            <Footer />
        </div>
    );
}

export default function AdsPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-gray-bg flex items-center justify-center">
                <LoadingSpinner size={48} />
            </div>
        }>
            <AdsContent />
        </Suspense>
    );
}