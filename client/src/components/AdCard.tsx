"use client";

import { useState } from "react";
import { useLanguage } from '@/lib/language-context';
import Link from "next/link";
import Image from "next/image";
import { Heart, Clock, X, MapPin, Eye, User } from "lucide-react";
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

    return (
        <Link href={`/ads/${id}`} className={`bg-white border border-gray-100 rounded-xl overflow-hidden group flex flex-col transition-all duration-300 hover:shadow-xl hover:-translate-y-1 !p-0 ${className}`}>
            {/* Image Area (compressed) */}
            <div className="relative h-40 bg-gray-50 overflow-hidden shrink-0">
                {isFeatured && (
                    <div className="absolute top-2 left-2 z-10 bg-primary text-white px-2 py-0.5 rounded-md text-[8px] font-black uppercase tracking-widest shadow-lg">
                        {t('featured')}
                    </div>
                )}

                <button
                    onClick={handleFavoriteClick}
                    className="absolute top-2 right-2 z-10 p-2 rounded-full bg-white/80 backdrop-blur-sm text-text-muted hover:text-red-500 transition-all shadow-sm"
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
                        className="object-cover transition-transform duration-500 group-hover:scale-110"
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 33vw, 20vw"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-200 font-black text-4xl opacity-20 select-none italic uppercase">{t('siteName')}</div>
                )}

                {/* Rich Hover Overlay */}
                <div className="absolute inset-0 bg-white/95 backdrop-blur-sm p-4 opacity-0 group-hover:opacity-100 transition-all duration-300 z-30 flex flex-col justify-center border-b-2 border-primary translate-y-4 group-hover:translate-y-0">
                    <h4 className="text-[11px] font-black text-secondary leading-tight line-clamp-2 mb-2">{title}</h4>
                    <p className="text-[9px] text-gray-500 line-clamp-4 leading-relaxed italic mb-auto">{description || title}</p>

                    <div className="mt-2 pt-2 border-t border-gray-100 space-y-1">
                        <div className="flex items-center justify-between text-[8px] font-bold text-gray-400">
                            <span className="flex items-center gap-1 uppercase"><User size={8} className="text-primary" /> {authorName || 'Merchant'}</span>
                            <span className="flex items-center gap-1 uppercase"><Eye size={8} className="text-primary" /> {views}</span>
                        </div>
                        <div className="flex items-center gap-1 text-[8px] font-black text-primary uppercase">
                            <MapPin size={8} /> {location}
                        </div>
                    </div>
                </div>
            </div>

            {/* Content Area (larger) */}
            <div className="p-4 flex-1 flex flex-col">
                <h3 className="text-[13px] font-black text-secondary line-clamp-1 mb-2 group-hover:text-primary transition-colors leading-tight uppercase tracking-tight">
                    {title}
                </h3>

                <div className="mt-auto">
                    <div className="flex items-baseline gap-1 text-primary">
                        <span className="text-lg font-[1000] italic tracking-tighter">{price?.toLocaleString()}</span>
                        <span className="text-[9px] font-black opacity-60 uppercase">SAR</span>
                    </div>

                    <div className="flex items-center gap-1.5 text-text-muted text-[10px] font-bold mt-1">
                        <MapPin size={10} className="text-primary/50" />
                        <span className="truncate">{location}</span>
                    </div>

                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-50">
                        <div className="flex items-center gap-1 text-[8px] font-black text-text-muted bg-gray-50 px-2 py-1 rounded-md uppercase tracking-wider">
                            <Clock size={10} />
                            {formatRelativeTime(createdAt, language)}
                        </div>
                        {category && (
                            <span className="text-[8px] font-black bg-primary/5 text-primary border border-primary/10 px-2 py-0.5 rounded-md uppercase tracking-widest">
                                {(t as any)[category] || category}
                            </span>
                        )}
                    </div>
                </div>
            </div>
        </Link>
    );
}
