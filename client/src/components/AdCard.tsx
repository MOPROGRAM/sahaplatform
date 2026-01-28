"use client";

import { useState } from "react";
import { useLanguage } from '@/lib/language-context';
import Link from "next/link";
import Image from "next/image";
import { Heart, Clock, MapPin, Home as HomeIcon, Car as CarIcon, Briefcase as BriefcaseIcon, Smartphone as SmartphoneIcon, Tag as TagIcon, Building as BuildingIcon, Wrench } from "lucide-react";
import { formatRelativeTime } from "@/lib/utils";

interface AdCardProps {
    id: string;
    title: string;
    price: number;
    currency?: string;
    location?: string;
    images?: string[];
    createdAt: string;
    authorName?: string;
    category?: string;
    subCategory?: string;
    description_ar?: string; // Added
    description_en?: string; // Added
    className?: string;
    language?: 'ar' | 'en';
    isFeatured?: boolean;
    description?: string;
    onMapHighlight?: (adId: string | null) => void;
    isHighlighted?: boolean;
    layout?: 'vertical' | 'horizontal';
}

export default function AdCard({
    id,
    title,
    price,
    currency = "SAR",
    location,
    images = [],
    createdAt,
    category,
    subCategory, // Added
    className = "",
    language = 'ar',
    isFeatured = false,
    description_ar, // Added
    description_en, // Added
    onMapHighlight,
    isHighlighted = false,
    layout = 'vertical'
}: AdCardProps) {
    const { t } = useLanguage();
    const [isFavorite, setIsFavorite] = useState(false);

    const handleFavoriteClick = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsFavorite(!isFavorite);
    };

    const getCategoryIcon = (catKey?: string) => {
        switch (catKey) {
            case 'realestate': return <HomeIcon size={12} className="text-gray-400" />;
            case 'cars': return <CarIcon size={12} className="text-gray-400" />;
            case 'electronics': return <SmartphoneIcon size={12} className="text-gray-400" />;
            case 'goods': return <TagIcon size={12} className="text-gray-400" />;
            case 'jobs': return <BriefcaseIcon size={12} className="text-gray-400" />;
            case 'services': return <Wrench size={12} className="text-gray-400" />;
            case 'other': return <BuildingIcon size={12} className="text-gray-400" />;
            default: return null;
        }
    }

    const isVertical = layout === 'vertical';
    const currentDescription = language === 'ar' ? description_ar : description_en; // Helper variable

    return (
        <Link
            href={`/ads/${id}`}
            className={`bento-card bento-card-hover group flex ${isHighlighted ? "border-primary ring-2 ring-primary/50" : ""} ${isVertical ? "flex-col h-full" : (language === "ar" ? "flex-row-reverse" : "flex-row")} ${className}`}
            onMouseEnter={() => onMapHighlight && onMapHighlight(id)}
            onMouseLeave={() => onMapHighlight && onMapHighlight(null)}
        >

            {/* Image Area */}
            <div className={`relative shrink-0 overflow-hidden ${isVertical ? "w-full h-20" : "w-[25%]"}`}>
                {isFeatured && (
                    <div className="absolute top-1 left-1 z-10 bg-primary text-white px-1 py-0.5 rounded text-[8px] font-black uppercase tracking-wider shadow-md">
                        {t("featured")}
                    </div>
                )}

                <button
                    onClick={handleFavoriteClick}
                    className="absolute top-1 right-1 z-10 p-0.5 rounded-full bg-white/80 backdrop-blur-sm text-text-muted hover:text-red-500 transition-all shadow-md hover:scale-110 active:scale-95"
                >
                    <Heart
                        size={12}
                        className={isFavorite ? "fill-red-500 text-red-500" : ""}
                    />
                </button>

                {images.length > 0 ? (
                    <Image
                        src={images[0]}
                        alt={title}
                        fill
                        className="object-cover"
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-text-muted font-black text-2xl opacity-10 select-none uppercase bg-gray-50 dark:bg-white/5">{t("siteName")}</div>
                )}
            </div>

            {/* Content Area */}
            <div className={`flex-1 flex flex-col p-1.5 ${isVertical ? "gap-0.5" : ""}`}>
                {/* Title */}
                <h3 className="text-[12px] font-black text-text-main line-clamp-2 leading-tight min-h-[2.5em]">
                    {title}
                </h3>

                {subCategory && (
                    <p className="text-[10px] sm:text-xs text-text-muted font-medium mb-1 line-clamp-1"> {/* Adjusted font size */}
                        {(t as any)[subCategory] || subCategory}
                    </p>
                )}

                {currentDescription && (
                    <p className="text-[10px] sm:text-xs text-text-muted line-clamp-2 leading-tight mb-1"> {/* Adjusted font size */}
                        {currentDescription.length > 100 ? currentDescription.substring(0, 100) + "..." : currentDescription}
                    </p>
                )}

                {/* Specs Grid */}
                <div className={`grid grid-cols-2 gap-x-1 gap-y-0.5 text-[8px] sm:text-[10px] text-text-muted ${isVertical ? "mt-auto mb-1" : "mt-1 mb-2"}`}> {/* Adjusted font size */}
                    <div className="flex items-center gap-0.5 font-normal">
                        <MapPin size={8} className="text-gray-400" />
                        <span className="truncate">{location?.split(",")[0].trim()}</span>
                    </div>
                    <div className="flex items-center gap-0.5 font-normal">
                        <Clock size={8} className="text-gray-400" />
                        <span>{formatRelativeTime(createdAt, language)}</span>
                    </div>
                </div>

                {/* Price & Category Footer */}
                <div className="mt-auto flex justify-between items-end pt-1 border-t border-border-color/50">
                    <div className="flex items-baseline gap-0.5 text-text-main">
                        <span className="text-xs font-black">{price?.toLocaleString()}</span>
                        <span className="text-[8px] font-normal text-text-muted uppercase">{currency}</span>
                    </div>
                    {category && (
                        <span className="text-[8px] sm:text-[10px] font-bold bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-gray-300 px-1 py-0.5 rounded-sm uppercase flex items-center gap-0.5"> {/* Adjusted font size */}
                            {getCategoryIcon(category)}
                            {(t as any)[category] || category}
                        </span>
                    )}
                </div>
            </div>
        </Link>
    );
}
