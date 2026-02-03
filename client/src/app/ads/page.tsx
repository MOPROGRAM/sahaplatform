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
import { Layers, Building, Car, Briefcase, ShoppingBag, Smartphone, Wrench, ChevronDown } from 'lucide-react';
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
// Removed dynamic import for AdsMap as it's no longer used
// Removed AdsMap import

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface Ad {
    id: string;
    title: string;
    titleAr?: string;
    titleEn?: string;
    description?: string;
    descriptionAr?: string;
    descriptionEn?: string;
    price: number | null;
    category: string;
    subCategory?: string | null;
    location: string | null;
    latitude?: number | null;
    longitude?: number | null;
    images: string;
    created_at: string;
    views?: number;
    author?: {
        name?: string,
        email?: string,
        avg_rating?: number,
        ratings_count?: number
    };
    author_id: string;
    phone?: string;
    email?: string;
    is_boosted?: boolean;
    currency?: string | { code: string; symbol: string; };
}

const AdsSkeleton = () => (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-5 gap-3">
        {[...Array(15)].map((_, i) => (
            <div key={i} className="bg-white dark:bg-zinc-900 rounded-2xl overflow-hidden border border-gray-100 dark:border-white/5 shadow-sm h-[200px] animate-pulse">
                <div className="h-20 bg-gray-200 dark:bg-white/10 w-full" />
                <div className="p-2 space-y-2">
                    <div className="h-3 bg-gray-200 dark:bg-white/10 rounded w-3/4" />
                    <div className="h-3 bg-gray-200 dark:bg-white/10 rounded w-1/2" />
                    <div className="flex justify-between pt-1">
                        <div className="h-2 bg-gray-200 dark:bg-white/10 rounded w-1/4" />
                        <div className="h-2 bg-gray-200 dark:bg-white/10 rounded w-1/4" />
                    </div>
                </div>
            </div>
        ))}
    </div>
);

