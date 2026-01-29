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
                <div className="w-full h-[240px] bg-gray-100 dark:bg-[#1a1a1a] rounded-[2rem] animate-pulse relative overflow-hidden">
                     <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent skew-x-12 translate-x-[-100%] animate-shimmer" />
                </div>
            </div>
        );
    }

    if (!ads.length) return null;

    const strips = [ads.slice(0, 20), ads.slice(20, 40)].filter(s => s.length > 0);

    return (
        <div className="w-full my-6 px-4 space-y-6">
            {strips.map((stripAds, index) => (
                <div key={index} className="relative w-full bg-gradient-to-br from-[#FF4D00] via-[#ff6a00] to-white rounded-[2rem] shadow-xl overflow-hidden border-4 border-white/20">
                    
                    {/* Wavy Pattern / Texture Effect */}
                    <div className="absolute inset-0 z-0">
                         <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                            <path d="M0 60 Q 20 40 40 60 T 80 60 T 120 40 V 100 H 0 Z" fill="rgba(255,255,255,0.15)" />
                            <path d="M0 40 Q 25 70 50 40 T 100 50 V 100 H 0 Z" fill="rgba(255,255,255,0.1)" />
                            <path d="M0 80 Q 30 50 60 80 T 120 70 V 100 H 0 Z" fill="rgba(255,255,255,0.2)" />
                         </svg>
                    </div>
                    
                    {/* Content Container - Horizontal Scroll */}
                    <div className="relative flex items-center gap-3 p-3 overflow-x-auto no-scrollbar snap-x touch-pan-x z-10">
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
                                <div key={ad.id} className="snap-start shrink-0 w-[200px] sm:w-[220px]">
                                    <AdCard 
                                        {...ad}
                                        images={images}
                                        layout="vertical"
                                        className="h-full border-2 border-yellow-500 shadow-lg hover:shadow-2xl hover:scale-105 transition-all duration-300"
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
