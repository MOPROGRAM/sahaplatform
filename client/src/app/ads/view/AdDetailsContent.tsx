"use client";

import Link from "next/link";
import {
    MapPin,
    Calendar,
    Eye,
    Share2,
    Heart,
    ShieldCheck,
    ChevronLeft,
    MessageCircle,
    Phone,
    Info,
    Loader2,
    PlusCircle,
    Search
} from "lucide-react";
import ChatWindow from "@/components/ChatWindow";
import { useState, useEffect } from "react";
import { useLanguage } from "@/lib/language-context";
import { apiService } from "@/lib/api";

interface Ad {
    id: string;
    title: string;
    description: string;
    price: number;
    currency: string;
    category: string;
    location: string;
    images: string;
    views: number;
    isBoosted: boolean;
    author: {
        id: string;
        name: string;
        verified: boolean;
        phone?: string;
    };
    createdAt: string;
}

export default function AdDetailsContent({ id }: { id: string }) {
    const { language, t } = useLanguage();
    const adId = id;

    const [ad, setAd] = useState<Ad | null>(null);
    const [loading, setLoading] = useState(true);
    const [showChat, setShowChat] = useState(false);
    const [showPhone, setShowPhone] = useState(false);

    useEffect(() => {
        fetchAdDetails();
    }, [adId]);

    const fetchAdDetails = async () => {
        setLoading(true);
        try {
            const data = await apiService.get(`/ads/${adId}`);
            setAd(data);
        } catch (error) {
            console.error('Failed to fetch ad details:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-[#f0f2f5]">
                <div className="w-8 h-8 border-3 border-primary border-t-transparent animate-spin rounded-full"></div>
            </div>
        );
    }

    if (!ad) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-[#f0f2f5] gap-4">
                <h2 className="text-[13px] font-black italic">SAHA: AD NOT FOUND</h2>
                <Link href="/" className="text-primary text-[11px] font-bold hover:underline">BACK HOME</Link>
            </div>
        );
    }

    return (
        <div className="bg-[#f0f2f5] min-h-screen" dir={language === 'ar' ? 'rtl' : 'ltr'}>
            {/* Unified Micro Header */}
            <header className="bg-white border-b border-gray-200 py-2 px-4 shadow-sm z-50 sticky top-0">
                <div className="max-w-7xl mx-auto flex items-center gap-6">
                    <Link href="/" className="flex items-center gap-2 group shrink-0">
                        <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center p-1.5 shadow-md">
                            <svg viewBox="0 0 100 40" className="w-full h-full text-white" fill="none" stroke="currentColor" strokeWidth="10" strokeLinecap="round">
                                <path d="M 10 15 L 10 10 L 90 10 L 90 20 M 10 20 L 10 30 L 90 30 L 90 25" />
                            </svg>
                        </div>
                        <span className="text-lg font-black tracking-tighter text-secondary">{t('siteName')}</span>
                    </Link>

                    <div className="flex-1 max-w-xl flex border-2 border-primary rounded-sm overflow-hidden bg-white">
                        <input
                            type="text"
                            placeholder={t('searchPlaceholder')}
                            className="flex-1 px-3 py-1.5 text-xs outline-none font-bold"
                        />
                        <button className="bg-primary px-4 text-white hover:bg-primary-hover transition-colors">
                            <Search size={14} />
                        </button>
                    </div>

                    <Link href="/post-ad" className="bg-secondary text-white px-4 py-1.5 rounded-sm text-[11px] font-black flex items-center gap-2 hover:bg-black transition-all shrink-0">
                        <PlusCircle size={14} />
                        {t('postAd')}
                    </Link>
                </div>
            </header>

            {/* Breadcrumbs - Ultra Compact */}
            <div className="max-w-7xl mx-auto px-2 py-1.5 text-[10px] text-gray-400 flex items-center gap-1">
                <Link href="/" className="hover:text-primary">{t('home')}</Link>
                <ChevronLeft size={10} className="opacity-30" />
                <span className="truncate max-w-[150px] font-bold text-gray-600">{ad.title}</span>
            </div>

            <main className="max-w-7xl mx-auto grid grid-cols-12 gap-2 p-2 pt-0">
                {/* Main Content Area (8/12) */}
                <div className="col-span-12 lg:col-span-9 flex flex-col gap-2">
                    {/* Media Card */}
                    <div className="bg-white border border-gray-200 rounded-sm overflow-hidden shadow-sm">
                        <div className="aspect-[21/9] bg-gray-900 relative flex items-center justify-center">
                            {JSON.parse(ad.images || "[]").length > 0 ? (
                                <img src={JSON.parse(ad.images || "[]")[0]} alt={ad.title} className="w-full h-full object-cover opacity-90" />
                            ) : (
                                <span className="text-gray-800 text-4xl font-black italic opacity-50 select-none">SAHA HUB</span>
                            )}
                            <div className="absolute top-2 right-2 bg-black/70 text-white px-2 py-0.5 rounded-xs text-[9px] font-bold">1 / {JSON.parse(ad.images || "[]").length || 1}</div>
                        </div>
                    </div>

                    {/* Content Details */}
                    <div className="bg-white border border-gray-200 p-4 rounded-sm shadow-sm">
                        <div className="flex flex-col gap-2">
                            <div className="flex justify-between items-start">
                                <h1 className="text-lg font-black text-secondary leading-tight">{ad.title}</h1>
                                <div className="text-right">
                                    <span className="text-xl font-black text-primary block">{new Intl.NumberFormat('ar-SA').format(ad.price)}</span>
                                    <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">{language === 'ar' ? 'ريال سعودي' : 'SAR'}</span>
                                </div>
                            </div>

                            <div className="flex items-center gap-4 text-[10px] font-bold text-gray-500 border-y border-gray-50 py-2 mt-2">
                                <span className="flex items-center gap-1"><MapPin size={12} className="text-primary" /> {ad.location}</span>
                                <span className="flex items-center gap-1"><Calendar size={12} /> {new Date(ad.createdAt).toLocaleDateString(language === 'ar' ? 'ar-SA' : 'en-US')}</span>
                                <span className="flex items-center gap-1"><Eye size={12} /> {ad.views} {language === 'ar' ? 'مشاهدة' : 'Views'}</span>
                            </div>

                            <div className="py-4">
                                <h3 className="text-[12px] font-black uppercase text-secondary mb-2 border-r-3 border-primary pr-2 leading-none">{language === 'ar' ? 'وصف الإعلان' : 'Description'}</h3>
                                <p className="text-[11px] leading-relaxed text-gray-600 font-medium whitespace-pre-line">
                                    {ad.description}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Interaction Sidebar (3/12) */}
                <aside className="col-span-12 lg:col-span-3 flex flex-col gap-2">
                    <div className="bg-white border border-gray-200 rounded-sm shadow-sm overflow-hidden">
                        <div className="p-4">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-10 h-10 bg-gray-50 rounded-full flex items-center justify-center border border-gray-100 shrink-0 font-black text-primary text-xs italic">
                                    {ad.author.name?.substring(0, 2).toUpperCase()}
                                </div>
                                <div className="min-w-0">
                                    <h3 className="font-bold text-[11px] flex items-center gap-1 truncate text-secondary">
                                        {ad.author.name}
                                        {ad.author.verified && <ShieldCheck size={12} className="text-blue-500" />}
                                    </h3>
                                    <span className="text-[9px] font-black text-green-500 uppercase tracking-tighter">Verified Seller</span>
                                </div>
                            </div>

                            <div className="flex flex-col gap-1.5">
                                <button
                                    onClick={() => setShowChat(true)}
                                    className="w-full bg-primary hover:bg-primary-hover text-white py-2 rounded-sm text-[11px] font-black flex items-center justify-center gap-2 transition-all"
                                >
                                    <MessageCircle size={14} />
                                    {language === 'ar' ? 'بدء دردشة' : 'START CHAT'}
                                </button>
                                <button
                                    onClick={() => setShowPhone(!showPhone)}
                                    className="w-full bg-secondary text-white py-2 rounded-sm text-[11px] font-black flex items-center justify-center gap-2 hover:bg-black transition-all"
                                >
                                    <Phone size={14} />
                                    {showPhone ? (ad.author.phone || 'N/A') : (language === 'ar' ? 'إظهار الجوال' : 'SHOW PHONE')}
                                </button>
                            </div>
                        </div>
                        <Link href="/" className="bg-gray-50 p-2 border-t border-gray-100 flex items-center justify-between text-[10px] font-bold text-gray-400 hover:text-primary transition-colors">
                            <span>عرض جميع إعلانات المعلن</span>
                            <ChevronLeft size={12} />
                        </Link>
                    </div>

                    <div className="bg-orange-50 border border-orange-100 p-3 rounded-sm flex gap-2">
                        <Info className="text-orange-500 shrink-0" size={16} />
                        <div className="flex flex-col gap-0.5">
                            <span className="text-[10px] font-black text-orange-700 uppercase">{language === 'ar' ? 'توصية أمان' : 'Safety Tip'}</span>
                            <p className="text-[9px] text-orange-600 leading-tight font-bold">
                                {language === 'ar' ? 'معاينة الغرض شخصياً هي أفضل ضامن لك.' : 'Personal inspection is your best safeguard.'}
                            </p>
                        </div>
                    </div>

                    {showChat && (
                        <div className="fixed bottom-4 left-4 w-80 z-50 shadow-2xl border border-gray-200">
                            <div className="flex justify-between items-center bg-secondary text-white p-2 rounded-t-sm">
                                <span className="text-[10px] font-black uppercase italic tracking-widest">Saha Messenger</span>
                                <button onClick={() => setShowChat(false)} className="text-xl leading-none">×</button>
                            </div>
                            <ChatWindow />
                        </div>
                    )}
                </aside>
            </main>
        </div>
    );
}
