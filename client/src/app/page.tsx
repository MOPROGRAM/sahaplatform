"use client";

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { Search, MapPin, Heart, MessageSquare, PlusCircle, Sparkles, Zap, ChevronLeft, Clock, Image as ImageIcon, Globe, Grid, TrendingUp, Loader2, Building2, Briefcase, Car, ShoppingBag, Wrench, Layers } from 'lucide-react';
import { apiService } from '@/lib/api';
import { useLanguage } from '@/lib/language-context';
import { useAuthStore } from '@/store/useAuthStore';
import Header from '@/components/Header';

interface Ad {
    id: string;
    title: string;
    price: string;
    location: string;
    category: string;
    createdAt: string;
    featured?: boolean;
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
            const data = await apiService.get('/ads');
            setAds(data);
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

            <main className="max-w-7xl mx-auto w-full p-4 grid grid-cols-12 gap-6">
                {/* Left Sidebar */}
                <aside className="col-span-12 md:col-span-2 space-y-4">
                    <div className="bg-white border border-gray-200 rounded-md overflow-hidden shadow-sm">
                        <div className="bg-gray-100 px-4 py-2 text-[12px] font-black border-b border-gray-200 text-black uppercase tracking-tight">
                            {t('categories')}
                        </div>
                        <nav className="flex flex-col">
                            {categoriesList.map((cat, idx) => (
                                <Link
                                    key={idx}
                                    href={`/ads?category=${cat.key}`}
                                    className="flex items-center justify-between px-4 py-2.5 hover:bg-primary/5 text-[13px] font-bold text-gray-700 transition-colors group border-b border-gray-50 last:border-0"
                                >
                                    <span className="flex items-center gap-3 group-hover:text-primary transition-colors">
                                        <cat.icon size={16} className="text-gray-400 group-hover:text-primary transition-colors" />
                                        {cat.name}
                                    </span>
                                    <span className="text-[10px] text-gray-300 font-bold group-hover:text-primary/50">{cat.count}</span>
                                </Link>
                            ))}
                        </nav>
                    </div>

                    <div className="bg-navy p-5 rounded-md text-white shadow-xl shadow-navy/20 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-primary/20 rounded-full -mr-12 -mt-12 blur-2xl group-hover:scale-150 transition-transform"></div>
                        <h4 className="text-[12px] font-black mb-1 italic text-primary uppercase tracking-tighter relative z-10">{t('siteName')} PRO</h4>
                        <p className="text-[10px] font-bold leading-relaxed mb-3 opacity-90 relative z-10">{t('joinThousands')}</p>
                        <button className="btn-saha-primary !px-4 !py-2 !text-[9px] !border-b-[4px] relative z-10">{t('startToday')}</button>
                    </div>
                </aside>

                {/* Central Feed */}
                <section className="col-span-12 md:col-span-8 flex flex-col gap-4">
                    <div className="flex items-center justify-between px-4 py-3 bg-white border border-gray-200 rounded-md shadow-sm">
                        <div className="flex items-center gap-3">
                            <Sparkles className="text-primary" size={18} />
                            <h2 className="text-[15px] font-[1000] uppercase tracking-tight text-black">{t('latestOffers')}</h2>
                        </div>
                        <div className="flex gap-4 text-[12px] font-black text-gray-400">
                            <span className="text-primary border-b-2 border-primary pb-0.5">{t('viewAll')}</span>
                            <span className="hover:text-black cursor-pointer transition-colors uppercase">{t('featured')}</span>
                            <span className="hover:text-black cursor-pointer transition-colors uppercase">{t('newAd')}</span>
                        </div>
                    </div>

