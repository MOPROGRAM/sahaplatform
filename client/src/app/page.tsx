"use client";

import Link from 'next/link';
import { useState, useEffect, useCallback } from 'react';
import { Sparkles, Building2, Briefcase, Car, ShoppingBag, Wrench, Layers } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useLanguage } from '@/lib/language-context';
import { adsService } from '@/lib/ads';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import AdCard from '@/components/AdCard';
import PromotedBanner from '@/components/PromotedBanner';
import { clsx } from "clsx";

// Skeleton Loader Component
const AdsSkeleton = () => (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 2xl:grid-cols-10 gap-1.5 pb-10">
        {[...Array(12)].map((_, i) => (
            <div key={i} className="bg-white dark:bg-zinc-900 rounded-2xl overflow-hidden border border-gray-100 dark:border-white/5 shadow-sm h-[192px] animate-pulse">
                <div className="h-[72px] bg-gray-200 dark:bg-white/10 w-full" />
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

interface Ad {
    id: string;
    title: string;
    titleAr?: string;
    titleEn?: string;
    price: number | null;
    location: string | null;
    category: string;
    description?: string;
    descriptionAr?: string;
    descriptionEn?: string;
    created_at: string;
    images: string;
    is_boosted?: boolean;
    author_id: string;
    author?: {
        name?: string;
        email?: string;
        avg_rating?: number;
        ratings_count?: number;
    };
    city?: {
        name: string;
    };
    phone?: string;
    email?: string;
    currency?: string | { code: string; symbol: string; };
}

const categoriesList = [
    { icon: Briefcase, key: 'jobs' },
    { icon: Building2, key: 'realestate' },
    { icon: Car, key: 'cars' },
    { icon: ShoppingBag, key: 'goods' },
    { icon: Wrench, key: 'services' },
    { icon: Layers, key: 'other' }
];

export default function HomePage() {
    const { language, t, currency } = useLanguage();
    const [ads, setAds] = useState<Ad[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'all' | 'featured' | 'new'>('all');
    const [categoryCounts, setCategoryCounts] = useState<Record<string, number>>({});

    const fetchAds = useCallback(async () => {
        try {
            setLoading(true);
            const filters: any = {
                limit: 20,
                sortOrder: 'desc',
                sortBy: 'createdAt'
            };

            if (filter === 'featured') {
                filters.isBoosted = true;
            }

            const result = await adsService.getAds(filters);
            setAds(result.data || []);
        } catch (error) {
            console.error('Failed to fetch ads:', error);
            setAds([]);
        } finally {
            setLoading(false);
        }
    }, [filter]);

    const fetchCategoryCounts = useCallback(async () => {
        try {
            const counts: Record<string, number> = {};
            await Promise.all(categoriesList.map(async (cat) => {
                const { count } = await (supabase as any)
                    .from('ads')
                    .select('*', { count: 'exact', head: true })
                    .eq('is_active', true)
                    .eq('category', cat.key);
                counts[cat.key] = count || 0;
            }));
            setCategoryCounts(counts);
        } catch (error) {
            console.warn('Failed to fetch category counts:', error);
        }
    }, []);

    useEffect(() => {
        fetchAds();
        fetchCategoryCounts();
    }, [fetchAds, fetchCategoryCounts]);

    return (
        <div className="bg-gray-bg flex flex-col min-h-screen">
            <Header />

            <main className="w-full max-w-[1920px] mx-auto p-1 grid grid-cols-12 gap-1 flex-1">
                {/* Promoted Banner */}
                <div className="col-span-12">
                    <PromotedBanner />
                </div>

                {/* Bento Grid Sidebar - Categories */}
                <aside className={`col-span-2 hidden xl:block space-y-1`}>
                    <div className="bento-card p-0 flex flex-col sticky top-20 bg-white dark:bg-[#1a1a1a]">
                        <div className="p-3 border-b border-border-color bg-gray-50 dark:bg-white/5">
                            <h3 className="bento-title text-xs uppercase tracking-wider font-black">{t("categories")}</h3>
                        </div>
                        <nav className="flex flex-col p-1 space-y-0.5">
                            {categoriesList.map((cat, idx) => (
                                <Link
                                    key={idx}
                                    href={`/ads?category=${cat.key}`}
                                    className="flex items-center justify-between px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-white/5 transition-all group"
                                >
                                    <div className="flex items-center gap-2">
                                        <div className="text-gray-400 group-hover:text-primary transition-colors">
                                            <cat.icon size={14} />
                                        </div>
                                        <span className="font-bold text-xs text-text-main group-hover:text-primary transition-colors line-clamp-1">{t(cat.key as any)}</span>
                                    </div>
                                    <span className="text-[10px] font-bold text-text-muted bg-gray-100 dark:bg-white/5 px-1.5 py-0.5 rounded">{categoryCounts[cat.key] || 0}</span>
                                </Link>
                            ))}
                        </nav>
                    </div>
                </aside>

                {/* Central Grid Feed */}
                <section className={`col-span-12 xl:col-span-10 flex flex-col gap-1`}>
                    {/* Bento Filter Bar */}
                    <div className="bento-card p-1 flex items-center justify-between bg-white dark:bg-[#1a1a1a]">
                        <div className="flex items-center gap-2 px-3 py-2">
                            <div className="p-1.5 bg-primary/10 rounded-full text-primary">
                                <Sparkles size={14} />
                            </div>
                            <div>
                                <h2 className="text-sm font-black uppercase tracking-tight text-text-main leading-none">{t("latestOffers")}</h2>
                            </div>
                        </div>
                        <div className="flex p-0.5 bg-gray-100 dark:bg-black/20 rounded-lg mx-2">
                            <button onClick={() => setFilter("all")} className={`px-3 py-1.5 rounded-md text-[10px] font-bold transition-all ${filter === "all" ? "bg-white dark:bg-zinc-800 text-primary shadow-sm" : "text-text-muted hover:text-text-main"}`}>{t("viewAll")}</button>
                            <button onClick={() => setFilter("featured")} className={`px-3 py-1.5 rounded-md text-[10px] font-bold transition-all ${filter === "featured" ? "bg-white dark:bg-zinc-800 text-primary shadow-sm" : "text-text-muted hover:text-text-main"}`}>{t("featured")}</button>
                            <button onClick={() => setFilter("new")} className={`px-3 py-1.5 rounded-md text-[10px] font-bold transition-all ${filter === "new" ? "bg-white dark:bg-zinc-800 text-primary shadow-sm" : "text-text-muted hover:text-text-main"}`}>{t("newAd")}</button>
                        </div>
                    </div>

                    {/* Mobile Categories Strip */}
                    <div className="xl:hidden bg-white border border-border-color rounded-lg shadow-md p-1 mt-2 overflow-x-auto no-scrollbar">
                        <div className="flex flex-nowrap gap-2 whitespace-nowrap px-1">
                            <Link
                                href="/ads"
                                className="px-3 py-1.5 rounded-full text-sm font-bold transition-all bg-primary/10 text-primary hover:bg-primary/20"
                            >
                                {t('allAds')}
                            </Link>
                            {categoriesList.map((cat) => (
                                <Link
                                    key={cat.key}
                                    href={`/ads?category=${cat.key}`}
                                    className="px-3 py-1.5 rounded-full text-sm font-medium transition-all flex items-center gap-2 text-text-main hover:bg-gray-100"
                                >
                                    <cat.icon size={14} />
                                    <span>{t(cat.key as any)}</span>
                                    <span className="text-[10px] font-bold text-text-muted bg-gray-100 dark:bg-white/5 px-1.5 py-0.5 rounded">
                                        {categoryCounts[cat.key] || 0}
                                    </span>
                                </Link>
                            ))}
                        </div>
                    </div>

                    {loading ? (
                        <AdsSkeleton />
                    ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 gap-2 pb-10">
                            {ads.map((ad) => (
                                <div key={ad.id} className={clsx(
                                    "transition-all duration-300",
                                )}>
                                    <AdCard
                                        id={ad.id}
                                        title={ad.title}
                                        titleAr={ad.titleAr}
                                        titleEn={ad.titleEn}
                                        description={ad.description}
                                        descriptionAr={ad.descriptionAr}
                                        descriptionEn={ad.descriptionEn}
                                        price={ad.price || 0}
                                        currency={typeof ad.currency === 'string' ? ad.currency : ad.currency?.code || currency.toUpperCase()}
                                        location={ad.city?.name || ad.location || ''}
                                        images={ad.images ? (typeof ad.images === 'string' ? JSON.parse(ad.images) : ad.images) : []}
                                        createdAt={ad.created_at}
                                        category={ad.category}
                                        language={language}
                                        isFeatured={ad.is_boosted || false}
                                        authorId={ad.author_id}
                                        phone={ad.phone}
                                        email={ad.author?.email}
                                        authorRating={ad.author?.avg_rating}
                                        authorRatingsCount={ad.author?.ratings_count}
                                    />
                                </div>
                            ))}
                            {ads.length === 0 && (
                                <div className="col-span-full bento-card p-12 text-center flex flex-col items-center justify-center gap-4">
                                    <div className="w-16 h-16 bg-gray-100 dark:bg-white/5 rounded-full flex items-center justify-center text-gray-400">
                                        <Layers size={32} />
                                    </div>
                                    <div className="text-text-muted font-bold uppercase tracking-widest text-xs">{t("noResults")}</div>
                                </div>
                            )}
                        </div>
                    )}
                </section>
            </main>

            <Footer />
        </div>
    );
}
