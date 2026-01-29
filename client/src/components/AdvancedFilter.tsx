"use client";

import { useState, useEffect, useCallback } from "react";
import { ChevronDown, SlidersHorizontal, X, MapPin, Tag, Banknote, Calendar, ArrowUpDown } from "lucide-react";
import { useLanguage } from "@/lib/language-context";
import { useFilterStore } from "@/store/useFilterStore";
import { supabase } from "@/lib/supabase";

interface City {
    id: string;
    name: string;
    name_ar: string;
    name_en: string;
}

export default function AdvancedFilter() {
    const { language, t } = useLanguage();
    const {
        minPrice, maxPrice, setMinPrice, setMaxPrice,
        tags, addTag, removeTag,
        setCityId, cityId,
        setSortBy, sortBy,
        setSortOrder, sortOrder
    } = useFilterStore();

    const [isOpen, setIsOpen] = useState(false);
    const [cities, setCities] = useState<City[]>([]);

    const fetchCities = useCallback(async () => {
        try {
            const { data } = await (supabase as any).from("cities").select("*").eq("is_active", true);
            setCities(data || []);
        } catch (error) {
            console.error("Error fetching cities:", error);
        }
    }, []);

    useEffect(() => {
        fetchCities();
    }, [fetchCities]);

    const availableTags = ["rent", "sale"];

    return (
        <div className="w-full mb-4">
            {/* Filter Toggle Bar */}
            <div className="flex items-center justify-between gap-4 mb-2">
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-sm font-black uppercase tracking-widest transition-all duration-300 shadow-sm hover:shadow-md ${isOpen
                            ? "bg-primary text-white"
                            : "bg-white dark:bg-[#1a1a1a] text-text-main border border-border-color"
                        }`}
                >
                    <SlidersHorizontal size={18} />
                    {t("filter")}
                    <div className={`ml-2 transition-transform duration-300 ${isOpen ? "rotate-180" : "rotate-0"}`}>
                        <ChevronDown size={16} />
                    </div>
                </button>

                {(minPrice || maxPrice || cityId || tags.length > 0) && (
                    <button
                        onClick={() => {
                            setMinPrice("");
                            setMaxPrice("");
                            setCityId(null);
                            tags.forEach(tag => removeTag(tag));
                        }}
                        className="text-[10px] font-black uppercase tracking-tighter text-red-500 hover:text-red-600 underline underline-offset-4"
                    >
                        {t("clearFilters")}
                    </button>
                )}
            </div>

            {/* Expanded Filter Panel */}
            <div className={`overflow-hidden transition-all duration-500 ease-in-out ${isOpen ? "max-h-[800px] opacity-100" : "max-h-0 opacity-0"}`}>
                <div className="bento-card p-6 bg-white dark:bg-[#1a1a1a] shadow-2xl border border-border-color rounded-3xl grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">

                    {/* Price Filter */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 text-primary">
                            <Banknote size={16} />
                            <h4 className="text-[11px] font-black uppercase tracking-widest">{t("priceRange")}</h4>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="relative flex-1">
                                <input
                                    type="number"
                                    placeholder={t("min")}
                                    value={minPrice}
                                    onChange={(e) => setMinPrice(e.target.value)}
                                    className="bento-input w-full pl-8"
                                />
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-gray-400">#</span>
                            </div>
                            <div className="w-2 h-[1px] bg-border-color" />
                            <div className="relative flex-1">
                                <input
                                    type="number"
                                    placeholder={t("max")}
                                    value={maxPrice}
                                    onChange={(e) => setMaxPrice(e.target.value)}
                                    className="bento-input w-full pl-8"
                                />
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-gray-400">#</span>
                            </div>
                        </div>
                    </div>

                    {/* Location Filter */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 text-primary">
                            <MapPin size={16} />
                            <h4 className="text-[11px] font-black uppercase tracking-widest">{t("location")}</h4>
                        </div>
                        <div className="relative group">
                            <select
                                value={cityId || ""}
                                onChange={(e) => setCityId(e.target.value)}
                                className="bento-input w-full appearance-none cursor-pointer pr-10 hover:border-primary transition-colors"
                            >
                                <option value="">{t("allCities")}</option>
                                {cities.map((city) => (
                                    <option key={city.id} value={city.id}>
                                        {language === "ar" ? city.name_ar : city.name_en}
                                    </option>
                                ))}
                            </select>
                            <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400 group-hover:text-primary transition-colors" />
                        </div>
                    </div>

                    {/* Sorting Filter */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 text-primary">
                            <ArrowUpDown size={16} />
                            <h4 className="text-[11px] font-black uppercase tracking-widest">{t("sortBy")}</h4>
                        </div>
                        <div className="relative group">
                            <select
                                value={`${sortBy}-${sortOrder}`}
                                onChange={(e) => {
                                    const [newSortBy, newSortOrder] = e.target.value.split("-");
                                    setSortBy(newSortBy as any);
                                    setSortOrder(newSortOrder as any);
                                }}
                                className="bento-input w-full appearance-none cursor-pointer pr-10 hover:border-primary transition-colors"
                            >
                                <option value="createdAt-desc">{t("newest")}</option>
                                <option value="createdAt-asc">{t("oldest")}</option>
                                <option value="price-asc">{t("priceLowHigh")}</option>
                                <option value="price-desc">{t("priceHighLow")}</option>
                            </select>
                            <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400 group-hover:text-primary transition-colors" />
                        </div>
                    </div>

                    {/* Tags Filter */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 text-primary">
                            <Tag size={16} />
                            <h4 className="text-[11px] font-black uppercase tracking-widest">{t("listingType")}</h4>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {availableTags.map((tag) => (
                                <button
                                    key={tag}
                                    type="button"
                                    onClick={() => (tags.includes(tag) ? removeTag(tag) : addTag(tag))}
                                    className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-300 ${tags.includes(tag)
                                            ? "bg-primary text-white shadow-premium"
                                            : "bg-gray-100 dark:bg-white/5 text-text-muted hover:bg-primary/10 hover:text-primary border border-transparent"
                                        }`}
                                >
                                    {(t as any)[tag] || tag}
                                </button>
                            ))}
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}