function AdsContent() {
    const { language, t } = useLanguage();
    const searchParams = useSearchParams();
    const router = useRouter();
    const searchQueryParam = searchParams.get('search');
    const categoryParam = searchParams.get('category');
    const subCategoryParam = searchParams.get('subcategory');
    const { category, subCategory, tags, setCategory, setSubCategory, resetFilters, minPrice, maxPrice, minArea, maxArea, cityId, sortBy, sortOrder } = useFilterStore();

    const [ads, setAds] = useState<Ad[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState(searchQueryParam || '');
    // Removed highlightedAdId state and related map logic

    const subCategoriesMap: { [key: string]: string[] } = {
        realestate: ['apartments', 'villas', 'lands', 'commercial', 'offices', 'chalets', 'compounds', 'stores', 'duplex', 'studio', 'penthouse', 'building', 'warehouse', 'showroom', 'workshop', 'farm', 'resthouse'],
        cars: ['toyota', 'hyundai', 'ford', 'mercedes', 'bmw', 'honda', 'nissan', 'chevrolet', 'kia', 'lexus', 'mazda', 'jeep', 'landrover', 'trucks', 'motorcycle', 'boat', 'heavy_equipment', 'car_parts'],
        jobs: ['it', 'sales', 'engineering', 'medical', 'education', 'accounting', 'management', 'technicians', 'drivers', 'security', 'customer_service', 'marketing', 'translation', 'photography', 'software_dev'],
        electronics: ['phones', 'computers', 'laptops', 'tvs', 'cameras', 'tablets', 'smartwatches', 'accessories', 'gaming', 'appliances', 'audio', 'smart_home'],
        services: ['cleaning', 'moving', 'maintenance', 'legal', 'design', 'delivery', 'events', 'transport', 'teaching', 'contracting', 'home_repair', 'catering', 'legal_services', 'medical_services', 'real_estate_services', 'car_services'],
        goods: ['furniture', 'fashion', 'sports', 'books', 'clothes', 'watches', 'perfumes', 'antiques', 'camping', 'misc'],
        other: ["misc"],
    };

    const mainCategories = [
        { name: t('jobs'), icon: Briefcase, key: 'jobs' },
        { name: t('realestate'), icon: Building, key: 'realestate' },
        { name: t('cars'), icon: Car, key: 'cars' },
        { name: t('electronics'), icon: Smartphone, key: 'electronics' },
        { name: t('services'), icon: Wrench, key: 'services' },
        { name: t('goods'), icon: ShoppingBag, key: 'goods' },
        { name: t('other'), icon: Layers, key: 'other' },
    ];

    const handleCategoryChange = (newCategory: string | null) => {
        setCategory(newCategory);
        setSubCategory(null); // Reset subcategory when category changes

        // Update URL
        const params = new URLSearchParams(window.location.search);
        if (newCategory) { params.set('category', newCategory); } else { params.delete('category'); }
        params.delete('subcategory');
        router.push(`${window.location.pathname}?${params.toString()}`);
    };

    const handleSubCategoryChange = (newSub: string | null) => {
        setSubCategory(newSub);
        const params = new URLSearchParams(window.location.search);
        if (newSub) { params.set('subcategory', newSub); } else { params.delete('subcategory'); }
        router.push(`${window.location.pathname}?${params.toString()}`);
    };

    const fetchAds = useCallback(async () => {
        setLoading(true);
        try {
            const filters: any = {
                limit: 100,
                sortBy: sortBy || 'createdAt',
                sortOrder: sortOrder || 'desc',
                category,
                subCategory,
                search: searchQuery,
                tags,
                minPrice: minPrice ? parseFloat(minPrice) : undefined,
                maxPrice: maxPrice ? parseFloat(maxPrice) : undefined,
                minArea: minArea ? parseFloat(minArea) : undefined,
                maxArea: maxArea ? parseFloat(maxArea) : undefined,
                cityId
            };

            const result = await adsService.getAds(filters);
            setAds(result.data || []);
        } catch (error) {
            console.error('Failed to fetch ads:', error);
            setAds([]);
        } finally {
            setLoading(false);
        }
    }, [category, subCategory, tags, searchQuery, minPrice, maxPrice, minArea, maxArea, cityId, sortBy, sortOrder]);

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
        <div className="min-h-screen bg-gray-bg flex flex-col">
            <Header />

            <main className="w-full max-w-[1920px] mx-auto p-1 grid grid-cols-12 gap-1 flex-1">
                {/* Bento Grid Sidebar - Categories (Matching HomePage) */}
                <aside className={`col-span-12 lg:col-span-2 hidden lg:block space-y-1`}>
                    <div className="bento-card p-0 flex flex-col sticky top-20 bg-white dark:bg-[#1a1a1a]">
                        <div className="p-3 border-b border-border-color bg-gray-50 dark:bg-white/5">
                            <h3 className="bento-title text-xs uppercase tracking-wider font-black">{t("categories")}</h3>
                        </div>
                        <nav className="flex flex-col p-1 space-y-0.5">
                            <button
                                onClick={() => handleCategoryChange(null)}
                                className={cn("flex items-center justify-between px-3 py-2 rounded-lg transition-all group w-full text-right", !category ? 'bg-primary/10 text-primary' : 'hover:bg-gray-100 dark:hover:bg-white/5')}
                            >
                                <span className="font-bold text-xs">{t('allAds')}</span>
                            </button>
                            {mainCategories.map((cat, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => handleCategoryChange(cat.key)}
                                    className={cn("flex items-center justify-between px-3 py-2 rounded-lg transition-all group w-full text-right", category === cat.key ? 'bg-primary/10 text-primary' : 'hover:bg-gray-100 dark:hover:bg-white/5')}
                                >
                                    <div className="flex items-center gap-2">
                                        <div className={cn("transition-colors", category === cat.key ? 'text-primary' : 'text-gray-400 group-hover:text-primary')}>
                                            <cat.icon size={14} />
                                        </div>
                                        <span className={cn("font-bold text-xs transition-colors line-clamp-1", category === cat.key ? 'text-primary' : 'text-text-main group-hover:text-primary')}>{cat.name}</span>
                                    </div>
                                </button>
                            ))}
                        </nav>
                    </div>
                </aside>

                <section className="col-span-12 lg:col-span-10 flex flex-col gap-2">
                    {/* Mobile Categories Strip */}
                    <div className="lg:hidden bg-white border border-border-color rounded-lg shadow-md p-1 mt-2 overflow-x-auto no-scrollbar">
                        <div className="flex flex-nowrap gap-2 whitespace-nowrap px-1">
                            <button
                                onClick={() => handleCategoryChange(null)}
                                className={cn("px-3 py-1.5 rounded-full text-sm font-bold transition-all", !category ? 'bg-primary text-white shadow-md' : 'text-primary hover:bg-primary/10')}
                            >
                                {t('allAds')}
                            </button>
                            {mainCategories.map((cat) => (
                                <button
                                    key={cat.key}
                                    onClick={() => handleCategoryChange(cat.key)}
                                    className={cn("px-3 py-1.5 rounded-full text-sm font-medium transition-all flex items-center gap-2", category === cat.key ? 'bg-primary text-white shadow-md' : 'text-text-main hover:bg-gray-100')}
                                >
                                    <cat.icon size={14} />
                                    <span>{cat.name}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Subcategory Filter Row */}
                    {category && subCategoriesMap[category] && (
                        <div className="bg-white border border-border-color rounded-lg shadow-md p-1 mt-3 overflow-x-auto no-scrollbar">
                            <div className="flex flex-nowrap gap-2 whitespace-nowrap">
                                <button
                                    onClick={() => handleSubCategoryChange(null)}
                                    className={cn("px-3 py-1.5 rounded-full text-sm font-bold transition-all", !subCategory ? 'bg-indigo-600 text-white shadow-md' : 'text-indigo-600 hover:bg-indigo-100')}
                                >
                                    {t('allAds')}
                                </button>
                                {subCategoriesMap[category].map((sub) => (
                                    <button
                                        key={sub}
                                        onClick={() => handleSubCategoryChange(sub)}
                                        className={cn("px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all duration-300", subCategory === sub ? 'bg-secondary text-white shadow-premium' : 'text-secondary hover:bg-secondary/10 bg-secondary/5')}
                                    >
                                        {t(sub as any)}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Advanced Filters (Tag Filters) */}
                    <AdvancedFilter />

                    <div className="bg-white dark:bg-[#1a1a1a] border border-border-color rounded-2xl p-4 shadow-premium flex items-center justify-between transition-all hover:border-primary/30">
                        <div className="flex flex-wrap items-center gap-3">
                            <h1 className="text-sm font-black text-text-main uppercase tracking-widest flex items-center gap-2">
                                {category ? (
                                    <span className="bg-primary/10 text-primary px-3 py-1 rounded-lg">
                                        {t(category as any)}
                                    </span>
                                ) : (
                                    <span className="text-text-muted">{t('allAds')}</span>
                                )}

                                {subCategory && (
                                    <>
                                        <ChevronDown size={14} className="-rotate-90 text-gray-300" />
                                        <span className="text-secondary font-black">
                                            {t(subCategory as any)}
                                        </span>
                                    </>
                                )}
                            </h1>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                            <span className="text-[10px] font-black text-text-muted uppercase tracking-wider">
                                {t('foundAds').replace('{{count}}', ads.length.toString())}
                            </span>
                        </div>
                    </div>

                    {loading ? (
                        <AdsSkeleton />
                    ) : ads.length > 0 ? (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-1.5 pb-10">
                            {ads.map((ad) => (
                                <AdCard
                                    key={ad.id}
                                    id={ad.id}
                                    title={ad.title}
                                    titleAr={ad.titleAr}
                                    titleEn={ad.titleEn}
                                    price={ad.price || 0}
                                    currency={typeof ad.currency === 'string' ? ad.currency : ad.currency?.code}
                                    location={ad.location || ''}
                                    images={ad.images ? (typeof ad.images === 'string' ? JSON.parse(ad.images) : ad.images) : []}
                                    createdAt={ad.created_at}
                                    category={ad.category}
                                    language={language}
                                    isFeatured={ad.is_boosted || false}
                                    authorName={ad.author?.name}
                                    description={ad.description}
                                    descriptionAr={ad.descriptionAr}
                                    descriptionEn={ad.descriptionEn}
                                    authorId={ad.author_id}
                                    phone={ad.phone}
                                    email={ad.author?.email}
                                    authorRating={ad.author?.avg_rating}
                                    authorRatingsCount={ad.author?.ratings_count}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="bento-card border-dashed p-20 text-center">
                            <p className="text-gray-400 font-black uppercase text-[11px] tracking-[0.2em]">{t('noResults')}</p>
                            <button onClick={() => { resetFilters(); router.push('/ads'); }} className="mt-4 btn-saha-outline !px-6 !rounded-xl">{t('clearFilters')}</button>
                        </div>
                    )}

                </section>
            </main >
            <Footer />
        </div >
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
