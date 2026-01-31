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

    const strips = [ads.slice(0, 20), ads.slice(20, 40)].filter(s => s.length > 0);

    return (
        <div className="w-full my-6 px-4 space-y-6">
            {strips.map((stripAds, index) => (
                <div key={index} className="relative w-full bg-gradient-to-br from-[#ff6b35] via-[#ff8a4a] to-white rounded-[2rem] shadow-xl overflow-hidden">
                    
                    {/* Wavy Pattern / Texture Effect */}
                    <div className="absolute inset-0 z-0">
                         <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                            <path d="M0 60 Q 20 40 40 60 T 80 60 T 120 40 V 100 H 0 Z" fill="rgba(255,255,255,0.15)" />
                            <path d="M0 40 Q 25 70 50 40 T 100 50 V 100 H 0 Z" fill="rgba(255,255,255,0.1)" />
                            <path d="M0 80 Q 30 50 60 80 T 120 70 V 100 H 0 Z" fill="rgba(255,255,255,0.2)" />
                         </svg>
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
                                        className="h-full relative isolate
                                            bg-gradient-to-br from-[#fff7e6] via-[#ffe2a8] to-[#ffd58a] dark:from-[#2a2108] dark:via-[#3a2a0e] dark:to-[#4a3512]
                                            shadow-[0_2px_6px_rgba(255,191,0,0.15),0_12px_24px_rgba(255,191,0,0.12),0_24px_32px_-8px_rgba(0,0,0,0.1)] 
                                            hover:shadow-[0_16px_32px_-8px_rgba(255,191,0,0.25)]
                                            border-[0.5px] border-amber-200 dark:border-amber-300/30
                                            ring-1 ring-inset ring-amber-300/60 dark:ring-amber-200/20
                                            hover:scale-[1.02] hover:-translate-y-1 transition-all duration-500 ease-out"
                                        isFeatured={true}
                                        language={language}
                                        phoneNumber={ad.phone}
                                        email={ad.email || ad.author?.email} // Added
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
