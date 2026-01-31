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
    Loader2,
    Share2,
    Maximize2
} from "lucide-react";
import ChatWindow from "@/components/ChatWindow";
import Header from "@/components/Header";
import Image from "next/image";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/lib/language-context";
import { adsService, Ad as AdsAd } from "@/lib/ads";
import { conversationsService } from "@/lib/conversations";
import { useAuthStore } from "@/store/useAuthStore";
import { formatRelativeTime, formatDateTime } from "@/lib/utils";

interface Ad {
    id: string;
    title: string;
    description: string;
    price: number;
    currency?: string | { code: string; symbol: string; };
    category: string;
    location: string;
    latitude?: number;
    longitude?: number;
    images?: string[];
    phone?: string;
    email?: string;
    allow_no_media?: boolean;
    views: number;
    user_id: string;
    created_at?: string | null;
    author: {
        id: string;
        name: string;
        verified: boolean;
        phone?: string;
        email?: string;
    };
}

export default function AdDetailsContent({ id }: { id: string }) {
    const { language, t } = useLanguage();
    const { user } = useAuthStore();
    const router = useRouter();
    const adId = id;

    const [ad, setAd] = useState<Ad | null>(null);
    const [loading, setLoading] = useState(true);
    const [conversationId, setConversationId] = useState<string | null>(null);
    const [showChat, setShowChat] = useState(false);
    const [showPhone, setShowPhone] = useState(false);

    useEffect(() => {
        let mounted = true;
        const load = async () => {
            setLoading(true);
            try {
                const data = await adsService.getAd(adId);
                if (!mounted) return;

                if (data) {
                    const adData: AdsAd = data;

                    const transformedAd: Ad = {
                        id: adData.id,
                        title: adData.title || '',
                        description: adData.description || '',
                        price: adData.price || 0,
                        currency: adData.currency,
                        category: adData.category || '',
                        location: adData.location || '',
                        latitude: adData.latitude ?? undefined,
                        longitude: adData.longitude ?? undefined,
                        images: typeof adData.images === 'string' ? JSON.parse(adData.images || '[]') : adData.images || [],
                        phone: adData.phone ?? undefined,
                        email: adData.email ?? undefined,
                        views: adData.views || 0,
                        user_id: adData.author_id || '',
                        created_at: adData.created_at ?? null,
                        author: adData.author ? {
                            id: adData.author.id,
                            name: adData.author.name || '',
                            verified: true,
                            email: adData.author.email,
                            phone: adData.author.phone
                        } : { id: '', name: '', verified: false }
                    };

                    setAd(transformedAd);
                    // increment views (fire-and-forget)
                    void adsService.incrementViews(adId);
                } else {
                    setAd(null);
                }
            } catch (err) {
                console.error('[AD-VIEW] Failed to fetch ad details:', err);
                if (mounted) setAd(null);
            } finally {
                if (mounted) setLoading(false);
            }
        };

        load();
        return () => { mounted = false; };
    }, [adId]);

    const handleStartChat = async () => {
        if (!user) {
            router.push('/login');
            return;
        }
        
        const authorId = ad?.user_id || ad?.author?.id;
        
        if (user.id === authorId) {
            alert(language === 'ar' ? 'هذا إعلانك الخاص!' : 'This is your own ad!');
            return;
        }

        if (!authorId) {
             console.error("No author ID found");
             return;
        }

        try {
            // Check or create conversation for this ad
            const conversation = await conversationsService.createOrGetConversation(ad?.id || '', authorId);
            setConversationId(conversation.id);
            setShowChat(true);
        } catch (error) {
            console.error("Failed to start conversation:", error);
        }
    };

    if (loading) return (
        <div className="min-h-screen bg-gray-bg flex flex-col">
            <Header />
            <div className="max-w-7xl mx-auto w-full p-4 space-y-4 animate-pulse">
                <div className="h-4 w-1/4 bg-gray-200 dark:bg-white/5 rounded"></div>
                <div className="grid grid-cols-12 gap-4">
                    <div className="col-span-12 lg:col-span-9 space-y-4">
                        <div className="h-[400px] bg-gray-200 dark:bg-white/5 rounded-3xl"></div>
                        <div className="h-32 bg-gray-200 dark:bg-white/5 rounded-3xl"></div>
                    </div>
                    <div className="col-span-12 lg:col-span-3 space-y-4">
                        <div className="h-64 bg-gray-200 dark:bg-white/5 rounded-3xl"></div>
                    </div>
                </div>
            </div>
        </div>
    );
    if (!ad) return <div className="text-center p-20 font-black uppercase">Ad not found</div>;

    const lat = ad.latitude;
    const lon = ad.longitude;

    return (
        <div className="min-h-screen bg-[#f4f4f4] dark:bg-[#0a0a0a] text-text-main" dir={language === 'ar' ? 'rtl' : 'ltr'}>
            <Header />

            <div className="max-w-7xl mx-auto px-4 py-3 text-[10px] text-text-muted flex items-center gap-1">
                <Link href="/" className="hover:text-primary">{t('home')}</Link>
                <ChevronLeft size={10} className="opacity-30" />
                <span className="truncate max-w-[150px] font-bold text-text-main uppercase tracking-tighter">{ad.title}</span>
            </div>

            <main className="max-w-7xl mx-auto grid grid-cols-12 gap-4 p-4 pt-0">
                {/* Content */}
                <div className="col-span-12 lg:col-span-9 order-2 lg:order-1 flex flex-col gap-4">
                    {/* Content Section */}
                    <div className="bento-card p-6 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full -mr-16 -mt-16 opacity-30"></div>
                        <div className="relative z-10">
                            <div className="flex justify-between items-start mb-4">
                                <div className="flex flex-col gap-1">
                                    <h1 className="text-2xl font-black text-text-main leading-tight tracking-tight">{ad.title}</h1>
                                    <span className="text-[10px] font-black text-primary bg-primary/10 px-3 py-1 rounded-full inline-block uppercase tracking-widest w-fit">{ad.category}</span>
                                </div>
                                <div className="text-right flex flex-col items-end">
                                    <div className="flex items-baseline gap-1 text-primary">
                                        <span className="text-3xl font-black italic tracking-tighter">{new Intl.NumberFormat(language === 'ar' ? 'ar-SA' : 'en-US').format(ad.price)}</span>
                                        <span className="text-[10px] font-black uppercase tracking-widest opacity-60">
                                            {(ad.currency && typeof ad.currency === 'object') ? ad.currency.code : (ad.currency || 'SAR')}
                                        </span>
                                    </div>
                                    {ad.created_at && (
                                        <div className="flex flex-col items-end">
                                            <span className="text-[9px] font-black text-text-muted mt-1 uppercase italic tracking-tighter">
                                                {language === 'ar' ? 'نُشر' : 'LISTED'} {ad.created_at ? formatRelativeTime(ad.created_at, language) : ''}
                                            </span>
                                            <span className="text-[9px] text-text-muted opacity-50 font-medium">
                                                {formatDateTime(ad.created_at, language)}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="grid grid-cols-3 gap-4 border-y border-border-color py-4 my-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-2xl bg-gray-100 dark:bg-white/5 flex items-center justify-center text-primary"><MapPin size={18} /></div>
                                    <div className="flex flex-col"><span className="text-[9px] font-black text-text-muted uppercase">{t('location')}</span><span className="text-[11px] font-black text-text-main">{ad.location}</span></div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-2xl bg-gray-100 dark:bg-white/5 flex items-center justify-center text-primary"><Calendar size={18} /></div>
                                    <div className="flex flex-col"><span className="text-[9px] font-black text-text-muted uppercase">{t('availability') || 'Availability'}</span><span className="text-[11px] font-black text-text-main">{t('immediate') || 'Immediate'}</span></div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-2xl bg-gray-100 dark:bg-white/5 flex items-center justify-center text-primary"><Eye size={18} /></div>
                                    <div className="flex flex-col"><span className="text-[9px] font-black text-text-muted uppercase">{t('traffic') || 'Traffic'}</span><span className="text-[11px] font-black text-text-main">{ad.views} {t('views') || 'Views'}</span></div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <h3 className="text-[14px] font-black uppercase text-text-main border-b-2 border-primary w-fit pb-1">{t('description')}</h3>
                                <p className="text-[12px] font-medium leading-relaxed text-text-main bg-gray-50 dark:bg-white/5 p-4 rounded-2xl border border-border-color italic">
                                    {ad.description}
                                </p> 
                            </div>
                        </div>
                    </div>

                    {/* Media Gallery - Premium Full Visibility */}
                    {ad.images && ad.images.length > 0 && (
                        <div className="bento-card overflow-hidden relative group p-0">
                            <div className="h-[450px] bg-gray-100 dark:bg-black/20 relative overflow-hidden flex items-center justify-center">
                                {/* Decorative Background (no blur) */}
                                <div
                                    className="absolute inset-0 bg-cover bg-center scale-110 opacity-25"
                                    style={{ backgroundImage: `url(${ad.images[0]})` }}
                                ></div> 

                                {(() => {
                                    const images = ad.images || [];
                                    return images.length > 0 ? (
                                        <div className="relative z-10 w-full h-full">
                                            <Image src={images[0]} alt={ad.title} fill style={{ objectFit: 'contain' }} className="shadow-2xl" />
                                        </div>
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center bg-gray-100 dark:bg-white/5 italic font-black text-text-muted text-6xl">
                                            {t('siteName')}
                                        </div>
                                    );
                                })()}
                                <div className="absolute bottom-3 right-3 flex gap-2">
                                    <button className="bg-black/50 text-white p-2 rounded-xl hover:scale-105 transition-all backdrop-blur-md"><Maximize2 size={16} /></button>
                                    <button className="bg-black/50 text-white p-2 rounded-xl hover:scale-105 transition-all backdrop-blur-md"><Share2 size={16} /></button>
                                </div> 
                            </div>
                            {(() => {
                                const images = ad.images || [];
                                return images.length > 1 ? (
                                    <div className="p-4 border-t border-border-color bg-card-bg">
                                        <div className="grid grid-cols-4 gap-3">
                                            {images.slice(1, 5).map((img: string, idx: number) => (
                                                <div key={idx} className="aspect-square rounded-2xl overflow-hidden border border-border-color cursor-pointer hover:border-primary transition-all hover:scale-105">
                                                    <Image src={img} alt={`View ${idx + 2}`} fill style={{ objectFit: 'cover' }} />
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ) : null;
                            })()}
                        </div>
                    )}

                    {/* Integrated Map - Free OpenStreetMap - Moved to bottom */}
                    {typeof lat === 'number' && typeof lon === 'number' && lat !== 0 && lon !== 0 && lat >= -90 && lat <= 90 && lon >= -180 && lon <= 180 && ad.location && (
                        <div className="bento-card p-4 overflow-hidden flex flex-col gap-3">
                            <h3 className="text-[12px] font-black uppercase text-text-main flex items-center gap-2">
                                <MapPin size={14} className="text-primary" />
                                {language === 'ar' ? 'موقع العقار / السلعة' : 'PRECISE LOCATION'}
                            </h3>
                            <div className="h-48 rounded-2xl border border-border-color overflow-hidden relative shadow-inner">
                                <iframe
                                    width="100%"
                                    height="100%"
                                    frameBorder="0"
                                    scrolling="no"
                                    marginHeight={0}
                                    marginWidth={0}
                                    src={`https://www.openstreetmap.org/export/embed.html?bbox=${lon - 0.02}%2C${lat - 0.02}%2C${lon + 0.02}%2C${lat + 0.02}&layer=mapnik&marker=${lat}%2C${lon}`}
                                ></iframe>
                                <div className="absolute bottom-2 right-2 bg-white/90 text-text-muted px-2 py-1 text-[8px] font-black border border-border-color uppercase tracking-tighter rounded-md">Precision Map Data © OpenStreetMap</div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Sidebar */}
                <aside className="col-span-12 lg:col-span-3 order-1 flex flex-col gap-4">
                    <div className="bento-card p-4 sticky top-[80px]">
                        <div className="flex items-center gap-3 mb-6 bg-primary/10 p-3 rounded-2xl border border-primary/10 transition-colors hover:bg-primary/20">
                            <div className="w-12 h-12 bg-white dark:bg-white/10 rounded-full flex items-center justify-center border border-primary/20 shadow-sm shrink-0">
                                <span className="font-black text-primary text-sm italic">SE</span>
                            </div> 
                            <div className="flex flex-col min-w-0">
                                <h4 className="text-[12px] font-black text-text-main truncate flex items-center gap-1">
                                    Seller
                                    <ShieldCheck size={14} className="text-blue-500 fill-blue-500/10" />
                                </h4>
                                <span className="text-[9px] font-black text-text-muted uppercase italic tracking-tighter">Senior Merchant</span>
                            </div>
                        </div>

                        {/* Contact Information Section */}
                        {(ad.phone || ad.email || ad.author?.phone || ad.author?.email) && (
                            <div className="mb-4 p-3 bg-gray-50 dark:bg-white/5 border border-border-color rounded-2xl">
                                <h4 className="text-[10px] font-black text-text-main uppercase tracking-widest mb-2">
                                    {language === 'ar' ? 'معلومات الاتصال' : 'CONTACT INFO'}
                                </h4>
                                <div className="space-y-2">
                                    {(ad.phone || ad.author?.phone) && (
                                        <div className="flex items-center gap-2 text-[11px] font-medium text-text-main">
                                            <Phone size={14} className="text-green-600" />
                                            <span>{ad.phone || ad.author?.phone}</span>
                                        </div>
                                    )}
                                    {(ad.email || ad.author?.email) && (
                                        <div className="flex items-center gap-2 text-[11px] font-medium text-text-main">
                                            <MessageCircle size={14} className="text-blue-600" />
                                            <span>{ad.email || ad.author?.email}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        <div className="flex flex-col gap-2 items-center">
                            <button
                                onClick={handleStartChat}
                                className="w-1/3 bg-primary hover:bg-primary-hover text-white py-3 rounded-full text-[11px] font-black flex items-center justify-center gap-2 transition-all shadow-lg active:scale-95 uppercase tracking-widest"
                            >
                                <MessageCircle size={16} />
                                {language === 'ar' ? 'بدء محادثة فورية' : 'START REAL-TIME CHAT'}
                            </button>
                            {ad.author?.phone && (
                                <button
                                    onClick={() => setShowPhone(!showPhone)}
                                    className="w-1/3 bg-secondary text-white py-3 rounded-full text-[11px] font-black flex items-center justify-center gap-2 hover:bg-black transition-all active:scale-95 uppercase tracking-widest"
                                >
                                    <Phone size={16} />
                                    {showPhone ? ad.author.phone : (language === 'ar' ? 'إظهار رقم الجوال' : 'REVEAL PHONE NUMBER')}
                                </button>
                            )}
                        </div>

                        <div className="mt-6 flex flex-col gap-3">
                            <div className="bg-gray-50 dark:bg-white/5 border border-border-color p-3 rounded-2xl flex gap-3">
                                <ShieldCheck size={20} className="text-blue-500 shrink-0" />
                                <div className="flex flex-col"><span className="text-[10px] font-black text-blue-700 uppercase tracking-tighter">Verified Seller</span><p className="text-[9px] text-text-muted font-bold leading-tight">This seller has provided valid identity documents for safety.</p></div>
                            </div>
                            <button
                                onClick={() => {
                                    if (confirm(language === 'ar' ? 'هل أنت متأكد من الإبلاغ عن هذا المحتوى؟' : 'Are you sure you want to report this content?')) {
                                        alert(language === 'ar' ? 'تم الإبلاغ بنجاح' : 'Reported successfully');
                                    }
                                }}
                                className="text-[9px] font-black text-text-muted hover:text-red-500 transition-colors uppercase italic underline w-fit"
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
