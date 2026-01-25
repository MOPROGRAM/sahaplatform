"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Heart, MapPin, Clock } from "lucide-react";
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
    isFeatured = false
}: AdCardProps) {
    const [isFavorite, setIsFavorite] = useState(false);

    const handleFavoriteClick = (e: React.MouseEvent) => {
        e.preventDefault();
        setIsFavorite(!isFavorite);
    };



    return (
        <Link href={`/ads/${id}`} className={`ad-card-3d card-hover-effect overflow-hidden group ${className}`}>
            <div className="relative overflow-hidden">
                {/* Featured Badge */}
                {isFeatured && (
                    <div className="absolute top-3 left-3 z-20 bg-gradient-to-r from-orange-400 to-orange-600 text-white px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider shadow-lg">
                        {language === 'ar' ? 'مميز' : 'Featured'}
                    </div>
                )}

                {/* Favorite Button */}
                <button
                    onClick={handleFavoriteClick}
                    className="absolute top-3 right-3 z-10 p-2 rounded-full bg-white/80 backdrop-blur-md hover:bg-white text-gray-500 hover:text-red-500 transition-all shadow-sm hover:shadow-md hover:scale-110 active:scale-95"
                >
                    <Heart
                        size={16}
                        className={isFavorite ? "fill-red-500 text-red-500" : ""}
                    />
                </button>

                {/* Image */}
                {images.length > 0 ? (
                    <div className={`relative ${isFeatured ? 'h-64' : 'h-48'} bg-gray-50 flex items-center justify-center overflow-hidden`}>
                        <div className="absolute inset-0 bg-cover bg-center blur-xl opacity-20 scale-125 transition-all group-hover:scale-110" style={{ backgroundImage: `url(${images[0]})` }}></div>
                        <Image
                            src={images[0]}
                            alt={title}
                            fill
                            className="object-contain card-animated-element transition-transform duration-700 ease-out group-hover:scale-110 z-10"
                            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 33vw, 20vw"
                        />
                        {images.length > 1 && (
                            <div className="absolute bottom-2 right-2 bg-black/60 backdrop-blur-sm text-white px-2 py-0.5 rounded-sm text-[9px] font-black uppercase tracking-wider z-20">
                                +{images.length - 1} PHOTOS
                            </div>
                        )}
                    </div>
                ) : (
                    <div className={`${isFeatured ? 'h-64' : 'h-48'} bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center relative overflow-hidden group-hover:bg-primary/5 transition-colors`}>
                        <div className="absolute w-20 h-20 bg-primary/10 rounded-full blur-2xl -top-10 -right-10 animate-pulse"></div>
                        <div className="text-gray-300 font-black text-4xl opacity-20 select-none scale-150 rotate-12">SAHA</div>
                    </div>
                )}
            </div>

            {/* Content */}
            <div className={`${isFeatured ? 'p-6' : 'p-4'} relative`}>
                <div className="card-header relative z-10">
                    <h3 className={`${isFeatured ? 'text-lg' : 'text-sm'} card-title line-clamp-1 group-hover:text-primary transition-colors duration-300`}>{title}</h3>
                    <div className="card-price flex items-baseline gap-1">
                        {price.toLocaleString()} <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">{currency}</span>
                    </div>
                </div>

                {location && (
                    <div className="card-location text-[10px] font-bold opacity-80 mb-3">
                        {location}
                    </div>
                )}

                {/* Modern Glass Footer */}
                <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100/50">
                    {createdAt && (
                        <div className="flex items-center gap-1.5 text-[9px] font-bold text-gray-400 uppercase tracking-wider bg-gray-50 px-2 py-1 rounded-sm">
                            <Clock size={10} />
                            {formatRelativeTime(createdAt, language)}
                        </div>
                    )}
                    {category && (
                        <span className="text-[9px] font-black bg-primary/5 text-primary border border-primary/10 px-2 py-1 rounded-sm uppercase tracking-widest group-hover:bg-primary group-hover:text-white transition-all">
                            {category}
                        </span>
                    )}
                </div>
            </div>
        </Link>
    );
}