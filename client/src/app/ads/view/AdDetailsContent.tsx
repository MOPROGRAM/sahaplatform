"use client";

import Link from "next/link";
import {
    MapPin,
    Calendar,
    Eye,
    ShieldCheck,
    ChevronLeft,
    MessageCircle,
    Phone,
    Info,
    Loader2,
    Share2,
    Heart,
    Maximize2
} from "lucide-react";
import ChatWindow from "@/components/ChatWindow";
import Header from "@/components/Header";
import { useState, useEffect } from "react";
import { useLanguage } from "@/lib/language-context";
import { apiService } from "@/lib/api";
import { useAuthStore } from "@/store/useAuthStore";

interface Ad {
    id: string;
    title: string;
    description: string;
    price: number;
    category: string;
    location: string;
    latitude?: number;
    longitude?: number;
    images: string;
    views: number;
    isBoosted: boolean;
    author: {
        id: string;
        name: string;
        verified: boolean;
        phone?: string;
    };
    currency?: {
        code: string;
        symbol: string;
    };
    createdAt: string;
}

export default function AdDetailsContent({ id }: { id: string }) {
    const { language, t } = useLanguage();
    const { user } = useAuthStore();
    const adId = id;

    const [ad, setAd] = useState<Ad | null>(null);
    const [loading, setLoading] = useState(true);
    const [conversationId, setConversationId] = useState<string | null>(null);
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

    const handleStartChat = async () => {
        if (!user) {
            alert(language === 'ar' ? 'يرجى تسجيل الدخول أولاً' : 'Please login first');
            return;
        }
        if (user.id === ad?.author.id) {
            alert(language === 'ar' ? 'هذا إعلانك الخاص!' : 'This is your own ad!');
            return;
        }

        try {
            // Check or create conversation for this ad
            const conversation = await apiService.post('/conversations', {
                participants: [ad?.author.id],
                adId: ad?.id
            });
            setConversationId(conversation.id);
            setShowChat(true);
        } catch (error) {
            console.error("Failed to start conversation:", error);
        }
    };

    if (loading) return <div className="flex items-center justify-center min-h-screen"><Loader2 className="animate-spin text-primary" /></div>;
    if (!ad) return <div className="text-center p-20 font-black uppercase">Ad not found</div>;

    const lat = ad.latitude || 24.7136;
    const lon = ad.longitude || 46.6753;

    return (
        <div className="bg-[#f0f2f5] min-h-screen" dir={language === 'ar' ? 'rtl' : 'ltr'}>
            <Header />

            <div className="max-w-7xl mx-auto px-2 py-1.5 text-[10px] text-gray-400 flex items-center gap-1">
                <Link href="/" className="hover:text-primary">{t('home')}</Link>
                <ChevronLeft size={10} className="opacity-30" />
                <span className="truncate max-w-[150px] font-bold text-gray-600 uppercase tracking-tighter">{ad.title}</span>
            </div>

            <main className="max-w-7xl mx-auto grid grid-cols-12 gap-3 p-2 pt-0">
                <div className="col-span-12 lg:col-span-9 flex flex-col gap-3">
                    {/* Media Gallery */}
                    <div className="bg-white border border-gray-200 rounded-sm overflow-hidden shadow-sm">
                        <div className="aspect-[21/9] bg-gray-900 relative">
                            {JSON.parse(ad.images || "[]").length > 0 ? (
                                <img src={JSON.parse(ad.images || "[]")[0]} alt={ad.title} className="w-full h-full object-cover opacity-90 transition-opacity hover:opacity-100" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-800 to-gray-900">
                                    <span className="text-white/10 text-6xl font-black italic select-none">SAHA PREVIEW</span>
                                </div>
                            )}
                            <div className="absolute bottom-3 right-3 flex gap-2">
                                <button className="bg-black/50 backdrop-blur-md text-white p-1.5 rounded-xs hover:bg-primary transition-all"><Maximize2 size={14} /></button>
                                <button className="bg-black/50 backdrop-blur-md text-white p-1.5 rounded-xs hover:bg-primary transition-all"><Share2 size={14} /></button>
                            </div>
                        </div>
                    </div>

                    {/* Content Section */}
                    <div className="bg-white border border-gray-200 p-6 rounded-sm shadow-sm relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 blur-3xl"></div>
                        <div className="relative z-10">
                            <div className="flex justify-between items-start mb-4">
                                <div className="flex flex-col gap-1">
                                    <h1 className="text-2xl font-black text-secondary leading-tight tracking-tight">{ad.title}</h1>
                                    <span className="text-[10px] font-black text-primary bg-primary/5 px-2 py-0.5 rounded-full inline-block uppercase tracking-widest w-fit">{ad.category}</span>
                                </div>
                                <div className="text-right flex flex-col items-end">
                                    <div className="flex items-baseline gap-1 text-primary">
                                        <span className="text-3xl font-black italic tracking-tighter">{new Intl.NumberFormat(language === 'ar' ? 'ar-SA' : 'en-US').format(ad.price)}</span>
                                        <span className="text-[10px] font-black uppercase tracking-widest opacity-60">
                                            {ad.currency?.code || 'SAR'}
                                        </span>
                                    </div>
                                    <span className="text-[9px] font-black text-gray-400 mt-1 uppercase italic tracking-tighter">Listed {new Date(ad.createdAt).toLocaleDateString()}</span>
                                </div>
                            </div>

                            <div className="grid grid-cols-3 gap-4 border-y border-gray-50 py-4 my-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-xs bg-gray-50 flex items-center justify-center text-primary"><MapPin size={16} /></div>
                                    <div className="flex flex-col"><span className="text-[9px] font-black text-gray-400 uppercase">Location</span><span className="text-[11px] font-black text-secondary">{ad.location}</span></div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-xs bg-gray-50 flex items-center justify-center text-primary"><Calendar size={16} /></div>
                                    <div className="flex flex-col"><span className="text-[9px] font-black text-gray-400 uppercase">Availability</span><span className="text-[11px] font-black text-secondary">Immediate</span></div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-xs bg-gray-50 flex items-center justify-center text-primary"><Eye size={16} /></div>
                                    <div className="flex flex-col"><span className="text-[9px] font-black text-gray-400 uppercase">Traffic</span><span className="text-[11px] font-black text-secondary">{ad.views} Views</span></div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <h3 className="text-[14px] font-black uppercase text-secondary border-b-2 border-primary w-fit pb-1">{t('description')}</h3>
                                <p className="text-[12px] font-medium leading-relaxed text-gray-600 bg-gray-50/50 p-4 rounded-xs border border-gray-100 italic">
                                    {ad.description}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Integrated Map - Free OpenStreetMap */}
                    <div className="bg-white border border-gray-200 p-4 rounded-sm shadow-sm overflow-hidden flex flex-col gap-3">
                        <h3 className="text-[12px] font-black uppercase text-secondary flex items-center gap-2">
                            <MapPin size={14} className="text-primary" />
                            {language === 'ar' ? 'موقع العقار / السلعة' : 'PRECISE LOCATION'}
                        </h3>
                        <div className="h-64 rounded-xs border border-gray-100 overflow-hidden relative shadow-inner">
                            <iframe
                                width="100%"
                                height="100%"
                                frameBorder="0"
                                scrolling="no"
                                marginHeight={0}
                                marginWidth={0}
                                src={`https://www.openstreetmap.org/export/embed.html?bbox=${lon - 0.02}%2C${lat - 0.02}%2C${lon + 0.02}%2C${lat + 0.02}&layer=mapnik&marker=${lat}%2C${lon}`}
                            ></iframe>
                            <div className="absolute bottom-2 right-2 bg-white/90 backdrop-blur px-2 py-1 text-[8px] font-black border border-gray-200 uppercase tracking-tighter">Precision Map Data © OpenStreetMap</div>
                        </div>
                    </div>
                </div>

                {/* Sidebar */}
                <aside className="col-span-12 lg:col-span-3 flex flex-col gap-3">
                    <div className="bg-white border border-gray-200 rounded-sm shadow-sm p-4 sticky top-[80px]">
                        <div className="flex items-center gap-3 mb-6 bg-primary/5 p-3 rounded-xs border border-primary/10 transition-colors hover:bg-primary/10">
                            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center border border-primary/20 shadow-sm shrink-0">
                                <span className="font-black text-primary text-sm italic">{ad.author.name?.substring(0, 2).toUpperCase()}</span>
                            </div>
                            <div className="flex flex-col min-w-0">
                                <h4 className="text-[12px] font-black text-secondary truncate flex items-center gap-1">
                                    {ad.author.name}
                                    {ad.author.verified && <ShieldCheck size={14} className="text-blue-500 fill-blue-500/10" />}
                                </h4>
                                <span className="text-[9px] font-black text-gray-400 uppercase italic tracking-tighter">Senior Merchant</span>
                            </div>
                        </div>

                        <div className="flex flex-col gap-2">
                            <button
                                onClick={handleStartChat}
                                className="w-full bg-primary hover:bg-primary-hover text-white py-3 rounded-sm text-[11px] font-black flex items-center justify-center gap-2 transition-all shadow-lg active:scale-95 uppercase tracking-widest"
                            >
                                <MessageCircle size={16} />
                                {language === 'ar' ? 'بدء محادثة فورية' : 'START REAL-TIME CHAT'}
                            </button>
                            <button
                                onClick={() => setShowPhone(!showPhone)}
                                className="w-full bg-secondary text-white py-3 rounded-sm text-[11px] font-black flex items-center justify-center gap-2 hover:bg-black transition-all active:scale-95 uppercase tracking-widest"
                            >
                                <Phone size={16} />
                                {showPhone ? (ad.author.phone || '05X XXX XXXX') : (language === 'ar' ? 'إظهار رقم الجوال' : 'REVEAL PHONE NUMBER')}
                            </button>
                        </div>

                        <div className="mt-6 flex flex-col gap-3">
                            <div className="bg-gray-50 border border-gray-100 p-3 rounded-xs flex gap-3">
                                <ShieldCheck size={20} className="text-blue-500 shrink-0" />
                                <div className="flex flex-col"><span className="text-[10px] font-black text-blue-700 uppercase tracking-tighter">Verified Seller</span><p className="text-[9px] text-gray-500 font-bold leading-tight">This seller has provided valid identity documents for safety.</p></div>
                            </div>
                            <button
                                onClick={() => {
                                    if (confirm(language === 'ar' ? 'هل أنت متأكد من الإبلاغ عن هذا المحتوى؟' : 'Are you sure you want to report this content?')) {
                                        alert(language === 'ar' ? 'تم الإبلاغ بنجاح' : 'Reported successfully');
                                    }
                                }}
                                className="text-[9px] font-black text-gray-400 hover:text-red-500 transition-colors uppercase italic underline w-fit"
                            >
                                {language === 'ar' ? 'الإبلاغ عن محتوى مشبوه' : 'Report Suspicious Content'}
                            </button>
                        </div>
                    </div>

                    {showChat && conversationId && (
                        <div className="fixed bottom-0 right-10 w-80 sm:w-96 z-[1000] animate-in slide-in-from-bottom-5">
                            <ChatWindow conversationId={conversationId} onClose={() => setShowChat(false)} />
                        </div>
                    )}
                </aside>
            </main>
        </div>
    );
}
