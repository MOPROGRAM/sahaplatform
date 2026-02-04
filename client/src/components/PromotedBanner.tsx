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
            <style jsx>{`
                .card {
                    --background: linear-gradient(to left, #f7ba2b 0%, #ea5358 100%);
                    background: var(--background);
                    position: relative;
                    z-index: 1;
                }

                .card::after {
                    position: absolute;
                    content: "";
                    top: 30px;
                    left: 0;
                    right: 0;
                    z-index: -1;
                    height: 100%;
                    width: 100%;
                    transform: scale(0.8);
                    filter: blur(25px);
                    background: var(--background);
                    transition: opacity 0.5s;
                }

                .card:hover::after {
                    opacity: 0;
                }
            `}</style>
            {strips.map((stripAds, index) => (
                <div key={index} className="card w-full max-w-[1920px] mx-auto rounded-[1rem] shadow-2xl overflow-hidden">
                    
                    {/* Content Container - Horizontal Scroll */}
                    <div className="relative flex items-center gap-2 p-5 overflow-x-auto no-scrollbar snap-x touch-pan-x z-10">
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
                                            bg-white dark:from-[#181818] dark:via-[#282828] dark:to-[#181818]
                                            shadow-[0_8px_32px_rgba(247,186,43,0.2),0_16px_48px_rgba(234,83,88,0.15),inset_0_1px_0_rgba(255,255,255,0.8)] 
                                            hover:shadow-[0_20px_60px_rgba(247,186,43,0.3),0_32px_80px_rgba(234,83,88,0.25),inset_0_2px_0_rgba(255,255,255,0.9)]
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
