"use client";

import { useFilterStore } from "@/store/useFilterStore";
import { ChevronDown, MapPin, Search } from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export default function AdvancedFilter() {
    const { category, setCategory, tags, toggleTag } = useFilterStore();

    const mainCategories = [
        { id: 'jobs', label: 'وظائف', labelEn: 'Jobs' },
        { id: 'realestate', label: 'عقارات', labelEn: 'Real Estate' },
        { id: 'cars', label: 'سيارات', labelEn: 'Vehicles' },
        { id: 'services', label: 'خدمات', labelEn: 'Services' },
        { id: 'electronics', label: 'إلكترونيات', labelEn: 'Electronics' },
    ];

    const subFilters = [
        { label: 'المنطقة', items: ['الرياض', 'جدة', 'الدمام', 'مكة', 'المدينة'] },
        { label: 'النوع', items: ['سكني', 'تجاري', 'إيجار', 'بيع', 'استثمار'] },
        { label: 'السعر', items: ['أقل من 50k', '50k - 200k', '200k - 500k', '500k+'] },
    ];

    return (
        <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-gray-800 rounded-sm shadow-sm overflow-hidden text-[13px]">
            {/* Search Header */}
            <div className="p-3 border-b border-gray-100 dark:border-gray-800 flex flex-wrap gap-2 items-center">
                <div className="flex-1 flex gap-2 border border-primary/30 p-1 rounded-sm">
                    <div className="flex items-center gap-1 px-2 border-l border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-slate-800 cursor-pointer text-xs">
                        <MapPin size={14} className="text-primary" />
                        <span>الرياض</span>
                        <ChevronDown size={12} />
                    </div>
                    <input
                        className="flex-1 bg-transparent outline-none px-2"
                        placeholder="عن ماذا تبحث اليوم؟ (وظائف، عقارات، سيارات...)"
                    />
                    <button className="bg-primary hover:bg-primary-dark text-white px-6 py-1.5 font-bold rounded-sm transition-colors flex items-center gap-2">
                        <Search size={16} />
                        <span>بحث</span>
                    </button>
                </div>
            </div>

            {/* Row 1: Main Categories */}
            <div className="flex border-b border-gray-50 dark:border-gray-800">
                <div className="w-24 bg-gray-50 dark:bg-slate-800 p-2 text-gray-400 font-bold shrink-0">التصنيف</div>
                <div className="flex flex-wrap gap-x-4 gap-y-2 p-2 px-4">
                    <button
                        onClick={() => setCategory(null)}
                        className={cn("hover:text-primary whitespace-nowrap", !category && "text-primary font-bold")}
                    >
                        الكل
                    </button>
                    {mainCategories.map((cat) => (
                        <button
                            key={cat.id}
                            onClick={() => setCategory(cat.id)}
                            className={cn("hover:text-primary whitespace-nowrap", category === cat.id && "text-primary font-bold")}
                        >
                            {cat.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Row 2 & 3: Dynamic Sub-filters */}
            {subFilters.map((row, idx) => (
                <div key={idx} className="flex border-b border-gray-50 dark:border-gray-100 last:border-0 dark:border-gray-800">
                    <div className="w-24 bg-gray-50 dark:bg-slate-800 p-2 text-gray-400 font-bold shrink-0">{row.label}</div>
                    <div className="flex flex-wrap gap-x-4 gap-y-2 p-2 px-4">
                        {row.items.map((item) => (
                            <button
                                key={item}
                                onClick={() => toggleTag(item)}
                                className={cn(
                                    "hover:text-primary whitespace-nowrap transition-colors",
                                    tags.includes(item) && "bg-primary/10 text-primary px-1 rounded-sm font-medium"
                                )}
                            >
                                {item}
                            </button>
                        ))}
                    </div>
                </div>
            ))}

            {/* Selected Tags Summary */}
            {tags.length > 0 && (
                <div className="bg-primary/5 p-2 px-4 flex gap-2 items-center flex-wrap">
                    <span className="text-[11px] text-gray-400">الفلاتر النشطة:</span>
                    {tags.map(tag => (
                        <span key={tag} className="bg-white dark:bg-slate-800 border border-primary/20 text-primary px-2 py-0.5 rounded-sm flex items-center gap-1 text-[11px]">
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
                        onClick={() => useFilterStore.getState().resetFilters()}
                        className="text-[11px] text-gray-400 hover:text-red-500 underline underline-offset-2"
                    >
                        مسح الكل
                    </button>
                </div>
            )}
        </div>
    );
}
