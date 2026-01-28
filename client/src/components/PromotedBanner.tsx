"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from 'next/image';
import { adsService } from "@/lib/ads";
import { Zap, MapPin, Clock } from "lucide-react"; // Added MapPin and Clock
import { useLanguage } from '@/lib/language-context'; // Added useLanguage
import { formatRelativeTime } from "@/lib/utils"; // Added formatRelativeTime

export default function PromotedBanner() {
    const [ads, setAds] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const { t, language } = useLanguage(); // Destructure t and language

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
            <div className="w-full bg-[#111] py-2 border-b border-border-color min-h-[60px]">
                <div className="max-w-[1920px] mx-auto px-4 flex items-center gap-3">
                    <div className="w-20 h-4 bg-white/10 rounded animate-pulse shrink-0" />
                    <div className="flex gap-3 overflow-hidden py-1 w-full">
                        {[1, 2, 3, 4, 5].map(i => (
                            <div key={i} className="flex-shrink-0 w-48 h-14 bg-[#1a1a1a] rounded border border-border-color animate-pulse" />
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    if (!ads.length) return (
        <div className="w-full bg-[#111] py-2 border-b border-border-color min-h-[60px] flex items-center justify-center">
            <div className="text-gray-500 text-xs font-medium">{(t as any)["noFeaturedAds"]}</div>
        </div>
    );

    return (
        <div className="w-full bg-[#111] text-white py-2 border-b border-border-color min-h-[180px] flex items-center"> {/* Adjusted min-h for new card design */}
            <div className="max-w-[1920px] mx-auto px-4 flex items-center gap-3 overflow-x-auto scrollbar-hide py-1">
                {ads.map(ad => {
                    let imageUrl = null;
                    try {
                        const images = typeof ad.images === 'string' ? JSON.parse(ad.images) : (ad.images || []);
                        imageUrl = Array.isArray(images) ? images[0] : null;
                    } catch (e) {
                        // ignore error
                    }

                    return (
                        <Link key={ad.id} href={`/ads/${ad.id}`} className="promoted-card flex-shrink-0 w-full md:w-[280px]"> {/* Apply card class, maintain width */}
                            <div className="promoted-info-section">
                                <div className="promoted-background-design">
                                    {imageUrl && (
                                        <Image
                                            src={imageUrl}
                                            alt={ad.title}
                                            fill
                                            className="object-cover opacity-50"
                                        />
                                    )}
                                    <div className="promoted-circle" />
                                    <div className="promoted-circle" />
                                    <div className="promoted-circle" />
                                </div>
                                <div className="promoted-left-side">
                                    <div className="flex items-center gap-1">
                                        <Zap size={14} className="text-primary fill-primary" />
                                        <span className="text-xs font-black uppercase tracking-wider">{(t as any)["featured"]}</span>
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="promoted-temperature">{ad.price ? `${ad.price.toLocaleString()}` : ''}</span>
                                        <span className="text-sm font-medium">{(ad.currency && typeof ad.currency === 'object') ? ad.currency.code : (ad.currency || 'SAR')}</span>
                                    </div>
                                </div>
                                <div className="promoted-right-side">
                                    <div>
                                        <span className="promoted-title">{ad.title}</span>
                                        {ad.created_at && (
                                            <span className="promoted-date flex items-center gap-1">
                                                <Clock size={10} /> {formatRelativeTime(ad.created_at, language)}
                                            </span>
                                        )}
                                        {ad.location && (
                                            <span className="promoted-date flex items-center gap-1">
                                                <MapPin size={10} /> {ad.location.split(',')[0].trim()}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                            <div className="promoted-days-section">
                                <button className="promoted-info-button">
                                    <Zap size={12} className="text-white" />
                                    <span className="promoted-day">{(t as any)["viewDetails"]}</span>
                                </button>
                            </div>
                        </Link>
                    );
                })}
            </div>
        </div>
    );
}