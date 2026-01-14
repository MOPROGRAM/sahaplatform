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
    Loader2
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
            <div className="flex items-center justify-center min-h-screen bg-[#f2f4f7] dark:bg-slate-950">
                <Loader2 className="animate-spin text-primary" size={48} />
            </div>
        );
    }

    if (!ad) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-[#f2f4f7] dark:bg-slate-950 gap-4">
                <h2 className="text-xl font-bold">الإعلان غير موجود أو تم حذفه</h2>
                <Link href="/" className="text-primary hover:underline">العودة للرئيسية</Link>
            </div>
        );
    }

    return (
        <div className="bg-[#f2f4f7] dark:bg-slate-950 min-h-screen pb-12" dir="rtl">
            {/* Breadcrumbs (Dense) */}
            <div className="max-w-[1240px] mx-auto px-4 py-3 text-[11px] text-gray-500 flex items-center gap-2">
                <Link href="/" className="hover:text-primary transition-colors">الرئيسية</Link> <ChevronLeft size={10} />
                <span>{ad.category === 'realEstate' ? 'عقارات' : ad.category === 'cars' ? 'سيارات' : 'أصناف أخرى'}</span> <ChevronLeft size={10} />
                <span className="text-secondary dark:text-gray-300 font-bold truncate max-w-[200px]">{ad.title}</span>
            </div>

            <main className="max-w-[1240px] mx-auto grid grid-cols-12 gap-6 px-4">

                {/* Left: Main Content */}
                <div className="col-span-12 lg:col-span-8 flex flex-col gap-4">
                    {/* Gallery Section */}
                    <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-gray-800 rounded-sm overflow-hidden">
                        <div className="aspect-video bg-gray-100 dark:bg-slate-800 relative flex items-center justify-center overflow-hidden">
                            {JSON.parse(ad.images || "[]").length > 0 ? (
                                <img src={JSON.parse(ad.images || "[]")[0]} alt={ad.title} className="w-full h-full object-cover" />
                            ) : (
                                <span className="text-gray-300 text-lg font-bold italic opacity-20 text-[80px] select-none">الـساحـة</span>
                            )}
                            <div className="absolute top-4 right-4 bg-black/50 text-white px-3 py-1 rounded-sm text-xs font-bold">1 / {JSON.parse(ad.images || "[]").length || 1}</div>
                        </div>
                    </div>

                    {/* Core Info */}
                    <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-gray-800 p-6 rounded-sm">
                        <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-6">
                            <div className="flex flex-col gap-1">
                                <h1 className="text-2xl font-black">{ad.title}</h1>
                                <div className="flex items-center gap-4 text-xs text-gray-400">
                                    <span className="flex items-center gap-1"><MapPin size={14} /> {ad.location || 'الموقع غير محدد'}</span>
                                    <span className="flex items-center gap-1"><Calendar size={14} /> {new Date(ad.createdAt).toLocaleDateString('ar-SA')}</span>
                                    <span className="flex items-center gap-1"><Eye size={14} /> {ad.views} مشاهدة</span>
                                </div>
                            </div>
                            <div className="flex flex-col items-end shrink-0">
                                <span className="text-3xl font-black text-primary">{ad.price?.toLocaleString()}</span>
                                <span className="text-sm font-bold text-gray-400">ريال سعودي</span>
                            </div>
                        </div>

                        <div className="flex gap-2 mb-8">
                            <button className="flex items-center gap-2 border border-gray-200 dark:border-gray-700 px-4 py-2 text-xs font-bold rounded-sm hover:bg-gray-50 transition-colors"><Share2 size={16} /> مشاركة</button>
                            <button className="flex items-center gap-2 border border-gray-200 dark:border-gray-700 px-4 py-2 text-xs font-bold rounded-sm hover:text-red-500 transition-colors"><Heart size={16} /> حفظ في المفضلة</button>
                        </div>

                        {/* Description */}
                        <div className="prose dark:prose-invert max-w-none">
                            <h3 className="text-lg font-bold mb-3 border-r-4 border-primary pr-3">الوصف</h3>
                            <p className="text-sm leading-relaxed text-gray-600 dark:text-gray-400 whitespace-pre-line">
                                {ad.description}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Right: Seller Info & Interaction */}
                <div className="col-span-12 lg:col-span-4 flex flex-col gap-4">
                    {/* Seller Card */}
                    <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-gray-800 rounded-sm shadow-sm overflow-hidden">
                        <div className="p-6">
                            <div className="flex items-center gap-4 mb-6">
                                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center border-4 border-gray-50 overflow-hidden shrink-0">
                                    <span className="text-xl font-black text-primary">{ad.author.name?.substring(0, 2).toUpperCase()}</span>
                                </div>
                                <div>
                                    <h3 className="font-bold text-base flex items-center gap-1 text-right">
                                        {ad.author.name}
                                        {ad.author.verified && <ShieldCheck size={16} className="text-blue-500" />}
                                    </h3>
                                    <p className="text-xs text-green-500 font-bold text-right">معلن نشط</p>
                                </div>
                            </div>

                            <div className="flex flex-col gap-3">
                                <button
                                    onClick={() => setShowChat(true)}
                                    className="w-full bg-primary hover:bg-primary-dark text-white py-4 rounded-sm font-black flex items-center justify-center gap-3 shadow-lg shadow-primary/20 transition-all active:scale-95"
                                >
                                    <MessageCircle size={20} />
                                    دردشة مع البائع
                                </button>
                                <button
                                    onClick={() => setShowPhone(!showPhone)}
                                    className="w-full bg-secondary dark:bg-slate-800 text-white py-4 rounded-sm font-black flex items-center justify-center gap-3 hover:bg-black transition-all"
                                >
                                    <Phone size={20} />
                                    {showPhone ? (ad.author.phone || 'لا يوجد رقم') : 'إظهار رقم الجوال'}
                                </button>
                            </div>
                        </div>
                        <div className="bg-gray-50 dark:bg-slate-800/50 p-4 border-t border-gray-100 dark:border-gray-800 flex justify-between items-center">
                            <Link href="/dashboard" className="text-xs font-bold text-gray-500 hover:text-primary">مشاهدة جميع إعلانات المعلن</Link>
                            <ChevronLeft size={14} className="text-gray-300" />
                        </div>
                    </div>

                    {/* Safety Tips Overlay */}
                    <div className="bg-orange-50 dark:bg-orange-950/20 border border-orange-100 dark:border-orange-800 p-4 rounded-sm flex gap-3">
                        <Info className="text-orange-500 shrink-0" size={20} />
                        <div className="flex flex-col gap-1">
                            <span className="text-xs font-bold text-orange-700 dark:text-orange-400">نصيحة أمان</span>
                            <p className="text-[11px] text-orange-600 dark:text-orange-400/70 leading-relaxed">
                                لا تقم بتحويل أي مبلغ مقدم لحجز العقار. ننصح بمعاينة العقار شخصياً قبل إتمام أي معاملة مالية.
                            </p>
                        </div>
                    </div>

                    {/* Chat Window Popup Integration */}
                    {showChat && (
                        <div className="fixed bottom-4 left-4 w-96 z-50">
                            <div className="flex justify-between items-center bg-primary text-white p-2 rounded-t-sm">
                                <span className="text-xs font-bold">دردشة سريعة</span>
                                <button onClick={() => setShowChat(false)} className="text-xl">×</button>
                            </div>
                            <ChatWindow />
                        </div>
                    )}
                </div>

            </main>
        </div>
    );
}
