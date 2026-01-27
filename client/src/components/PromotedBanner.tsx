"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from 'next/image';
import { adsService } from "@/lib/ads";
import { Zap } from "lucide-react";

export default function PromotedBanner() {
    const [ads, setAds] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let mounted = true;
        const fetchPromoted = async () => {
            try {
                const data = await adsService.getAds({ isBoosted: true, limit: 10 });
                if (mounted) setAds(data || []);
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
                        {[1,2,3,4,5].map(i => (
                            <div key={i} className="flex-shrink-0 w-48 h-14 bg-[#1a1a1a] rounded border border-border-color animate-pulse" />
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    if (!ads.length) return (
         <div className="w-full bg-[#111] py-2 border-b border-border-color min-h-[60px] flex items-center justify-center">
            <div className="text-gray-500 text-xs font-medium">No featured ads available</div>
         </div>
    );

    return (
        <div className="w-full bg-[#111] text-white py-2 border-b border-border-color min-h-[60px]">
            <div className="max-w-[1920px] mx-auto px-4 flex items-center gap-3">
                <div className="flex items-center gap-2 shrink-0">
                    <Zap className="text-primary fill-primary" size={14} />
                    <strong className="text-xs font-black uppercase tracking-wider text-primary">Featured</strong>
                </div>
                <div className="flex gap-3 overflow-x-auto scrollbar-hide py-1">
                    {ads.map(ad => {
                        let imageUrl = null;
                        try {
                            const images = typeof ad.images === 'string' ? JSON.parse(ad.images) : (ad.images || []);
                            imageUrl = Array.isArray(images) ? images[0] : null;
                        } catch (e) {
                            // ignore error
                        }

                        return (
                            <Link key={ad.id} href={`/ads/${ad.id}`} className="flex-shrink-0 w-48 p-2 bg-[#1a1a1a] rounded border border-border-color hover:border-primary/50 transition-colors flex items-center gap-2">
                                {imageUrl && (
                                    <div className="relative w-10 h-10 shrink-0 rounded overflow-hidden bg-gray-800">
                                        <Image src={imageUrl} alt={ad.title} fill className="object-cover" sizes="40px" />
                                    </div>
                                )}
                                <div className="flex-1 min-w-0">
                                    <div className="text-xs font-bold truncate text-gray-100">{ad.title}</div>
                                    <div className="text-[10px] text-primary font-medium">{ad.price ? `${ad.price.toLocaleString()} SAR` : 'Contact'}</div>
                                </div>
                            </Link>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}