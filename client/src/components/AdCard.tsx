"use client";

import { useState, useEffect } from "react";
import { useLanguage } from '@/lib/language-context';
import Link from "next/link";
import Image from "next/image";
import { Heart, Clock, MapPin, Home as HomeIcon, Car as CarIcon, Briefcase as BriefcaseIcon, Smartphone as SmartphoneIcon, Tag as TagIcon, Building as BuildingIcon, Wrench, Phone, MessageCircle, User } from "lucide-react";
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
    imageHeight,
    authorName // Added to destructuring
}: AdCardProps) {
    const { t } = useLanguage();
    const [isFavorite, setIsFavorite] = useState(false);
    const [peel, setPeel] = useState<{x: number; y: number}>({ x: 0, y: 0 });
    const [faceIndex, setFaceIndex] = useState(0);
    const [backPeelY, setBackPeelY] = useState(0);
    const cornerMax = 96;
    const peelY = Math.max(0, Math.min(cornerMax, peel.y));

    useEffect(() => {
        try {
            const key = 'saha:favorites';
            const raw = window.localStorage.getItem(key);
            if (raw) {
                const list = JSON.parse(raw) as any[];
                setIsFavorite(list.some(a => a.id === id));
            }
        } catch {}
    }, [id]);

    // Faces configuration
    const faces = isFeatured ? ['image', 'details', 'contact'] : ['image', 'details'];
    
    // Helpers to determine content for physical sides
    const getFrontContent = () => {
        const i = faceIndex;
        // If current face is even, it's on the front. 
        // If current face is odd (back visible), front should prep for next even (i+1).
        const typeIndex = (i % 2 === 0) ? i : i + 1;
        return faces[typeIndex % faces.length];
    };

    const getBackContent = () => {
        const i = faceIndex;
        // If current face is odd, it's on the back.
        // If current face is even (front visible), back should prep for next odd (i+1).
        const typeIndex = (i % 2 !== 0) ? i : i + 1;
        return faces[typeIndex % faces.length];
    };

    const handleNextFace = (e?: React.MouseEvent) => {
        if (e) {
            e.preventDefault();
            e.stopPropagation();
        }
        setFaceIndex(prev => prev + 1);
    };

    const handleResetFace = (e?: React.MouseEvent) => {
        if (e) {
            e.preventDefault();
            e.stopPropagation();
        }
        const len = faces.length;
        const current = faceIndex;
        // Calculate steps to next image (index 0)
        const nextImage = current + (len - (current % len));
        setFaceIndex(nextImage);
    };

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
        : (description_en || descriptionEn || description); 

    const currentTitle = language === 'ar'
        ? (titleAr || title)
        : (titleEn || title);

    const currencyCode = (currency && typeof currency === 'object') ? (currency as any).code : (currency || 'SAR');
    const peelProgress = peelY / cornerMax;
    const openThreshold = 0.4;
    
    // Render Functions
    const renderStandardFace = () => (
        <div className={`w-full h-full flex bg-white dark:bg-[#1a1a1a] ${isVertical ? "flex-col" : (language === "ar" ? "flex-row-reverse" : "flex-row")}`}>
             {/* Image Section */}
            <div className={`relative shrink-0 overflow-hidden ${isVertical ? (imageHeight ? `w-full ${imageHeight}` : "w-full h-48") : "w-[35%] h-full"}`}>
                {/* Shine Effect */}
                <div className="absolute inset-0 -translate-x-[150%] group-hover:animate-shimmer bg-gradient-to-r from-transparent via-white/30 to-transparent skew-x-12 z-10 pointer-events-none duration-1000" />

                {/* Flip/Peel Interaction */}
                <div className="absolute top-1 left-1 z-20">
                    <motion.button
                        className={`px-1 py-0.5 rounded text-[8px] font-black uppercase tracking-wider shadow-md cursor-grab active:cursor-grabbing select-none flex items-center gap-1 ${isFeatured ? "bg-primary text-white" : "bg-white/80 dark:bg-black/50 text-text-muted backdrop-blur-sm hover:bg-white dark:hover:bg-black/70"}`}
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
                                handleNextFace();
                            }
                            setPeel({ x: 0, y: 0 });
                        }}
                        onClick={handleNextFace}
                    >
                        {isFeatured ? t("featured") : t("details")}
                    </motion.button>

                    <div className="absolute inset-0 pointer-events-none">
                        <div
                            className={`absolute top-0 left-0 shadow-2xl ${isFeatured ? "bg-gradient-to-br from-[#ff6b35] to-[#ff8a4a]" : "bg-white/90 dark:bg-[#1f1f1f]/90"}`}
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
                        className="object-cover transition-transform duration-700 group-hover:scale-110"
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-50 dark:bg-white/5 select-none group-hover:bg-gray-100 dark:group-hover:bg-white/10 transition-colors">
                        <Logo className="w-12 h-12 text-primary opacity-70 group-hover:scale-110 transition-transform duration-500" />
                    </div>
                )}
            </div>

            {/* Content Section */}
            <div className={`flex-1 flex flex-col p-2 ${isVertical ? "gap-1" : "justify-center"}`}>
                 <div className="flex items-start justify-between gap-2">
                    <h3 className="text-sm font-bold text-text-main line-clamp-2 hover:text-primary transition-colors duration-300">
                        {currentTitle}
                    </h3>
                </div>

                <div className="flex items-center gap-2 mt-auto">
                     <p className="text-lg font-black text-primary">
                        {new Intl.NumberFormat(language === 'ar' ? 'ar-SA' : 'en-US').format(price)}
                        <span className="text-[10px] font-normal text-text-muted mx-1">{currencyCode}</span>
                    </p>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-gray-800 mt-1">
                     {location && (
                        <div className="flex items-center gap-1 text-[10px] text-text-muted">
                            <MapPin size={10} />
                            <span className="truncate max-w-[80px]">{location.split(",")[0]}</span>
                        </div>
                    )}
                     <div className="flex items-center gap-1 text-[10px] text-text-muted">
                        <Clock size={10} />
                        <span>{createdAt ? formatRelativeTime(createdAt, language) : ''}</span>
                    </div>
                </div>
            </div>
        </div>
    );

    const renderDetailsFace = () => (
        <div
            className={`w-full h-full p-2 relative overflow-hidden flex flex-col ${isFeatured ? "bg-gradient-to-br from-[#ff6b35] via-[#ff8a4a] to-white" : "bg-white dark:bg-[#1a1a1a]"}`}
            onClick={(e) => {
                e.stopPropagation();
            }}
        >
             {isFeatured && (
                <div className="absolute inset-0 z-0 pointer-events-none">
                    <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                        <path d="M0 60 Q 20 40 40 60 T 80 60 T 120 40 V 100 H 0 Z" fill="rgba(255,255,255,0.15)" />
                        <path d="M0 40 Q 25 70 50 40 T 100 50 V 100 H 0 Z" fill="rgba(255,255,255,0.1)" />
                        <path d="M0 80 Q 30 50 60 80 T 120 70 V 100 H 0 Z" fill="rgba(255,255,255,0.2)" />
                    </svg>
                </div>
            )}

            {/* Close/Next Controls */}
            <div className="absolute top-1 left-1 z-20">
                <motion.button
                    className={`px-1 py-0.5 rounded text-[8px] font-black uppercase tracking-wider shadow-md cursor-grab active:cursor-grabbing select-none flex items-center gap-1 ${isFeatured ? "bg-white/20 text-white backdrop-blur-sm" : "bg-gray-100 text-text-main"}`}
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
                            handleResetFace();
                        }
                        setBackPeelY(0);
                    }}
                    onClick={handleResetFace}
                >
                    إغلاق
                </motion.button>
                 <div className="absolute inset-0 pointer-events-none">
                    <div
                        className={`absolute top-0 left-0 shadow-2xl ${isFeatured ? "bg-white/30" : "bg-gray-200"}`}
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

            <div className="flex flex-col h-full relative z-10 pt-4">
                <h3 className={`text-[12px] font-black leading-tight mb-1 ${isFeatured ? "text-white drop-shadow-md" : "text-text-main"}`}>{currentTitle}</h3>
                {currentDescription && (
                    <p className={`text-[10px] leading-tight mb-2 line-clamp-4 ${isFeatured ? "text-white/90" : "text-text-muted"}`}>
                        {currentDescription}
                    </p>
                )}
                
                <div className={`grid grid-cols-2 gap-2 text-[9px] mb-2 ${isFeatured ? "text-white/80" : "text-text-muted"}`}>
                     {location && (
                        <div className="flex items-center gap-1">
                            <MapPin size={9} className={isFeatured ? "text-white" : "text-gray-400"} />
                            <span className="truncate">{location?.split(",")[0].trim()}</span>
                        </div>
                    )}
                     <div className="flex items-center gap-1">
                        <Clock size={9} className={isFeatured ? "text-white" : "text-gray-400"} />
                        <span>{createdAt ? formatRelativeTime(createdAt, language) : ''}</span>
                    </div>
                </div>

                <div className="mt-auto flex items-center justify-between">
                     <button
                        className={`px-2 py-1 text-[10px] font-black rounded transition-colors ${isFeatured ? "bg-white/20 text-white hover:bg-white/30" : "bg-gray-100 dark:bg-white/10 text-text-main hover:bg-primary/10"}`}
                        onClick={handleNextFace}
                    >
                        {isFeatured ? t("contact") : t("back")}
                    </button>
                    <span className={`text-[9px] ${isFeatured ? "text-white/80" : "text-text-muted"}`}>
                        اسحب للإغلاق
                    </span>
                </div>
            </div>
        </div>
    );

    const renderContactFace = () => (
         <div
            className={`w-full h-full p-2 relative overflow-hidden flex flex-col bg-white dark:bg-[#1a1a1a]`}
            onClick={(e) => {
                e.stopPropagation();
            }}
        >
            {/* Close Button (similar logic) */}
             <div className="absolute top-1 left-1 z-20">
                 <button 
                    className="px-1 py-0.5 rounded text-[8px] font-black uppercase tracking-wider shadow-md bg-gray-100 text-text-main"
                    onClick={handleResetFace}
                 >
                    إغلاق
                 </button>
             </div>

            <div className="flex flex-col h-full relative z-10 pt-6 items-center text-center">
                 <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mb-2">
                    <User className="text-primary" size={20} />
                 </div>
                 <h3 className="text-[11px] font-bold text-text-main mb-3">{authorName || t("seller")}</h3>
                 
                 <div className="flex flex-col gap-2 w-full px-2">
                    <button className="flex items-center justify-center gap-2 w-full py-1.5 bg-primary text-white rounded text-[10px] font-bold hover:bg-primary/90 transition-colors">
                        <Phone size={12} />
                        {t("call")}
                    </button>
                    <button className="flex items-center justify-center gap-2 w-full py-1.5 bg-[#25D366] text-white rounded text-[10px] font-bold hover:bg-[#25D366]/90 transition-colors">
                        <MessageCircle size={12} />
                        {t("whatsapp")}
                    </button>
                 </div>

                  <div className="mt-auto flex items-center justify-between w-full">
                     <button
                        className="px-2 py-1 text-[10px] font-black rounded bg-gray-100 text-text-main hover:bg-gray-200"
                        onClick={handleNextFace}
                    >
                        الصورة
                    </button>
                </div>
            </div>
        </div>
    );

    const renderContent = (type: string) => {
        switch (type) {
            case 'image': return renderStandardFace();
            case 'details': return renderDetailsFace();
            case 'contact': return renderContactFace();
            default: return renderStandardFace();
        }
    };

    return (
        <Link
            href={`/ads/${id}`}
            className={`bento-card bento-card-hover group flex shadow hover:shadow-xl hover:-translate-y-1 transition-all duration-300 ${isHighlighted ? "border-primary ring-2 ring-primary/50" : "border-gray-300 dark:border-gray-700"} ${isVertical ? "flex-col h-full" : (language === "ar" ? "flex-row-reverse" : "flex-row")} ${className}`}
            onMouseEnter={() => onMapHighlight && onMapHighlight(id)}
            onMouseLeave={() => onMapHighlight && onMapHighlight(null)}
        >
            <div className="relative w-full h-full" style={{ perspective: 1000 }}>
                <motion.div
                    className="w-full h-full relative"
                    style={{ transformStyle: 'preserve-3d' }}
                    animate={{ rotateY: faceIndex * 180 }}
                    transition={{ duration: 0.6, ease: [0.23, 1, 0.32, 1] }} // Cubic bezier for smoother flip
                >
                    {/* Front Physical Side */}
                    <div 
                        className="relative w-full h-full"
                        style={{ backfaceVisibility: 'hidden', transform: 'rotateY(0deg)' }}
                    >
                        {renderContent(getFrontContent())}
                    </div>

                    {/* Back Physical Side */}
                    <div 
                        className="absolute inset-0 w-full h-full"
                        style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
                    >
                        {renderContent(getBackContent())}
                    </div>
                </motion.div>
            </div>
        </Link>
    );
}
