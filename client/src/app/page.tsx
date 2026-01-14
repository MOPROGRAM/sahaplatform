"use client";

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { Search, MapPin, Heart, MessageSquare, PlusCircle, Sparkles, Zap, ChevronLeft, Clock, Image as ImageIcon, Globe } from 'lucide-react';
import { apiService } from '@/lib/api';
import { useLanguage } from '@/lib/language-context';

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
    const [ads, setAds] = useState<Ad[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentAdIndices, setCurrentAdIndices] = useState([0, 0, 0, 0, 0, 0]);

    const categories = [
        { name: t('jobs'), icon: "briefcase", key: 'jobs', count: "3,600" },
        { name: t('realEstate'), icon: "home", key: 'realEstate', count: "8,500" },
        { name: t('cars'), icon: "car", key: 'cars', count: "12,300" },
        { name: t('goods'), icon: "shopping-bag", key: 'goods', count: "15,200" },
        { name: t('services'), icon: "wrench", key: 'services', count: "4,200" },
        { name: t('other'), icon: "layers", key: 'other', count: "2,100" }
    ];

    useEffect(() => {
        fetchAds();

        // Ticker animation for each category
        const intervals = [];
        for (let i = 0; i < 6; i++) {
            const interval = setInterval(() => {
                setCurrentAdIndices(prev => {
                    const newIndices = [...prev];
                    newIndices[i] = (newIndices[i] + 1) % 5;
                    return newIndices;
                });
            }, 5000);
            intervals.push(interval);
        }

        return () => intervals.forEach(clearInterval);
    }, []);

    const fetchAds = async () => {
        try {
            const data = await apiService.get('/ads');
            setAds(data);
        } catch (error) {
            console.error('Failed to fetch ads:', error);
            // Show empty state when no data available
            setAds([]);
        } finally {
            setLoading(false);
        }
    };

    const getIconComponent = (iconName: string) => {
        const icons: Record<string, string> = {
            briefcase: "M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m8 0V8a2 2 0 012 2v6a2 2 0 01-2 2H6a2 2 0 01-2-2v-6a2 2 0 012-2V6m8 0H8",
            home: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6",
            car: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z",
            "shopping-bag": "M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z",
            wrench: "M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z",
            layers: "M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
        };
        return icons[iconName] || icons.layers;
    };

    return (
        <div className="min-h-screen bg-[#f8fafc] selection:bg-primary/20 flex flex-col overflow-hidden" dir="rtl">
            {/* Marketing Ticker */}
            <div className="glass border-b border-gray-200/50 py-1 overflow-hidden shrink-0 z-50">
                <div className="animate-marquee-slow flex gap-32 items-center">
                    <p className="text-[10px] font-bold flex items-center gap-2 text-gray-400">
                        <span className="bg-yellow-400/90 text-black px-1.5 rounded-sm text-[8px] font-black italic">إعلان ممول</span>
                        استأجر مكتبك بـ 500 ريال فقط في قلب العاصمة - احجز عبر ساحة | <a href="#" className="underline text-secondary">التفاصيل</a>
                    </p>
                    <p className="text-[10px] font-bold flex items-center gap-2 text-gray-400">
                        <span className="bg-primary text-white px-1.5 rounded-sm text-[8px] font-black italic">ساحة بيزنس</span>
                        باقات مخصصة للمنشآت الصغيرة والمتوسطة بخصم 40% | <a href="#" className="underline text-primary">اشترك هنا</a>
                    </p>
                </div>
            </div>

            {/* Top Navigation */}
            <div className="py-1 text-[10px] font-bold text-gray-400 shrink-0">
                <div className="w-full px-4 flex justify-between items-center">
                    <div className="flex gap-4 items-center">
                        <button
                            onClick={() => setLanguage(language === 'ar' ? 'en' : 'ar')}
                            className="flex gap-2 text-primary hover:text-primary-hover transition-colors"
                        >
                            <Globe className="w-3 h-3" />
                            <span>{language === 'ar' ? 'English' : 'العربية'}</span>
                        </button>
                        <span className="text-gray-200 font-light">|</span>
                        <Link href="/help" className="hover:text-primary transition-colors cursor-pointer">{t('help')}</Link>
                        <Link href="/advertise" className="text-primary/80 italic font-black cursor-pointer hover:underline">{t('advertiseWithUs')}</Link>
                    </div>
                    <div className="flex gap-4 items-center">
                        <span className="flex items-center gap-1.5">
                            <MapPin className="w-3 text-primary" />
                            الرياض
                        </span>
                        <Link href="/login" className="text-secondary font-black cursor-pointer hover:text-primary transition-all">
                            {t('login')}
                        </Link>
                    </div>
                </div>
            </div>

            <main className="w-full h-full flex flex-col overflow-hidden px-2 pb-2">
                {/* Header with Search */}
                <header className="flex justify-between items-center glass p-2 px-4 rounded-xl mb-2 shadow-xl shadow-black/[0.02] shrink-0 gap-8">
                    <div className="flex items-center gap-8">
                        <div className="flex items-baseline gap-1.5 group cursor-pointer">
                            <Link href="/" className="text-3xl font-[900] text-primary tracking-tighter italic transition-all group-hover:scale-[1.02]">
                                ساحة
                            </Link>
                        </div>
                    </div>

                    <div className="flex-1 max-w-2xl relative group">
                        <input
                            type="text"
                            placeholder={t('searchPlaceholder')}
                            className="w-full bg-gray-100 border-none rounded-xl py-2.5 pr-10 pl-4 text-[11px] font-bold text-secondary focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-gray-400 group-hover:bg-white group-hover:shadow-md outline-none"
                        />
                        <Search className="w-4 absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 group-hover:text-primary transition-colors" />
                    </div>

                    <div className="flex items-center gap-4">
                        <Link href="/post-ad" className="bg-primary text-white px-5 py-2 font-black text-[10px] rounded-lg shadow-lg shadow-primary/20 hover:bg-[#e65c00] transition-all flex items-center gap-2 whitespace-nowrap">
                            <PlusCircle className="w-3.5" />
                            أضف إعلانك
                        </Link>
                    </div>
                </header>

                {/* Portal Layout */}
                <div className="grid grid-cols-12 gap-4 h-full overflow-hidden pb-4">
                    {/* Right Sidebar - Categories */}
                    <aside className="col-span-12 sm:col-span-6 md:col-span-3 lg:col-span-2 space-y-4 h-full overflow-y-auto">
                        <div className="glass rounded-xl overflow-hidden">
                            <div className="bg-secondary p-3 text-white text-sm font-bold text-center">
                                {t('categories')}
                            </div>
                            <div className="flex flex-col">
                                {categories.map((cat, idx) => (
                                    <Link
                                        key={idx}
                                        href={`/ads?category=${cat.key}`}
                                        className="px-4 py-3 border-b border-gray-200 last:border-0 hover:bg-primary/10 cursor-pointer flex justify-between items-center group transition-all duration-300"
                                    >
                                        <span className="text-sm font-semibold text-secondary/90 group-hover:text-primary flex items-center gap-3">
                                            <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={getIconComponent(cat.icon)} />
                                            </svg>
                                            {cat.name}
                                        </span>
                                        <span className="text-xs text-gray-500 font-medium bg-gray-100 px-2 py-1 rounded-full">({cat.count})</span>
                                        <ChevronLeft className="w-4 h-4 text-gray-400 group-hover:text-primary transition-all group-hover:translate-x-1" />
                                    </Link>
                                ))}
                            </div>
                        </div>

                        <div className="bg-white/60 backdrop-blur-md border border-white p-2.5 rounded-xl shadow-sm">
                            <h3 className="text-[10px] font-[900] border-r-3 border-primary pr-2 mb-2 leading-none text-secondary">
                                تصفية ذكية
                            </h3>
                            <div className="space-y-1.5">
                                <label className="flex items-center gap-2 text-[10px] font-bold text-gray-500 cursor-pointer group hover:text-primary transition-colors">
                                    <input type="checkbox" className="w-3.5 h-3.5 rounded accent-primary" />
                                    موثوق
                                </label>
                                <label className="flex items-center gap-2 text-[10px] font-bold text-gray-500 cursor-pointer group hover:text-primary transition-colors">
                                    <input type="checkbox" className="w-3.5 h-3.5 rounded accent-primary" />
                                    عاجل
                                </label>
                            </div>
                        </div>
                    </aside>

                    {/* Main Feed */}
                    <section className="col-span-12 sm:col-span-6 md:col-span-7 lg:col-span-8 flex flex-col gap-4 h-full overflow-y-auto px-2">
                        <div className="flex items-center gap-3 px-2 leading-none shrink-0 py-2">
                            <Sparkles className="w-5 h-5 text-primary animate-pulse" />
                            <h2 className="text-lg font-bold text-secondary border-r-4 border-primary pr-4">
                                {t('latestOffers')}
                            </h2>
                        </div>

                        {loading ? (
                            <div className="flex items-center justify-center py-16">
                                <div className="spinner"></div>
                                <span className="mr-4 text-gray-600 font-medium">{t('loading')}</span>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 pb-20">
                                {categories.map((category, idx) => {
                                    const categoryAds = ads.filter(a => a.category === category.key).slice(0, 3);
                                    const featuredAd = ads.find(a => a.category === category.key && a.featured) || categoryAds[0];

                                    return (
                                        <div key={idx} className="card flex flex-col group h-[280px]">
                                            <div className="bg-gray-50 p-3 border-b border-gray-200 flex items-center justify-between shrink-0">
                                                <span className="flex items-center gap-2">
                                                    <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={getIconComponent(category.icon)} />
                                                    </svg>
                                                    <span className="font-semibold text-secondary text-sm">{category.name}</span>
                                                </span>
                                            </div>

                                            <div className="divide-y divide-gray-100 overflow-hidden flex-1">
                                                {categoryAds.length > 0 ? categoryAds.map((ad, i) => (
                                                    <Link
                                                        key={ad.id}
                                                        href={`/ads/view?id=${ad.id}`}
                                                        className="py-3 px-3 border-b border-gray-100 last:border-0 hover:bg-gray-50 cursor-pointer flex flex-col gap-1 leading-tight group transition-all"
                                                    >
                                                        <h4 className="text-xs font-semibold text-secondary/90 line-clamp-1 group-hover:text-primary transition-colors">
                                                            {ad.title}
                                                        </h4>
                                                        <div className="flex justify-between items-center text-xs text-gray-500 font-medium">
                                                            <span className="flex items-center gap-1">
                                                                <Clock className="w-3 h-3" />
                                                                {new Date(ad.createdAt).toLocaleDateString(language === 'ar' ? 'ar-SA' : 'en-US')}
                                                            </span>
                                                            <span className="text-primary font-bold bg-primary/10 px-2 py-1 rounded text-xs">{ad.price} {language === 'ar' ? 'ر.س' : 'SAR'}</span>
                                                        </div>
                                                    </Link>
                                                )) : (
                                                    <div className="p-4 text-center text-gray-400 text-[10px] italic">لا يوجد إعلانات حالياً</div>
                                                )}
                                            </div>

                                            {featuredAd && (
                                                <div className="bg-gradient-to-br from-primary/5 to-transparent border-t border-b border-gray-100 group/spotlight relative h-[85px] overflow-hidden shrink-0">
                                                    <Link href={`/ads/view?id=${featuredAd.id}`} className="absolute inset-0 p-2 flex gap-2 group cursor-pointer hover:bg-white/40 transition-colors">
                                                        <div className="w-[65px] h-full bg-white rounded-md shrink-0 flex items-center justify-center relative overflow-hidden border border-white shadow-sm">
                                                            <ImageIcon className="w-4 text-gray-300" />
                                                            {featuredAd.featured && <div className="absolute top-0 right-0 bg-primary/90 text-white text-[7px] font-black px-1 py-0 rounded-bl-md shadow-sm">مميز</div>}
                                                        </div>
                                                        <div className="flex-1 flex flex-col justify-between py-0.5">
                                                            <div className="flex flex-col gap-0.5">
                                                                <h4 className="text-[10px] font-[900] text-secondary line-clamp-2 leading-[1.2] group-hover/spotlight:text-primary transition-colors">
                                                                    {featuredAd.title}
                                                                </h4>
                                                                <div className="flex items-center gap-2 text-[8px] text-gray-400 font-medium select-none">
                                                                    <span className="flex items-center gap-0.5">
                                                                        <MapPin className="w-2.5 text-gray-300" />
                                                                        {featuredAd.location}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                            <div className="flex justify-between items-end">
                                                                <span className="text-[10px] font-black text-primary">{featuredAd.price}</span>
                                                                <span className="text-[8px] font-bold bg-white border border-gray-100 px-1.5 py-0 rounded shadow-sm">التفاصيل</span>
                                                            </div>
                                                        </div>
                                                    </Link>
                                                </div>
                                            )}

                                            <div className="py-1 bg-white/30 text-center border-t border-white/50 shrink-0">
                                                <Link href={`/ads?category=${category.key}`} className="text-[8px] font-extrabold text-gray-400 hover:text-primary uppercase tracking-widest transition-all">
                                                    عرض الكل
                                                </Link>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </section>

                    {/* Left Sidebar - Featured & Business */}
                    <aside className="col-span-12 sm:col-span-6 md:col-span-3 lg:col-span-2 space-y-2 h-full overflow-y-auto pl-1">
                        <div className="bg-white/60 backdrop-blur-md border border-white rounded-xl p-2.5 shadow-sm">
                            <div className="flex items-center justify-between mb-2">
                                <h3 className="text-[10px] font-[900] flex items-center gap-1.5 text-secondary leading-none">
                                    <Zap className="w-3.5 text-primary" />
                                    مختارة
                                </h3>
                                <span className="text-[7px] font-black bg-primary text-white px-1 py-0.5 rounded-sm">VIP</span>
                            </div>
                            <div className="space-y-1">
                                {[1, 2, 3].map((i) => (
                                    <div key={i} className="flex gap-2 items-center group cursor-pointer border-b border-white/50 last:border-0 pb-1.5 mb-1.5 last:pb-0 last:mb-0 hover:bg-white rounded-lg transition-all">
                                        <div className="w-10 h-10 bg-gray-50 rounded-md shrink-0 border border-white flex items-center justify-center group-hover:bg-primary/5 transition-colors">
                                            <ImageIcon className="w-3.5 text-gray-200" />
                                        </div>
                                        <div className="flex flex-col leading-tight">
                                            <h4 className="text-[9px] font-bold group-hover:text-primary transition-colors line-clamp-1">
                                                فرصة استثنائية
                                            </h4>
                                            <span className="text-[9px] text-primary font-black mt-0.5">
                                                2.5M <span className="text-[7px] opacity-60">ر.س</span>
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="bg-gradient-to-br from-[#1c1e21] via-[#2a2d32] to-black p-3 rounded-xl text-white relative overflow-hidden group shadow-md transition-all hover:scale-[1.01] h-[100px] flex flex-col justify-center">
                            <div className="relative z-10 flex flex-col gap-1">
                                <h4 className="font-black text-lg italic tracking-tighter leading-none text-primary">ساحة BIZ</h4>
                                <p className="text-[8px] font-bold opacity-70 leading-relaxed">حلول أعمال متكاملة.</p>
                                <button className="mt-1.5 bg-primary w-fit px-3 py-1 text-[8px] font-black rounded hover:bg-white hover:text-black transition-all">اشترك</button>
                            </div>
                            <div className="absolute -bottom-6 -left-6 w-20 h-20 bg-primary opacity-20 rounded-full blur-2xl group-hover:scale-125 transition-all"></div>
                        </div>
                    </aside>
                </div>
            </main>
        </div>
    );
}
