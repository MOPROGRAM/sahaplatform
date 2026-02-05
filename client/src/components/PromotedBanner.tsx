"use client";

import { useEffect, useState } from "react";
import { adsService } from "@/lib/ads";
import { useLanguage } from '@/lib/language-context';
import AdCard from "./AdCard";
import HoneycombBackground from "./HoneycombBackground";

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

    if (loading) {
        return (
            <div className="w-full my-0 px-4">
                <div className="w-full h-[254px] bg-[#1a1a1a] rounded-[1rem] animate-pulse relative overflow-hidden">
                     <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent skew-x-12 translate-x-[-100%] animate-shimmer" />
                </div>
            </div>
        );
    }

    if (!ads.length) return null;

    return (
        <div className="w-full my-0 px-0 sm:px-2 relative group">
            {/* Animated Honeycomb Background */}
            <HoneycombBackground />

            <div className="relative w-full z-10">
                <div className="flex items-center gap-2 mb-2 px-2">
                    <div className="w-1 h-4 bg-amber-500 rounded-full shadow-[0_0_10px_rgba(245,158,11,0.5)]"></div>
                    <h3 className="text-amber-500 text-xs font-black uppercase tracking-widest shadow-amber-500/20 drop-shadow-sm">
                        {language === 'ar' ? 'إعلانات مميزة' : 'PROMOTED'}
                    </h3>
                </div>

                {/* Horizontal Scroll for Ads */}
                <div className="flex items-start gap-2 overflow-x-auto snap-x touch-pan-x pb-10 scrollbar-hide px-2">
                    {ads.slice(0, 10).map((ad) => (
                        <div key={ad.id} className="min-w-[180px] sm:min-w-[280px] snap-center transform transition-transform duration-300 hover:scale-[1.01] p-2">
                            <div className="dark h-full">
                                <AdCard 
                                    {...ad} 
                                    isFeatured={true}
                                    className="h-full shadow-lg" 
                                    imageHeight="h-[100px] sm:h-32"
                                />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}