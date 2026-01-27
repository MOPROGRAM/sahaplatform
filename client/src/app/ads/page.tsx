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
import CategorySidebar from '@/components/CategorySidebar';
import AdvancedFilter from '@/components/AdvancedFilter';

interface Ad {
    id: string;
    title: string;
    description: string;
    price: number | null;
    category: string;
    sub_category?: string | null;
    location: string | null;
    images: string;
    created_at: string;
    views?: number;
    author?: { name?: string };
}

function AdsContent() {
    const { language, t } = useLanguage();
    const searchParams = useSearchParams();
    const router = useRouter();
    const searchQueryParam = searchParams.get('search');
    const categoryParam = searchParams.get('category');
    const subCategoryParam = searchParams.get('subcategory');
    const { category, subCategory, tags, setCategory, setSubCategory, toggleTag, resetFilters } = useFilterStore();

    const [ads, setAds] = useState<Ad[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState(searchQueryParam || '');

    // Sync filters with URL
    useEffect(() => {
        if (categoryParam !== category) setCategory(categoryParam);
        if (subCategoryParam !== subCategory) setSubCategory(subCategoryParam);
    }, [categoryParam, subCategoryParam]);

    const fetchAds = useCallback(async () => {
        setLoading(true);
        try {
            const filters: any = {
                limit: 100,
                sortBy: 'created_at',
                sortOrder: 'desc',
                category,
                subCategory,
                search: searchQuery,
                tags
            };

            const data = await adsService.getAds(filters);
            setAds(Array.isArray(data) ? (data as any) : []);
        } catch (error) {
            console.error('Failed to fetch ads:', error);
            setAds([]);
        } finally {
            setLoading(false);
        }
    }, [category, subCategory, tags, searchQuery]);

    useEffect(() => {
        setSearchQuery(searchQueryParam || '');
    }, [searchQueryParam]);

    useEffect(() => {
        fetchAds();
    }, [fetchAds]);

    return (
        <div className="min-h-screen bg-[#f4f4f4] flex flex-col" dir={language === 'ar' ? 'rtl' : 'ltr'}>
            <Header />

            <main className="max-w-7xl mx-auto w-full p-2 flex-1 flex flex-col lg:flex-row gap-3">
                {/* Left Sidebar */}
                <div className="w-full lg:w-64 shrink-0 space-y-3 hidden lg:block">
                    <CategorySidebar />
                </div>

                {/* Main Content Area */}
                <div className="flex-1 flex flex-col gap-3">
                    <AdvancedFilter />

                    <div className="bg-white border border-gray-200 rounded-sm p-3 shadow-sm flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <h1 className="text-[14px] font-[1000] text-secondary uppercase tracking-tight">
                                {category ? (t as any)[category] || category : t('allAds')}
                                {subCategory && (
                                    <>
                                        <span className="text-gray-300 mx-2">/</span>
                                        <span className="text-primary">{(t as any)[subCategory] || subCategory}</span>
                                    </>
                                )}
                            </h1>
                        </div>
                        <span className="text-[10px] font-black text-gray-400 bg-gray-50 px-2 py-1 rounded-sm uppercase italic">
                            {t('foundAds').replace('{{count}}', ads.length.toString())}
                        </span>
                    </div>

                    {loading ? (
                        <div className="bg-white border border-gray-200 h-64 flex items-center justify-center rounded-sm">
                            <LoadingSpinner size={32} />
                        </div>
                    ) : ads.length > 0 ? (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-5 gap-2">
                            {ads.map((ad) => (
                                <AdCard
                                    key={ad.id}
                                    id={ad.id}
                                    title={ad.title}
                                    price={ad.price || 0}
                                    currency="SAR"
                                    location={ad.location || ''}
                                    images={ad.images ? (typeof ad.images === 'string' ? JSON.parse(ad.images) : ad.images) : []}
                                    createdAt={ad.created_at}
                                    category={ad.category}
                                    language={language}
                                    isFeatured={false}
                                    views={ad.views || 0}
                                    authorName={ad.author?.name}
                                    description={ad.description}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="bg-white border border-dashed border-gray-300 p-20 text-center rounded-sm">
                            <p className="text-gray-400 font-black uppercase text-[11px] tracking-[0.2em]">{t('noResults')}</p>
                            <button onClick={() => { resetFilters(); router.push('/ads'); }} className="mt-4 btn-saha-outline !px-6">{t('clearFilters')}</button>
                        </div>
                    )}
                </div>
            </main>
            <Footer />
        </div>
    );
}

export default function AdsPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-[#f4f4f4] flex items-center justify-center">
                <LoadingSpinner size={48} />
            </div>
        }>
            <AdsContent />
        </Suspense>
    );
}
