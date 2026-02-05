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
import ChatWindow from "@/components/ChatWindow";
import { conversationsService } from "@/lib/conversations";
import { useAuthStore } from "@/store/useAuthStore";
import ClientPortal from "@/components/ClientPortal";

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
    const [showChat, setShowChat] = useState(false);
    const [conversationId, setConversationId] = useState<string | null>(null);
    const { user } = useAuthStore();
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

    const handleFavoriteClick = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        const next = !isFavorite;
        setIsFavorite(next);
        
        try {
            // Update local storage
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
                
                // Save to Supabase if user is logged in
                if (user?.id) {
                    try {
                        const { error } = await supabase
                            .from('favorites')
                            .upsert({
                                user_id: user.id,
                                ad_id: id,
                                title: currentTitle,
                                price: price,
                                currency: currencyCode,
                                location: location || '',
                                image_url: images[0] || '',
                                created_at: new Date().toISOString()
                            });
                        
                        if (error) {
                            console.error('Error saving favorite to Supabase:', error);
                        }
                    } catch (dbError) {
                        console.error('Failed to save favorite to database:', dbError);
                    }
                }
            } else {
                const updated = list.filter(a => a.id !== id);
                window.localStorage.setItem(key, JSON.stringify(updated));
                
                // Remove from Supabase if user is logged in
                if (user?.id) {
                    try {
                        const { error } = await supabase
                            .from('favorites')
                            .delete()
                            .eq('user_id', user.id)
                            .eq('ad_id', id);
                        
                        if (error) {
                            console.error('Error removing favorite from Supabase:', error);
                        }
                    } catch (dbError) {
                        console.error('Failed to remove favorite from database:', dbError);
                    }
                }
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

    const handleStartChat = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        if (!user) {
            router.push('/login');
            return;
        }

        if (user.id === authorId) {
            alert(contextLanguage === 'ar' ? 'هذا إعلانك الخاص!' : 'This is your own ad!');
            return;
        }

        try {
            const conversation = await conversationsService.createOrGetConversation(id, authorId || '');
            setConversationId(conversation.id);
            setShowChat(true);
        } catch (error) {
            console.error("Failed to start conversation:", error);
        }
    };


    // Render Functions
    const renderStandardFace = () => (
        <div className={`w-full h-full flex overflow-hidden ${isFeatured ? "bg-[#fffce8] dark:bg-[#18181b]" : "bg-white dark:bg-[#050505]"} ${isVertical ? "flex-col" : (language === "ar" ? "flex-row-reverse" : "flex-row")}`}>
            {/* Image Section */}
            <div className={`relative shrink-0 overflow-hidden ${isVertical ? (imageHeight ? `w-full ${imageHeight}` : "w-full h-32") : "w-[35%] h-full"}`}>
                {/* Shine Effect */}
                <div className="absolute inset-0 -translate-x-[150%] group-hover:animate-shimmer bg-gradient-to-r from-transparent via-white/10 to-transparent skew-x-12 z-10 pointer-events-none duration-1000" />

                {/* Flip/Peel Interaction */}
                <div className="absolute top-1 left-1 z-20">
                    <motion.button
                        className={`px-1.5 py-0.5 rounded-full text-[8px] font-bold uppercase tracking-wider backdrop-blur-md shadow-sm cursor-grab active:cursor-grabbing select-none flex items-center gap-1 ${isFeatured ? "bg-amber-500 text-black" : "bg-black/40 text-white hover:bg-black/60"}`}
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
                        className="p-1.5 rounded-full bg-black/40 backdrop-blur-md text-white hover:text-red-500 transition-all hover:scale-110 active:scale-95"
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
                        className="object-cover transition-transform duration-700 group-hover:scale-105"
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-50 dark:bg-neutral-900 select-none group-hover:bg-gray-100 dark:group-hover:bg-neutral-800 transition-colors">
                        <Logo className="w-8 h-8 text-primary opacity-50 group-hover:scale-110 transition-transform duration-500" />
                    </div>
                )}
            </div>

            {/* Content Section */}
            <div className={`flex-1 flex flex-col p-2 ${isVertical ? "gap-0.5" : "justify-center"}`}>
                <div className="flex items-start justify-between gap-2">
                    <h3 className="text-[10px] sm:text-xs font-bold text-gray-900 dark:text-gray-100 line-clamp-2 leading-snug group-hover:text-primary transition-colors duration-300">
                        {currentTitle}
                    </h3>
                </div>

                <div className="flex items-center gap-2 mt-auto">
                    <p className="text-xs sm:text-sm font-black text-primary">
                        {new Intl.NumberFormat(language === 'ar' ? 'ar-SA' : 'en-US').format(price)}
                        <span className="text-[8px] sm:text-[9px] font-normal text-gray-500 dark:text-gray-400 mx-1">{currencyCode}</span>
                    </p>
                </div>

                <div className="flex items-center justify-between pt-1 mt-1">
                    <div className="flex items-center gap-2">
                        {location && (
                            <div className="flex items-center gap-1 text-[8px] sm:text-[9px] text-gray-500 dark:text-gray-400">
                                <MapPin size={9} />
                                <span className="truncate max-w-[65px]">{location.split(",")[0]}</span>
                            </div>
                        )}
                        <div className="flex items-center gap-1 text-[8px] sm:text-[9px] text-gray-500 dark:text-gray-400">
                            <Clock size={9} />
                            <span>{createdAt ? formatRelativeTime(createdAt, language) : ''}</span>
                        </div>
                    </div>

                    {category && (
                        <span
                            className="text-[8px] sm:text-[9px] font-medium text-primary/80 hover:text-primary cursor-pointer truncate max-w-[60px]"
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
            className={`w-full h-full p-2 relative overflow-hidden flex flex-col ${isFeatured ? "bg-[#fffce8] dark:bg-[#18181b]" : "bg-white dark:bg-[#050505]"}`}
            onClick={(e) => {
                e.stopPropagation();
            }}
        >
            {/* Close/Next Controls */}
            <div className="absolute top-1 left-1 z-20">
                <motion.button
                    className={`px-1.5 py-0.5 rounded-full text-[8px] font-bold uppercase tracking-wider shadow-sm cursor-grab active:cursor-grabbing select-none flex items-center gap-1 ${isFeatured ? "bg-amber-400 text-black" : "bg-gray-100 dark:bg-neutral-800 text-gray-900 dark:text-gray-100"}`}
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
                        className={`absolute top-0 left-0 shadow-2xl ${isFeatured ? "bg-[#ffd700]/30" : "bg-gray-200 dark:bg-neutral-800"}`}
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
                <h3 className="text-[11px] font-black leading-tight mb-1 text-gray-900 dark:text-gray-100">{currentTitle}</h3>
                {currentDescription && (
                    <p className="text-[9px] leading-tight mb-2 line-clamp-4 text-gray-500 dark:text-gray-400">
                        {currentDescription}
                    </p>
                )}

                <div className="mt-auto flex items-center justify-between gap-2">
                    <button
                        className="flex-1 py-1.5 bg-primary/10 text-primary hover:bg-primary text-[9px] font-black rounded-lg transition-all hover:text-white uppercase tracking-wider"
                        onClick={handleNextFace}
                    >
                        {t("contact")}
                    </button>
                    <button
                        className="px-3 py-1.5 bg-gray-100 dark:bg-neutral-800 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 text-[9px] font-black rounded-lg transition-all"
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
            className={`w-full h-full p-2 relative overflow-hidden flex flex-col ${isFeatured ? "bg-[#fffce8] dark:bg-[#18181b]" : "bg-white dark:bg-[#050505]"}`}
            onClick={(e) => {
                e.stopPropagation();
            }}
        >
            {/* Close/Next Controls */}
            <div className="absolute top-1 left-1 z-20">
                <button
                    className={`px-1.5 py-0.5 rounded-full text-[8px] font-bold uppercase tracking-wider shadow-sm bg-gray-100 dark:bg-neutral-800 text-gray-900 dark:text-gray-100`}
                    onClick={handleResetFace}
                >
                    إغلاق
                </button>
            </div>

            <div className="flex flex-col h-full relative z-10 pt-4">
                <h3 className="text-[9px] font-black leading-tight mb-1 text-primary italic uppercase tracking-widest">{t("details")} (تابع)</h3>
                {currentDescription && (
                    <p className="text-[9px] leading-tight mb-2 text-gray-500 dark:text-gray-400">
                        {currentDescription.substring(descriptionLimit)}
                    </p>
                )}

                <div className="mt-auto flex items-center justify-between gap-2">
                    <button
                        className="flex-1 py-1.5 bg-primary/10 text-primary hover:bg-primary text-[9px] font-black rounded-lg transition-all hover:text-white uppercase tracking-wider"
                        onClick={handleNextFace}
                    >
                        {(t as any)("contact")}
                    </button>
                    <button
                        className="px-3 py-1.5 bg-gray-100 dark:bg-neutral-800 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 text-[9px] font-black rounded-lg transition-all"
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
            className={`w-full h-full p-2 relative overflow-hidden flex flex-col items-center justify-center ${isFeatured ? "bg-[#fffce8] dark:bg-[#18181b]" : "bg-white dark:bg-[#050505]"}`}
            onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
            }}
        >
            <div className="absolute top-1 left-1 z-20">
                <button
                    className="px-1.5 py-0.5 rounded-full text-[8px] font-bold uppercase tracking-wider shadow-sm bg-gray-100 dark:bg-neutral-800 text-gray-900 dark:text-gray-100"
                    onClick={handleResetFace}
                >
                    إغلاق
                </button>
            </div>

            <div className="flex flex-col w-full h-full relative z-10 pt-2 items-center text-center">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center mb-1">
                    <User className="text-primary" size={16} />
                </div>
                <h3 className="text-[10px] font-bold text-gray-900 dark:text-gray-100 mb-1 line-clamp-1">{authorName || (t as any)("seller")}</h3>

                {/* Seller Rating Display */}
                <div className="flex items-center gap-1 mb-2">
                    <div className="flex items-center">
                        {[1, 2, 3, 4, 5].map((s) => (
                            <Star
                                key={s}
                                size={8}
                                className={s <= Math.round(authorRating) ? "fill-yellow-400 text-yellow-400" : "text-gray-300 dark:text-gray-600"}
                            />
                        ))}
                    </div>
                    <span className="text-[8px] font-black text-gray-500 dark:text-gray-400">({authorRatingsCount})</span>
                </div>

                <div className="flex flex-col gap-1.5 w-full px-1">
                    <button
                        onClick={handleStartChat}
                        className="flex items-center justify-center gap-2 w-full py-1 bg-white dark:bg-neutral-800 border border-blue-500/30 rounded-lg text-[9px] font-black uppercase tracking-widest hover:bg-blue-50 dark:hover:bg-blue-900/20 text-blue-500 transition-colors"
                    >
                        <MessageCircle size={8} className="text-blue-500" />
                        {(t as any)("messages")}
                    </button>

                    {phone && (
                        <>
                            <a
                                href={`tel:${phone}`}
                                onClick={(e) => e.stopPropagation()}
                                className="flex items-center justify-center gap-2 w-full py-1 bg-white dark:bg-neutral-800 border border-primary/30 rounded-lg text-[9px] font-black uppercase tracking-widest hover:bg-primary/10 transition-colors text-primary"
                            >
                                <Phone size={8} className="text-primary" />
                                {(t as any)("call")}
                            </a>
                            <a
                                href={`https://wa.me/${phone.replace(/[^0-9]/g, '')}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={(e) => e.stopPropagation()}
                                className="flex items-center justify-center gap-2 w-full py-1 bg-white dark:bg-neutral-800 border border-[#25D366]/30 rounded-lg text-[9px] font-black uppercase tracking-widest hover:bg-[#25D366]/10 transition-colors text-[#25D366]"
                            >
                                <Logo className="w-2.5 h-2.5" />
                                {(t as any)("whatsapp")}
                            </a>
                        </>
                    )}

                    {email && (
                        <a
                            href={`mailto:${email}`}
                            onClick={(e) => e.stopPropagation()}
                            className="flex items-center justify-center gap-2 w-full py-1 bg-white dark:bg-neutral-800 border border-gray-600/30 rounded-lg text-[9px] font-black uppercase tracking-widest hover:bg-gray-100 dark:hover:bg-neutral-700 transition-colors text-gray-600 dark:text-gray-400"
                        >
                            <Mail size={8} className="text-gray-600 dark:text-gray-400" />
                            {(t as any)("email" as any)}
                        </a>
                    )}
                </div>
            </div>

            <div className="mt-auto flex items-center justify-between w-full pt-1 border-t border-gray-100 dark:border-gray-800">
                <button
                    className="px-2 py-0.5 text-[8px] font-black rounded bg-gray-100 dark:bg-neutral-800 text-gray-900 dark:text-gray-100 hover:bg-gray-200 dark:hover:bg-neutral-700"
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
            className={`group flex transition-all duration-500 ease-in-out ${isVertical ? "flex-col" : (language === "ar" ? "flex-row-reverse h-32" : "flex-row h-32")} rounded-2xl relative cursor-pointer block ${className} ${
                isFeatured 
                    ? "bg-gradient-to-l from-[#f7ba2b] to-[#ea5358] p-[5px] overflow-visible z-10"
                    : `bento-card bento-card-hover border border-transparent dark:border-white/5 shadow-sm hover:shadow-xl bg-white dark:bg-black overflow-hidden ${isHighlighted ? "ring-2 ring-primary/50" : "hover:ring-1 hover:ring-primary/50"}`
            }`}
            style={{
                perspective: '1000px',
                height: isVertical && !imageHeight ? '180px' : 'auto'
            }}
            onMouseEnter={() => onMapHighlight && onMapHighlight(id)}
            onMouseLeave={() => onMapHighlight && onMapHighlight(null)}
        >
            {isFeatured && (
                <div className="absolute top-[30px] left-0 right-0 h-full w-full scale-[0.8] blur-[25px] bg-gradient-to-l from-[#f7ba2b] to-[#ea5358] -z-10 transition-opacity duration-500 opacity-100 group-hover:opacity-0" />
            )}
            
            <div className={`relative w-full h-full ${isFeatured ? 'z-[2] rounded-xl overflow-hidden' : ''}`} style={{ perspective: 1000 }}>
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
            {showChat && conversationId && (
                <ClientPortal>
                    <div
                        className="fixed bottom-0 right-4 w-80 sm:w-96 z-[9999] animate-in slide-in-from-bottom-5 shadow-2xl rounded-t-xl overflow-hidden"
                        onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                        }}
                    >
                        <ChatWindow conversationId={conversationId} onClose={() => setShowChat(false)} />
                    </div>
                </ClientPortal>
            )}
        </Link>
    );
}
