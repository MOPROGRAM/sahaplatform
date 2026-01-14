"use client";

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Search, Filter, MapPin, Clock, Heart, Share2, ChevronLeft, Image as ImageIcon, PlusCircle } from 'lucide-react';
import { apiService } from '@/lib/api';
import { useLanguage } from '@/lib/language-context';

interface Ad {
    id: string;
    title: string;
    description: string;
    price: number;
    currency: string;
    category: string;
    location: string;
    images: string;
    isBoosted: boolean;
    author: {
        name: string;
        verified: boolean;
    };
    createdAt: string;
}

function AdsContent() {
    const { language, t } = useLanguage();
    const searchParams = useSearchParams();
    const categoryQuery = searchParams.get('category');

    const [ads, setAds] = useState<Ad[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [locationFilter, setLocationFilter] = useState('');
    const [priceRange, setPriceRange] = useState({ min: '', max: '' });

    useEffect(() => {
        fetchAds();
    }, [categoryQuery]);

    const fetchAds = async () => {
        setLoading(true);
        try {
            const params: any = {};
            if (categoryQuery) params.category = categoryQuery;
            if (searchQuery) params.searchQuery = searchQuery;
            if (locationFilter) params.location = locationFilter;
            if (priceRange.min) params.minPrice = priceRange.min;
            if (priceRange.max) params.maxPrice = priceRange.max;

            const data = await apiService.get('/ads', params);
            setAds(data);
        } catch (error) {
            console.error('Failed to fetch ads:', error);
            setAds([]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#f0f2f5]" dir={language === 'ar' ? 'rtl' : 'ltr'}>
            {/* Unified Micro Header */}
            <header className="bg-white border-b border-gray-200 py-2 px-4 shadow-sm sticky top-0 z-50">
                <div className="max-w-7xl mx-auto flex items-center gap-6">
                    <Link href="/" className="flex items-center gap-2 group shrink-0">
                        <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center p-1.5 shadow-md">
                            <svg viewBox="0 0 100 40" className="w-full h-full text-white" fill="none" stroke="currentColor" strokeWidth="10" strokeLinecap="round">
                                <path d="M 10 15 L 10 10 L 90 10 L 90 20 M 10 20 L 10 30 L 90 30 L 90 25" />
                            </svg>
                        </div>
                        <span className="text-lg font-black tracking-tighter text-secondary">{t('siteName')}</span>
                    </Link>

                    <div className="flex-1 max-w-xl flex border-2 border-primary rounded-sm overflow-hidden bg-white">
                        <input
                            type="text"
                            placeholder={t('searchPlaceholder')}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && fetchAds()}
                            className="flex-1 px-3 py-1.5 text-xs outline-none font-bold"
                        />
                        <button onClick={fetchAds} className="bg-primary px-4 text-white hover:bg-primary-hover transition-colors">
                            <Search size={14} />
                        </button>
                    </div>

                    <Link href="/post-ad" className="bg-secondary text-white px-4 py-1.5 rounded-sm text-[11px] font-black flex items-center gap-2 hover:bg-black transition-all shrink-0">
                        <PlusCircle size={14} />
                        {t('postAd')}
                    </Link>
                </div>
            </header>

            {/* Filter Bar - Ultra Compact */}
            <div className="bg-white border-b border-gray-200 py-1.5 px-4 sticky top-[53px] z-40">
                <div className="max-w-7xl mx-auto flex items-center gap-3">
                    <div className="flex items-center gap-1.5 text-[10px] font-black text-gray-500 bg-gray-50 px-2 py-1 rounded-sm border border-gray-200">
                        <Filter size={12} />
                        <span>تصفية:</span>
                    </div>
                    <input
                        type="text"
                        placeholder="المدينة"
                        className="bg-gray-50 border border-gray-200 px-2 py-1 text-[10px] rounded-sm focus:border-primary outline-none w-24"
                        value={locationFilter}
                        onChange={(e) => setLocationFilter(e.target.value)}
                    />
                    <div className="flex items-center gap-1">
                        <input
                            type="number"
                            placeholder="الأقل"
                            className="bg-gray-50 border border-gray-200 px-2 py-1 text-[10px] rounded-sm focus:border-primary outline-none w-16"
                            value={priceRange.min}
                            onChange={(e) => setPriceRange(prev => ({ ...prev, min: e.target.value }))}
                        />
                        <span className="text-[10px] opacity-30">-</span>
                        <input
                            type="number"
                            placeholder="الأعلى"
                            className="bg-gray-50 border border-gray-200 px-2 py-1 text-[10px] rounded-sm focus:border-primary outline-none w-16"
                            value={priceRange.max}
                            onChange={(e) => setPriceRange(prev => ({ ...prev, max: e.target.value }))}
                        />
                    </div>
                    <button onClick={fetchAds} className="bg-primary/10 text-primary px-3 py-1 text-[10px] font-black rounded-sm hover:bg-primary hover:text-white transition-all">تطبيق</button>
                </div>
            </div>

            <main className="max-w-7xl mx-auto w-full p-2">
                {/* Result Info */}
                <div className="flex items-center justify-between mb-3 px-1">
                    <h1 className="text-[13px] font-black uppercase text-secondary">
                        {categoryQuery ? `${categoryQuery}` : 'جميع الإعلانات'}
                        <span className="text-[10px] font-bold text-gray-400 mr-2 border-r pr-2">({ads.length} نتيجة)</span>
                    </h1>
                </div>

                {loading ? (
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2">
                        {[...Array(12)].map((_, i) => (
                            <div key={i} className="bg-white border border-gray-100 rounded-sm p-2 animate-pulse">
                                <div className="aspect-[4/3] bg-gray-50 mb-2"></div>
                                <div className="h-3 bg-gray-50 w-3/4 mb-1"></div>
                                <div className="h-3 bg-gray-50 w-1/2"></div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2">
                        {ads.map((ad) => (
                            <Link
                                key={ad.id}
                                href={`/ads/view?id=${ad.id}`}
                                className="bg-white border border-gray-100 p-2 rounded-sm hover:border-primary transition-all group flex flex-col gap-1.5 h-full shadow-sm"
                            >
                                <div className="aspect-[4/3] bg-gray-50 rounded-xs relative overflow-hidden flex items-center justify-center border border-gray-100 shrink-0">
                                    <ImageIcon className="text-gray-200" size={24} />
                                    {ad.isBoosted && (
                                        <div className="absolute top-0 right-0 bg-primary text-white text-[8px] font-black px-1.5 py-0.5 rounded-bl-sm">مميز</div>
                                    )}
                                </div>
                                <div className="flex flex-col gap-1 flex-1">
                                    <h3 className="text-[11px] font-black line-clamp-2 leading-[1.2] group-hover:text-primary transition-colors h-[26px]">
                                        {ad.title}
                                    </h3>
                                    <div className="flex flex-col mt-auto">
                                        <div className="text-[12px] font-black text-primary">
                                            {new Intl.NumberFormat('ar-SA').format(ad.price)} <span className="text-[8px] opacity-60">ر.س</span>
                                        </div>
                                        <div className="flex justify-between items-center text-[9px] font-bold text-gray-400 border-t border-gray-50 pt-1 mt-1">
                                            <span className="flex items-center gap-1 truncate"><MapPin size={8} /> {ad.location}</span>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}

export default function AdsPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-[#f0f2f5] flex items-center justify-center font-black text-xs text-primary italic">LOADING SAHA...</div>}>
            <AdsContent />
        </Suspense>
    );
}