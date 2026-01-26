"use client";

import { useState } from "react";
import { useLanguage } from '@/lib/language-context';
import Link from "next/link";
import Image from "next/image";
import { Heart, Clock, X, ChevronLeft, ChevronRight } from "lucide-react";
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
    category,
    className = "",
    language = 'ar',
    isFeatured = false
}: AdCardProps) {
    const { t } = useLanguage();
    const [isFavorite, setIsFavorite] = useState(false);
    const [showImageViewer, setShowImageViewer] = useState(false);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    const handleFavoriteClick = (e: React.MouseEvent) => {
        e.preventDefault();
        setIsFavorite(!isFavorite);
    };

    const handleImageClick = (e: React.MouseEvent, index: number) => {
        e.preventDefault();
        setCurrentImageIndex(index);
        setShowImageViewer(true);
    };

    const nextImage = () => {
        setCurrentImageIndex((prev) => (prev + 1) % images.length);
    };

    const prevImage = () => {
        setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
    };

    return (
        <>
            <Link href={`/ads/${id}`} className={`depth-card overflow-hidden group ${className}`}>
                <div className="relative">
                    {isFeatured && (
                        <div className="absolute top-2 left-2 z-10 bg-primary text-white px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-lg">
                            {t('featured')}
                        </div>
                    )}

                    <button
                        onClick={handleFavoriteClick}
                        className="absolute top-2 right-2 z-10 p-1.5 rounded-full bg-card-bg/70 backdrop-blur-sm text-text-muted hover:text-red-500 transition-all shadow-sm"
                    >
                        <Heart
                            size={14}
                            className={isFavorite ? "fill-red-500 text-red-500" : ""}
                        />
                    </button>

                    <div className="relative h-40 bg-gray-bg flex items-center justify-center overflow-hidden">
                        {images.length > 0 ? (
                            <Image
                                src={images[0]}
                                alt={title}
                                fill
                                className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300 ease-out"
                                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 33vw, 20vw"
                                onClick={(e) => handleImageClick(e, 0)}
                            />
                        ) : (
                            <div className="text-text-muted font-black text-3xl opacity-20 select-none">{t('siteName')}</div>
                        )}
                        {images.length > 1 && (
                            <div className="absolute bottom-2 right-2 bg-black/50 text-white px-1.5 py-0.5 rounded text-[9px] font-bold uppercase">
                                +{images.length}
                            </div>
                        )}
                    </div>
                </div>

                <div className="p-3">
                    <h3 className="text-sm font-bold text-text-main line-clamp-2 group-hover:text-primary transition-colors">{title}</h3>
                    
                    <p className="text-primary font-black text-lg mt-1">
                        {price > 0 ? `${price.toLocaleString()} ${t(currency as any)}` : t('priceOnRequest')}
                    </p>

                    {location && (
                        <p className="text-xs text-text-muted mt-1 truncate">{location}</p>
                    )}

                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-border-color">
                        <div className="flex items-center gap-1 text-[10px] text-text-muted font-bold">
                            <Clock size={10} />
                            {formatRelativeTime(createdAt, language)}
                        </div>
                        {category && (
                            <span className="text-[9px] font-bold bg-primary/10 text-primary px-2 py-0.5 rounded uppercase">
                                {t(category)}
                            </span>
                        )}
                    </div>
                </div>
            </Link>

            {showImageViewer && images.length > 0 && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 backdrop-blur-sm" onClick={() => setShowImageViewer(false)}>
                    <div className="relative max-w-3xl max-h-[90vh] w-full" onClick={(e) => e.stopPropagation()}>
                        <Image
                            src={images[currentImageIndex]}
                            alt={title}
                            width={1200}
                            height={800}
                            className="w-full h-full object-contain rounded-lg"
                        />
                        <button onClick={() => setShowImageViewer(false)} className="absolute top-4 right-4 text-white bg-black/50 rounded-full p-2">
                            <X size={20} />
                        </button>
                        {images.length > 1 && (
                            <>
                                <button onClick={prevImage} className="absolute left-4 top-1/2 -translate-y-1/2 text-white bg-black/50 rounded-full p-2">
                                    <ChevronLeft size={24} />
                                </button>
                                <button onClick={nextImage} className="absolute right-4 top-1/2 -translate-y-1/2 text-white bg-black/50 rounded-full p-2">
                                    <ChevronRight size={24} />
                                </button>
                                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white bg-black/50 rounded-full px-3 py-1 text-sm">
                                    {currentImageIndex + 1} / {images.length}
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}
        </>
    );
}