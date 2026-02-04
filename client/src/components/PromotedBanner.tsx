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
                <div className="w-full h-[254px] bg-gray-100 dark:bg-[#1a1a1a] rounded-[1rem] animate-pulse relative overflow-hidden">
                     <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent skew-x-12 translate-x-[-100%] animate-shimmer" />
                </div>
            </div>
        );
    }

    if (!ads.length) return null;

    return (
        <div className="w-full my-3 px-4">
            <style jsx>{`
                .card {
                    width: 100%;
                    padding: 12px;
                    border-radius: 1rem;
                    overflow: visible;
                    background: white;
                    position: relative;
                    z-index: 1;
                    min-height: 220px;
                    height: auto;
                    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
                    border: 1px solid rgba(0, 255, 214, 0.3);
                }

                .card-info {
                    background: white;
                    color: black;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    width: 100%;
                    height: 100%;
                    overflow: visible;
                    border-radius: .7rem;
                }
            `}</style>
            
            {/* Main Card */}
            <div className="card max-w-[1920px] mx-auto">
                <div className="card-info">
                    <div className="w-full h-full p-5">
                        {/* Horizontal Scroll for Ads with proper card sizing */}
                        <div className="flex items-center gap-3 overflow-hidden snap-x touch-pan-x">
                            {ads.slice(0, 10).map((ad) => {
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
                                    <div key={ad.id} className="snap-start shrink-0 basis-[calc(50%-8px)] sm:basis-[calc(33.333%-8px)] md:basis-[calc(25%-8px)] lg:basis-[calc(20%-8px)] xl:basis-[calc(16.666%-8px)] 2xl:basis-[calc(14.285%-8px)]">
                                        <AdCard 
                                            {...ad}
                                            images={images}
                                            layout="vertical"
                                            className="bento-card bento-card-hover group flex shadow hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border-amber-400 ring-2 ring-amber-400/20 shadow-[0_0_15px_rgba(251,191,36,0.3)] rounded-2xl bg-white dark:bg-[#1a1a1a] overflow-hidden relative cursor-pointer block h-full"
                                            isFeatured={true}
                                            language={language}
                                        />
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
