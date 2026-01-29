"use client";

import { useState } from "react";
import { useLanguage } from '@/lib/language-context';
import Link from "next/link";
import Image from "next/image";
import { Heart, Clock, MapPin, Home as HomeIcon, Car as CarIcon, Briefcase as BriefcaseIcon, Smartphone as SmartphoneIcon, Tag as TagIcon, Building as BuildingIcon, Wrench } from "lucide-react";
import { Logo } from "@/components/Logo";
import { formatRelativeTime } from "@/lib/utils";
import { motion } from "framer-motion";

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
    titleAr?: string;
    titleEn?: string;
    description_ar?: string; // Added
    description_en?: string; // Added
    descriptionAr?: string; // Added camelCase support
    descriptionEn?: string; // Added camelCase support
    className?: string;
    language?: 'ar' | 'en';
    isFeatured?: boolean;
    description?: string;
    onMapHighlight?: (adId: string | null) => void;
    isHighlighted?: boolean;
    layout?: 'vertical' | 'horizontal';
    imageHeight?: string;
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
    titleAr,
    titleEn,
    description_ar, // Added
    description_en, // Added
    descriptionAr, // Added camelCase support
    descriptionEn, // Added camelCase support
    description, // Added fallback
    onMapHighlight,
    isHighlighted = false,
    layout = 'vertical',
    imageHeight
}: AdCardProps) {
    const { t } = useLanguage();
    const [isFavorite, setIsFavorite] = useState(false);
    const [peel, setPeel] = useState<{x: number; y: number}>({ x: 0, y: 0 });
    const [flipped, setFlipped] = useState(false);
    const [backPeelY, setBackPeelY] = useState(0);
    const cornerMax = 96;
    const peelY = Math.max(0, Math.min(cornerMax, peel.y));

    const handleFavoriteClick = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        const next = !isFavorite;
        setIsFavorite(next);
        try {
            const key = 'saha:favorites';
            const raw = typeof window !== 'undefined' ? window.localStorage.getItem(key) : null;
            const list = raw ? JSON.parse(raw) as any[] : [];
            if (next) {
                const fav = {
                    id,
                    title: currentTitle,
                    price,
                    currency: currencyCode,
                    location: location || '',
                    image: images[0] || '',
                    createdAt
                };
                const exists = list.some(a => a.id === id);
                const updated = exists ? list.map(a => a.id === id ? fav : a) : [...list, fav];
                window.localStorage.setItem(key, JSON.stringify(updated));
            } else {
                const updated = list.filter(a => a.id !== id);
                window.localStorage.setItem(key, JSON.stringify(updated));
            }
        } catch {}
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
    const currentDescription = language === 'ar' 
        ? (description_ar || descriptionAr || description) 
        : (description_en || descriptionEn || description); // Helper variable with fallbacks

    const currentTitle = language === 'ar'
        ? (titleAr || title)
        : (titleEn || title);

    const currencyCode = (currency && typeof currency === 'object') ? (currency as any).code : (currency || 'SAR');
    const peelProgress = peelY / cornerMax;
    const openThreshold = 0.4;
    
    return (
        <Link
            href={`/ads/${id}`}
            className={`bento-card bento-card-hover group flex shadow hover:shadow-lg ${isHighlighted ? "border-primary ring-2 ring-primary/50" : "border-gray-300 dark:border-gray-700"} ${isVertical ? "flex-col h-full" : (language === "ar" ? "flex-row-reverse" : "flex-row")} ${className}`}
            onMouseEnter={() => onMapHighlight && onMapHighlight(id)}
            onMouseLeave={() => onMapHighlight && onMapHighlight(null)}
        >
            <div className="relative w-full" style={{ perspective: 1000 }}>
                <motion.div
                    style={{ transformStyle: 'preserve-3d' }}
                    animate={{ rotateY: flipped ? 180 : 0 }}
                    transition={{ duration: 0.5, ease: 'easeInOut' }}
                >
                    <div style={{ backfaceVisibility: 'hidden' }}>

            {/* Image Area */}
            <div className={`relative shrink-0 overflow-hidden ${isVertical ? (imageHeight ? `w-full ${imageHeight}` : "w-full h-[72px]") : "w-[25%]"}`}>
                {isFeatured && (
                    <div className="absolute top-1 left-1 z-20">
                        <motion.button
                            className="px-1 py-0.5 bg-primary text-white rounded text-[8px] font-black uppercase tracking-wider shadow-md cursor-grab active:cursor-grabbing select-none"
                            drag="y"
                            dragMomentum={false}
                            onPointerDown={(e) => { e.preventDefault(); e.stopPropagation(); }}
                            onDrag={(e, info) => {
                                e.preventDefault();
                                e.stopPropagation();
                                setPeel({
                                    x: 0,
                                    y: Math.max(0, Math.min(cornerMax, info.offset.y)),
                                });
                            }}
                            onDragEnd={() => {
                                if (peelProgress >= openThreshold) {
                                    setFlipped(true);
                                }
                                setPeel({ x: 0, y: 0 });
                            }}
                        >
                            {t("featured")}
                        </motion.button>

                        <div className="absolute inset-0 pointer-events-none">
                            <div
                                className="absolute top-0 left-0 bg-white/90 dark:bg-[#1f1f1f]/90 shadow-2xl"
                                style={{
                                    width: cornerMax,
                                    height: cornerMax,
                                    clipPath: `polygon(0px 0px, 8px 0px, 0px ${peelY}px)`,
                                    borderTopLeftRadius: 8,
                                    transform: `perspective(600px) rotateX(${Math.min(45, peelY / 2)}deg)`,
                                    transformOrigin: "top left"
                                }}
                            />
                        </div>
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
                    <div className="w-full h-full flex items-center justify-center bg-gray-50 dark:bg-white/5 select-none">
                        <Logo className="w-12 h-12 text-primary opacity-70" />
                    </div>
                )}
            </div>

            {/* Content Area */}
            <div className={`flex-1 flex flex-col p-1.5 ${isVertical ? "gap-0.5" : ""}`}>
                {/* Title */}
                <h3 className="text-[12px] font-black text-text-main line-clamp-2 leading-tight min-h-[2.5em]">
                    {currentTitle}
                </h3>

                {subCategory && (
                    <p className="text-[10px] text-text-muted font-medium mb-1 line-clamp-1">
                        {(t as any)[subCategory] || subCategory}
                    </p>
                )}

                {currentDescription && (
                    <p className="text-[10px] text-text-muted line-clamp-2 leading-tight mb-1">
                        {currentDescription.length > 100 ? currentDescription.substring(0, 100) + "..." : currentDescription}
                    </p>
                )}

                {/* Specs Grid */}
                <div className={`grid grid-cols-2 gap-x-1 gap-y-0.5 text-[8px] text-text-muted ${isVertical ? "mt-auto mb-1" : "mt-1 mb-2"}`}>
                    <div className="flex items-center gap-0.5 font-normal">
                        <MapPin size={8} className="text-gray-400" />
                        <span className="truncate">{location?.split(",")[0].trim()}</span>
                    </div>
                    <div className="flex items-center gap-0.5 font-normal" suppressHydrationWarning>
                        <Clock size={8} className="text-gray-400" />
                        <span>{createdAt ? formatRelativeTime(createdAt, language) : ''}</span>
                    </div>
                </div>

                {/* Price & Category Footer */}
                <div className="mt-auto flex justify-between items-end pt-1 border-t border-border-color/50">
                    <div className="flex items-baseline gap-0.5 text-text-main">
                        <span className="text-xs font-black">
                            {new Intl.NumberFormat(language === 'ar' ? 'ar-SA' : 'en-US').format(price)}
                        </span>
                        <span className="text-[8px] font-normal text-text-muted uppercase">{currencyCode}</span>
                    </div>
                    {category && (
                        <span className="text-[8px] font-bold bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-gray-300 px-1 py-0.5 rounded-sm uppercase flex items-center gap-0.5">
                            {getCategoryIcon(category)}
                            {(t as any)[category] || category}
                        </span>
                    )}
                </div>
            </div>
                    </div>

                    {/* Back Face */}
                    <div
                        className="absolute inset-0 p-2 bg-white/95 dark:bg-[#1a1a1a]/95 border border-border-color rounded-md shadow-2xl cursor-pointer"
                        style={{ transform: 'rotateY(180deg)', backfaceVisibility: 'hidden' }}
                        onClick={(e) => {
                            e.stopPropagation();
                            // السماح للنقر على الظهر أن يفتح صفحة التفاصيل (رابط البطاقة سيتعامل مع التنقل)
                        }}
                    >
                        {/* Draggable top-left corner to close by dragging up */}
                        <div className="absolute top-1 left-1 z-20">
                            <motion.button
                                className="px-1 py-0.5 bg-primary text-white rounded text-[8px] font-black uppercase tracking-wider shadow-md cursor-grab active:cursor-grabbing select-none"
                                drag="y"
                                dragMomentum={false}
                                onPointerDown={(e) => { e.preventDefault(); e.stopPropagation(); }}
                                onDrag={(e, info) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    setBackPeelY(Math.max(0, Math.min(cornerMax, -info.offset.y)));
                                }}
                                onDragEnd={() => {
                                    if (backPeelY >= cornerMax * 0.4) {
                                        setFlipped(false);
                                    }
                                    setBackPeelY(0);
                                }}
                            >
                                إغلاق
                            </motion.button>
                            <div className="absolute inset-0 pointer-events-none">
                                <div
                                    className="absolute top-0 left-0 bg-white/90 dark:bg-[#1f1f1f]/90 shadow-2xl"
                                    style={{
                                        width: cornerMax,
                                        height: cornerMax,
                                        clipPath: `polygon(0px 0px, 8px 0px, 0px ${backPeelY}px)`,
                                        borderTopLeftRadius: 8,
                                        transform: `perspective(600px) rotateX(${Math.min(45, backPeelY / 2)}deg)`,
                                        transformOrigin: "top left"
                                    }}
                                />
                            </div>
                        </div>
                        <div className="flex flex-col h-full">
                            <h3 className="text-[12px] font-black text-text-main leading-tight mb-1">{currentTitle}</h3>
                            {currentDescription && (
                                <p className="text-[10px] text-text-muted leading-tight mb-2">
                                    {currentDescription}
                                </p>
                            )}
                            <div className="grid grid-cols-2 gap-2 text-[9px] text-text-muted mb-2">
                                {location && (
                                    <div className="flex items-center gap-1">
                                        <MapPin size={9} className="text-gray-400" />
                                        <span className="truncate">{location?.split(",")[0].trim()}</span>
                                    </div>
                                )}
                                <div className="flex items-baseline gap-1 text-text-main">
                                    <span className="text-[11px] font-black">
                                        {new Intl.NumberFormat(language === 'ar' ? 'ar-SA' : 'en-US').format(price)}
                                    </span>
                                    <span className="text-[9px] font-medium text-text-muted uppercase">{currencyCode}</span>
                                </div>
                            </div>
                            <div className="mt-auto flex items-center justify-between">
                                <button
                                    className="px-2 py-1 text-[10px] font-black rounded bg-gray-100 dark:bg-white/10 text-text-main hover:bg-primary/10 transition-colors"
                                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); setFlipped(false); }}
                                >
                                    رجوع
                                </button>
                                <span className="text-[9px] text-text-muted">
                                    اسحب الزاوية للأعلى لإغلاق
                                </span>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </Link>
    );
}
