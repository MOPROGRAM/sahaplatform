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

    const categoriesList = [
        { name: t('jobs'), icon: Briefcase, key: 'jobs', count: "3.6k" },
        { name: t('realEstate'), icon: Building2, key: 'realEstate', count: "8.5k" },
        { name: t('cars'), icon: Car, key: 'cars', count: "12.3k" },
        { name: t('goods'), icon: ShoppingBag, key: 'goods', count: "15k" },
        { name: t('services'), icon: Wrench, key: 'services', count: "4k" },
        { name: t('other'), icon: Layers, key: 'other', count: "2k" }
    ];

    useEffect(() => {
        fetchAds();
    }, []);

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
                // Ensure data is always an array
                setAds(Array.isArray(data as any) ? (data as any) : []);
            }
        } catch (error) {
            console.error('Failed to fetch ads:', error);
            setAds([]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#f8fafc] flex flex-col" dir={language === 'ar' ? 'rtl' : 'ltr'}>
            <Header />

            {/* Ticker - Localized and High Contrast */}
            <div className="bg-black text-white py-2 overflow-hidden text-[13px] font-black uppercase tracking-widest border-b border-white/10 shadow-lg">
                <div className="animate-marquee flex gap-32">
                    <span className="flex items-center gap-3">
                        <span className="bg-primary text-white px-2 py-0.5 rounded-sm text-[11px] font-black italic">{t('hotOffer')}</span>
                        {t('tickerMessage1')}
                    </span>
                    <span className="flex items-center gap-3">
                        <span className="bg-emerald text-white px-2 py-0.5 rounded-sm text-[11px] font-black italic">{t('trending')}</span>
                        {t('tickerMessage2')}
                    </span>
                </div>
            </div>



            <main className="max-w-7xl mx-auto w-full p-2 grid grid-cols-12 gap-3">
                {/* Left Sidebar */}
                <aside className="col-span-12 md:col-span-2 space-y-3">
                    <div className="bg-white border border-gray-200 rounded-md overflow-hidden shadow-sm">
                        <div className="bg-gray-100 px-3 py-1.5 text-[11px] font-black border-b border-gray-200 text-black uppercase tracking-tight">
                            {t('categories')}
                        </div>
                        <nav className="flex flex-col">
                            {categoriesList.map((cat, idx) => (
                                <Link
                                    key={idx}
                                    href={`/ads?category=${cat.key}`}
                                    className="flex items-center justify-between px-3 py-2 hover:bg-primary/5 text-[12px] font-bold text-gray-700 transition-colors group border-b border-gray-50 last:border-0"
                                >
                                    <span className="flex items-center gap-2 group-hover:text-primary transition-colors">
                                        <cat.icon size={14} className="text-gray-400 group-hover:text-primary transition-colors" />
                                        {cat.name}
                                    </span>
                                    <span className="text-[9px] text-gray-300 font-bold group-hover:text-primary/50">{cat.count}</span>
                                </Link>
                            ))}
                        </nav>
                    </div>

                    <div className="bg-navy p-4 rounded-md text-white shadow-xl shadow-navy/10 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-20 h-20 bg-primary/20 rounded-full -mr-10 -mt-10 blur-2xl group-hover:scale-150 transition-transform"></div>
                        <h4 className="text-[11px] font-black mb-1 italic text-primary uppercase tracking-tighter relative z-10">{t('siteName')} PRO</h4>
                        <p className="text-[9px] font-bold leading-tight mb-3 opacity-90 relative z-10">{t('joinThousands')}</p>
                        <button className="btn-saha-primary !px-3 !py-1 !text-[9px] !border-b-[3px] !shadow-none !rounded-sm relative z-10">{t('startToday')}</button>
                    </div>
                </aside>

                {/* Central Feed */}
                <section className="col-span-12 md:col-span-8 flex flex-col gap-3">
                    <div className="flex items-center justify-between px-3 py-2 bg-white border border-gray-200 rounded-md shadow-sm">
                        <div className="flex items-center gap-2">
                            <Sparkles className="text-primary" size={16} />
                            <h2 className="text-[13px] font-[1000] uppercase tracking-tight text-black">{t('latestOffers')}</h2>
                        </div>
                        <div className="flex gap-3 text-[11px] font-black text-gray-400">
                            <span className="text-primary border-b-2 border-primary pb-0.5 cursor-pointer">{t('viewAll')}</span>
                            <span className="hover:text-black cursor-pointer transition-colors uppercase">{t('featured')}</span>
                            <span className="hover:text-black cursor-pointer transition-colors uppercase">{t('newAd')}</span>
                        </div>
                    </div>

                    {loading ? (
                        <div className="bg-white h-48 flex items-center justify-center border border-gray-200 rounded-md shadow-sm">
                            <LoadingSpinner size={32} />
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {ads.length > 0 ? ads.map((ad, idx) => (
                                <AdCard
                                    key={idx}
                                    id={ad.id}
                                    title={ad.title}
                                    price={ad.price || 0}
                                    currency="ريال"
                                    location={ad.location || ''}
                                    images={ad.images ? JSON.parse(ad.images) : []}
                                    createdAt={ad.created_at}
                                    category={ad.category}
                                    language={language}
                                />
                            )) : (
                                <div className="col-span-full bg-white p-12 text-center border border-dashed border-gray-300 rounded-md">
                                    <div className="text-gray-300 font-bold uppercase tracking-widest text-[11px]">{t('noResults')}</div>
                                </div>
                            )}
                        </div>
                    )}
                </section>

                {/* Right Widgets */}
                <aside className="col-span-12 md:col-span-2 space-y-3">
                    <div className="bg-white border border-gray-200 p-3 rounded-md shadow-sm">
                        <div className="flex items-center gap-2 mb-3 text-black border-r-4 border-primary pr-2 leading-none">
                            <Zap size={14} className="text-primary fill-primary" />
                            <h3 className="text-[12px] font-black uppercase italic tracking-tight">{t('trending')}</h3>
                        </div>
                        <div className="space-y-3">
                            {[1, 2, 3, 4].map(i => (
                                <div key={i} className="flex gap-2 items-center group cursor-pointer border-b border-gray-50 last:border-0 pb-2 transition-all">
                                    <div className="w-9 h-9 rounded-sm bg-gray-50 border border-gray-100 flex items-center justify-center shrink-0 group-hover:bg-primary/5 group-hover:border-primary/20 transition-all">
                                        <ImageIcon className="text-gray-200 group-hover:text-primary/40" size={14} />
                                    </div>
                                    <div className="flex flex-col min-w-0">
                                        <span className="text-[11px] font-black text-black truncate group-hover:text-primary transition-colors uppercase tracking-tight">{t('realEstate')}</span>
                                        <span className="text-[11px] font-black text-primary leading-none italic mt-1">125k <span className="text-[8px] opacity-40 uppercase tracking-widest">SAR</span></span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="bg-white border border-gray-200 p-4 rounded-md text-center relative overflow-hidden flex flex-col justify-center items-center group shadow-sm hover:shadow-md transition-all">
                        <h4 className="text-[13px] font-[1000] text-black relative z-10 leading-none uppercase tracking-tighter">{t('siteBrand')}</h4>
                        <p className="text-[9px] text-gray-400 mt-2 relative z-10 leading-tight font-bold uppercase tracking-widest opacity-80">{t('taglineFooter')}</p>
                        <button className="btn-saha-attract !w-full !px-3 !py-1.5 !text-[10px] !border-b-[3px] mt-3 relative z-10">{t('register')}</button>
                    </div>
                </aside>
            </main>

            {/* Localized Footer */}
            <Footer />
        </div>
    );
}
