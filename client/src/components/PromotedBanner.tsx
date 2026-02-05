"use client";

import { useEffect, useState } from "react";
import { adsService } from "@/lib/ads";
import { useLanguage } from '@/lib/language-context';
import AdCard from "./AdCard";
import InteractiveBackground from "./InteractiveBackground";

export default function PromotedBanner() {
    const [ads, setAds] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const { t, language } = useLanguage();

    useEffect(() => {
        let mounted = true;
        const fetchPromoted = async () => {
            try {
                const result = await adsService.getAds({ isBoosted: true, limit: 40 });
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

    if (!loading && !ads.length) return null;

    return (
        <div className="w-full my-1 px-0 sm:px-2 relative group overflow-hidden">
            <InteractiveBackground />
            <div className="relative w-full z-10">
                <div className="flex items-center gap-2 mb-1 px-2 pt-1">
                    <div className="w-1 h-4 bg-amber-500 rounded-full shadow-[0_0_10px_rgba(245,158,11,0.5)]"></div>
                    <h3 className="text-amber-500 text-xs font-black uppercase tracking-widest shadow-amber-500/20 drop-shadow-sm">
                        {language === 'ar' ? 'إعلانات مميزة' : 'PROMOTED'}
                    </h3>
                </div>

                {/* Horizontal Scroll for Ads */}
                <div className="flex items-start gap-2 overflow-x-auto snap-x touch-pan-x py-4 scrollbar-hide px-2">
                    {loading ? (
                        // Skeleton Loading State
                        Array.from({ length: 4 }).map((_, i) => (
                            <div key={i} className="min-w-[260px] sm:min-w-[280px] h-[9.5rem] bg-white/5 dark:bg-black/20 rounded-2xl animate-pulse border border-white/10" />
                        ))
                    ) : (
                        ads.slice(0, 10).map((ad) => (
                            <div key={ad.id} className="min-w-[260px] sm:min-w-[280px] snap-center transform transition-transform duration-300 hover:scale-[1.01] py-1 px-1">
                                <div className="h-full">
                                    <AdCard 
                                        {...ad} 
                                        isFeatured={true}
                                        className="h-full" 
                                    />
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}