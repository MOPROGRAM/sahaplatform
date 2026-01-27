"use client";

import Link from 'next/link';
import { useState, useEffect, useCallback } from 'react';
import { Sparkles, Building2, Briefcase, Car, ShoppingBag, Wrench, Layers } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useLanguage } from '@/lib/language-context';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import LoadingSpinner from '@/components/LoadingSpinner';
import AdCard from '@/components/AdCard';
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface Ad {
    id: string;
    title: string;
    price: number | null;
    location: string | null;
    category: string;
    description?: string;
    createdAt: string;
    images: string;
    isBoosted?: boolean;
    userId: string;
    author?: {
        name: string;
    };
}

export default function HomePage() {
    const { language, t, currency } = useLanguage(); // Destructure currency
    const [ads, setAds] = useState<Ad[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'all' | 'featured' | 'new'>('all');

    const [categoriesList, setCategoriesList] = useState([
        { name: '...', icon: Briefcase, key: 'jobs', count: 0 },
        { name: '...', icon: Building2, key: 'realestate', count: 0 },
        { name: '...', icon: Car, key: 'cars', count: 0 },
        { name: '...', icon: ShoppingBag, key: 'goods', count: 0 },
        { name: '...', icon: Wrench, key: 'services', count: 0 },
        { name: '...', icon: Layers, key: 'other', count: 0 }
    ]);

    useEffect(() => {
        setCategoriesList([
            { name: t('jobs'), icon: Briefcase, key: 'jobs', count: 0 },
            { name: t('realestate'), icon: Building2, key: 'realestate', count: 0 },
            { name: t('cars'), icon: Car, key: 'cars', count: 0 },
            { name: t('goods'), icon: ShoppingBag, key: 'goods', count: 0 },
            { name: t('services'), icon: Wrench, key: 'services', count: 0 },
            { name: t('other'), icon: Layers, key: 'other', count: 0 }
        ]);
    }, [t]);

    const fetchAds = useCallback(async () => {
        try {
            setLoading(true);
            let query = (supabase as any)
                .from('Ad') // Changed from 'ads' to 'Ad'
                .select('*, author:User(name)') // Fetch author name
                .eq('isActive', true);

            if (filter === 'featured') {
                query = query.eq('isBoosted', true);
            }

            query = query.order('createdAt', { ascending: false }).limit(20);

            const { data, error } = await query;
            if (error) {
                console.error('Failed to fetch ads:', error);
                setAds([]);
            } else {
                setAds(data || []);
            }
        } catch (error) {
            console.error('Failed to fetch ads:', error);
            setAds([]);
        } finally {
            setLoading(false);
        }
    }, [filter]);

    const fetchCategoryCounts = useCallback(async () => {
        try {
            const updated = await Promise.all(categoriesList.map(async (cat) => {
                const { count } = await (supabase as any)
                    .from('Ad') // Changed from 'ads' to 'Ad'
                    .select('*', { count: 'exact', head: true })
                    .eq('isActive', true)
                    .eq('category', cat.key);
                return { key: cat.key, count: count || 0 };
            }));

            setCategoriesList(prev => prev.map(cat => ({
                ...cat,
                count: updated.find(u => u.key === cat.key)?.count || 0
            })));
        } catch (error) {
            console.warn('Failed to fetch category counts:', error);
        }
    }, [categoriesList]);

    useEffect(() => {
        fetchAds();
        fetchCategoryCounts();
    }, [fetchAds, fetchCategoryCounts]);

    return (
        <div className="min-h-screen bg-gray-bg flex flex-col transition-colors duration-300" dir={language === "ar" ? "rtl" : "ltr"}>
            <Header />

            <main className="max-w-[1400px] mx-auto w-full p-4 grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1">
                {/* Bento Grid Sidebar - Categories */}
                <aside className={`lg:col-span-3 space-y-4 hidden md:block ${language === 'ar' ? 'lg:order-1' : 'lg:order-1'}`}>
                    <div className="bento-card p-0 flex flex-col h-full">
                        <div className="p-4 border-b border-border-color bg-primary/5">
                            <h3 className="bento-title text-sm uppercase tracking-wider">{t("categories")}</h3>
                        </div>
                        <nav className="flex flex-col p-2 space-y-1">
                            {categoriesList.map((cat, idx) => (
                                <Link
                                    key={idx}
                                    href={`/ads?category=${cat.key}`}
                                    className="flex items-center justify-between px-4 py-3 rounded-xl hover:bg-gray-100 dark:hover:bg-white/5 transition-all group"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-gray-100 dark:bg-white/5 rounded-lg text-gray-500 group-hover:text-primary group-hover:bg-primary/10 transition-colors">
                                            <cat.icon size={18} />
                                        </div>
                                        <span className="font-bold text-sm text-text-main group-hover:text-primary transition-colors">{cat.name}</span>
                                    </div>
                                    <span className="text-xs font-bold text-text-muted bg-gray-100 dark:bg-white/5 px-2 py-1 rounded-md">{cat.count}</span>
                                </Link>
                            ))}
                        </nav>
                    </div>
                </aside>

                {/* Central Grid Feed */}
                <section className={`lg:col-span-9 flex flex-col gap-6 ${language === 'ar' ? 'lg:order-2' : 'lg:order-2'}`}>
                    {/* Bento Filter Bar */}
                    <div className="bento-card p-1 flex items-center justify-between">
                        <div className="flex items-center gap-3 px-4 py-3">
                            <div className="p-2 bg-primary/10 rounded-full text-primary animate-pulse">
                                <Sparkles size={18} />
                            </div>
                            <div>
                                <h2 className="text-base font-black uppercase tracking-tight text-text-main leading-none">{t("latestOffers")}</h2>
                                <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Fresh from the market</span>
                            </div>
                        </div>
                        <div className="flex p-1 bg-gray-100 dark:bg-black/20 rounded-2xl mx-2">
                            <button onClick={() => setFilter("all")} className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${filter === "all" ? "bg-white dark:bg-zinc-800 text-primary shadow-sm" : "text-text-muted hover:text-text-main"}`}>{t("viewAll")}</button>
                            <button onClick={() => setFilter("featured")} className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${filter === "featured" ? "bg-white dark:bg-zinc-800 text-primary shadow-sm" : "text-text-muted hover:text-text-main"}`}>{t("featured")}</button>
                            <button onClick={() => setFilter("new")} className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${filter === "new" ? "bg-white dark:bg-zinc-800 text-primary shadow-sm" : "text-text-muted hover:text-text-main"}`}>{t("newAd")}</button>
                        </div>
                    </div>

                    {loading ? (
                        <div className="bento-card h-96 flex flex-col items-center justify-center gap-4">
                            <LoadingSpinner size={40} />
                            <p className="text-sm font-bold text-text-muted animate-pulse">Loading best offers...</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 pb-10">
                            {ads.map((ad, idx) => (
                                <div key={ad.id} className={clsx(
                                    "transition-all duration-300",
                                    // Make first 2 featured ads span 2 cols if possible for bento feel
                                    // idx === 0 && ad.isBoosted ? "md:col-span-2 md:row-span-2" : ""
                                )}>
                                    <AdCard
                                        id={ad.id}
                                        title={ad.title}
                                        price={ad.price || 0}
                                        currency={currency.toUpperCase()}
                                        location={ad.location || ''}
                                        images={ad.images ? (typeof ad.images === 'string' ? JSON.parse(ad.images) : ad.images) : []}
                                        createdAt={ad.createdAt}
                                        category={ad.category}
                                        language={language}
                                        isFeatured={ad.isBoosted || false}
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
