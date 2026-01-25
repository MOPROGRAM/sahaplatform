"use client";

import { useFilterStore } from "@/store/useFilterStore";
import { useRouter } from "next/navigation";
import { ChevronDown, MapPin, Search } from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export default function AdvancedFilter() {
    const router = useRouter();
    const { category, setCategory, searchQuery, setSearchQuery, tags, toggleTag, resetFilters } = useFilterStore();

    const handleCategoryChange = (newCategory: string | null) => {
        setCategory(newCategory);

        // Update URL with category parameter
        const params = new URLSearchParams(window.location.search);
        if (newCategory) {
            params.set('category', newCategory);
        } else {
            params.delete('category');
        }
        const newUrl = `${window.location.pathname}${params.toString() ? '?' + params.toString() : ''}`;
        router.push(newUrl);
    };

    const handleTagToggle = (tag: string) => {
        toggleTag(tag);
        // Tags don't affect URL directly, they work through the store
    };

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
        <div className="bg-card border border-border-color rounded-sm shadow-sm overflow-hidden text-[13px]">
            {/* Search Header */}
            <div className="p-3 border-b border-border-color flex flex-wrap gap-2 items-center">
                <div className="flex-1 flex gap-2 border border-primary/30 p-1 rounded-sm">
                    <div className="flex items-center gap-1 px-2 border-l border-border-color bg-card cursor-pointer text-xs">
                        <MapPin size={14} className="text-primary" />
                        <span>الرياض</span>
                        <ChevronDown size={12} />
                    </div>
                    <input
                        className="flex-1 bg-transparent outline-none px-2"
                        placeholder="عن ماذا تبحث اليوم؟ (وظائف، عقارات، سيارات...)"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    <button className="bg-primary hover:bg-primary-dark text-white px-6 py-1.5 font-bold rounded-sm transition-colors flex items-center gap-2">
                        <Search size={16} />
                        <span>بحث</span>
                    </button>
                </div>
            </div>

            {/* Row 1: Main Categories */}
            <div className="flex border-b border-gray-50 dark:border-gray-800">
                <div className="w-24 bg-card p-2 text-text-muted font-bold shrink-0">التصنيف</div>
                <div className="flex flex-wrap gap-x-4 gap-y-2 p-2 px-4">
                    <button
                        onClick={() => handleCategoryChange(null)}
                        className={cn("hover:text-primary whitespace-nowrap", !category && "text-primary font-bold")}
                    >
                        الكل
                    </button>
                    {mainCategories.map((cat) => (
                        <button
                            key={cat.id}
                            onClick={() => handleCategoryChange(cat.id)}
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
                    <div className="w-24 bg-card p-2 text-text-muted font-bold shrink-0">{row.label}</div>
                    <div className="flex flex-wrap gap-x-4 gap-y-2 p-2 px-4">
                        {row.items.map((item) => (
                            <button
                                key={item}
                                onClick={() => handleTagToggle(item)}
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
                    <span className="text-[11px] text-text-muted">الفلاتر النشطة:</span>
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
                        onClick={() => resetFilters()}
                        className="text-[11px] text-text-muted hover:text-red-500 underline underline-offset-2"
                    >
                        مسح الكل
                    </button>
                </div>
            )}
        </div>
    );
}
