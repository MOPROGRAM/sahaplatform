"use client";

// export const runtime = 'edge';

import { useAuthStore } from "@/store/useAuthStore";
import { useState, useEffect, useCallback } from "react";
import {
    LayoutDashboard,
    Package,
    MessageSquare,
    Settings,
    LogOut,
    Eye,
    TrendingUp,
    Clock,
    Loader2,
    PlusCircle,
    ShieldCheck,
    Edit,
    Trash2,
    Zap,
    Calendar,
    DollarSign,
    Bell,
    ArrowLeft,
    X,
    AlertTriangle,
    Headphones
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { adsService } from "@/lib/ads";
import { useLanguage } from "@/lib/language-context";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function DashboardPage() {
    const { language, t } = useLanguage();
    const { user, logout } = useAuthStore();
    const router = useRouter();
    const [activeTab, setActiveTab] = useState('overview');
    const [ads, setAds] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState([
        { label: "Views", value: "0", icon: <Eye size={12} />, color: "text-blue-500" },
        { label: "Messages", value: "0", icon: <MessageSquare size={12} />, color: "text-green-500" },
        { label: "Listings", value: "0", icon: <Package size={12} />, color: "text-primary" },
        { label: "Growth", value: "0%", icon: <TrendingUp size={12} />, color: "text-purple-500" },
    ]);
    const [deleteModal, setDeleteModal] = useState<{ open: boolean; adId: string | null; adTitle: string }>({ open: false, adId: null, adTitle: '' });
    const [promoteModal, setPromoteModal] = useState<{ open: boolean; adId: string | null; adTitle: string; days: number }>({ open: false, adId: null, adTitle: '', days: 1 });
    const [processing, setProcessing] = useState(false);

    // Buy Points State
    const [showBuyPoints, setShowBuyPoints] = useState(false);
    const [selectedPlan, setSelectedPlan] = useState<any>(null);
    const [paymentStep, setPaymentStep] = useState(false);
    const [buyPointsFormData, setBuyPointsFormData] = useState({
        name: '',
        email: '',
        phone: '',
        message: '',
        cardNumber: '',
        expiry: '',
        cvc: ''
    });
    const [paymentMethod, setPaymentMethod] = useState<'card' | 'email'>('card');
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const plans = [
        {
            name: t('pointsPack1'),
            points: 10,
            price: '7.5 SAR (2 USD)',
            description: t('pointsPack1Desc'),
            features: [`10 ${t('points')}`, t('promoteAdDesc'), t('verifiedBadge')],
            color: 'bg-blue-500'
        },
        {
            name: t('pointsPack2'),
            points: 100,
            price: '70 SAR',
            description: t('pointsPack2Desc'),
            features: [`100 ${t('points')}`, language === 'ar' ? 'ط·آ®ط·آµط¸â€¦ 7%' : '7% Discount', t('detailedAnalytics')],
            popular: true,
            color: 'bg-purple-600'
        },
        {
            name: t('pointsPack3'),
            points: 500,
            price: '300 SAR',
            description: t('pointsPack3Desc'),
            features: [`500 ${t('points')}`, language === 'ar' ? 'ط·آ®ط·آµط¸â€¦ 20%' : '20% Discount', t('dedicatedSupport')],
            color: 'bg-amber-500'
        }
    ];

    const openBuyPoints = () => {
        setBuyPointsFormData({
            ...buyPointsFormData,
            name: user?.name || '',
            email: user?.email || '',
            phone: (user as any).phone || '',
        });
        setShowBuyPoints(true);
        setPaymentStep(false);
        setSelectedPlan(null);
    };

    const handleBuyPointsNext = (e: React.FormEvent) => {
        e.preventDefault();
        setPaymentStep(true);
    };

    const handleBuyPointsSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedPlan) return;
        setProcessing(true);

        try {
            let finalMessage = buyPointsFormData.message;
            let requestType = 'buy_points';
            
            if (selectedPlan.manual) {
                requestType = 'manual_request';
            } else if (paymentMethod === 'card') {
                // Simulate Payment
                await new Promise(resolve => setTimeout(resolve, 2000));
                const transactionId = `txn_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
                finalMessage = `${buyPointsFormData.message}\n\n[System] Payment Verified via Visa\nTransaction ID: ${transactionId}\nCard: **** **** **** ${buyPointsFormData.cardNumber.slice(-4) || '0000'}`;
            } else {
                 // Email Request
                 finalMessage = `${buyPointsFormData.message}\n\n[System] Payment Method: Email Request (Resend)\nStatus: Pending Payment`;
            }

            const response = await fetch('/api/subscribe', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userName: buyPointsFormData.name,
                    userEmail: buyPointsFormData.email,
                    userPhone: buyPointsFormData.phone,
                    packageName: selectedPlan.name,
                    packagePrice: selectedPlan.price,
                    pointsAmount: selectedPlan.points,
                    requestType: requestType,
                    message: finalMessage,
                    userId: user?.id
                }),
            });

            if (response.ok) {
                alert(t('requestSentSuccessfully'));
                setShowBuyPoints(false);
                // Refresh points
                const { checkUser } = useAuthStore.getState();
                if (checkUser) await checkUser();
            } else {
                const result = await response.json();
                alert(`${t('error')}: ${result.error}`);
            }
        } catch (error) {
            alert(t('failedToSendRequest'));
        } finally {
            setProcessing(false);
        }
    };

    const handleManualRequest = () => {
        setSelectedPlan({
            name: language === 'ar' ? 'ط·آ·ط¸â€‍ط·آ¨ ط·آ´ط·آ±ط·آ§ط·طŒ ط¸â€ ط¸â€ڑط·آ§ط·آ· ط¸ظ¹ط·آ¯ط¸ث†ط¸ظ¹ط·آ§ط¸â€¹' : 'Manual Points Purchase',
            price: language === 'ar' ? 'ط·آ­ط·آ³ط·آ¨ ط·آ§ط¸â€‍ط·آ§ط·ع¾ط¸ظ¾ط·آ§ط¸â€ڑ' : 'TBD',
            points: 0,
            description: language === 'ar' ? 'ط·ع¾ط¸ث†ط·آ§ط·آµط¸â€‍ ط¸â€¦ط·آ¹ط¸â€ ط·آ§ ط¸â€‍ط·ع¾ط·آ­ط·آ¯ط¸ظ¹ط·آ¯ ط·آ§ط¸â€‍ط·آ¨ط·آ§ط¸â€ڑط·آ© ط·آ§ط¸â€‍ط¸â€¦ط¸â€ ط·آ§ط·آ³ط·آ¨ط·آ©' : 'Contact us to determine the suitable package',
            features: [],
            manual: true
        });
        setPaymentStep(true);
    };


    const getRelativeTime = (date: string) => {
        const now = Date.now();
        const created = new Date(date).getTime();
        const diff = now - created;

        const minutes = Math.floor(diff / (1000 * 60));
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));

        if (minutes < 60) return `${minutes}m ago`;
        if (hours < 24) return `${hours}h ago`;
        return `${days}d ago`;
    };

    const fetchDashboardData = useCallback(async () => {
        try {
            const myAds = await adsService.getMyAds();
            const activeAdsOnly = Array.isArray(myAds) ? myAds.filter((ad: any) => ad.is_active) : [];
            setAds(activeAdsOnly as any);

            const totalViews = activeAdsOnly.reduce((acc: number, ad: any) => acc + (ad.views || 0), 0);
            const activeAds = activeAdsOnly.length;

            setStats([
                { label: language === 'ar' ? "ط·آ±ط·آµط¸ظ¹ط·آ¯ ط·آ§ط¸â€‍ط¸â€ ط¸â€ڑط·آ§ط·آ·" : "Points Balance", value: (user?.points || 0).toString(), icon: <Zap size={12} />, color: "text-yellow-500" },
                { label: language === 'ar' ? "ط·آ§ط¸â€‍ط¸â€¦ط·آ´ط·آ§ط¸â€،ط·آ¯ط·آ§ط·ع¾" : "Views", value: totalViews.toString(), icon: <Eye size={12} />, color: "text-blue-500" },
                { label: language === 'ar' ? "ط·آ§ط¸â€‍ط·آ¥ط·آ¹ط¸â€‍ط·آ§ط¸â€ ط·آ§ط·ع¾" : "Listings", value: activeAds.toString(), icon: <Package size={12} />, color: "text-primary" },
                { label: language === 'ar' ? "ط·آ§ط¸â€‍ط¸â€ ط¸â€¦ط¸ث†" : "Growth", value: "+12%", icon: <TrendingUp size={12} />, color: "text-purple-500" },
            ]);
        } catch (error) {
            console.error("Failed to fetch dashboard data:", error);
        } finally {
            setLoading(false);
        }
    }, [language]);

    useEffect(() => {
        if (!user) {
            router.push('/login');
            return;
        }
        fetchDashboardData();
    }, [user, router, activeTab, fetchDashboardData]);

    const handleContactSupport = async () => {
        setProcessing(true);
        try {
            const token = useAuthStore.getState().token;
            const res = await fetch('/api/support/chat', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || 'Failed to start support chat');
            }
            
            const data = await res.json();
            router.push(`/messages?id=${data.conversationId}`);
        } catch (error: any) {
            console.error("Support chat error:", error);
            alert(language === 'ar' ? 'ط·آ¹ط·آ°ط·آ±ط·آ§ط¸â€¹ط·إ’ ط·آ­ط·آ¯ط·آ« ط·آ®ط·آ·ط·آ£ ط·آ£ط·آ«ط¸â€ ط·آ§ط·طŒ ط·آ§ط¸â€‍ط·آ§ط·ع¾ط·آµط·آ§ط¸â€‍ ط·آ¨ط·آ§ط¸â€‍ط·آ¯ط·آ¹ط¸â€¦' : 'Error connecting to support');
        } finally {
            setProcessing(false);
        }
    };

    const deleteAd = async (adId: string) => {
        try {
            await adsService.deleteAd(adId);
            fetchDashboardData();
            setDeleteModal({ open: false, adId: null, adTitle: '' });
        } catch (error) {
            console.error("Failed to delete ad:", error);
            alert(language === 'ar' ? 'ط¸ظ¾ط·آ´ط¸â€‍ ط¸ظ¾ط¸ظ¹ ط·آ­ط·آ°ط¸ظ¾ ط·آ§ط¸â€‍ط·آ¥ط·آ¹ط¸â€‍ط·آ§ط¸â€ ' : 'Failed to delete ad');
        }
    };

    const handlePromote = async () => {
        if (!promoteModal.adId) return;
        setProcessing(true);
        try {
            await adsService.promoteAd(promoteModal.adId, promoteModal.days);
            await fetchDashboardData();
            // Refresh user points
            const { checkUser } = useAuthStore.getState();
            if (checkUser) await checkUser();
            
            setPromoteModal({ open: false, adId: null, adTitle: '', days: 1 });
            alert(language === 'ar' ? 'ط·ع¾ط¸â€¦ ط·ع¾ط·آ±ط¸ث†ط¸ظ¹ط·آ¬ ط·آ§ط¸â€‍ط·آ¥ط·آ¹ط¸â€‍ط·آ§ط¸â€  ط·آ¨ط¸â€ ط·آ¬ط·آ§ط·آ­' : 'Ad promoted successfully');
        } catch (error: any) {
            alert(error.message);
        } finally {
            setProcessing(false);
        }
    };

    const openDeleteModal = (adId: string, adTitle: string) => {
        setDeleteModal({ open: true, adId, adTitle });
    };

    const closeDeleteModal = () => {
        setDeleteModal({ open: false, adId: null, adTitle: '' });
    };

    if (!user) return null;

    if (!mounted) return <div className="min-h-screen bg-background"></div>;

    return (
        <div className="min-h-screen flex flex-col bg-gray-bg">
            <Header />

            <div className="max-w-[1920px] mx-auto w-full flex-1 flex flex-col md:flex-row gap-4 p-4">
                <aside className="w-full md:w-56 space-y-3 shrink-0">
                    <div className="depth-card p-5 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-16 h-16 bg-primary/5 rounded-full -mr-8 -mt-8 group-hover:scale-150 transition-transform"></div>
                        <div className="relative z-10 text-center">
                            <div className="w-14 h-14 bg-white border border-primary/20 rounded-full mx-auto mb-3 flex items-center justify-center shadow-lg">
                                <span className="text-lg font-black text-primary italic">{user.name?.substring(0, 2).toUpperCase()}</span>
                            </div>
                            <h4 className="text-[12px] font-black text-text-main uppercase tracking-tight truncate">{user.name}</h4>
                            <div className="flex items-center justify-center gap-1 mt-1 text-primary">
                                <ShieldCheck size={12} className="fill-primary/10" />
                                <span className="text-[8px] font-black uppercase tracking-widest">{user.role} MERCHANT</span>
                            </div>
                        </div>
                    </div>

                    <div className="depth-card p-3">
                        <div className="flex items-center gap-2 text-[10px] font-black text-gray-500 uppercase tracking-widest">
                            <div className="w-2 h-2 bg-emerald rounded-full animate-pulse"></div>
                            <span>ID: {user.id.substring(0, 8)}</span>
                        </div>
                    </div>

                    {(user.role === 'ADMIN' || user.email === 'motwasel@yahoo.com') && (
                        <Link href="/admin" className="w-full flex items-center gap-3 px-4 py-3 text-[10px] font-black uppercase tracking-widest text-white bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 transition-all rounded-sm shadow-lg mb-2">
                            <Settings size={14} />
                            <span>{language === 'ar' ? 'ط¸â€‍ط¸ث†ط·آ­ط·آ© ط·آ§ط¸â€‍ط¸â€¦ط·آ³ط·آ¤ط¸ث†ط¸â€‍' : 'Admin Panel'}</span>
                        </Link>
                    )}

                    <nav className="glass-card overflow-hidden">
                        {[
                            { label: t('overview'), icon: <LayoutDashboard size={14} />, id: 'overview' },
                            { label: t('myListings'), icon: <Package size={14} />, id: 'listings' },
                            { label: t('messages'), icon: <MessageSquare size={14} />, id: 'messages' },
                            { label: t('notifications'), icon: <Bell size={14} />, id: 'notifications' },
                            { label: t('settings'), icon: <Settings size={14} />, id: 'settings' },
                        ].map((item, i) => (
                            <button key={i} onClick={() => setActiveTab(item.id)} className={`w-full flex items-center gap-3 px-4 py-3 text-[10px] font-black uppercase tracking-widest border-b border-border-color last:border-0 transition-all ${activeTab === item.id ? 'text-primary bg-primary/[0.03] border-r-2 border-r-primary' : 'text-text-muted hover:bg-card/60 hover:text-secondary'}`}>
                                {item.icon}
                                <span>{item.label}</span>
                            </button>
                        ))}
                    </nav>

                    <button 
                        onClick={handleContactSupport}
                        disabled={processing}
                        className="w-full flex items-center gap-3 px-4 py-3 text-[10px] font-black uppercase tracking-widest text-blue-500 bg-card hover:bg-blue-50 transition-all border border-blue-100 rounded-sm mb-2"
                    >
                        {processing ? <Loader2 size={14} className="animate-spin" /> : <Headphones size={14} />}
                        <span>{language === 'ar' ? 'ط·ع¾ط¸ث†ط·آ§ط·آµط¸â€‍ ط¸â€¦ط·آ¹ ط·آ§ط¸â€‍ط·آ¯ط·آ¹ط¸â€¦' : 'Contact Support'}</span>
                    </button>

                    <button onClick={() => logout()} className="w-full flex items-center gap-3 px-4 py-3 text-[10px] font-black uppercase tracking-widest text-red-500 bg-card hover:bg-red-50 transition-all border border-red-100 rounded-sm">
                        <LogOut size={14} />
                        <span>{t('logout')}</span>
                    </button>
                </aside>

                <main className="flex-1 flex flex-col gap-4">
                    {activeTab === 'overview' && (
                        <>
                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                                    {stats.map((stat, i) => (
                                    <div key={i} className="glass-card p-4 flex flex-col gap-2 relative overflow-hidden group">
                                        <div className={`absolute bottom-0 right-0 w-12 h-12 ${stat.color} opacity-[0.03] -mr-4 -mb-4 group-hover:scale-150 transition-transform`}>{stat.icon}</div>
                                        <span className={`w-8 h-8 flex items-center justify-center rounded-xs bg-card ${stat.color} p-1 border border-black/5 shadow-inner`}>
                                            {stat.icon}
                                        </span>
                                        <div className="flex flex-col">
                                            <span className="text-2xl font-black italic tracking-tighter text-text-main leading-none">{stat.value}</span>
                                            <span className="text-[9px] font-black text-text-muted uppercase tracking-widest mt-1 opacity-60">{stat.label} Matrix</span>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="bg-card border border-border-color rounded-sm shadow-sm overflow-hidden flex-1 flex flex-col">
                                <div className="px-4 py-3 bg-card border-b border-border-color flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <Package size={14} className="text-primary" />
                                        <h3 className="text-[11px] font-black uppercase tracking-[0.1em] text-text-main">Operational Fleet / Listings</h3>
                                    </div>
                                    <div className="flex gap-2">
                                        <button 
                                            onClick={openBuyPoints} 
                                            className="bg-yellow-500 text-white text-[9px] font-black px-3 py-1.5 rounded-xs flex items-center gap-2 hover:bg-yellow-600 shadow-lg active:scale-95 transition-all"
                                        >
                                            <Zap size={12} /> {language === 'ar' ? 'ط·آ´ط·آ±ط·آ§ط·طŒ ط¸â€ ط¸â€ڑط·آ§ط·آ·' : 'Buy Points'}
                                        </button>
                                        <Link href="/post-ad" className="bg-primary text-white text-[9px] font-black px-3 py-1.5 rounded-xs flex items-center gap-2 hover:bg-primary-hover shadow-lg shadow-primary/20 active:scale-95 transition-all">
                                            <PlusCircle size={12} /> ADD UNIT
                                        </Link>
                                    </div>
                                </div>

                                <div className="bento-grid">
                                    {loading ? (
                                        <div className="depth-card h-64 flex items-center justify-center">
                                            <Loader2 className="animate-spin text-primary opacity-20" size={40} />
                                        </div>
                                    ) : ads.length > 0 ? (
                                        ads.map(ad => (
                                            <div key={ad.id} className={`depth-card p-4 ${ad.is_boosted ? 'bento-large' : 'bento-small'}`}>
                                                <div className="flex items-start justify-between mb-3">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 bg-card border border-border-color rounded-lg flex items-center justify-center shrink-0">
                                                            <Package size={18} className="text-text-muted" />
                                                        </div>
                                                        <div className="min-w-0 flex-1">
                                                            <h4 className="font-black text-text-main block truncate text-sm">{ad.title}</h4>
                                                            <div className="flex items-center gap-2 mt-1">
                                                                <span className="text-primary font-bold text-sm">
                                                                    {new Intl.NumberFormat(language === 'ar' ? 'ar-SA' : 'en-US').format(ad.price)} {ad.currency?.code || 'SAR'}
                                                                </span>
                                                                <span className="text-xs text-text-muted">{ad.category}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className={`px-2 py-0.5 rounded-full text-[8px] font-bold uppercase ${ad.is_active ? 'bg-green-500 text-white' : 'bg-gray-400 text-white'}`}>
                                                        {ad.is_active ? 'Active' : 'Paused'}
                                                    </div>
                                                </div>
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-4 text-xs text-text-muted">
                                                        <span className="flex items-center gap-1">
                                                            <Eye size={12} />
                                                            {ad.views || 0}
                                                        </span>
                                                        <span className="flex items-center gap-1">
                                                            <Clock size={12} />
                                                            {ad.created_at ? getRelativeTime(ad.created_at) : (language === 'ar' ? 'ط·ط›ط¸ظ¹ط·آ± ط¸â€¦ط·ع¾ط¸ث†ط¸ظ¾ط·آ±' : 'N/A')}
                                                        </span>
                                                    </div>
                                                    <div className="flex gap-2">
                                                        <Link href={`/ads/${ad.id}`} className="px-3 py-1 bg-secondary text-white rounded text-xs font-bold hover:bg-black transition-all">
                                                            View
                                                        </Link>
                                                        <Link href={`/ads/${ad.id}/edit`} className="px-3 py-1 bg-blue-500 text-white rounded text-xs font-bold hover:bg-blue-600 transition-all">
                                                            Edit
                                                        </Link>
                                                        <button 
                                                            onClick={() => {
                                                                setPromoteModal({ open: true, adId: ad.id, adTitle: ad.title, days: 1 });
                                                            }} 
                                                            className="px-3 py-1 bg-yellow-500 text-white rounded text-xs font-bold hover:bg-yellow-600 transition-all flex items-center gap-1"
                                                        >
                                                            <Zap size={12} /> Boost
                                                        </button>
                                                        <button onClick={() => openDeleteModal(ad.id, ad.title)} className="px-3 py-1 bg-red-500 text-white rounded text-xs font-bold hover:bg-red-600 transition-all">
                                                            Delete
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="depth-card flex-1 flex flex-col items-center justify-center text-text-muted gap-3 p-16">
                                            <div className="w-16 h-16 bg-card rounded-full flex items-center justify-center border border-border-color shadow-inner">
                                                <Package size={32} className="opacity-10" />
                                            </div>
                                            <div className="text-center">
                                                <h4 className="text-lg font-black uppercase tracking-wide text-text-muted">No Ads Found</h4>
                                                <p className="text-sm font-bold text-text-muted mt-1">Start your journey by posting your first ad</p>
                                            </div>
                                            <Link href="/post-ad" className="mt-4 bg-primary text-white text-sm font-black px-6 py-3 rounded-lg shadow-xl shadow-primary/20 hover:-translate-y-1 transition-all uppercase tracking-wide">
                                                Post Ad Now
                                            </Link>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </>
                    )}

                    {activeTab === 'listings' && (
                        <div className="bg-card border border-border-color rounded-sm shadow-sm overflow-hidden flex-1 flex flex-col">
                            <div className="px-4 py-3 bg-card/60 border-b border-border-color flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Package size={14} className="text-primary" />
                                    <h3 className="text-[11px] font-black uppercase tracking-[0.1em] text-text-main">My Listings</h3>
                                </div>
                                <Link href="/post-ad" className="bg-primary text-white text-[9px] font-black px-3 py-1.5 rounded-xs flex items-center gap-2 hover:bg-primary-hover shadow-lg shadow-primary/20 active:scale-95 transition-all">
                                    <PlusCircle size={12} /> ADD UNIT
                                </Link>
                            </div>

                            <div className="overflow-x-auto flex-1">
                                {loading ? (
                                    <div className="h-48 flex items-center justify-center"><Loader2 className="animate-spin text-primary" size={24} /></div>
                                ) : ads.length > 0 ? (
                                    <table className="w-full text-[10px] border-collapse">
                                        <thead>
                                            <tr className="bg-card/60 text-text-muted font-black uppercase text-[8px] tracking-widest border-b border-border-color">
                                                <th className="px-6 py-3 text-left">Unit Identification / Details</th>
                                                <th className="px-6 py-3 text-center">Status Matrix</th>
                                                <th className="px-6 py-3 text-center">Engagement</th>
                                                <th className="px-6 py-3 text-right">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-50">
                                            {ads.map(ad => (
                                                <tr key={ad.id} className="hover:bg-primary/[0.02] transition-colors group">
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-9 h-9 bg-card border border-border-color rounded-xs flex items-center justify-center shrink-0 shadow-inner group-hover:border-primary/20 transition-colors">
                                                                <Package size={16} className="text-gray-300 group-hover:text-primary transition-colors" />
                                                            </div>
                                                            <div className="min-w-0">
                                                                <span className="font-black text-text-main block truncate group-hover:text-primary transition-colors uppercase tracking-tight">{ad.title}</span>
                                                                <div className="flex items-center gap-2 mt-0.5">
                                                                    <span className="text-primary font-black italic">{new Intl.NumberFormat(language === 'ar' ? 'ar-SA' : 'en-US').format(ad.price)} {ad.currency?.code || 'SAR'}</span>
                                                                    <span className="w-1 h-1 bg-gray-200 rounded-full"></span>
                                                                    <span className="text-[8px] font-black text-text-muted uppercase tracking-tighter">{ad.category}</span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 text-center">
                                                        <div className="flex flex-col items-center gap-1">
                                                            <span className={`px-2 py-0.5 rounded-full text-[7px] font-black uppercase tracking-widest shadow-sm ${ad.isActive ? 'bg-green-500 text-white' : 'bg-gray-400 text-white'}`}>
                                                                {ad.isActive ? 'Operation: Active' : 'Operation: Pause'}
                                                            </span>
                                                            <span className="text-[7px] font-black text-gray-300 uppercase italic">Code: {ad.id?.substring(0, 8)}</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 text-center">
                                                        <span className="text-[13px] font-black text-text-main">{ad.views || 0}</span>
                                                    </td>
                                                    <td className="px-6 py-4 text-right">
                                                        <div className="flex items-center gap-1">
                                                            <Link href={`/ads/${ad.id}`} className="px-2 py-1 bg-secondary text-white rounded-xs text-[8px] font-black uppercase tracking-widest hover:bg-black transition-all shadow-sm">Inspect</Link>
                                                            <Link href={`/ads/${ad.id}/edit`} className="px-2 py-1 bg-blue-500 text-white rounded-xs text-[8px] font-black uppercase tracking-widest hover:bg-blue-600 transition-all shadow-sm">
                                                                <Edit size={10} />
                                                            </Link>
                                                            <button onClick={() => openDeleteModal(ad.id, ad.title)} className="px-2 py-1 bg-red-500 text-white rounded-xs text-[8px] font-black uppercase tracking-widest hover:bg-red-600 transition-all shadow-sm">
                                                                <Trash2 size={10} />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                ) : (
                                    <div className="flex-1 flex flex-col items-center justify-center text-text-muted gap-3 p-16">
                                        <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center border border-gray-100 shadow-inner">
                                            <Package size={32} className="opacity-10" />
                                        </div>
                                        <div className="text-center">
                                            <h4 className="text-[11px] font-black uppercase tracking-[0.2em] text-gray-300">No Listings Found</h4>
                                            <p className="text-[9px] font-bold text-gray-300 uppercase italic mt-1 font-cairo">Post your first ad now</p>
                                        </div>
                                        <Link href="/post-ad" className="mt-4 bg-primary text-white text-[9px] font-black px-6 py-2 rounded-xs shadow-xl shadow-primary/20 hover:-translate-y-1 transition-all uppercase tracking-widest">Post Ad Now</Link>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {activeTab === 'messages' && (
                        <div className="bg-white dark:bg-[#1a1a1a] border border-border-color p-6 rounded-sm shadow-sm text-center">
                            <MessageSquare size={48} className="text-gray-300 mx-auto mb-4" />
                            <h3 className="text-lg font-black text-text-muted uppercase tracking-tight">
                                {t('messages')}
                            </h3>
                            <p className="text-[12px] text-gray-500 mt-2">
                                {language === 'ar' ? 'ط¸â€‍ط·آ§ ط·ع¾ط¸ث†ط·آ¬ط·آ¯ ط·آ±ط·آ³ط·آ§ط·آ¦ط¸â€‍ ط·آ¬ط·آ¯ط¸ظ¹ط·آ¯ط·آ©' : 'no new messages'}
                            </p>
                        </div>
                    )}

                    {activeTab === 'notifications' && (
                        <div className="bg-white dark:bg-[#1a1a1a] border border-border-color p-6 rounded-sm shadow-sm">
                            <h3 className="text-lg font-black text-text-main uppercase tracking-tight mb-4">
                                {t('notifications')}
                            </h3>
                            <div className="space-y-3">
                                {/* Welcome Gift Notification */}
                                <div className="flex items-start gap-4 p-4 bg-primary/5 border border-primary/10 rounded-lg">
                                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                                        <Zap size={20} className="text-primary" />
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center justify-between mb-1">
                                            <h4 className="font-bold text-text-main text-sm">
                                                {language === 'ar' ? 'ط¸â€،ط·آ¯ط¸ظ¹ط·آ© ط·آ§ط¸â€‍ط·ع¾ط·آ±ط·آ­ط¸ظ¹ط·آ¨' : 'Welcome Gift'}
                                            </h4>
                                            <span className="text-[10px] text-text-muted">
                                                {user.created_at ? getRelativeTime(user.created_at) : ''}
                                            </span>
                                        </div>
                                        <p className="text-xs text-text-muted leading-relaxed">
                                            {language === 'ar' 
                                                ? 'ط¸â€¦ط·آ¨ط·آ±ط¸ث†ط¸ئ’! ط¸â€‍ط¸â€ڑط·آ¯ ط·آ­ط·آµط¸â€‍ط·ع¾ ط·آ¹ط¸â€‍ط¸â€° 10 ط¸â€ ط¸â€ڑط·آ§ط·آ· ط¸â€¦ط·آ¬ط·آ§ط¸â€ ط¸ظ¹ط·آ© ط·آ¨ط¸â€¦ط¸â€ ط·آ§ط·آ³ط·آ¨ط·آ© ط·ع¾ط·آ³ط·آ¬ط¸ظ¹ط¸â€‍ط¸ئ’ ط¸â€¦ط·آ¹ط¸â€ ط·آ§. ط·آ§ط·آ³ط·ع¾ط¸â€¦ط·ع¾ط·آ¹ ط·آ¨ط·ع¾ط·آ±ط¸ث†ط¸ظ¹ط·آ¬ ط·آ¥ط·آ¹ط¸â€‍ط·آ§ط¸â€ ط·آ§ط·ع¾ط¸ئ’!' 
                                                : 'Congratulations! You have received 10 free points for registering with us. Enjoy promoting your ads!'}
                                        </p>
                                    </div>
                                </div>

                                {/* Current Balance Notification */}
                                <div className="flex items-start gap-4 p-4 bg-card border border-border-color rounded-lg">
                                    <div className="w-10 h-10 rounded-full bg-yellow-500/10 flex items-center justify-center shrink-0">
                                        <DollarSign size={20} className="text-yellow-500" />
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center justify-between mb-1">
                                            <h4 className="font-bold text-text-main text-sm">
                                                {language === 'ar' ? 'ط·آ±ط·آµط¸ظ¹ط·آ¯ ط·آ§ط¸â€‍ط¸â€ ط¸â€ڑط·آ§ط·آ· ط·آ§ط¸â€‍ط·آ­ط·آ§ط¸â€‍ط¸ظ¹' : 'Current Points Balance'}
                                            </h4>
                                            <span className="text-[10px] text-text-muted">
                                                {language === 'ar' ? 'ط·آ§ط¸â€‍ط·آ¢ط¸â€ ' : 'Just now'}
                                            </span>
                                        </div>
                                        <p className="text-xs text-text-muted leading-relaxed">
                                            {language === 'ar'
                                                ? `ط¸â€‍ط·آ¯ط¸ظ¹ط¸ئ’ ط·آ­ط·آ§ط¸â€‍ط¸ظ¹ط·آ§ط¸â€¹ ${user.points || 0} ط¸â€ ط¸â€ڑط·آ·ط·آ© ط¸ظ¾ط¸ظ¹ ط·آ±ط·آµط¸ظ¹ط·آ¯ط¸ئ’. ط¸ظ¹ط¸â€¦ط¸ئ’ط¸â€ ط¸ئ’ ط·آ§ط·آ³ط·ع¾ط·آ®ط·آ¯ط·آ§ط¸â€¦ط¸â€،ط·آ§ ط¸â€‍ط·ع¾ط·آ±ط¸ث†ط¸ظ¹ط·آ¬ ط·آ¥ط·آ¹ط¸â€‍ط·آ§ط¸â€ ط·آ§ط·ع¾ط¸ئ’.`
                                                : `You currently have ${user.points || 0} points in your balance. You can use them to promote your ads.`}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'settings' && (
                        <div className="space-y-4">
                            <div className="bg-white dark:bg-[#1a1a1a] border border-border-color p-6 rounded-sm shadow-sm">
                                <h3 className="text-lg font-black text-text-main uppercase tracking-tight mb-4">
                                    {t('settings')}
                                </h3>
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between p-4 border border-border-color rounded-sm">
                                        <div>
                                            <h4 className="font-black text-text-main text-[14px]">
                                                {t('notifications')}
                                            </h4>
                                            <p className="text-[10px] text-gray-500">
                                                {language === 'ar' ? 'ط·ع¾ط¸â€‍ط¸â€ڑط¸ظ¹ ط·آ¥ط·آ´ط·آ¹ط·آ§ط·آ±ط·آ§ط·ع¾ ط·آ­ط¸ث†ط¸â€‍ ط·آ§ط¸â€‍ط·آ¥ط·آ¹ط¸â€‍ط·آ§ط¸â€ ط·آ§ط·ع¾ ط¸ث†ط·آ§ط¸â€‍ط·آ±ط·آ³ط·آ§ط·آ¦ط¸â€‍' : 'receive notifications about ads and messages'}
                                            </p>
                                        </div>
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input type="checkbox" className="sr-only peer" defaultChecked />
                                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                                        </label>
                                    </div>

                                    <div className="flex items-center justify-between p-4 border border-border-color rounded-sm">
                                        <div>
                                            <h4 className="font-black text-text-main text-[14px]">
                                                {language === 'ar' ? 'ط·آ§ط¸â€‍ط·آ®ط·آµط¸ث†ط·آµط¸ظ¹ط·آ©' : 'privacy'}
                                            </h4>
                                            <p className="text-[10px] text-gray-500">
                                                {language === 'ar' ? 'ط·آ¥ط·آ¸ط¸â€،ط·آ§ط·آ± ط¸â€¦ط·آ¹ط¸â€‍ط¸ث†ط¸â€¦ط·آ§ط·ع¾ ط·آ§ط¸â€‍ط·آ§ط·ع¾ط·آµط·آ§ط¸â€‍ ط¸â€‍ط¸â€‍ط·آ¬ط¸â€¦ط¸ظ¹ط·آ¹' : 'show contact information to everyone'}
                                            </p>
                                        </div>
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input type="checkbox" className="sr-only peer" />
                                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                                        </label>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </main>
            </div>
            <Footer />

            {showBuyPoints && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white dark:bg-[#1a1a1a] rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-border-color">
                        <div className="bg-primary/5 p-6 border-b border-border-color flex justify-between items-center">
                            <div>
                                <h3 className="text-lg font-black text-text-main uppercase tracking-tight">{t('buyPoints')}</h3>
                                {selectedPlan && <p className="text-sm text-text-muted mt-1">{selectedPlan.name} - {selectedPlan.price}</p>}
                            </div>
                            <button onClick={() => setShowBuyPoints(false)} className="text-text-muted hover:text-text-main transition-colors">
                                <ArrowLeft className={language === 'ar' ? 'rotate-180' : ''} />
                            </button>
                        </div>
                        
                        <div className="p-6">
                            {!selectedPlan ? (
                                <div className="space-y-4">
                                    {plans.map((plan, index) => (
                                        <div key={index} onClick={() => setSelectedPlan(plan)} className={`p-4 rounded-xl border cursor-pointer transition-all hover:border-primary hover:bg-primary/5 ${plan.popular ? 'border-primary ring-1 ring-primary/20' : 'border-border-color'}`}>
                                            <div className="flex justify-between items-center mb-2">
                                                <h4 className="font-bold text-text-main">{plan.name}</h4>
                                                <span className="font-black text-primary">{plan.price}</span>
                                            </div>
                                            <div className="text-xs text-text-muted">{plan.description}</div>
                                            <div className="mt-3 flex flex-wrap gap-2">
                                                {plan.features.map((feature, i) => (
                                                    <span key={i} className="text-[10px] bg-card px-2 py-1 rounded-full border border-border-color text-text-muted">{feature}</span>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                    <div className="mt-6 pt-4 border-t border-border-color">
                                        <button 
                                            onClick={handleManualRequest}
                                            className="w-full py-3 bg-gray-100 dark:bg-gray-800 text-text-main rounded-xl font-bold hover:bg-gray-200 dark:hover:bg-gray-700 transition-all text-sm"
                                        >
                                            {language === 'ar' ? 'ط·آ·ط¸â€‍ط·آ¨ ط·آ´ط·آ±ط·آ§ط·طŒ ط¸â€ ط¸â€ڑط·آ§ط·آ· ط¸ظ¹ط·آ¯ط¸ث†ط¸ظ¹ط·آ§ط¸â€¹' : 'Request Manual Points Purchase'}
                                        </button>
                                        <p className="text-[10px] text-center text-text-muted mt-2">
                                            {language === 'ar' ? 'ط·آ³ط¸ظ¹ط¸â€ڑط¸ث†ط¸â€¦ ط¸ظ¾ط·آ±ط¸ظ¹ط¸â€ڑط¸â€ ط·آ§ ط·آ¨ط·آ§ط¸â€‍ط·ع¾ط¸ث†ط·آ§ط·آµط¸â€‍ ط¸â€¦ط·آ¹ط¸ئ’ ط¸â€‍ط·آ¥ط·ع¾ط¸â€¦ط·آ§ط¸â€¦ ط·آ§ط¸â€‍ط·آ¹ط¸â€¦ط¸â€‍ط¸ظ¹ط·آ©' : 'Our team will contact you to complete the process'}
                                        </p>
                                    </div>
                                </div>
                            ) : !paymentStep ? (
                                <form onSubmit={handleBuyPointsNext} className="space-y-4">
                                    <div>
                                        <label className="block text-xs font-bold text-text-muted uppercase mb-1.5">{t('name')}</label>
                                        <input
                                            type="text"
                                            required
                                            value={buyPointsFormData.name}
                                            onChange={(e) => setBuyPointsFormData({...buyPointsFormData, name: e.target.value})}
                                            className="w-full px-4 py-3 bg-gray-50 dark:bg-[#111] border border-border-color rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-text-muted uppercase mb-1.5">{t('email')}</label>
                                        <input
                                            type="email"
                                            required
                                            value={buyPointsFormData.email}
                                            onChange={(e) => setBuyPointsFormData({...buyPointsFormData, email: e.target.value})}
                                            className="w-full px-4 py-3 bg-gray-50 dark:bg-[#111] border border-border-color rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-text-muted uppercase mb-1.5">{t('phone')}</label>
                                        <input
                                            type="tel"
                                            required
                                            value={buyPointsFormData.phone}
                                            onChange={(e) => setBuyPointsFormData({...buyPointsFormData, phone: e.target.value})}
                                            className="w-full px-4 py-3 bg-gray-50 dark:bg-[#111] border border-border-color rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none"
                                        />
                                    </div>
                                    <div className="flex gap-3 mt-6">
                                        <button type="button" onClick={() => setSelectedPlan(null)} className="flex-1 py-3 bg-gray-100 dark:bg-gray-800 text-text-main rounded-xl font-bold hover:bg-gray-200 dark:hover:bg-gray-700 transition-all">
                                            {t('back')}
                                        </button>
                                        <button type="submit" className="flex-1 bg-primary text-white rounded-xl font-bold hover:bg-primary-hover transition-all">
                                            {language === 'ar' ? 'ط¸â€¦ط·ع¾ط·آ§ط·آ¨ط·آ¹ط·آ© ط¸â€‍ط¸â€‍ط·آ¯ط¸ظ¾ط·آ¹' : 'Proceed to Payment'}
                                        </button>
                                    </div>
                                </form>
                            ) : (
                                <form onSubmit={handleBuyPointsSubmit} className="space-y-4">
                                    <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl flex items-center gap-3 mb-6">
                                        <ShieldCheck className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                                        <p className="text-xs text-blue-800 dark:text-blue-200 font-medium">
                                            {language === 'ar' ? 'ط·آ¨ط¸ظ¹ط·آ§ط¸â€ ط·آ§ط·ع¾ ط·آ§ط¸â€‍ط·آ¯ط¸ظ¾ط·آ¹ ط¸â€¦ط·آ´ط¸ظ¾ط·آ±ط·آ© ط¸ث†ط·آ¢ط¸â€¦ط¸â€ ط·آ© 100%' : 'Payment data is 100% encrypted and secure'}
                                        </p>
                                    </div>

                                    <div className="flex gap-2 mb-6 bg-gray-100 dark:bg-gray-800 p-1 rounded-xl">
                                        <button
                                            type="button"
                                            onClick={() => setPaymentMethod('card')}
                                            className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${paymentMethod === 'card' ? 'bg-white dark:bg-[#1a1a1a] text-primary shadow-sm' : 'text-text-muted hover:text-text-main'}`}
                                        >
                                            {language === 'ar' ? 'ط·آ¨ط·آ·ط·آ§ط¸â€ڑط·آ© ط·آ§ط·آ¦ط·ع¾ط¸â€¦ط·آ§ط¸â€ ' : 'Credit Card'}
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setPaymentMethod('email')}
                                            className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${paymentMethod === 'email' ? 'bg-white dark:bg-[#1a1a1a] text-primary shadow-sm' : 'text-text-muted hover:text-text-main'}`}
                                        >
                                            {language === 'ar' ? 'ط·آ·ط¸â€‍ط·آ¨ ط·آ¹ط·آ¨ط·آ± ط·آ§ط¸â€‍ط·آ¨ط·آ±ط¸ظ¹ط·آ¯' : 'Email Request'}
                                        </button>
                                    </div>

                                    {paymentMethod === 'card' ? (
                                        <>
                                            <div>
                                                <label className="block text-xs font-bold text-text-muted uppercase mb-1.5">Card Number</label>
                                                <div className="relative">
                                                    <input
                                                        type="text"
                                                        required={paymentMethod === 'card'}
                                                        placeholder="0000 0000 0000 0000"
                                                        maxLength={19}
                                                        value={buyPointsFormData.cardNumber}
                                                        onChange={(e) => setBuyPointsFormData({...buyPointsFormData, cardNumber: e.target.value.replace(/\D/g, '').replace(/(.{4})/g, '$1 ').trim()})}
                                                        className="w-full pl-12 pr-4 py-3 bg-gray-50 dark:bg-[#111] border border-border-color rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none font-mono"
                                                    />
                                                    <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
                                                </div>
                                            </div>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-xs font-bold text-text-muted uppercase mb-1.5">Expiry</label>
                                                    <input
                                                        type="text"
                                                        required={paymentMethod === 'card'}
                                                        placeholder="MM/YY"
                                                        maxLength={5}
                                                        value={buyPointsFormData.expiry}
                                                        onChange={(e) => setBuyPointsFormData({...buyPointsFormData, expiry: e.target.value})}
                                                        className="w-full px-4 py-3 bg-gray-50 dark:bg-[#111] border border-border-color rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none font-mono text-center"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-xs font-bold text-text-muted uppercase mb-1.5">CVC</label>
                                                    <input
                                                        type="text"
                                                        required={paymentMethod === 'card'}
                                                        placeholder="123"
                                                        maxLength={3}
                                                        value={buyPointsFormData.cvc}
                                                        onChange={(e) => setBuyPointsFormData({...buyPointsFormData, cvc: e.target.value.replace(/\D/g, '')})}
                                                        className="w-full px-4 py-3 bg-gray-50 dark:bg-[#111] border border-border-color rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none font-mono text-center"
                                                    />
                                                </div>
                                            </div>
                                        </>
                                    ) : (
                                        <div className="bg-primary/5 border border-primary/10 rounded-xl p-6 text-center">
                                            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                                                <Zap className="text-primary" size={24} />
                                            </div>
                                            <h4 className="font-bold text-text-main mb-2">
                                                {language === 'ar' ? 'ط·آ·ط¸â€‍ط·آ¨ ط·آ´ط·آ±ط·آ§ط·طŒ ط¸â€ ط¸â€ڑط·آ§ط·آ·' : 'Points Purchase Request'}
                                            </h4>
                                            <p className="text-xs text-text-muted leading-relaxed">
                                                {language === 'ar' 
                                                    ? 'ط·آ³ط¸ظ¹ط·ع¾ط¸â€¦ ط·آ¥ط·آ±ط·آ³ط·آ§ط¸â€‍ ط·آ·ط¸â€‍ط·آ¨ط¸ئ’ ط·آ¹ط·آ¨ط·آ± ط·آ§ط¸â€‍ط·آ¨ط·آ±ط¸ظ¹ط·آ¯ ط·آ§ط¸â€‍ط·آ¥ط¸â€‍ط¸ئ’ط·ع¾ط·آ±ط¸ث†ط¸â€ ط¸ظ¹ ط·آ¥ط¸â€‍ط¸â€° ط¸ظ¾ط·آ±ط¸ظ¹ط¸â€ڑ ط·آ§ط¸â€‍ط¸â€¦ط·آ¨ط¸ظ¹ط·آ¹ط·آ§ط·ع¾. ط·آ³ط¸â€ ط·ع¾ط¸ث†ط·آ§ط·آµط¸â€‍ ط¸â€¦ط·آ¹ط¸ئ’ ط¸â€ڑط·آ±ط¸ظ¹ط·آ¨ط·آ§ط¸â€¹ ط¸â€‍ط·آ¥ط·ع¾ط¸â€¦ط·آ§ط¸â€¦ ط·آ¹ط¸â€¦ط¸â€‍ط¸ظ¹ط·آ© ط·آ§ط¸â€‍ط·آ¯ط¸ظ¾ط·آ¹ ط¸ث†ط·ع¾ط¸ظ¾ط·آ¹ط¸ظ¹ط¸â€‍ ط·آ§ط¸â€‍ط¸â€ ط¸â€ڑط·آ§ط·آ·.' 
                                                    : 'Your request will be sent via email to our sales team. We will contact you shortly to complete the payment and activate your points.'}
                                            </p>
                                        </div>
                                    )}

                                    <div className="flex gap-3 mt-6">
                                        <button type="button" onClick={() => setPaymentStep(false)} className="flex-1 py-3 bg-gray-100 dark:bg-gray-800 text-text-main rounded-xl font-bold hover:bg-gray-200 dark:hover:bg-gray-700 transition-all">
                                            {t('back')}
                                        </button>
                                        <button type="submit" disabled={processing} className="flex-1 bg-primary text-white rounded-xl font-bold hover:bg-primary-hover transition-all flex items-center justify-center gap-2">
                                            {processing && <Loader2 className="animate-spin" size={16} />}
                                            {language === 'ar' 
                                                ? (paymentMethod === 'card' ? `ط·آ¯ط¸ظ¾ط·آ¹ ${selectedPlan.price}` : 'ط·آ¥ط·آ±ط·آ³ط·آ§ط¸â€‍ ط·آ§ط¸â€‍ط·آ·ط¸â€‍ط·آ¨')
                                                : (paymentMethod === 'card' ? `Pay ${selectedPlan.price}` : 'Send Request')}
                                        </button>
                                    </div>
                                </form>
                            )}
                        </div>
                    </div>
                </div>
            )}
            {deleteModal.open && (
                <>
                    <div className="fixed inset-0 bg-solid-overlay z-[50] flex items-center justify-center p-4">
                        <div className="bg-white dark:bg-[#1a1a1a] border-2 border-border-color rounded-md shadow-2xl max-w-md w-full p-6" dir={language === 'ar' ? 'rtl' : 'ltr'}>
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                                    <Trash2 size={20} className="text-red-500" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-black text-text-main uppercase tracking-tight">{t('confirmDelete')}</h3>
                                    <p className="text-sm text-gray-600">{t('deleteWarning')}</p>
                                </div>
                            </div>

                            <div className="bg-card p-3 rounded-md mb-6">
                                <p className="text-sm font-bold text-text-main">{deleteModal.adTitle}</p>
                                <p className="text-xs text-gray-500 mt-1">{t('thisActionCannotBeUndone')}</p>
                            </div>

                            <div className="flex gap-3 justify-end">
                                <button
                                    onClick={closeDeleteModal}
                                    className="px-4 py-2 border border-border-color text-text-main rounded-md hover:bg-card/60 transition-all"
                                >
                                    {t('cancel')}
                                </button>
                                <button
                                    onClick={() => deleteAd(deleteModal.adId!)}
                                    className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-all"
                                >
                                    {t('delete')}
                                </button>
                            </div>
                        </div>
                    </div>
                </>
            )}

            {promoteModal.open && (
                <div className="fixed inset-0 z-[50] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="bg-white dark:bg-[#1a1a1a] rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-border-color" dir={language === 'ar' ? 'rtl' : 'ltr'}>
                        <div className="bg-primary/5 p-6 border-b border-border-color flex justify-between items-center">
                            <div>
                                <h3 className="text-lg font-black text-text-main uppercase tracking-tight">{language === 'ar' ? 'ط·ع¾ط·آ±ط¸ث†ط¸ظ¹ط·آ¬ ط·آ§ط¸â€‍ط·آ¥ط·آ¹ط¸â€‍ط·آ§ط¸â€ ' : 'Promote Ad'}</h3>
                                <p className="text-sm text-text-muted mt-1">{promoteModal.adTitle}</p>
                            </div>
                            <button onClick={() => setPromoteModal({ ...promoteModal, open: false })} className="text-text-muted hover:text-text-main transition-colors">
                                <X size={20} />
                            </button>
                        </div>

                        <div className="p-6">
                            <div className="bg-yellow-50 dark:bg-yellow-900/10 p-4 rounded-xl flex gap-3 mb-6">
                                <Zap className="w-6 h-6 text-yellow-500 shrink-0" />
                                <div>
                                    <h4 className="font-bold text-yellow-700 dark:text-yellow-500 text-sm mb-1">
                                        {language === 'ar' ? 'ط¸â€‍ط¸â€¦ط·آ§ط·آ°ط·آ§ ط·ع¾ط·آ±ط¸ث†ط·آ¬ ط·آ¥ط·آ¹ط¸â€‍ط·آ§ط¸â€ ط¸ئ’ط·ع؛' : 'Why promote?'}
                                    </h4>
                                    <p className="text-xs text-yellow-600 dark:text-yellow-400 leading-relaxed">
                                        {language === 'ar' 
                                            ? 'ط·ع¾ط·آ¸ط¸â€،ط·آ± ط·آ§ط¸â€‍ط·آ¥ط·آ¹ط¸â€‍ط·آ§ط¸â€ ط·آ§ط·ع¾ ط·آ§ط¸â€‍ط¸â€¦ط·آ±ط¸ث†ط·آ¬ط·آ© ط¸ظ¾ط¸ظ¹ ط·آ£ط·آ¹ط¸â€‍ط¸â€° ط·آ§ط¸â€‍ط¸â€ڑط·آ§ط·آ¦ط¸â€¦ط·آ© ط¸ث†ط¸ظ¾ط¸ظ¹ ط·آ§ط¸â€‍ط·آ´ط·آ±ط¸ظ¹ط·آ· ط·آ§ط¸â€‍ط¸â€¦ط·ع¾ط·آ­ط·آ±ط¸ئ’ط·إ’ ط¸â€¦ط¸â€¦ط·آ§ ط¸ظ¹ط·آ²ط¸ظ¹ط·آ¯ ط·آ§ط¸â€‍ط¸â€¦ط·آ´ط·آ§ط¸â€،ط·آ¯ط·آ§ط·ع¾ ط·آ¨ط¸â€ ط·آ³ط·آ¨ط·آ© 500%.' 
                                            : 'Promoted ads appear at the top and in the ticker, increasing views by 500%.'}
                                    </p>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-text-muted uppercase mb-2">
                                        {language === 'ar' ? 'ط¸â€¦ط·آ¯ط·آ© ط·آ§ط¸â€‍ط·ع¾ط·آ±ط¸ث†ط¸ظ¹ط·آ¬ (ط·آ£ط¸ظ¹ط·آ§ط¸â€¦)' : 'Duration (Days)'}
                                    </label>
                                    <div className="flex items-center gap-4 bg-card border border-border-color rounded-xl p-2">
                                        <button 
                                            onClick={() => setPromoteModal(p => ({ ...p, days: Math.max(1, p.days - 1) }))}
                                            className="w-10 h-10 flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors font-bold text-lg"
                                        >
                                            -
                                        </button>
                                        <div className="flex-1 text-center">
                                            <input 
                                                type="number" 
                                                min="1" 
                                                max="30"
                                                value={promoteModal.days}
                                                onChange={(e) => {
                                                    const val = parseInt(e.target.value);
                                                    if (!isNaN(val)) {
                                                        setPromoteModal(p => ({ ...p, days: Math.min(30, Math.max(1, val)) }));
                                                    }
                                                }}
                                                className="w-full text-center text-2xl font-black text-primary bg-transparent border-none focus:ring-0 p-0"
                                            />
                                            <span className="text-xs font-bold text-text-muted block uppercase tracking-wider">{language === 'ar' ? 'ط·آ£ط¸ظ¹ط·آ§ط¸â€¦' : 'Days'}</span>
                                        </div>
                                        <button 
                                            onClick={() => setPromoteModal(p => ({ ...p, days: Math.min(30, p.days + 1) }))}
                                            className="w-10 h-10 flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors font-bold text-lg"
                                        >
                                            +
                                        </button>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between p-4 bg-card border border-border-color rounded-xl">
                                    <span className="text-sm font-bold text-text-muted uppercase tracking-wider">{language === 'ar' ? 'ط·آ§ط¸â€‍ط·ع¾ط¸ئ’ط¸â€‍ط¸ظ¾ط·آ© ط·آ§ط¸â€‍ط·آ¥ط·آ¬ط¸â€¦ط·آ§ط¸â€‍ط¸ظ¹ط·آ©' : 'Total Cost'}</span>
                                    <div className="text-right">
                                        <span className="text-2xl font-black text-text-main block">{promoteModal.days * 1}</span>
                                        <span className="text-[10px] font-bold text-yellow-500 uppercase tracking-widest">{language === 'ar' ? 'ط¸â€ ط¸â€ڑط·آ§ط·آ·' : 'POINTS'}</span>
                                    </div>
                                </div>

                                <div className="pt-2">
                                    <div className="flex justify-between text-xs font-bold text-text-muted mb-2">
                                        <span>{language === 'ar' ? 'ط·آ±ط·آµط¸ظ¹ط·آ¯ط¸ئ’ ط·آ§ط¸â€‍ط·آ­ط·آ§ط¸â€‍ط¸ظ¹' : 'Your Balance'}</span>
                                        <span className={(user?.points || 0) < promoteModal.days ? 'text-red-500' : 'text-green-500'}>
                                            {user?.points || 0} {language === 'ar' ? 'ط¸â€ ط¸â€ڑط·آ·ط·آ©' : 'PTS'}
                                        </span>
                                    </div>
                                    {(user?.points || 0) < promoteModal.days && (
                                        <div className="text-red-500 text-xs font-bold mb-4 flex items-center gap-1">
                                            <AlertTriangle size={12} />
                                            {language === 'ar' ? 'ط·آ±ط·آµط¸ظ¹ط·آ¯ ط·ط›ط¸ظ¹ط·آ± ط¸ئ’ط·آ§ط¸ظ¾ط¸ظ¹' : 'Insufficient balance'}
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="flex gap-3 mt-2">
                                <button 
                                    onClick={() => setPromoteModal({ ...promoteModal, open: false })} 
                                    className="flex-1 py-3 bg-gray-100 dark:bg-gray-800 text-text-main rounded-xl font-bold hover:bg-gray-200 dark:hover:bg-gray-700 transition-all"
                                >
                                    {t('cancel')}
                                </button>
                                <button 
                                    onClick={handlePromote}
                                    disabled={processing || (user?.points || 0) < promoteModal.days}
                                    className="flex-1 bg-primary text-white rounded-xl font-bold hover:bg-primary-hover transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    {processing ? <Loader2 className="animate-spin" size={16} /> : <Zap size={16} />}
                                    {language === 'ar' ? 'ط·ع¾ط·آ±ط¸ث†ط¸ظ¹ط·آ¬ ط·آ§ط¸â€‍ط·آ¢ط¸â€ ' : 'Promote Now'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}