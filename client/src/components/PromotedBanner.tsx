"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from 'next/image';
import { adsService } from "@/lib/ads";
import { Zap, MapPin } from "lucide-react";
import { useLanguage } from '@/lib/language-context';

export default function PromotedBanner() {
    const [ads, setAds] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
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

    return (
        <div className="w-full my-6 px-4">
            <div className="relative w-full bg-gradient-to-r from-[#FF4D00] via-[#FF7500] to-[#FF4D00] rounded-[2rem] shadow-xl overflow-hidden border border-white/10">
                
                {/* Wavy Pattern / Texture Effect */}
                <div className="absolute inset-0 opacity-20">
                     <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                        <path d="M0 50 Q 25 60 50 50 T 100 50 V 100 H 0 Z" fill="rgba(255,255,255,0.1)" />
                        <path d="M0 30 Q 25 40 50 30 T 100 30 V 100 H 0 Z" fill="rgba(255,255,255,0.05)" />
                     </svg>
                </div>
                
                {/* Content Container - Horizontal Scroll */}
                <div className="relative flex items-center gap-3 p-4 overflow-x-auto no-scrollbar snap-x touch-pan-x">
                    {ads.map((ad) => {
                        let imageUrl = null;
                        try {
                            const images = typeof ad.images === 'string' ? JSON.parse(ad.images) : (ad.images || []);
                            imageUrl = Array.isArray(images) ? images[0] : null;
                        } catch (e) { }

                        const currencyCode = (ad.currency && typeof ad.currency === 'object') ? ad.currency.code : (ad.currency || 'SAR');

                        return (
                            <Link 
                                key={ad.id}
                                href={`/ads/${ad.id}`} 
                                className="snap-start shrink-0 w-[200px] sm:w-[240px] md:w-[14.28%] flex flex-col bg-white dark:bg-[#1a1a1a] rounded-xl overflow-hidden shadow-lg hover:shadow-2xl hover:scale-105 transition-all duration-300 group"
                            >
                                {/* Image Area */}
                                <div className="relative h-32 w-full bg-gray-200 dark:bg-gray-800 overflow-hidden">
                                    {imageUrl ? (
                                        <Image
                                            src={imageUrl}
                                            alt={ad.title}
                                            fill
                                            className="object-cover group-hover:scale-110 transition-transform duration-500"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                                            <Zap size={24} />
                                        </div>
                                    )}
                                    <div className="absolute top-2 right-2 bg-primary/90 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm backdrop-blur-sm">
                                        {(t as any)["featured"]}
                                    </div>
                                </div>

                                {/* Content Area */}
                                <div className="p-3 flex flex-col gap-1.5 flex-1 justify-between">
                                    <div>
                                        <h3 className="text-sm font-bold text-gray-900 dark:text-white line-clamp-2 leading-tight mb-1">
                                            {ad.title}
                                        </h3>
                                        <div className="flex items-center gap-1 text-[10px] text-gray-500 dark:text-gray-400">
                                            <MapPin size={10} />
                                            <span className="truncate">{ad.location ? ad.location.split(',')[0] : ''}</span>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between mt-1 pt-2 border-t border-gray-100 dark:border-gray-800">
                                        <div className="flex items-baseline gap-1 text-primary font-black">
                                            <span className="text-lg">
                                                {ad.price ? new Intl.NumberFormat(language === 'ar' ? 'ar-SA' : 'en-US').format(ad.price) : ''}
                                            </span>
                                            <span className="text-[10px] uppercase">{currencyCode}</span>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
