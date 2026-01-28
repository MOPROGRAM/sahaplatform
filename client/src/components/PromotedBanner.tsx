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
            <div className="w-full h-[120px] bg-white dark:bg-[#0f0f0f] border-b border-border-color animate-pulse relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent skew-x-12 translate-x-[-100%] animate-shimmer" />
                <div className="max-w-[1920px] mx-auto px-4 h-full flex items-center justify-between">
                    <div className="h-10 w-32 bg-gray-200 dark:bg-gray-800 rounded" />
                    <div className="h-8 w-64 bg-gray-200 dark:bg-gray-800 rounded" />
                    <div className="h-10 w-24 bg-gray-200 dark:bg-gray-800 rounded" />
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
        <div className="w-full relative overflow-hidden h-[120px] bg-white dark:bg-[#0f0f0f] border-b border-border-color shadow-sm group">
            {/* Background Design Elements (The "Card" Look) */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                {/* Yellow/Orange Circles - mimicking the card design */}
                <div className="absolute top-[-50%] right-[-10%] w-[300px] h-[300px] bg-primary/10 rounded-full blur-3xl" />
                <div className="absolute bottom-[-50%] left-[-10%] w-[200px] h-[200px] bg-yellow-400/10 rounded-full blur-3xl" />
                
                {/* Background Image (Low Opacity) */}
                {imageUrl && (
                    <div className="absolute inset-0 opacity-[0.07] dark:opacity-[0.15]">
                        <Image
                            src={imageUrl}
                            alt="Background"
                            fill
                            className="object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-r from-white via-transparent to-white dark:from-[#0f0f0f] dark:via-transparent dark:to-[#0f0f0f]" />
                    </div>
                )}
            </div>

            {/* Content Container */}
            <Link href={`/ads/${ad.id}`} className="relative max-w-[1920px] mx-auto px-4 sm:px-8 h-full flex items-center justify-between gap-4 z-10 text-text-main hover:opacity-90 transition-opacity">
                
                {/* Left Side: Price & Featured Badge */}
                <div className="flex flex-col items-start gap-1 shrink-0">
                    <div className="flex items-center gap-1.5 bg-primary/10 text-primary px-2 py-0.5 rounded-full border border-primary/20">
                        <Zap size={12} className="fill-primary" />
                        <span className="text-[10px] font-black uppercase tracking-wider">{(t as any)["featured"]}</span>
                    </div>
                    <div className="flex items-baseline gap-1">
                        <span className="text-3xl sm:text-4xl font-black tracking-tight text-primary">
                            {ad.price ? new Intl.NumberFormat(language === 'ar' ? 'ar-SA' : 'en-US').format(ad.price) : ''}
                        </span>
                        <span className="text-xs sm:text-sm font-bold text-text-muted uppercase">{currencyCode}</span>
                    </div>
                </div>

                {/* Center: Title & Info (Hidden on very small screens, shown on sm+) */}
                <div className="flex-1 hidden sm:flex flex-col items-center text-center px-4">
                    <h3 className="text-lg sm:text-xl font-bold line-clamp-1 mb-1">{ad.title}</h3>
                    <div className="flex items-center gap-4 text-xs text-text-muted">
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

                {/* Mobile Title (Only shown on small screens) */}
                <div className="flex-1 sm:hidden">
                    <h3 className="text-sm font-bold line-clamp-2">{ad.title}</h3>
                </div>

                {/* Right Side: Action Button */}
                <div className="shrink-0 flex items-center gap-4">
                     <button className="hidden md:flex items-center gap-2 bg-primary text-white px-6 py-2 rounded-full font-bold text-sm shadow-lg shadow-primary/20 hover:bg-primary-hover transition-all hover:scale-105 active:scale-95">
                        {(t as any)["viewDetails"]}
                        {language === 'ar' ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
                    </button>
                    {/* Mobile Arrow */}
                    <div className="md:hidden w-8 h-8 flex items-center justify-center bg-primary/10 rounded-full text-primary">
                        {language === 'ar' ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
                    </div>
                </div>
            </Link>

            {/* Navigation Buttons (Only visible on hover if multiple ads) */}
            {ads.length > 1 && (
                <>
                    <button 
                        onClick={handlePrev}
                        className="absolute left-2 top-1/2 -translate-y-1/2 p-2 bg-white/80 dark:bg-black/50 rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity z-20 hover:scale-110 active:scale-95 hidden sm:flex"
                    >
                        <ChevronRight size={20} />
                    </button>
                    <button 
                        onClick={handleNext}
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-white/80 dark:bg-black/50 rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity z-20 hover:scale-110 active:scale-95 hidden sm:flex"
                    >
                        <ChevronLeft size={20} />
                    </button>
                    
                    {/* Dots Indicator */}
                    <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5 z-20">
                        {ads.map((_, idx) => (
                            <div 
                                key={idx} 
                                className={`w-1.5 h-1.5 rounded-full transition-all ${idx === currentIndex ? 'bg-primary w-4' : 'bg-gray-300 dark:bg-gray-600'}`} 
                            />
                        ))}
                    </div>
                </>
            )}
        </div>
    );
}
