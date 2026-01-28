"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from 'next/image';
import { adsService } from "@/lib/ads";
import { Zap, MapPin, Clock, ChevronRight, ChevronLeft } from "lucide-react";
import { useLanguage } from '@/lib/language-context';
import { formatRelativeTime } from "@/lib/utils";

export default function PromotedBanner() {
    const [ads, setAds] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentIndex, setCurrentIndex] = useState(0);
    const { t, language } = useLanguage();

    useEffect(() => {
        let mounted = true;
        const fetchPromoted = async () => {
            try {
                const result = await adsService.getAds({ isBoosted: true, limit: 10 });
                if (mounted) setAds(result.data || []);
            } catch (e) {
                console.error(e);
            } finally {
                if (mounted) setLoading(false);
            }
        };
        fetchPromoted();
        return () => { mounted = false; };
    }, []);

    useEffect(() => {
        if (ads.length <= 1) return;
        const interval = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % ads.length);
        }, 5000);
        return () => clearInterval(interval);
    }, [ads.length]);

    const handleNext = (e: React.MouseEvent) => {
        e.preventDefault();
        setCurrentIndex((prev) => (prev + 1) % ads.length);
    };

    const handlePrev = (e: React.MouseEvent) => {
        e.preventDefault();
        setCurrentIndex((prev) => (prev - 1 + ads.length) % ads.length);
    };

    if (loading) {
        return (
            <div className="w-full relative overflow-hidden py-8 border-b border-border-color min-h-[160px]">
                {/* Orange/Glow Background Strip */}
                <div className="absolute inset-0 bg-[#111]">
                    <div className="absolute top-[-50%] right-[-10%] w-[50%] h-[200%] bg-primary/20 rounded-full blur-[100px] animate-pulse" />
                    <div className="absolute bottom-[-50%] left-[-10%] w-[50%] h-[200%] bg-yellow-400/20 rounded-full blur-[100px] animate-pulse" />
                </div>
                
                <div className="relative max-w-4xl mx-auto px-4 z-10">
                    <div className="w-full h-[100px] bg-white/90 dark:bg-[#1a1a1a]/90 backdrop-blur-sm rounded-xl border border-white/10 shadow-lg animate-pulse" />
                </div>
            </div>
        );
    }

    if (!ads.length) return null;

    const ad = ads[currentIndex];
    let imageUrl = null;
    try {
        const images = typeof ad.images === 'string' ? JSON.parse(ad.images) : (ad.images || []);
        imageUrl = Array.isArray(images) ? images[0] : null;
    } catch (e) { }

    const currencyCode = (ad.currency && typeof ad.currency === 'object') ? ad.currency.code : (ad.currency || 'SAR');

    return (
        <div className="w-full relative overflow-hidden py-6 border-b border-border-color group/banner">
            
            {/* 1. THE STRIP (Outer Container with Orange/Glow Theme) */}
            <div className="absolute inset-0 bg-[#0a0a0a]">
                {/* The "Orange Currency Card" Style applied to the whole strip background */}
                <div className="absolute top-[-50%] right-[-10%] w-[40%] h-[200%] bg-primary/15 rounded-full blur-[80px]" />
                <div className="absolute bottom-[-50%] left-[-10%] w-[40%] h-[200%] bg-yellow-400/15 rounded-full blur-[80px]" />
                <div className="absolute inset-0 bg-[url('/noise.png')] opacity-5 mix-blend-overlay" /> {/* Optional texture */}
            </div>

            {/* 2. THE INNER CONTENT (The Ad Card) - Now smaller (max-w-4xl) */}
            <div className="relative max-w-4xl mx-auto px-4 z-10">
                <div className="relative w-full bg-white dark:bg-[#151515] rounded-xl shadow-2xl border border-white/5 overflow-hidden transition-all duration-500 hover:shadow-primary/10">
                    
                    {/* Inner Card Content */}
                    <Link href={`/ads/${ad.id}`} className="flex flex-col sm:flex-row items-center gap-4 p-4 h-auto sm:h-[100px] text-text-main hover:opacity-95 transition-opacity">
                        
                        {/* Image Thumbnail (New addition for the 'Card' feel) */}
                        {imageUrl && (
                            <div className="relative w-full sm:w-[120px] h-[120px] sm:h-full shrink-0 rounded-lg overflow-hidden hidden sm:block">
                                <Image
                                    src={imageUrl}
                                    alt={ad.title}
                                    fill
                                    className="object-cover"
                                />
                            </div>
                        )}

                        {/* Price Section */}
                        <div className="flex flex-col items-start gap-1 shrink-0 min-w-[120px]">
                            <div className="flex items-center gap-1.5 bg-primary/10 text-primary px-2 py-0.5 rounded-full border border-primary/20 self-start">
                                <Zap size={10} className="fill-primary" />
                                <span className="text-[10px] font-black uppercase tracking-wider">{(t as any)["featured"]}</span>
                            </div>
                            <div className="flex items-baseline gap-1">
                                <span className="text-2xl sm:text-3xl font-black tracking-tight text-primary">
                                    {ad.price ? new Intl.NumberFormat(language === 'ar' ? 'ar-SA' : 'en-US').format(ad.price) : ''}
                                </span>
                                <span className="text-xs font-bold text-text-muted uppercase">{currencyCode}</span>
                            </div>
                        </div>

                        {/* Middle Info */}
                        <div className="flex-1 w-full flex flex-col items-start sm:items-center sm:text-center gap-1">
                            <h3 className="text-lg font-bold line-clamp-1 w-full">{ad.title}</h3>
                            <div className="flex flex-wrap items-center gap-3 text-xs text-text-muted">
                                {ad.location && (
                                    <span className="flex items-center gap-1">
                                        <MapPin size={12} />
                                        {ad.location.split(',')[0].trim()}
                                    </span>
                                )}
                                {ad.created_at && (
                                    <span className="flex items-center gap-1">
                                        <Clock size={12} />
                                        {formatRelativeTime(ad.created_at, language)}
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Action Button */}
                        <div className="shrink-0 hidden sm:flex">
                             <span className="flex items-center gap-2 bg-gray-100 dark:bg-white/5 hover:bg-primary hover:text-white text-text-main px-5 py-2 rounded-lg font-bold text-sm transition-all">
                                {(t as any)["viewDetails"]}
                                {language === 'ar' ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
                            </span>
                        </div>
                    </Link>

                    {/* Navigation Buttons (Outside link, inside card) */}
                    {ads.length > 1 && (
                        <>
                            <button 
                                onClick={handlePrev}
                                className="absolute left-2 top-1/2 -translate-y-1/2 p-1.5 bg-white/80 dark:bg-black/50 rounded-full shadow-md opacity-0 group-hover/banner:opacity-100 transition-opacity z-20 hover:scale-110 active:scale-95 hidden sm:flex"
                            >
                                <ChevronRight size={18} />
                            </button>
                            <button 
                                onClick={handleNext}
                                className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-white/80 dark:bg-black/50 rounded-full shadow-md opacity-0 group-hover/banner:opacity-100 transition-opacity z-20 hover:scale-110 active:scale-95 hidden sm:flex"
                            >
                                <ChevronLeft size={18} />
                            </button>
                        </>
                    )}
                </div>
                 
                 {/* Pagination Dots (Below card) */}
                {ads.length > 1 && (
                    <div className="flex justify-center gap-1.5 mt-3">
                        {ads.map((_, idx) => (
                            <div 
                                key={idx} 
                                className={`w-1.5 h-1.5 rounded-full transition-all ${idx === currentIndex ? 'bg-white w-4' : 'bg-white/20'}`} 
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
