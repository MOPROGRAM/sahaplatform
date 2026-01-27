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

interface Ad {
    id: string;
    title: string;
    price: number | null;
    location: string | null;
    category: string;
    description?: string;
    created_at: string;
    images: string;
    is_boosted?: boolean;
    author_id: string;
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
                .eq('is_active', true);

            if (filter === 'featured') {
                query = query.eq('is_boosted', true);
            }

            query = query.order('created_at', { ascending: false }).limit(20);

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
                    .eq('is_active', true)
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
        <div className="min-h-screen bg-[#f4f4f4] flex flex-col" dir={language === "ar" ? "rtl" : "ltr"}>
            <Header />

            <main className="max-w-7xl mx-auto w-full p-2 grid grid-cols-1 lg:grid-cols-12 gap-3 flex-1">
                {/* Right Sidebar - Titled Categories */}
                <aside className="lg:col-span-3 order-1 lg:order-2 space-y-2 hidden md:block">
                    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
                        <div className="bg-gray-50 px-3 py-2 text-xs font-black border-b border-gray-100 text-secondary uppercase tracking-widest text-center">
                            {t("categories")}
                        </div>
                        <nav className="flex flex-col">
                            {categoriesList.map((cat, idx) => (
                                <Link
                                    key={idx}
                                    href={`/ads?category=${cat.key}`}
                                    className="flex items-center justify-between px-3 py-2 hover:bg-primary/5 text-sm font-bold text-gray-700 transition-colors group border-b border-gray-50 last:border-0"
                                >
                                    <span className="flex items-center gap-2 group-hover:text-primary transition-colors">
                                        <cat.icon size={14} className="text-gray-400 group-hover:text-primary transition-colors" />
                                        {cat.name}
                                    </span>
                                    <span className="text-xs text-gray-300 font-bold group-hover:text-primary/50">{cat.count}</span>
                                </Link>
                            ))}
                        </nav>
                    </div>
                </aside>

                {/* Central Grid Feed */}
                <section className="lg:col-span-9 order-2 lg:order-1 flex flex-col gap-3">
                    <div className="bg-white border border-gray-100 rounded-lg flex items-center justify-between px-4 py-2 shadow-sm">
                        <div className="flex items-center gap-2">
                            <Sparkles className="text-primary animate-pulse" size={16} />
                            <h2 className="text-base font-black uppercase tracking-tight text-secondary">{t("latestOffers")}</h2>
                        </div>
                        <div className="flex gap-3 text-xs font-bold text-gray-400 uppercase tracking-widest">
                            <button onClick={() => setFilter("all")} className={`pb-1 border-b-2 ${filter === "all" ? "text-primary border-primary" : "border-transparent"}`}>{t("viewAll")}</button>
                            <button onClick={() => setFilter("featured")} className={`pb-1 border-b-2 ${filter === "featured" ? "text-primary border-primary" : "border-transparent"}`}>{t("featured")}</button>
                            <button onClick={() => setFilter("new")} className={`pb-1 border-b-2 ${filter === "new" ? "text-primary border-primary" : "border-transparent"}`}>{t("newAd")}</button>
                        </div>
                    </div>

                    {loading ? (
                        <div className="bg-white h-64 flex items-center justify-center border border-gray-100 rounded-lg">
                            <LoadingSpinner size={32} />
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 pb-10">
                            {ads.map((ad) => (
                                <AdCard
                                    key={ad.id}
                                    id={ad.id}
                                    title={ad.title}
                                    price={ad.price || 0}
                                    currency={currency.toUpperCase()} // Use dynamic currency
                                    location={ad.location || ''}
                                    images={ad.images ? (typeof ad.images === 'string' ? JSON.parse(ad.images) : ad.images) : []}
                                    createdAt={ad.created_at}
                                    category={ad.category}
                                    language={language}
                                    isFeatured={ad.is_boosted || false}
                                />
                            ))}
                            {ads.length === 0 && (
                                <div className="col-span-full bg-white p-10 text-center border border-dashed border-gray-300 rounded-lg">
                                    <div className="text-gray-300 font-bold uppercase tracking-widest text-[11px]">{t('noResults')}</div>
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
