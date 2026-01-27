"use client";

import { useFilterStore } from "@/store/useFilterStore";
import { useRouter } from "next/navigation";
import { ChevronDown, MapPin, Search, X } from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { useLanguage } from "@/lib/language-context";

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export default function AdvancedFilter() {
    const router = useRouter();
    const { language, t } = useLanguage();
    const { category, subCategory, searchQuery, setSearchQuery, tags, setCategory, setSubCategory, toggleTag, resetFilters } = useFilterStore();

    const handleTagToggle = (tag: string) => {
        toggleTag(tag);
        // Tags don't affect URL directly, they work through the store
    };

    const subFilters = [
        { label: t('Area') || 'Area', items: ['الرياض', 'جدة', 'الدمام', 'مكة', 'المدينة'] },
        { label: t('Type') || 'Type', items: ['سكني', 'تجاري', 'إيجار', 'بيع', 'استثمار'] },
        { label: t('Price') || 'Price', items: ['أقل من 50k', '50k - 200k', '200k - 500k', '500k+'] },
    ];

    const handleSearch = (value: string) => {
        setSearchQuery(value);
    };

    const handleClearSearch = () => {
        setSearchQuery("");
    };

    return (
        <div className="depth-card p-0 rounded-lg overflow-hidden" dir={language === 'ar' ? 'rtl' : 'ltr'}>

            {/* Tag Filters (Location/Type/Price) - Retaining this filtering logic here */}
            <div className="flex flex-col border-b border-border-color">
                <div className="p-3 bg-gray-50 border-b border-border-color">
                    <h3 className="text-sm font-bold text-text-main uppercase tracking-wider">{t('filter')}</h3>
                </div>

                <div className="p-3 space-y-2">
                    {subFilters.map((row, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                            <span className="text-xs font-bold text-text-muted shrink-0 w-16">{row.label}:</span>
                            <div className="flex flex-wrap gap-2 flex-1 overflow-x-auto no-scrollbar">
                                {row.items.map((item) => (
                                    <button
                                        key={item}
                                        onClick={() => handleTagToggle(item)}
                                        className={cn(
                                            "px-2 py-0.5 rounded-full text-[11px] font-medium transition-colors whitespace-nowrap",
                                            tags.includes(item) ? 'bg-primary text-white shadow-sm' : 'bg-gray-100 text-gray-700 hover:bg-primary/10 hover:text-primary'
                                        )}
                                    >
                                        {item}
                                    </button>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Selected Tags Summary */}
            {tags.length > 0 && (
                <div className="bg-primary/5 p-3 px-4 flex gap-2 items-center flex-wrap border-t border-border-color">
                    <span className="text-xs text-text-muted font-bold uppercase tracking-wider mr-2">{t('activeFilters')}:</span>
                    {tags.map(tag => (
                        <span key={tag} className="bg-white border border-primary/20 text-primary px-2 py-0.5 rounded-full flex items-center gap-1 text-xs">
                            {tag}
                            <button
                                onClick={() => toggleTag(tag)}
                                className="hover:text-red-500 font-bold"
                            >
                                ×
                            </button>
                        </span>
                    ))}
                    <button
                        onClick={() => { resetFilters(); handleClearSearch(); }}
                        className="text-xs text-text-muted hover:text-red-500 underline underline-offset-2 ml-auto font-bold"
                    >
                        {t('clearFilters')}
                    </button>
                </div>
            )}
        </div>
    );
}
