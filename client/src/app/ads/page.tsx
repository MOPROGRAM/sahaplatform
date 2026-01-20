"use client";

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Filter, Loader2, MapPin, Image as ImageIcon } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useLanguage } from '@/lib/language-context';
import { useFilterStore } from '@/store/useFilterStore';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import AdCard from '@/components/AdCard';
import SearchBar from '@/components/SearchBar';
import LoadingSpinner from '@/components/LoadingSpinner';
import AdvancedFilter from '@/components/AdvancedFilter';

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
    const searchQueryParam = searchParams.get('search');
    const { category, tags } = useFilterStore();

    const [ads, setAds] = useState<Ad[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState(searchQueryParam || '');
    const [showAllAds, setShowAllAds] = useState(false); // Show ads without media

    useEffect(() => {
        setSearchQuery(searchQueryParam || '');
        fetchAds();
    }, [category, tags, searchQueryParam]);

    const fetchAds = async () => {
        setLoading(true);
        try {
            let query = supabase
                .from('ads')
                .select('*')
                .order('created_at', { ascending: false })
                .limit(50);

            // Filter by category if specified
            if (category) {
                query = query.eq('category', category);
            }

            // Search in title and description
            if (searchQuery) {
                query = query.or(`title.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`);
            }

            // Location filter from tags
            const regions = ['الرياض', 'جدة', 'الدمام', 'مكة', 'المدينة'];
            const selectedRegions = tags.filter(tag => regions.includes(tag));
            if (selectedRegions.length > 0) {
                const locationConditions = selectedRegions.map(region => `location.ilike.%${region}%`);
                query = query.or(locationConditions.join(','));
            }

            // Type filter from tags
            const types = ['سكني', 'تجاري', 'إيجار', 'بيع', 'استثمار'];
            const selectedTypes = tags.filter(tag => types.includes(tag));
            if (selectedTypes.length > 0) {
                const typeConditions = selectedTypes.flatMap(type => [`title.ilike.%${type}%`, `description.ilike.%${type}%`]);
                query = query.or(typeConditions.join(','));
            }

            // Price filter from tags
            const priceRanges = {
                'أقل من 50k': { min: 0, max: 50000 },
                '50k - 200k': { min: 50000, max: 200000 },
                '200k - 500k': { min: 200000, max: 500000 },
                '500k+': { min: 500000, max: Infinity }
            };
            const selectedPrices = tags.filter(tag => tag in priceRanges);
            if (selectedPrices.length > 0) {
                const priceConditions = selectedPrices.map(tag => {
                    const range = priceRanges[tag as keyof typeof priceRanges];
                    let cond = '';
                    if (range.min > 0) cond += `price.gte.${range.min}`;
                    if (range.max < Infinity) cond += (cond ? ',' : '') + `price.lte.${range.max}`;
                    return cond;
                }).filter(Boolean);
                if (priceConditions.length > 0) {
                    query = query.or(priceConditions.join(','));
                }
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

            {/* Advanced Filter */}
            <div className="bg-gray-50 border-b border-gray-200 py-4 px-4">
                <div className="max-w-7xl mx-auto">
                    <AdvancedFilter />
                    <div className="mt-4 flex items-center gap-2">
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
                            {category ? `${category}` : 'Global Marketplace'}
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
                                language={language}
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