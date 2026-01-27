"use client";

import { useState } from "react";
import { useLanguage } from '@/lib/language-context';
import Link from "next/link";
import Image from "next/image";
import { Heart, Clock, MapPin, Eye, User, Home as HomeIcon, Car as CarIcon, Briefcase as BriefcaseIcon } from "lucide-react";
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
    className?: string;
    language?: 'ar' | 'en';
    isFeatured?: boolean;
    views?: number;
    description?: string;
}

export default function AdCard({
    id,
    title,
    price,
    currency = "ريال",
    location,
    images = [],
    createdAt,
    authorName,
    category,
    className = "",
    language = 'ar',
    isFeatured = false,
    views = 0,
    description = ""
}: AdCardProps) {
    const { t } = useLanguage();
    const [isFavorite, setIsFavorite] = useState(false);

    const handleFavoriteClick = (e: React.MouseEvent) => {
        e.preventDefault();
        setIsFavorite(!isFavorite);
    };

    const getCategoryIcon = (catKey?: string) => {
        switch (catKey) {
            case 'realestate': return <HomeIcon size={12} className="text-gray-400" />;
            case 'cars': return <CarIcon size={12} className="text-gray-400" />;
            case 'jobs': return <BriefcaseIcon size={12} className="text-gray-400" />;
            default: return null;
        }
    }

    return (
        <Link href={`/ads/${id}`} className={`bg-white border border-gray-100 rounded-xl overflow-hidden group flex transition-all duration-300 hover:shadow-xl hover:border-primary/30 ${className}`}>

            {/* Image Area (Left, ~40% width) */}
            <div className="relative w-2/5 shrink-0 overflow-hidden">
                {isFeatured && (
                    <div className="absolute top-2 left-2 z-10 bg-primary text-white px-2 py-0.5 rounded-md text-[8px] font-black uppercase tracking-widest shadow-lg">
                        {t('featured')}
                    </div>
                )}

                <button
                    onClick={handleFavoriteClick}
                    className="absolute top-2 right-2 z-10 p-2 rounded-full bg-white/80 backdrop-blur-sm text-gray-400 hover:text-red-500 transition-all shadow-sm"
                >
                    <Heart
                        size={14}
                        className={isFavorite ? "fill-red-500 text-red-500" : ""}
                    />
                </button>

                {images.length > 0 ? (
                    <Image
                        src={images[0]}
                        alt={title}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 33vw, 20vw"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-200 font-black text-4xl opacity-20 select-none italic uppercase">{t('siteName')}</div>
                )}
            </div>

            {/* Content Area (Right, flex-1) */}
            <div className="flex-1 flex flex-col p-4">
                {/* Title */}
                <h3 className="text-base font-semibold text-text-main line-clamp-2 mb-2 leading-snug">
                    {title}
                </h3>

                {/* Specs Grid - Airbnb Style */}
                <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-text-muted mt-1 mb-3">
                    <div className="flex items-center gap-1">
                        <MapPin size={12} className="text-gray-400" />
                        <span className="font-normal">{location?.split(",")[0].trim()}</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <Eye size={12} className="text-gray-400" />
                        <span className="font-normal">{views} {t('views')}</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <Clock size={12} className="text-gray-400" />
                        <span className="font-normal">{formatRelativeTime(createdAt, language)}</span>
                    </div>
                    {authorName && (
                        <div className="flex items-center gap-1">
                            <User size={12} className="text-gray-400" />
                            <span className="font-normal">{authorName}</span>
                        </div>
                    )}
                </div>

                {/* Price & Category Footer */}
                <div className="mt-auto flex justify-between items-end pt-3 border-t border-border-color">
                    <div className="flex items-baseline gap-1 text-text-main">
                        <span className="text-xl font-bold">{price?.toLocaleString()}</span>
                        <span className="text-xs font-medium text-text-muted uppercase">{currency}</span>
                    </div>
                    {category && (
                        <span className="text-[10px] font-medium bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full uppercase flex items-center gap-1">
                            {getCategoryIcon(category)}
                            {(t as any)[category] || category}
                        </span>
                    )}
                </div>
            </div>
        </Link>
    );
}
