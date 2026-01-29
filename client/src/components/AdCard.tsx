"use client";

import { useState, useEffect } from "react";
import { useLanguage } from '@/lib/language-context';
import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Heart, Clock, MapPin, Home as HomeIcon, Car as CarIcon, Briefcase as BriefcaseIcon, Smartphone as SmartphoneIcon, Tag as TagIcon, Building as BuildingIcon, Wrench, Phone, MessageCircle, User, Star, Flag, AlertTriangle, CheckCircle2, X, Mail } from "lucide-react";
import { Logo } from "@/components/Logo";
import { formatRelativeTime } from "@/lib/utils";
import { motion } from "framer-motion";
import { supabase } from "@/lib/supabase";

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
    phone?: string;
    email?: string;
    authorId?: string;
    authorRating?: number;
    authorRatingsCount?: number;
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
    authorName,
    phone,
    email,
    authorId,
    authorRating = 0,
    authorRatingsCount = 0
}: AdCardProps) {
    const { t, language: contextLanguage } = useLanguage();
    const router = useRouter();
    const currentLanguage = language || contextLanguage;
    const [isFavorite, setIsFavorite] = useState(false);
    const [peel, setPeel] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
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
        } catch { }
    }, [id]);

    const isVertical = layout === 'vertical';
    const currentDescription = currentLanguage === 'ar'
        ? (description_ar || descriptionAr || description)
        : (description_en || descriptionEn || description);

    const currentTitle = currentLanguage === 'ar'
        ? (titleAr || title)
        : (titleEn || title);

    const currencyCode = (currency && typeof currency === 'object') ? (currency as any).code : (currency || 'SAR');
    const peelProgress = peelY / cornerMax;
    const openThreshold = 0.4;

    // Faces configuration
    const descriptionLimit = 160;
    const hasMoreDetails = currentDescription && currentDescription.length > descriptionLimit;
    const faces = hasMoreDetails
        ? ['image', 'details', 'details_more', 'contact']
        : ['image', 'details', 'contact'];

    // Helpers to determine content for physical sides
    const getFrontContent = () => {
        const i = faceIndex;
        const typeIndex = (i % 2 === 0) ? i : i + 1;
        return faces[typeIndex % faces.length];
    };

    const getBackContent = () => {
        const i = faceIndex;
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
        } catch { }
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


    // Render Functions
    const renderStandardFace = () => (
        <div className={`w-full h-full flex bg-white dark:bg-[#1a1a1a] ${isVertical ? "flex-col" : (language === "ar" ? "flex-row-reverse" : "flex-row")}`}>
            {/* Image Section */}
            <div className={`relative shrink-0 overflow-hidden ${isVertical ? (imageHeight ? `w-full ${imageHeight}` : "w-full h-20") : "w-[35%] h-full"}`}>
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

                <div className="absolute top-1 right-1 z-[15] flex flex-col gap-1">
                    <button
                        onClick={handleFavoriteClick}
                        className="p-1 rounded-full bg-white/90 backdrop-blur-sm text-text-muted hover:text-red-500 transition-all shadow-sm hover:scale-110 active:scale-95 border border-black/5"
                    >
                        <Heart
                            size={12}
                            className={isFavorite ? "fill-red-500 text-red-500" : ""}
                        />
                    </button>

                </div>

                {images.length > 0 ? (
                    <Image
                        src={images[0]}
                        alt={title}
                        fill
                        priority={isFeatured}
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
                    <div className="flex items-center gap-2">
                        {location && (
                            <div className="flex items-center gap-1 text-[10px] text-text-muted">
                                <MapPin size={10} />
                                <span className="truncate max-w-[50px]">{location.split(",")[0]}</span>
                            </div>
                        )}
                        <div className="flex items-center gap-1 text-[10px] text-text-muted">
                            <Clock size={10} />
                            <span>{createdAt ? formatRelativeTime(createdAt, language) : ''}</span>
                        </div>
                    </div>

                    {category && (
                        <span
                            className="text-[10px] font-bold text-primary hover:underline cursor-pointer truncate max-w-[80px]"
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                router.push(`/ads?category=${category}`);
                            }}
                        >
                            {t(category as any)}
                        </span>
                    )}
                </div>
            </div>
        </div >
    );

    const renderDetailsFace = () => (
        <div
            className={`w-full h-full p-2 relative overflow-hidden flex flex-col ${isFeatured ? "bg-[#fffce8] dark:bg-[#2a2610]" : "bg-white dark:bg-[#1a1a1a]"}`}
            onClick={(e) => {
                e.stopPropagation();
            }}
        >
            {/* Close/Next Controls */}
            <div className="absolute top-1 left-1 z-20">
                <motion.button
                    className={`px-1 py-0.5 rounded text-[8px] font-black uppercase tracking-wider shadow-md cursor-grab active:cursor-grabbing select-none flex items-center gap-1 ${isFeatured ? "bg-[#ffd700] text-black backdrop-blur-sm" : "bg-gray-100 text-text-main"}`}
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
                        className={`absolute top-0 left-0 shadow-2xl ${isFeatured ? "bg-[#ffd700]/30" : "bg-gray-200"}`}
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
                <h3 className="text-[12px] font-black leading-tight mb-1 text-text-main">{currentTitle}</h3>
                {currentDescription && (
                    <p className="text-[10px] leading-tight mb-2 line-clamp-4 text-text-muted">
                        {currentDescription}
                    </p>
                )}

                <div className="mt-auto flex items-center justify-between gap-2">
                    <button
                        className="flex-1 py-1.5 bg-primary/10 text-primary hover:bg-primary text-[10px] font-black rounded-lg transition-all hover:text-white uppercase tracking-wider"
                        onClick={handleNextFace}
                    >
                        {t("contact")}
                    </button>
                    <button
                        className="px-3 py-1.5 bg-gray-100 dark:bg-white/10 text-text-muted hover:text-text-main text-[10px] font-black rounded-lg transition-all"
                        onClick={handleResetFace}
                    >
                        {t("back" as any)}
                    </button>
                </div>
            </div>
        </div>
    );

    const renderDetailsMoreFace = () => (
        <div
            className={`w-full h-full p-2 relative overflow-hidden flex flex-col ${isFeatured ? "bg-[#fffce8] dark:bg-[#2a2610]" : "bg-white dark:bg-[#1a1a1a]"}`}
            onClick={(e) => {
                e.stopPropagation();
            }}
        >
            {/* Close/Next Controls */}
            <div className="absolute top-1 left-1 z-20">
                <button
                    className={`px-1 py-0.5 rounded text-[8px] font-black uppercase tracking-wider shadow-md bg-gray-100 text-text-main`}
                    onClick={handleResetFace}
                >
                    إغلاق
                </button>
            </div>

            <div className="flex flex-col h-full relative z-10 pt-4">
                <h3 className="text-[10px] font-black leading-tight mb-1 text-primary italic uppercase tracking-widest">{t("details")} (تابع)</h3>
                {currentDescription && (
                    <p className="text-[10px] leading-tight mb-2 text-text-muted">
                        {currentDescription.substring(descriptionLimit)}
                    </p>
                )}

                <div className="mt-auto flex items-center justify-between gap-2">
                    <button
                        className="flex-1 py-1.5 bg-primary/10 text-primary hover:bg-primary text-[10px] font-black rounded-lg transition-all hover:text-white uppercase tracking-wider"
                        onClick={handleNextFace}
                    >
                        {(t as any)("contact")}
                    </button>
                    <button
                        className="px-3 py-1.5 bg-gray-100 dark:bg-white/10 text-text-muted hover:text-text-main text-[10px] font-black rounded-lg transition-all"
                        onClick={handleResetFace}
                    >
                        {(t as any)("back" as any)}
                    </button>
                </div>
            </div>
        </div>
    );

    const renderContactFace = () => (
        <div
            className={`w-full h-full p-2 relative overflow-hidden flex flex-col items-center justify-center ${isFeatured ? "bg-[#fffce8] dark:bg-[#2a2610]" : "bg-white dark:bg-[#1a1a1a]"}`}
            onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
            }}
        >
            <div className="absolute top-1 left-1 z-20">
                <button
                    className="px-1 py-0.5 rounded text-[8px] font-black uppercase tracking-wider shadow-md bg-gray-100 text-text-main"
                    onClick={handleResetFace}
                >
                    إغلاق
                </button>
            </div>

            <div className="flex flex-col w-full h-full relative z-10 pt-2 items-center text-center">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center mb-1">
                    <User className="text-primary" size={16} />
                </div>
                <h3 className="text-[10px] font-bold text-text-main mb-1 line-clamp-1">{authorName || (t as any)("seller")}</h3>

                {/* Seller Rating Display */}
                <div className="flex items-center gap-1 mb-2">
                    <div className="flex items-center">
                        {[1, 2, 3, 4, 5].map((s) => (
                            <Star
                                key={s}
                                size={8}
                                className={s <= Math.round(authorRating) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}
                            />
                        ))}
                    </div>
                    <span className="text-[8px] font-black text-text-muted">({authorRatingsCount})</span>
                </div>

                <div className="flex flex-col gap-1.5 w-full px-1">
                    <button
                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); router.push(`/messages?adId=${id}&receiverId=${authorId}`); }}
                        className="flex items-center justify-center gap-2 w-full py-1.5 bg-blue-500 text-white rounded-lg text-[9px] font-black uppercase tracking-widest hover:bg-blue-600 transition-colors shadow-sm"
                    >
                        <MessageCircle size={10} />
                        {(t as any)("messages")}
                    </button>

                    {phone && (
                        <>
                            <a
                                href={`tel:${phone}`}
                                onClick={(e) => e.stopPropagation()}
                                className="flex items-center justify-center gap-2 w-full py-1.5 bg-primary text-white rounded-lg text-[9px] font-black uppercase tracking-widest hover:bg-primary/90 transition-colors shadow-sm"
                            >
                                <Phone size={10} />
                                {(t as any)("call")}
                            </a>
                            <a
                                href={`https://wa.me/${phone.replace(/[^0-9]/g, '')}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={(e) => e.stopPropagation()}
                                className="flex items-center justify-center gap-2 w-full py-1.5 bg-[#25D366] text-white rounded-lg text-[9px] font-black uppercase tracking-widest hover:bg-[#26bd5c] transition-colors shadow-sm"
                            >
                                <Logo className="w-3 h-3 invert" />
                                {(t as any)("whatsapp")}
                            </a>
                        </>
                    )}

                    {email && (
                        <a
                            href={`mailto:${email}`}
                            onClick={(e) => e.stopPropagation()}
                            className="flex items-center justify-center gap-2 w-full py-1.5 bg-gray-600 text-white rounded-lg text-[9px] font-black uppercase tracking-widest hover:bg-gray-700 transition-colors shadow-sm"
                        >
                            <Mail size={10} />
                            {(t as any)("email" as any)}
                        </a>
                    )}
                </div>
            </div>

            <div className="mt-auto flex items-center justify-between w-full pt-1 border-t border-gray-100 dark:border-gray-800">
                <button
                    className="px-2 py-0.5 text-[8px] font-black rounded bg-gray-100 dark:bg-white/10 text-text-main hover:bg-gray-200"
                    onClick={handleNextFace}
                >
                    {t("home")}
                </button>
            </div>
        </div>
    );

    const renderContent = (type: string) => {
        switch (type) {
            case 'image': return renderStandardFace();
            case 'details': return renderDetailsFace();
            case 'details_more': return renderDetailsMoreFace();
            case 'contact': return renderContactFace();
            default: return renderStandardFace();
        }
    };

    return (
        <Link
            href={`/ads/${id}`}
            className={`bento-card bento-card-hover group flex shadow hover:shadow-xl hover:-translate-y-1 transition-all duration-300 ${isVertical ? "flex-col" : (language === "ar" ? "flex-row-reverse h-32" : "flex-row h-32")} ${isFeatured
                ? "border-amber-400 ring-2 ring-amber-400/20 shadow-[0_0_15px_rgba(251,191,36,0.3)]"
                : (isHighlighted ? "border-primary ring-2 ring-primary/50" : "border-gray-300 dark:border-gray-700")
                } rounded-2xl bg-white dark:bg-[#1a1a1a] overflow-hidden relative cursor-pointer block ${className}`}
            style={{
                height: isVertical && !imageHeight ? '180px' : 'auto'
            }}
            onMouseEnter={() => onMapHighlight && onMapHighlight(id)}
            onMouseLeave={() => onMapHighlight && onMapHighlight(null)}
        >
            {isFeatured && (
                <div className="absolute inset-0 pointer-events-none z-[1] overflow-hidden rounded-2xl">
                    {/* Animated Glitter Streak */}
                    <div className="absolute inset-[-100%] bg-gradient-to-r from-transparent via-amber-100/60 to-transparent skew-x-[35deg] animate-shimmer"
                        style={{ backgroundSize: '200% 100%', animationDuration: '2.5s' }}
                    />
                    {/* Golden Glow Border Outer */}
                    <div className="absolute inset-0 border-2 border-amber-400 shadow-[0_0_20px_rgba(251,191,36,0.5)]" />
                    {/* Corner Glint */}
                    <div className="absolute top-0 left-0 w-24 h-24 bg-gradient-to-br from-white/20 to-transparent blur-md" />
                </div>
            )}
            <div className={`relative w-full h-full ${isFeatured ? 'z-[2]' : ''}`} style={{ perspective: 1000 }}>
                <motion.div
                    className="w-full h-full relative"
                    style={{ transformStyle: 'preserve-3d' }}
                    animate={{ rotateY: faceIndex * 180 }}
                    transition={{ duration: 0.6, ease: [0.23, 1, 0.32, 1] }} // Cubic bezier for smoother flip
                >
                    {/* Invisible Spacer to maintain size */}
                    <div className="invisible pointer-events-none opacity-0 select-none relative" aria-hidden="true">
                        {isFeatured ? renderDetailsFace() : renderStandardFace()}
                    </div>

                    {/* Front Physical Side */}
                    <div
                        className="absolute inset-0 w-full h-full"
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
