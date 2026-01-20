"use client";

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Search, Filter, MapPin, Clock, Heart, Share2, ChevronLeft, Image as ImageIcon, PlusCircle, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useLanguage } from '@/lib/language-context';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

interface Ad {
    id: string;
    title: string;
    description: string;
    price: number;
    currencyId: string;
    category: string;
    location: string;
    images: string;
    isBoosted: boolean;
    authorId: string;
    createdAt: string;
}

function AdsContent() {
    const { language, t, currency } = useLanguage();
    const searchParams = useSearchParams();
    const categoryQuery = searchParams.get('category');
    const searchQueryParam = searchParams.get('search');

    const [ads, setAds] = useState<Ad[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState(searchQueryParam || '');
    const [locationFilter, setLocationFilter] = useState('');
    const [priceRange, setPriceRange] = useState({ min: '', max: '' });

    useEffect(() => {
        setSearchQuery(searchQueryParam || '');
        fetchAds();
    }, [categoryQuery, searchQueryParam]);

    const fetchAds = async () => {
        setLoading(true);
        try {
            let query = supabase
                .from('Ad')
                .select('*')
                .order('createdAt', { ascending: false })
                .limit(20);

            if (categoryQuery) {
                query = query.eq('category', categoryQuery);
            }
            if (searchQuery) {
                query = query.or(`title.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%,titleAr.ilike.%${searchQuery}%,descriptionAr.ilike.%${searchQuery}%`);
            }
            if (locationFilter) {
                query = query.ilike('location', `%${locationFilter}%`);
            }
            if (priceRange.min) {
                query = query.gte('price', Number(priceRange.min));
            }
            if (priceRange.max) {
                query = query.lte('price', Number(priceRange.max));
            }

            const { data, error } = await query;
            if (error) throw error;
            setAds(data || []);
        } catch (error) {
            console.error('Failed to fetch ads:', error);
            setAds([]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#f0f2f5] flex flex-col" dir={language === 'ar' ? 'rtl' : 'ltr'}>
            <Header />

            {/* Filter Bar */}
            <div className="bg-white border-b border-gray-200 py-2 px-4 sticky top-[53px] z-40 shadow-sm">
                <div className="max-w-7xl mx-auto flex items-center gap-4">
                    <div className="flex items-center gap-2 text-[10px] font-black text-secondary bg-gray-100 px-3 py-1.5 rounded-xs border border-gray-200 uppercase tracking-widest italic">
                        <Filter size={14} className="text-primary" />
                        <span>Filter Matrix</span>
                    </div>
                    <div className="flex-1 flex items-center gap-2">
                        <input
                            type="text"
                            placeholder={language === 'ar' ? 'البحث عن مدينة...' : 'Search Location...'}
                            className="bg-gray-50 border border-gray-200 px-3 py-1.5 text-[10px] font-bold rounded-xs focus:border-primary focus:bg-white outline-none w-40 transition-all font-cairo"
                            value={locationFilter}
                            onChange={(e) => setLocationFilter(e.target.value)}
                        />
                        <div className="flex items-center gap-1 bg-gray-50 border border-gray-200 rounded-xs px-2 py-1">
                            <input
                                type="number"
                                placeholder="MIN"
                                className="bg-transparent text-[10px] font-black outline-none w-14 text-center placeholder:text-gray-300"
                                value={priceRange.min}
                                onChange={(e) => setPriceRange(prev => ({ ...prev, min: e.target.value }))}
                            />
                            <span className="text-[10px] opacity-20 font-black">/</span>
                            <input
                                type="number"
                                placeholder="MAX"
                                className="bg-transparent text-[10px] font-black outline-none w-14 text-center placeholder:text-gray-300"
                                value={priceRange.max}
                                onChange={(e) => setPriceRange(prev => ({ ...prev, max: e.target.value }))}
                            />
                        </div>
                        <button onClick={fetchAds} className="bg-primary text-white px-4 py-1.5 text-[10px] font-black rounded-xs hover:bg-primary-hover transition-all uppercase tracking-widest shadow-lg active:scale-95">SYNC RESULTS</button>
                    </div>
                </div>
            </div>

            <main className="max-w-7xl mx-auto w-full p-3 flex-1">
                {/* Result Info */}
                <div className="flex items-center justify-between mb-4 px-1">
                    <div className="flex items-center gap-3">
                        <div className="w-1 h-4 bg-primary rounded-full"></div>
                        <h1 className="text-[14px] font-black uppercase text-secondary tracking-tight">
                            {categoryQuery ? `${categoryQuery}` : 'Global Marketplace'}
                            <span className="text-[10px] font-black text-gray-400 mr-3 border-r border-gray-200 pr-3 uppercase italic mx-2">{ads.length} listings identified</span>
                        </h1>
                    </div>
                </div>

                {loading ? (
                    <div className="flex items-center justify-center p-20 opacity-20">
                        <Loader2 className="animate-spin" size={48} />
                    </div>
                ) : ads.length > 0 ? (
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
                        {ads.map((ad) => (
                            <Link
                                key={ad.id}
                                href={`/ads/view?id=${ad.id}`}
                                className="bg-white border border-gray-100 p-2 rounded-sm hover:border-primary transition-all group flex flex-col gap-2 h-full shadow-sm hover:shadow-xl hover:-translate-y-1"
                            >
                                <div className="aspect-[4/3] bg-gray-50 rounded-xs relative overflow-hidden flex items-center justify-center border border-gray-100 shrink-0">
                                    <ImageIcon className="text-gray-200 group-hover:scale-110 transition-transform" size={24} />
                                    {ad.isBoosted && (
                                        <div className="absolute top-0 right-0 bg-primary text-white text-[8px] font-black px-2 py-0.5 rounded-bl-sm shadow-md uppercase tracking-widest">Boosted</div>
                                    )}
                                </div>
                                <div className="flex flex-col gap-1.5 flex-1 p-1">
                                    <h3 className="text-[11px] font-black line-clamp-2 leading-[1.3] group-hover:text-primary transition-colors text-secondary h-[28px] uppercase tracking-tighter">
                                        {ad.title}
                                    </h3>
                                    <div className="mt-auto">
                                        <div className="text-[14px] font-black text-primary italic tracking-tighter flex items-center gap-1 leading-none">
                                            {new Intl.NumberFormat(language === 'ar' ? 'ar-SA' : 'en-US').format(ad.price)}
                                            <span className="text-[8px] not-italic opacity-40 uppercase tracking-widest">SAR</span>
                                        </div>
                                        <div className="flex items-center gap-1 text-[9px] font-black text-gray-400 mt-2 uppercase tracking-tighter truncate">
                                            <MapPin size={10} className="text-primary opacity-50 shrink-0" />
                                            <span className="truncate">{ad.location}</span>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                ) : (
                    <div className="text-center p-20 text-gray-300 font-black uppercase text-sm italic tracking-widest">No matching listings in the matrix</div>
                )}
            </main>
            <Footer />
        </div>
    );
}

export default function AdsPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-[#f0f2f5] flex items-center justify-center font-black text-xs text-primary italic uppercase tracking-[0.3em]">Syncing Feed Matrix...</div>}>
            <AdsContent />
        </Suspense>
    );
}