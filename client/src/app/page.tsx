"use client";

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { Search, MapPin, Heart, MessageSquare, PlusCircle, Sparkles, Zap, ChevronLeft, Clock, Image as ImageIcon, Globe, Grid, TrendingUp, Loader2, Building2, Briefcase, Car, ShoppingBag, Wrench, Layers } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useLanguage } from '@/lib/language-context';
import { useAuthStore } from '@/store/useAuthStore';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import SearchBar from '@/components/SearchBar';
import LoadingSpinner from '@/components/LoadingSpinner';
import AdCard from '@/components/AdCard';

interface Ad {
    id: string;
    title: string;
    price: number | null;
    location: string | null;
    category: string;
    created_at: string;
    images: string;
    is_boosted?: boolean;
    author_id: string;
    currency?: {
        code: string;
        symbol: string;
    };
}

export default function HomePage() {
    const { language, setLanguage, t } = useLanguage();
    const { user } = useAuthStore();
    const [ads, setAds] = useState<Ad[]>([]);
    const [loading, setLoading] = useState(true);

    const [categoriesList, setCategoriesList] = useState([
        { name: t('jobs'), icon: Briefcase, key: 'jobs', count: 0 },
        { name: t('realEstate'), icon: Building2, key: 'realEstate', count: 0 },
        { name: t('cars'), icon: Car, key: 'cars', count: 0 },
        { name: t('goods'), icon: ShoppingBag, key: 'goods', count: 0 },
        { name: t('services'), icon: Wrench, key: 'services', count: 0 },
        { name: t('other'), icon: Layers, key: 'other', count: 0 }
    ]);

    useEffect(() => {
        fetchAds();
        fetchCategoryCounts();
    }, []);

    const fetchCategoryCounts = async () => {
        try {
            const updated = await Promise.all(categoriesList.map(async (cat) => {
                const { count, error } = await (supabase as any)
                    .from('Ad')
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
            console.error('Failed to fetch category counts:', error);
        }
    };

    const fetchAds = async () => {
        try {
            const { data, error } = await (supabase as any)
                .from('Ad')
                .select('*')
                .order('created_at', { ascending: false })
                .limit(20);

            if (error) {
                console.error('Failed to fetch ads:', error);
                setAds([]);
            } else {
                setAds(Array.isArray(data) ? data : []);
            }
        } catch (error) {
            console.error('Failed to fetch ads:', error);
            setAds([]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col" dir={language === "ar" ? "rtl" : "ltr"}>
            <Header />

            {/* Paid Ads Sticky Slider (replaced by PromotedBanner) */}
            {/* Replaced with site-wide PromotedBanner via Header for consistent UX */}
            

            <main className="max-w-7xl mx-auto w-full p-4 grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Left Sidebar */}
                <aside className="lg:col-span-3 space-y-4">
                    <div className="depth-card overflow-hidden">
                        <div className="bg-gray-800 px-4 py-3 text-sm font-black border-b border-gray-700 text-white uppercase tracking-tight">
                            {t('categories')}
                        </div>
                        <nav className="flex flex-col">
                            {categoriesList.map((cat, idx) => (
                                <Link
                                    key={idx}
                                    href={`/ads?category=${cat.key}`}
                                    className="flex items-center justify-between px-4 py-3 hover:bg-primary/10 text-sm font-bold text-gray-300 hover:text-white transition-colors group border-b border-gray-800 last:border-0"
                                >
                                    <span className="flex items-center gap-3 group-hover:text-primary transition-colors">
                                        <cat.icon size={16} className="text-gray-500 group-hover:text-primary transition-colors" />
                                        {cat.name}
                                    </span>
                                    <span className="text-sm text-gray-400 font-bold group-hover:text-primary/50">{cat.count}</span>
                                </Link>
                            ))}
                        </nav>
                    </div>
                </aside>

                {/* Central Bento Grid Feed */}
                <section className="lg:col-span-9 flex flex-col gap-6">
                    <div className="depth-card flex items-center justify-between px-6 py-4">
                        <div className="flex items-center gap-3">
                            <Sparkles className="text-primary" size={20} />
                            <h2 className="text-lg font-black uppercase tracking-tight text-white">{t('latestOffers')}</h2>
                        </div>
                        <div className="flex gap-4 text-sm font-bold text-gray-400">
                            <span className="text-primary border-b-2 border-primary pb-1 cursor-pointer">{t('viewAll')}</span>
                            <span className="hover:text-white cursor-pointer transition-colors uppercase">{t('featured')}</span>
                            <span className="hover:text-white cursor-pointer transition-colors uppercase">{t('newAd')}</span>
                        </div>
                    </div>

                    {loading ? (
                        <div className="depth-card h-64 flex items-center justify-center">
                            <LoadingSpinner size={40} />
                        </div>
                    ) : (
                        <div className="bento-grid">
                            {ads.map((ad, idx) => (
                                <AdCard
                                    key={ad.id}
                                    id={ad.id}
                                    title={ad.title}
                                    price={ad.price || 0}
                                    currency="ريال"
                                    location={ad.location || ''}
                                    images={ad.images ? JSON.parse(ad.images) : []}
                                    createdAt={ad.created_at}
                                    category={ad.category}
                                    language={language}
                                    isFeatured={ad.is_boosted || false}
                                    className={ad.is_boosted ? 'bento-large' : 'bento-small'}
                                />
                            ))}
                        </div>
                    )}
                </section>
            </main>

            {/* Localized Footer */}
            <Footer />
        </div>
    );
}
