"use client";

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Filter, Loader2, MapPin, Image as ImageIcon } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useLanguage } from '@/lib/language-context';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import AdCard from '@/components/AdCard';
import SearchBar from '@/components/SearchBar';
import LoadingSpinner from '@/components/LoadingSpinner';

interface Ad {
    id: string;
    title: string;
    description: string;
    price: number;
    category: string;
    location: string;
    images_urls: string[];
    phone?: string;
    email?: string;
    latitude?: number;
    longitude?: number;
    allow_no_media?: boolean;
    user_id: string;
    created_at: string;
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
    const [showAllAds, setShowAllAds] = useState(false); // Show ads without media

    useEffect(() => {
        setSearchQuery(searchQueryParam || '');
        fetchAds();
    }, [categoryQuery, searchQueryParam]);

    const fetchAds = async () => {
        setLoading(true);
        try {
            let query = supabase
                .from('ads')
                .select('*')
                .order('created_at', { ascending: false })
                .limit(50);

            // Filter by category if specified
            if (categoryQuery) {
                query = query.eq('category', categoryQuery);
            }

            // Search in title and description
            if (searchQuery) {
                query = query.or(`title.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`);
            }

            // Location filter
            if (locationFilter) {
                query = query.ilike('location', `%${locationFilter}%`);
            }

            // Price range filter
            if (priceRange.min) {
                query = query.gte('price', Number(priceRange.min));
            }
            if (priceRange.max) {
                query = query.lte('price', Number(priceRange.max));
            }

            // Filter ads based on media availability
            if (!showAllAds) {
                // Show only ads that have either images or map coordinates OR explicitly allow no media
                query = query.or(`images_urls.neq.{},latitude.not.is.null,allow_no_media.eq.true`);
            }

            const { data, error } = await query;
            if (error) throw error;
            // Ensure data is always an array
            setAds(Array.isArray(data) ? data : []);
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
                        <label className="flex items-center gap-2 text-[10px] font-black text-gray-600">
                            <input
                                type="checkbox"
                                checked={showAllAds}
                                onChange={(e) => setShowAllAds(e.target.checked)}
                                className="w-3 h-3"
                            />
                            {language === 'ar' ? 'عرض جميع الإعلانات' : 'Show All Ads'}
                        </label>
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
                    <div className="flex items-center justify-center p-20">
                        <LoadingSpinner size={48} />
                    </div>
                ) : ads.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {ads.map((ad) => (
                            <AdCard
                                key={ad.id}
                                id={ad.id}
                                title={ad.title}
                                price={ad.price}
                                currency="ريال"
                                location={ad.location}
                                images={ad.images_urls || []}
                                createdAt={ad.created_at}
                                category={ad.category}
                            />
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
        <Suspense fallback={
            <div className="min-h-screen bg-gray-bg flex items-center justify-center">
                <LoadingSpinner size={48} />
            </div>
        }>
            <AdsContent />
        </Suspense>
    );
}