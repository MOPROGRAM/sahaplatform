"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Heart, MapPin, Clock } from "lucide-react";

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
    className = ""
}: AdCardProps) {
    const [isFavorite, setIsFavorite] = useState(false);

    const handleFavoriteClick = (e: React.MouseEvent) => {
        e.preventDefault();
        setIsFavorite(!isFavorite);
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));

        if (diffInHours < 24) {
            return `منذ ${diffInHours} ساعة`;
        } else {
            const diffInDays = Math.floor(diffInHours / 24);
            return `منذ ${diffInDays} يوم`;
        }
    };

    return (
        <Link href={`/ads/view?id=${id}`} className={`ad-card-3d ${className}`}>
            <div className="relative">
                {/* Favorite Button */}
                <button
                    onClick={handleFavoriteClick}
                    className="absolute top-3 right-3 z-10 p-2 rounded-full bg-white/80 backdrop-blur-sm hover:bg-white transition-colors"
                >
                    <Heart
                        size={16}
                        className={isFavorite ? "fill-red-500 text-red-500" : "text-gray-600"}
                    />
                </button>

                {/* Image */}
                {images.length > 0 ? (
                    <div className="relative h-48 rounded-t-xl overflow-hidden">
                        <Image
                            src={images[0]}
                            alt={title}
                            fill
                            className="object-cover"
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        />
                        {images.length > 1 && (
                            <div className="absolute bottom-2 right-2 bg-black/50 text-white px-2 py-1 rounded text-xs">
                                +{images.length - 1}
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="h-48 bg-gradient-to-br from-gray-200 to-gray-300 rounded-t-xl flex items-center justify-center">
                        <div className="text-gray-500 text-sm">لا توجد صورة</div>
                    </div>
                )}
            </div>

            {/* Content */}
            <div className="p-4">
                <div className="card-header">
                    <h3 className="card-title line-clamp-2">{title}</h3>
                    <div className="card-price">
                        {price.toLocaleString()} {currency}
                    </div>
                </div>

                {location && (
                    <div className="card-location">
                        {location}
                    </div>
                )}

                {/* Footer Info */}
                <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
                    <div className="flex items-center gap-1 text-xs text-gray-500">
                        <Clock size={12} />
                        {formatDate(createdAt)}
                    </div>
                    {category && (
                        <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                            {category}
                        </span>
                    )}
                </div>
            </div>
        </Link>
    );
}