                    {loading ? (
                        <div className="bg-white h-64 flex items-center justify-center border border-gray-200 rounded-md shadow-sm">
                            <Loader2 className="animate-spin text-primary" size={32} />
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {ads.length > 0 ? ads.map((ad, idx) => (
                                <Link href={`/ads/view?id=${ad.id}`} key={idx} className="bg-white border border-gray-200 p-3 rounded-md hover:border-primary transition-all group flex flex-col gap-3 h-full shadow-sm hover:shadow-xl hover:-translate-y-1">
                                    <div className="aspect-[4/3] bg-gray-50 rounded-sm relative overflow-hidden flex items-center justify-center border border-gray-100 group-hover:bg-primary/5 transition-colors">
                                        <ImageIcon className="text-gray-200 group-hover:text-primary/20 transition-all" size={32} />
                                        {ad.featured && (
                                            <div className="absolute top-2 right-2 bg-primary text-white text-[10px] font-black px-2 py-0.5 rounded-sm shadow-lg shadow-primary/30 uppercase italic">{t('featured')}</div>
                                        )}
                                    </div>
                                    <div className="flex flex-col gap-2 flex-1">
                                        <h4 className="text-[15px] font-black line-clamp-2 leading-snug group-hover:text-primary transition-colors h-[40px] text-black uppercase tracking-tight">{ad.title}</h4>
                                        <div className="text-[18px] font-black text-primary italic tracking-tighter mt-1">
                                            {ad.price.toLocaleString()} <span className="text-[11px] opacity-60 font-bold uppercase tracking-widest not-italic">SAR</span>
                                        </div>
                                        <div className="flex justify-between items-center text-[11px] font-bold text-gray-500 border-t border-gray-100 pt-3 mt-auto">
                                            <span className="flex items-center gap-1.5"><MapPin size={12} className="text-primary" /> {ad.location}</span>
                                            <button className="btn-saha-primary !px-2.5 !py-1 !text-[10px] !border-b-[3px] !shadow-sm !rounded-sm">
                                                {t('details')}
                                            </button>
                                        </div>
                                    </div>
                                </Link>
                            )) : (
                                <div className="col-span-full bg-white p-20 text-center border border-dashed border-gray-300 rounded-lg">
                                    <div className="text-gray-300 font-bold uppercase tracking-widest text-[13px]">{t('noResults')}</div>
                                </div>
                            )}
                        </div>
                    )}
                </section>

                {/* Right Widgets */}
                <aside className="col-span-12 md:col-span-2 space-y-4">
                    <div className="bg-white border border-gray-200 p-4 rounded-md shadow-sm">
                        <div className="flex items-center gap-2 mb-4 text-black border-r-4 border-primary pr-3 leading-none">
                            <Zap size={16} className="text-primary fill-primary" />
                            <h3 className="text-[13px] font-black uppercase italic tracking-tight">{t('trending')}</h3>
                        </div>
                        <div className="space-y-4">
                            {[1, 2, 3, 4].map(i => (
                                <div key={i} className="flex gap-3 items-center group cursor-pointer border-b border-gray-50 last:border-0 pb-3 transition-all">
                                    <div className="w-10 h-10 rounded-sm bg-gray-50 border border-gray-100 flex items-center justify-center shrink-0 group-hover:bg-primary/5 group-hover:border-primary/20 transition-all">
                                        <ImageIcon className="text-gray-200 group-hover:text-primary/40" size={16} />
                                    </div>
                                    <div className="flex flex-col min-w-0">
                                        <span className="text-[12px] font-black text-black truncate group-hover:text-primary transition-colors uppercase tracking-tight">{t('realEstate')}</span>
                                        <span className="text-[12px] font-black text-primary leading-none italic mt-1">125k <span className="text-[9px] opacity-40 uppercase tracking-widest">SAR</span></span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="bg-white border border-gray-200 p-5 rounded-md text-center relative overflow-hidden flex flex-col justify-center items-center group shadow-premium hover:shadow-2xl transition-all">
                        <h4 className="text-[15px] font-[1000] text-black relative z-10 leading-none uppercase tracking-tighter">{t('siteBrand')}</h4>
                        <p className="text-[11px] text-gray-500 mt-2 relative z-10 leading-tight font-bold uppercase tracking-widest opacity-80">{t('taglineFooter')}</p>
                        <button className="btn-saha-secondary !w-full !px-4 !py-2.5 !text-[11px] !border-b-[4px] mt-4 relative z-10">{t('register')}</button>
                    </div>
                </aside>
            </main>

            {/* Localized Footer */}
            <footer className="mt-auto bg-white border-t border-gray-200 py-6 px-4">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="flex items-center gap-6 text-[12px] font-bold text-gray-500">
                        <span className="font-[1000] italic text-black tracking-tighter uppercase">{t('siteName')} SYNC © 2026</span>
                        <div className="flex gap-4">
                            <span className="hover:text-primary cursor-pointer transition-colors uppercase tracking-widest text-[10px]">{t('help')}</span>
                            <span className="hover:text-primary cursor-pointer transition-colors uppercase tracking-widest text-[10px]">{t('advertiseWithUs')}</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2.5 bg-gray-50 border border-gray-200 rounded-md px-3 py-1.5 shadow-inner">
                            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.6)]"></div>
                            <span className="text-[10px] font-black text-green-700 uppercase tracking-widest">{t('secureProtocol')}</span>
                        </div>
                    </div>
                </div>
                <div className="max-w-7xl mx-auto mt-4 pt-4 border-t border-gray-50 text-center">
                    <p className="text-[10px] font-black text-gray-300 uppercase tracking-[0.3em]">{t('footerNotice')}</p>
                </div>
            </footer>
        </div>
    );
}
