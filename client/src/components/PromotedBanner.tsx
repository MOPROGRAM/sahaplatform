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
                    --background: linear-gradient(to left, #f7ba2b 0%, #ea5358 100%);
                    width: 100%;
                    height: 254px;
                    padding: 5px;
                    border-radius: 1rem;
                    overflow: visible;
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
                    transition: opacity .5s;
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

                /*Hover*/
                .card:hover::after {
                    opacity: 0;
                }
            `}</style>
            
            {/* Main Card */}
            <div className="card max-w-[1920px] mx-auto">
                <div className="card-info">
                    <div className="w-full h-full p-5">
                        {/* Horizontal Scroll for Ads */}
                        <div className="flex items-center gap-3 overflow-x-auto no-scrollbar snap-x touch-pan-x">
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
                                    <div key={ad.id} className="snap-start shrink-0 w-[180px] h-[150px]">
                                        <AdCard 
                                            {...ad}
                                            images={images}
                                            layout="vertical"
                                            className="h-full w-full bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-all duration-300"
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
