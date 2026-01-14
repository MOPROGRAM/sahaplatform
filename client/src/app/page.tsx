"use client";

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { Search, MapPin, Heart, MessageSquare, PlusCircle, Sparkles, Zap, ChevronLeft, Clock, Image as ImageIcon, Globe, Grid, TrendingUp, Loader2 } from 'lucide-react';
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

    const categories = [
        { name: t('jobs'), icon: "briefcase", key: 'jobs', count: "3.6k" },
        { name: t('realEstate'), icon: "home", key: 'realEstate', count: "8.5k" },
        { name: t('cars'), icon: "car", key: 'cars', count: "12.3k" },
        { name: t('goods'), icon: "shopping-bag", key: 'goods', count: "15k" },
        { name: t('services'), icon: "wrench", key: 'services', count: "4k" },
        { name: t('other'), icon: "layers", key: 'other', count: "2k" }
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

    const getIconPath = (key: string) => {
        const paths: Record<string, string> = {
            jobs: "M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m8 0V8a2 2 0 012 2v6a2 2 0 01-2 2H6a2 2 0 01-2-2v-6a2 2 0 012-2V6m8 0H8",
            realEstate: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6",
            cars: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z",
            "shopping-bag": "M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z",
            services: "M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z",
            other: "M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
        };
        return paths[key] || paths.other;
    };

    return (
        <div className="min-h-screen bg-[#f0f2f5] flex flex-col" dir={language === 'ar' ? 'rtl' : 'ltr'}>
            <Header />

            {/* Ticker - Micro Density */}
            <div className="bg-navy text-white py-1.5 overflow-hidden text-[12px] font-black uppercase tracking-widest border-b border-white/10 shadow-lg">
                <div className="animate-marquee flex gap-32">
                    <span className="flex items-center gap-2">
                        <span className="bg-primary text-white px-1.5 py-0.5 rounded-xs text-[10px] italic">HOT</span>
                        {language === 'ar' ? 'عروض حصرية لمشتركي باقة "ساحة بيزنس" - خصم 50%' : 'Exclusive offers for Saha Business members - 50% OFF'}
                    </span>
                    <span className="flex items-center gap-2">
                        <span className="bg-emerald text-white px-1.5 py-0.5 rounded-xs text-[10px] italic">TRENDING</span>
                        {language === 'ar' ? 'أفضل وقت لنشر إعلانات السيارات: الآن!' : 'Best time to post Car ads: NOW!'}
                    </span>
                </div>
            </div>

            <main className="max-w-7xl mx-auto w-full p-2 grid grid-cols-12 gap-2">
                {/* Fixed Left Sidebar - High Density */}
                <aside className="col-span-2 space-y-2">
                    <div className="bg-white border border-gray-200 rounded-sm overflow-hidden">
                        <div className="bg-gray-100 px-3 py-1.5 text-[11px] font-black border-b border-gray-200">
                            {t('categories')}
                        </div>
                        <nav>
                            {categories.map((cat, idx) => (
                                <Link
                                    key={idx}
                                    href={`/ads?category=${cat.key}`}
                                    className="flex items-center justify-between px-3 py-1.5 hover:bg-primary/5 text-[11px] font-bold text-gray-600 transition-colors group border-b border-gray-50 last:border-0"
                                >
                                    <span className="flex items-center gap-2 group-hover:text-primary">
                                        <svg className="w-3 h-3 opacity-70 group-hover:opacity-100" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d={getIconPath(cat.key)} />
                                        </svg>
                                        {cat.name}
                                    </span>
                                    <span className="text-[9px] opacity-40 font-mono">{cat.count}</span>
                                </Link>
                            ))}
                        </nav>
                    </div>

                    <div className="bg-gradient-to-br from-primary to-primary-hover p-3 rounded-sm text-white shadow-sm">
                        <h4 className="text-[10px] font-black mb-1 italic opacity-80 uppercase tracking-tighter">Saha Premier</h4>
                        <p className="text-[9px] font-medium leading-[1.2] mb-2">{language === 'ar' ? 'حلول ذكية لنمو تجارتك.' : 'Smart solutions for your growth.'}</p>
                        <button className="w-full bg-black/20 py-1 text-[9px] font-black rounded hover:bg-black/30 transition-all uppercase tracking-widest">{t('choosePlan')}</button>
                    </div>
                </aside>

                {/* Central Feed - Maximum Content Density */}
                <section className="col-span-8 flex flex-col gap-2">
                    <div className="flex items-center justify-between px-2 py-1 bg-white border border-gray-200 rounded-sm shadow-sm">
                        <div className="flex items-center gap-2">
                            <TrendingUp className="text-primary" size={14} />
                            <h2 className="text-[13px] font-black uppercase tracking-tight">{t('latestOffers')}</h2>
                        </div>
                        <div className="flex gap-3 text-[10px] font-bold text-gray-400">
                            <span className="text-primary border-b-2 border-primary">الكل</span>
                            <span className="hover:text-secondary cursor-pointer">مميز</span>
                            <span className="hover:text-secondary cursor-pointer">جديد</span>
                        </div>
                    </div>

                    {loading ? (
                        <div className="bg-white h-64 flex items-center justify-center border border-gray-200 rounded-sm">
                            <Loader2 className="animate-spin text-primary" size={24} />
                        </div>
                    ) : (
                        <div className="grid grid-cols-3 gap-2">
                            {ads.map((ad, idx) => (
                                <Link href={`/ads/view?id=${ad.id}`} key={idx} className="bg-white border border-gray-100 p-2 rounded-sm hover:border-primary transition-all group flex flex-col gap-1.5 h-full shadow-sm hover:shadow-md">
                                    <div className="aspect-[4/3] bg-gray-50 rounded-xs relative overflow-hidden flex items-center justify-center border border-gray-100">
                                        <ImageIcon className="text-gray-200" size={24} />
                                        {ad.featured && (
                                            <div className="absolute top-0 right-0 bg-primary text-white text-[8px] font-black px-1.5 py-0.5 rounded-bl-sm shadow-sm">مميز</div>
                                        )}
                                    </div>
                                    <div className="flex flex-col gap-0.5">
                                        <div className="flex justify-between items-start gap-2">
                                            <h4 className="text-[11px] font-black line-clamp-2 leading-none group-hover:text-primary transition-colors h-[22px]">{ad.title}</h4>
                                        </div>
                                        <div className="text-[11px] font-black text-primary mt-1 italic tracking-tighter">
                                            {ad.price} <span className="text-[8px] opacity-60 font-bold uppercase tracking-widest">SAR</span>
                                        </div>
                                        <div className="flex justify-between items-center text-[9px] font-bold text-gray-400 border-t border-gray-50 pt-1 mt-1">
                                            <span className="flex items-center gap-1"><MapPin size={8} className="text-primary" /> {ad.location}</span>
                                            <span className="flex items-center gap-1"><Clock size={8} /> {new Date(ad.createdAt).toLocaleDateString()}</span>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </section>

                {/* Right Widgets - Active Data */}
                <aside className="col-span-2 space-y-2">
                    <div className="bg-white border border-gray-200 p-2 rounded-sm shadow-sm">
                        <div className="flex items-center gap-2 mb-2 text-secondary">
                            <Zap size={14} className="text-primary fill-primary" />
                            <h3 className="text-[11px] font-black uppercase italic tracking-tighter">Hot Deals</h3>
                        </div>
                        <div className="space-y-2">
                            {[1, 2, 3, 4].map(i => (
                                <div key={i} className="flex gap-2 items-center group cursor-pointer border-b border-gray-50 last:border-0 pb-1.5 transition-all">
                                    <div className="w-8 h-8 rounded-xs bg-gray-50 border border-gray-100 flex items-center justify-center shrink-0 group-hover:bg-primary/5 group-hover:border-primary/20">
                                        <ImageIcon className="text-gray-200 group-hover:text-primary" size={12} />
                                    </div>
                                    <div className="flex flex-col min-w-0">
                                        <span className="text-[10px] font-black truncate group-hover:text-primary line-clamp-1 uppercase tracking-tighter">Investment Dept</span>
                                        <span className="text-[10px] font-black text-primary leading-none italic">125k <span className="text-[8px] opacity-40 uppercase tracking-widest">SAR</span></span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="bg-gray-900 p-3 rounded-sm text-center relative overflow-hidden h-32 flex flex-col justify-center items-center group">
                        <div className="bg-primary/20 w-32 h-32 absolute -top-16 -left-16 rounded-full blur-3xl group-hover:scale-150 transition-transform"></div>
                        <h4 className="text-xs font-black text-white relative z-10 leading-none">{t('siteBrand')}</h4>
                        <p className="text-[8px] text-gray-400 mt-2 relative z-10 leading-tight font-bold uppercase tracking-widest opacity-60">GCC Largest Trade Hub</p>
                        <button className="bg-primary text-white text-[9px] font-black px-4 py-1.5 rounded-sm mt-3 relative z-10 hover:bg-primary-hover transition-all shadow-lg shadow-primary/30 uppercase tracking-widest active:scale-95">{t('register')}</button>
                    </div>
                </aside>
            </main>

            {/* Micro Footer */}
            <footer className="mt-auto bg-white border-t border-gray-200 py-3 px-4">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
                    <div className="flex items-center gap-4 text-[10px] font-bold text-gray-400">
                        <span className="font-black italic text-secondary tracking-tighter">SAHA SYNC © 2026</span>
                        <Link href="/" className="hover:text-secondary whitespace-nowrap uppercase tracking-widest text-[8px]">Terms</Link>
                        <Link href="/" className="hover:text-secondary whitespace-nowrap uppercase tracking-widest text-[8px]">Privacy</Link>
                        <Link href="/" className="hover:text-secondary whitespace-nowrap uppercase tracking-widest text-[8px]">Legal</Link>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-sm px-2 py-1">
                            <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse shadow-[0_0_5px_rgba(34,197,94,0.5)]"></div>
                            <span className="text-[8px] font-black text-green-600 uppercase tracking-widest">Network Secure</span>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}
