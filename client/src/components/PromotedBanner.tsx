"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { Zap } from "lucide-react";

export default function PromotedBanner() {
    const [ads, setAds] = useState<any[]>([]);

    useEffect(() => {
        let mounted = true;
        const fetchPromoted = async () => {
            const { data } = await supabase
                .from('Ad')
                .select('*')
                .eq('is_boosted', true)
                .eq('is_active', true)
                .order('created_at', { ascending: false })
                .limit(10);
            if (mounted) setAds(data || []);
        };
        fetchPromoted();
        return () => { mounted = false; };
    }, []);

    if (!ads.length) return null;

    return (
        <div className="w-full bg-gradient-to-r from-black to-[#111111] text-white py-6 pulse-orange shadow-[inset_0_-6px_24px_rgba(255,77,0,0.06)] border-b border-primary/10">
            <div className="max-w-7xl mx-auto px-4 flex items-center gap-4">
                <div className="flex items-center gap-3">
                    <Zap className="text-primary" size={20} />
                    <strong className="uppercase tracking-widest">Sponsored</strong>
                </div>
                <div className="flex gap-4 overflow-x-auto scrollbar-hide">
                    {ads.map(ad => (
                        <Link key={ad.id} href={`/ads/${ad.id}`} className="flex-shrink-0 w-64 p-3 bg-[#0b0b0b] rounded-lg border border-primary/10 hover:scale-[1.01] transition-transform flex items-center gap-3 shadow-[0_8px_30px_rgba(255,77,0,0.06)]">
                            {ad.images && JSON.parse(ad.images || '[]')[0] && (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img src={JSON.parse(ad.images)[0]} alt={ad.title} className="w-16 h-12 rounded-md object-cover" />
                            )}
                            <div className="flex-1 text-sm">
                                <div className="font-extrabold truncate">{ad.title}</div>
                                <div className="text-[12px] text-gray-300">{ad.price ? `${ad.price} SAR` : 'Free'}</div>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
}