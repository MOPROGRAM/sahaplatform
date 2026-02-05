"use client";

import { useEffect, useState } from "react";
import { adsService } from "@/lib/ads";
import { useLanguage } from '@/lib/language-context';
import AdCard from "./AdCard";

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
            <div className="w-full my-1 px-4">
                <div className="w-full h-[254px] bg-[#1a1a1a] rounded-[1rem] animate-pulse relative overflow-hidden border border-white/5 shadow-inner">
                     <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent skew-x-12 translate-x-[-100%] animate-shimmer" />
                </div>
            </div>
        );
    }

    if (!ads.length) return null;

    return (
        <div className="w-full my-1 px-0 sm:px-2">
            <div className="relative w-full">
                <div className="flex items-center gap-2 mb-2 px-2">
                    <div className="w-1 h-4 bg-amber-500 rounded-full shadow-[0_0_10px_rgba(245,158,11,0.5)]"></div>
                    <h3 className="text-amber-500 text-xs font-black uppercase tracking-widest shadow-amber-500/20 drop-shadow-sm">
                        {language === 'ar' ? 'إعلانات مميزة' : 'PROMOTED'}
                    </h3>
                </div>

                {/* Horizontal Scroll for Ads */}
                <div className="flex items-start gap-2 overflow-x-auto snap-x touch-pan-x pb-2 scrollbar-hide px-2">
                    {ads.slice(0, 10).map((ad) => (
                         <div key={ad.id} className="min-w-[260px] sm:min-w-[280px] snap-center transform transition-transform duration-300 hover:scale-[1.01]">
                            <div className="dark h-full">
                                <AdCard 
                                    {...ad} 
                                    className="!bg-[#050505] !border-white/10 hover:!border-amber-500/30 transition-all duration-300 !shadow-lg h-full" 
                                />
                            </div>
                         </div>
                    ))}
                </div>
            </div>
        </div>
    );
}