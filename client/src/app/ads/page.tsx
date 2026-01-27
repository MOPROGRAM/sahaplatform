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
import AdvancedFilter from '@/components/AdvancedFilter';
import { Sparkles, ChevronLeft, Layers, Building, Car, Briefcase, ShoppingBag, Smartphone, Wrench, MapPin, Eye, Clock, User } from 'lucide-react';
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface Ad {
    id: string;
    title: string;
    description?: string;
    price: number | null;
    category: string;
    sub_category?: string | null;
    location: string | null;
    images: string;
    created_at: string;
    views?: number;
    author?: { name?: string };
    is_boosted?: boolean;
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

    const mainCategories = [
        { name: t('jobs'), icon: Briefcase, key: 'jobs' },
        { name: t('realestate'), icon: Building, key: 'realestate' },
        { name: t('cars'), icon: Car, key: 'cars' },
        { name: t('electronics'), icon: Smartphone, key: 'electronics' },
        { name: t('services'), icon: Wrench, key: 'services' },
        { name: t('goods'), icon: ShoppingBag, key: 'goods' },
        { name: t('other'), icon: Layers, key: 'other' },
    ];

    const subCategoriesMap: Record<string, string[]> = {
        realestate: ['apartments', 'villas', 'lands', 'commercial', 'rent'],
        cars: ['toyota', 'hyundai', 'ford', 'mercedes', 'bmw', 'trucks'],
        jobs: ['it', 'sales', 'engineering', 'medical', 'education'],
        electronics: ['phones', 'computers', 'appliances', 'gaming'],
        services: ['cleaning', 'moving', 'maintenance', 'legal', 'design'],
        goods: ['furniture', 'fashion', 'sports', 'books', 'other'],
    };

    const handleCategoryChange = (newCategory: string | null) => {
        setCategory(newCategory);
        setSubCategory(null); // Reset subcategory when category changes

        // Update URL
        const params = new URLSearchParams(window.location.search);
        if (newCategory) {
            params.set('category', newCategory);
        } else {
            params.delete('category');
        }
        params.delete('subcategory');
        const newUrl = `${window.location.pathname}?${params.toString()}`;
        router.push(newUrl);
    };

    const handleSubCategoryChange = (newSub: string | null) => {
        setSubCategory(newSub);
        const params = new URLSearchParams(window.location.search);
        if (newSub) {
            params.set('subcategory', newSub);
        } else {
            params.delete('subcategory');
        }
        const newUrl = `${window.location.pathname}?${params.toString()}`;
        router.push(newUrl);
    };

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

    // Sync URL params to store state on initial load/URL change
    useEffect(() => {
        if (categoryParam !== category) setCategory(categoryParam);
        if (subCategoryParam !== subCategory) setSubCategory(subCategoryParam);
        setSearchQuery(searchQueryParam || '');
    }, [categoryParam, subCategoryParam, searchQueryParam, category, subCategory, setCategory, setSubCategory, setSearchQuery]);

    useEffect(() => {
        fetchAds();
    }, [fetchAds]);

    return (
        <div className="min-h-screen bg-[#f4f4f4] flex flex-col" dir={language === 'ar' ? 'rtl' : 'ltr'}>
            <Header />

            <main className="max-w-7xl mx-auto w-full p-2 flex-1 flex flex-col gap-3">

                {/* Horizontal Category Filter Bar (Item 2.1) - NEW AIRBNB STYLE */}
                <div className="bg-white border border-border-color rounded-lg shadow-md p-1 overflow-x-auto no-scrollbar">
                    <div className="flex flex-nowrap gap-2 whitespace-nowrap">
                        <button
                            onClick={() => handleCategoryChange(null)}
                            className={cn("px-3 py-1.5 rounded-full text-sm font-bold transition-all", !category ? 'bg-primary text-white shadow-md' : 'text-gray-600 hover:bg-gray-100')}
                        >
                            {t('allAds')}
                        </button>
                        {mainCategories.map((cat) => (
                            <button
                                key={cat.key}
                                onClick={() => handleCategoryChange(cat.key)}
                                className={cn("px-3 py-1.5 rounded-full text-sm font-medium transition-all flex items-center gap-2", category === cat.key ? 'bg-primary text-white shadow-md' : 'text-gray-700 hover:bg-primary/10')}
                            >
                                <cat.icon size={16} />
                                {cat.name}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Advanced Filters (Tag Filters) */}
                <AdvancedFilter />

                <div className="bg-white border border-gray-200 rounded-sm p-3 shadow-sm flex items-center justify-between">
                    <div className="flex flex-wrap items-center gap-2">
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
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-5 gap-3">
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
                                isFeatured={ad.is_boosted || false}
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
