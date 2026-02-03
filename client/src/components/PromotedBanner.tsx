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
            <div className="w-full my-6 px-4">
                <div className="w-full h-[184px] bg-gray-100 dark:bg-[#1a1a1a] rounded-[2rem] animate-pulse relative overflow-hidden">
                     <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent skew-x-12 translate-x-[-100%] animate-shimmer" />
                </div>
            </div>
        );
    }

    if (!ads.length) return null;

    const strips = [ads.slice(0, 20)].filter(s => s.length > 0);

    return (
        <div className="w-full my-3 px-4">
            {strips.map((stripAds, index) => (
                <div key={index} className="relative w-full max-w-[1920px] mx-auto bg-gradient-to-br from-orange-500 via-orange-400 to-white rounded-[2rem] shadow-2xl overflow-hidden border-2 border-orange-300 transition-all duration-500 group transform-gpu hover:shadow-[0_35px_60px_-15px_rgba(255,140,0,0.3)] hover:scale-[1.01] hover:rotate-[0.5deg]">
                    
                    {/* Orange & White Wave Effect - Always Visible */}
                    <div className="absolute inset-0 z-0">
                         <div className="w-full h-full" style={{
                             backgroundImage: 'linear-gradient(90deg, rgba(255,165,0,0.2) 0%, rgba(255,255,255,0.4) 50%, rgba(255,165,0,0.2) 100%)',
                             backgroundSize: '200% 100%',
                             animation: 'wave 6s ease-in-out infinite'
                         }} />
                    </div>

                    {/* Orange Sparkle Particles */}
                    <div className="absolute inset-0 z-0 opacity-60">
                         <div className="w-full h-full" style={{
                             backgroundImage: 'radial-gradient(circle at 20% 35%, rgba(255,255,255,0.8) 1px, transparent 1px), radial-gradient(circle at 80% 65%, rgba(255,255,255,0.6) 1px, transparent 1px), radial-gradient(circle at 40% 20%, rgba(255,255,255,0.7) 1px, transparent 1px)',
                             backgroundSize: '50px 50px, 70px 70px, 30px 30px'
                         }} />
                    </div>
                    
                    {/* Content Container - Horizontal Scroll */}
                    <div className="relative flex items-center gap-2 p-2 overflow-x-auto no-scrollbar snap-x touch-pan-x z-10">
                        {stripAds.map((ad) => {
                            let images: string[] = [];
                            try {
                                if (Array.isArray(ad.images)) {
                                    images = ad.images;
                                } else if (typeof ad.images === 'string') {
                                    images = JSON.parse(ad.images);
                                }
                            } catch (e) {
                                images = [];
                            }

                            return (
                                <div key={ad.id} className="snap-start shrink-0 w-[calc(50%-8px)] sm:w-[calc(33.333%-8px)] md:w-[calc(25%-8px)] lg:w-[calc(20%-8px)] xl:w-[calc(16.666%-8px)] 2xl:w-[calc(14.285%-8px)]">
                                    <AdCard 
                                        {...ad}
                                        images={images}
                                        layout="vertical"
                                        className="h-full relative isolate transform-gpu
                                            bg-gradient-to-br from-white via-orange-50 to-orange-100 dark:from-[#2a2108] dark:via-[#3a2a0e] dark:to-[#4a3512]
                                            shadow-[0_8px_32px_rgba(255,140,0,0.2),0_16px_48px_rgba(255,165,0,0.15),inset_0_1px_0_rgba(255,255,255,0.8)] 
                                            hover:shadow-[0_20px_60px_rgba(255,140,0,0.3),0_32px_80px_rgba(255,165,0,0.25),inset_0_2px_0_rgba(255,255,255,0.9)]
                                            border-2 border-orange-200 dark:border-orange-300/40
                                            ring-2 ring-inset ring-orange-100/50 dark:ring-orange-200/20
                                            hover:scale-[1.03] hover:-translate-y-2 hover:rotate-[1deg] 
                                            transition-all duration-500 ease-out backdrop-blur-sm
                                            transform-style: preserve-3d
                                            perspective: 1000px"
                                        isFeatured={true}
                                        language={language}
                                    />
                                </div>
                            );
                        })}
                    </div>
                </div>
            ))}
        </div>
    );
}
