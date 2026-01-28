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
            <div className="relative w-full bg-gradient-to-br from-[#FF4D00] via-[#ff6a00] to-white rounded-[2rem] shadow-xl overflow-hidden border-4 border-white/20">
                
                {/* Wavy Pattern / Texture Effect - Enhanced & More Wavy */}
                <div className="absolute inset-0 z-0">
                     <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                        <path d="M0 60 Q 20 40 40 60 T 80 60 T 120 40 V 100 H 0 Z" fill="rgba(255,255,255,0.15)" />
                        <path d="M0 40 Q 25 70 50 40 T 100 50 V 100 H 0 Z" fill="rgba(255,255,255,0.1)" />
                        <path d="M0 80 Q 30 50 60 80 T 120 70 V 100 H 0 Z" fill="rgba(255,255,255,0.2)" />
                     </svg>
                </div>
                
                {/* Content Container - Horizontal Scroll */}
                <div className="relative flex items-center gap-3 p-3 overflow-x-auto no-scrollbar snap-x touch-pan-x z-10">
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
                                className="snap-start shrink-0 w-[250px] sm:w-[300px] md:w-[18%] flex flex-col bg-white dark:bg-[#1a1a1a] rounded-xl overflow-hidden shadow-lg hover:shadow-2xl hover:scale-105 transition-all duration-300 group"
                            >
                                {/* Image Area - Reduced Height (75% of previous h-24 = 72px) */}
                                <div className="relative h-[72px] w-full bg-gray-200 dark:bg-gray-800 overflow-hidden">
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

                                {/* Content Area - Compacted */}
                                <div className="p-2 flex flex-col gap-1 flex-1 justify-between">
                                    <div>
                                        <h3 className="text-xs font-bold text-gray-900 dark:text-white line-clamp-1 leading-tight mb-0.5">
                                            {ad.title}
                                        </h3>
                                        <div className="flex items-center gap-1 text-[10px] text-gray-500 dark:text-gray-400">
                                            <MapPin size={10} />
                                            <span className="truncate">{ad.location ? ad.location.split(',')[0] : ''}</span>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between mt-1 pt-1.5 border-t border-gray-100 dark:border-gray-800">
                                        <div className="flex items-baseline gap-1 text-primary font-black">
                                            <span className="text-sm">
                                                {ad.price ? new Intl.NumberFormat(language === 'ar' ? 'ar-SA' : 'en-US').format(ad.price) : ''}
                                            </span>
                                            <span className="text-[9px] uppercase">{currencyCode}</span>
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
