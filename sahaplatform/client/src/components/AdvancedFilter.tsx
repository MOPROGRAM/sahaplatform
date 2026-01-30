"use client";

import { useState, useEffect, useCallback } from "react";
import { ChevronDown, SlidersHorizontal, X } from "lucide-react";
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
    const { minPrice, maxPrice, setMinPrice, setMaxPrice, tags, addTag, removeTag, setCityId, cityId, setSortBy, sortBy, setSortOrder, sortOrder } = useFilterStore();
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

    const availableTags = ["rent", "sale"]; // Example tags

    return (
        <div className="w-full">
            <div className="bento-card p-1 flex justify-between items-center bg-white dark:bg-[#1a1a1a] shadow-premium">
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-bold text-text-main hover:bg-gray-100 dark:hover:bg-white/5 transition-colors"
                >
                    <SlidersHorizontal size={16} />
                    {t("filter")}
                    <ChevronDown size={14} className={`transition-transform ${isOpen ? "rotate-180" : "rotate-0"}`} />
                </button>
            </div>

            {isOpen && (
                <div className="bento-card p-6 mt-4 space-y-6 bg-white dark:bg-[#1a1a1a] animate-in fade-in slide-in-from-top-2">
                    {/* Price Range */}
                    <div>
                        <h4 className="text-sm font-black text-text-main uppercase tracking-tight mb-3 border-b-2 border-primary w-fit pb-1">
                            {t("priceRange")}
                        </h4>
                        <div className="flex gap-3">
                            <input
                                type="number"
                                placeholder={t("min")}
                                value={minPrice}
                                onChange={(e) => setMinPrice(e.target.value)}
                                className="bento-input flex-1"
                            />
                            <input
                                type="number"
                                placeholder={t("max")}
                                value={maxPrice}
                                onChange={(e) => setMaxPrice(e.target.value)}
                                className="bento-input flex-1"
                            />
                        </div>
                    </div>

                    {/* City Filter */}
                    <div>
                        <h4 className="text-sm font-black text-text-main uppercase tracking-tight mb-3 border-b-2 border-primary w-fit pb-1">
                            {t("location")}
                        </h4>
                        <select
                            value={cityId || ""}
                            onChange={(e) => setCityId(e.target.value)}
                            className="bento-input w-full appearance-none cursor-pointer"
                        >
                            <option value="">{t("allCities")}</option>
                            {cities.map((city) => (
                                <option key={city.id} value={city.id}>
                                    {language === "ar" ? city.name_ar : city.name_en}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Tags Filter */}
                    <div>
                        <h4 className="text-sm font-black text-text-main uppercase tracking-tight mb-3 border-b-2 border-primary w-fit pb-1">
                            {t("tags")}
                        </h4>
                        <div className="flex flex-wrap gap-2">
                            {availableTags.map((tag) => (
                                <button
                                    key={tag}
                                    type="button"
                                    onClick={() => (tags.includes(tag) ? removeTag(tag) : addTag(tag))}
                                    className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all ${tags.includes(tag)
                                        ? "bg-primary text-white shadow-md"
                                        : "bg-gray-100 dark:bg-white/5 text-text-muted hover:bg-gray-200 dark:hover:bg-white/10"}
                                    `}
                                >
                                    {t(tag as any)}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Sort By */}
                    <div>
                        <h4 className="text-sm font-black text-text-main uppercase tracking-tight mb-3 border-b-2 border-primary w-fit pb-1">
                            {t("sortBy")}
                        </h4>
                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value as any)}
                            className="bento-input w-full appearance-none cursor-pointer"
                        >
                            <option value="createdAt">{t("newest")}</option>
                            <option value="price">{t("price")}</option>
                        </select>
                    </div>
                </div>
            )}
        </div>
    );
}
