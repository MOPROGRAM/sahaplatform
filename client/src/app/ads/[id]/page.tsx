"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import {
    MapPin,
    Calendar,
    Eye,
    Share2,
    Heart,
    ShieldCheck,
    CheckCircle2,
    ChevronLeft,
    MessageCircle,
    Phone,
    Info
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
    isBoosted: boolean;
    author: {
        name: string;
        verified: boolean;
    };
    createdAt: string;
}

export async function generateStaticParams() {
    return [];
}

export default function AdDetailsPage() {
    const { language, t } = useLanguage();
    const params = useParams();
    const adId = params.id as string;

    const [ad, setAd] = useState<Ad | null>(null);
    const [loading, setLoading] = useState(true);
    const [showChat, setShowChat] = useState(false);

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
            // Show error state
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-[#f2f4f7] dark:bg-slate-950 min-h-screen pb-12">
            {/* Breadcrumbs (Dense) */}
            <div className="max-w-[1240px] mx-auto px-4 py-3 text-[11px] text-gray-500 flex items-center gap-2">
                <span>الرئيسية</span> <ChevronLeft size={10} />
                <span>عقارات</span> <ChevronLeft size={10} />
                <span>شقق للبيع</span> <ChevronLeft size={10} />
                <span className="text-secondary dark:text-gray-300 font-bold">شقة فاخرة في حي الملقا</span>
            </div>

            <main className="max-w-[1240px] mx-auto grid grid-cols-12 gap-6 px-4">

                {/* Left: Main Content */}
                <div className="col-span-12 lg:col-span-8 flex flex-col gap-4">
                    {/* Gallery Section */}
                    <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-gray-800 rounded-sm overflow-hidden">
                        <div className="aspect-video bg-gray-100 dark:bg-slate-800 relative flex items-center justify-center">
                            <span className="text-gray-300 text-lg font-bold italic opacity-20 text-[80px] select-none">الـسـاحـة</span>
                            <div className="absolute top-4 right-4 bg-black/50 text-white px-3 py-1 rounded-sm text-xs font-bold">1 / 8</div>
                        </div>
                        <div className="flex p-2 gap-2 overflow-x-auto bg-gray-50 dark:bg-slate-900 border-t border-gray-100 dark:border-gray-800">
                            {[1, 2, 3, 4, 5].map(i => (
                                <div key={i} className={`w-24 h-16 bg-gray-200 dark:bg-slate-800 shrink-0 border-2 ${i === 1 ? 'border-primary' : 'border-transparent'}`}></div>
                            ))}
                        </div>
                    </div>

                    {/* Core Info */}
                    <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-gray-800 p-6 rounded-sm">
                        <div className="flex justify-between items-start mb-4">
                            <div className="flex flex-col gap-1">
                                <h1 className="text-2xl font-black">شقة فاخرة للبيع - 3 غرف وصالة - حي الملقا، الرياض</h1>
                                <div className="flex items-center gap-4 text-xs text-gray-400">
                                    <span className="flex items-center gap-1"><MapPin size={14} /> الرياض، حي الملقا</span>
                                    <span className="flex items-center gap-1"><Calendar size={14} /> نُشر منذ ساعتين</span>
                                    <span className="flex items-center gap-1"><Eye size={14} /> 1,240 مشاهدة</span>
                                </div>
                            </div>
                            <div className="flex flex-col items-end">
                                <span className="text-3xl font-black text-primary">1,250,000</span>
                                <span className="text-sm font-bold text-gray-400">ريال سعودي</span>
                            </div>
                        </div>

                        <div className="flex gap-2 mb-8">
                            <button className="flex items-center gap-2 border border-gray-200 dark:border-gray-700 px-4 py-2 text-xs font-bold rounded-sm hover:bg-gray-50 transition-colors"><Share2 size={16} /> مشاركة</button>
                            <button className="flex items-center gap-2 border border-gray-200 dark:border-gray-700 px-4 py-2 text-xs font-bold rounded-sm hover:text-red-500 transition-colors"><Heart size={16} /> حفظ في المفضلة</button>
                        </div>

                        {/* Attributes Grid */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 bg-gray-50 dark:bg-slate-800/50 rounded-sm mb-6">
                            {[
                                { l: "المساحة", v: "180 م²" },
                                { l: "عمر العقار", v: "جديد" },
                                { l: "عدد الغرف", v: "3 غرف" },
                                { l: "عدد الحمامات", v: "3 حمامات" },
                                { l: "الدور", v: "الثالث" },
                                { l: "الواجهة", v: "شمالية" },
                            ].map((at, i) => (
                                <div key={i} className="flex flex-col gap-0.5">
                                    <span className="text-[10px] text-gray-400 font-bold uppercase">{at.l}</span>
                                    <span className="text-sm font-bold">{at.v}</span>
                                </div>
                            ))}
                        </div>

                        {/* Description */}
                        <div className="prose dark:prose-invert max-w-none">
                            <h3 className="text-lg font-bold mb-3 border-r-4 border-primary pr-3">الوصف</h3>
                            <p className="text-sm leading-relaxed text-gray-600 dark:text-gray-400 whitespace-pre-line">
                                شقة متميزة في أحد أكثر أحياء الرياض طلباً (حي الملقا). الشقة في مجمع سكني مغلق مع كاميرات مراقبة وحراسة.
                                مميزات الشقة:
                                - تكييف مركزي راكب بالكامل.
                                - مطبخ مجهز بأحدث الأجهزة.
                                - موقف سيارة خاص في القبو.
                                - إضاءة ذكية بالكامل.

                                الشقة جاهزة للسكن المباشر، الصك حر ومفرغ.
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
                                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center border-4 border-gray-50 overflow-hidden shrink-0">
                                    <span className="text-xl font-black text-gray-300">MA</span>
                                </div>
                                <div>
                                    <h3 className="font-bold text-base flex items-center gap-1">
                                        شركة الأساس العقارية
                                        <ShieldCheck size={16} className="text-blue-500" />
                                    </h3>
                                    <p className="text-xs text-green-500 font-bold">بائع موثوق منذ 2021</p>
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
                                <button className="w-full bg-secondary dark:bg-slate-800 text-white py-4 rounded-sm font-black flex items-center justify-center gap-3 hover:bg-black transition-all">
                                    <Phone size={20} />
                                    إظهار رقم الجوال
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
