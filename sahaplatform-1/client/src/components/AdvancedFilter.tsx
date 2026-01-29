"use client";

import { useFilterStore } from "@/store/useFilterStore";
import { ChevronDown, MapPin } from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { useLanguage } from "@/lib/language-context";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export default function AdvancedFilter() {
    const { language, t } = useLanguage();
    const { 
        category, tags, 
        toggleTag, resetFilters,
        minPrice, maxPrice, setPriceRange,
        cityId, setCityId,
        sortBy, sortOrder, setSort
    } = useFilterStore();

    const [cities, setCities] = useState<any[]>([]);
    const [localMinPrice, setLocalMinPrice] = useState(minPrice);
    const [localMaxPrice, setLocalMaxPrice] = useState(maxPrice);

    useEffect(() => {
        const fetchCities = async () => {
            const { data } = await supabase.from('City').select('*').eq('isActive', true);
            if (data) setCities(data);
        };
        fetchCities();
    }, []);

    // Debounce price update
    useEffect(() => {
        const timer = setTimeout(() => {
            setPriceRange(localMinPrice, localMaxPrice);
        }, 500);
        return () => clearTimeout(timer);
    }, [localMinPrice, localMaxPrice, setPriceRange]);

    const getPriceLabel = () => {
        if (category === 'jobs') return t('salaryRange');
        return t('priceRange');
    };

    return (
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-4 mb-4" dir={language === 'ar' ? 'rtl' : 'ltr'}>
            <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                    <h3 className="text-sm font-black text-secondary uppercase tracking-wider flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-primary"></span>
                        {t('advancedFilter')}
                    </h3>
                    {(minPrice || maxPrice || cityId || tags.length > 0) && (
                        <button 
                            onClick={resetFilters}
                            className="text-xs text-red-500 hover:text-red-700 font-bold underline"
                        >
                            {t('clearFilters')}
                        </button>
                    )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {/* Location Filter */}
                    <div className="space-y-1">
                        <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wide">{t('location')}</label>
                        <div className="relative">
                            <MapPin size={14} className="absolute top-3 left-3 text-gray-400" />
                            <select 
                                value={cityId || ''} 
                                onChange={(e) => setCityId(e.target.value || null)}
                                className="w-full bg-gray-50 border border-gray-200 rounded-md py-2 pl-9 pr-4 text-sm font-bold focus:border-primary focus:ring-1 focus:ring-primary outline-none appearance-none"
                            >
                                <option value="">{t('allCities')}</option>
                                {cities.map(city => (
                                    <option key={city.id} value={city.id}>
                                        {language === 'ar' ? city.nameAr : city.nameEn}
                                    </option>
                                ))}
                            </select>
                            <ChevronDown size={14} className="absolute top-3 right-3 text-gray-400 pointer-events-none" />
                        </div>
                    </div>

                    {/* Price Range */}
                    <div className="space-y-1 md:col-span-2">
                        <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wide">{getPriceLabel()}</label>
                        <div className="flex items-center gap-2">
                            <input 
                                type="number" 
                                placeholder={t('min')} 
                                value={localMinPrice}
                                onChange={(e) => setLocalMinPrice(e.target.value)}
                                className="w-full bg-gray-50 border border-gray-200 rounded-md py-2 px-3 text-sm font-bold focus:border-primary outline-none"
                            />
                            <span className="text-gray-400">-</span>
                            <input 
                                type="number" 
                                placeholder={t('max')} 
                                value={localMaxPrice}
                                onChange={(e) => setLocalMaxPrice(e.target.value)}
                                className="w-full bg-gray-50 border border-gray-200 rounded-md py-2 px-3 text-sm font-bold focus:border-primary outline-none"
                            />
                        </div>
                    </div>

                    {/* Sort Filter */}
                    <div className="space-y-1">
                        <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wide">{t('sortBy')}</label>
                        <div className="relative">
                            <select 
                                value={`${sortBy}-${sortOrder}`} 
                                onChange={(e) => {
                                    const [newSortBy, newSortOrder] = e.target.value.split('-');
                                    setSort(newSortBy, newSortOrder as 'asc' | 'desc');
                                }}
                                className="w-full bg-gray-50 border border-gray-200 rounded-md py-2 px-3 text-sm font-bold focus:border-primary focus:ring-1 focus:ring-primary outline-none appearance-none"
                            >
                                <option value="createdAt-desc">{t('newest')}</option>
                                <option value="createdAt-asc">{t('oldest')}</option>
                                <option value="price-asc">{category === 'jobs' ? t('lowestSalary') : t('lowestPrice')}</option>
                                <option value="price-desc">{category === 'jobs' ? t('highestSalary') : t('highestPrice')}</option>
                            </select>
                            <ChevronDown size={14} className="absolute top-3 right-3 text-gray-400 pointer-events-none" />
                        </div>
                    </div>

                    {/* Real Estate Specific Filters */}
                    {category === 'realestate' && (
                        <>
                            {/* Listing Type */}
                            <div className="space-y-1 md:col-span-3">
                                <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wide">{t('listingType')}</label>
                                <div className="flex gap-2 h-[38px] items-center">
                                    <button
                                        onClick={() => toggleTag('rent')}
                                        className={cn("px-3 py-1.5 rounded-md text-xs font-bold border transition-all h-full flex items-center justify-center flex-1", tags.includes('rent') ? "bg-primary text-white border-primary" : "bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100")}
                                    >
                                        {t('forRent')}
                                    </button>
                                    <button
                                        onClick={() => toggleTag('sale')}
                                        className={cn("px-3 py-1.5 rounded-md text-xs font-bold border transition-all h-full flex items-center justify-center flex-1", tags.includes('sale') ? "bg-primary text-white border-primary" : "bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100")}
                                    >
                                        {t('forSale')}
                                    </button>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
