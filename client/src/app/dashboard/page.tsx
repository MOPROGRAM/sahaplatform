"use client";

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
    Trash2
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { adsService } from "@/lib/ads";
import { useLanguage } from "@/lib/language-context";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

interface Ad {
    id: string;
    title: string;
    price: number;
    category: string;
    is_active: boolean;
    views: number;
    currency?: {
        code: string;
    };
}

export default function DashboardPage() {
    const { language, t, currency } = useLanguage();
    const { user, logout } = useAuthStore();
    const router = useRouter();
    const [activeTab, setActiveTab] = useState('overview');
    const [ads, setAds] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState([
        { label: "Views", value: "0", icon: <Eye size={12} />, color: "text-blue-500" },
        { label: "Messages", value: "0", icon: <MessageSquare size={12} />, color: "text-green-500" },
        { label: "Listings", value: "0", icon: <Package size={12} />, color: "text-orange-500" },
        { label: "Growth", value: "0%", icon: <TrendingUp size={12} />, color: "text-purple-500" },
    ]);
    const [deleteModal, setDeleteModal] = useState<{ open: boolean; adId: string | null; adTitle: string }>({ open: false, adId: null, adTitle: '' });

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

    useEffect(() => {
        if (!user) {
            router.push('/login');
            return;
        }
        fetchDashboardData();
    }, [user, router, activeTab, fetchDashboardData]);

    const fetchDashboardData = useCallback(async () => {
        try {
            const myAds = await adsService.getMyAds();
            const activeAdsOnly = Array.isArray(myAds) ? myAds.filter((ad: any) => ad.is_active) : [];
            setAds(activeAdsOnly as any);

            const totalViews = activeAdsOnly.reduce((acc: number, ad: any) => acc + (ad.views || 0), 0);
            const activeAds = activeAdsOnly.length;

            setStats([
                { label: language === 'ar' ? "المشاهدات" : "Views", value: totalViews.toString(), icon: <Eye size={12} />, color: "text-blue-500" },
                { label: language === 'ar' ? "الرسائل" : "Messages", value: "0", icon: <MessageSquare size={12} />, color: "text-green-500" },
                { label: language === 'ar' ? "الإعلانات" : "Listings", value: activeAds.toString(), icon: <Package size={12} />, color: "text-orange-500" },
                { label: language === 'ar' ? "النمو" : "Growth", value: "+12%", icon: <TrendingUp size={12} />, color: "text-purple-500" },
            ]);
        } catch (error) {
            console.error("Failed to fetch dashboard data:", error);
        } finally {
            setLoading(false);
        }
    }, [language]);

    const deleteAd = async (adId: string) => {
        try {
            await adsService.deleteAd(adId);
            // Refresh the list
            fetchDashboardData();
            setDeleteModal({ open: false, adId: null, adTitle: '' });
        } catch (error) {
            console.error("Failed to delete ad:", error);
            alert(language === 'ar' ? 'فشل في حذف الإعلان' : 'Failed to delete ad');
        }
    };

    const openDeleteModal = (adId: string, adTitle: string) => {
        setDeleteModal({ open: true, adId, adTitle });
    };

    const closeDeleteModal = () => {
        setDeleteModal({ open: false, adId: null, adTitle: '' });
    };

    if (!user) return null;

    return (
        <div className="min-h-screen flex flex-col" dir={language === 'ar' ? 'rtl' : 'ltr'}>
            <Header />

            <div className="max-w-7xl mx-auto w-full flex-1 flex flex-col md:flex-row gap-4 p-4">
                {/* Left Mini Sidebar - Professional Tech Style */}
                <aside className="w-full md:w-56 space-y-3 shrink-0">
                    <div className="depth-card p-5 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-16 h-16 bg-primary/5 rounded-full -mr-8 -mt-8 group-hover:scale-150 transition-transform"></div>
                        <div className="relative z-10 text-center">
                            <div className="w-14 h-14 bg-white border border-primary/20 rounded-full mx-auto mb-3 flex items-center justify-center shadow-lg">
                                <span className="text-lg font-black text-primary italic">{user.name?.substring(0, 2).toUpperCase()}</span>
                            </div>
                            <h4 className="text-[12px] font-black text-secondary uppercase tracking-tight truncate">{user.name}</h4>
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

                    <nav className="glass-card overflow-hidden">
                        {[
                            { label: t('overview'), icon: <LayoutDashboard size={14} />, id: 'overview' },
                            { label: t('myListings'), icon: <Package size={14} />, id: 'listings' },
                            { label: t('messages'), icon: <MessageSquare size={14} />, id: 'messages' },
                            { label: t('settings'), icon: <Settings size={14} />, id: 'settings' },
                        ].map((item, i) => (
                            <button key={i} onClick={() => setActiveTab(item.id)} className={`w-full flex items-center gap-3 px-4 py-3 text-[10px] font-black uppercase tracking-widest border-b border-border-color last:border-0 transition-all ${activeTab === item.id ? 'text-primary bg-primary/[0.03] border-r-2 border-r-primary' : 'text-text-muted hover:bg-card/60 hover:text-secondary'}`}>
                                {item.icon}
                                <span>{item.label}</span>
                            </button>
                        ))}
                    </nav>

                    <button onClick={() => logout()} className="w-full flex items-center gap-3 px-4 py-3 text-[10px] font-black uppercase tracking-widest text-red-500 bg-card hover:bg-red-50 transition-all border border-red-100 rounded-sm">
                        <LogOut size={14} />
                        <span>Sign Out System</span>
                    </button>
                </aside>

                {/* Main Content Area */}
                <main className="flex-1 flex flex-col gap-4">
                    {/* Overview Tab */}
                    {activeTab === 'overview' && (
                        <>
                            {/* Compact Stats Grid */}
                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                                {stats.map((stat, i) => (
                                    <div key={i} className="glass-card p-4 flex flex-col gap-2 relative overflow-hidden group">
                                        <div className={`absolute bottom-0 right-0 w-12 h-12 ${stat.color} opacity-[0.03] -mr-4 -mb-4 group-hover:scale-150 transition-transform`}>{stat.icon}</div>
                                        <span className={`w-8 h-8 flex items-center justify-center rounded-xs bg-card ${stat.color} p-1 border border-black/5 shadow-inner`}>
                                            {stat.icon}
                                        </span>
                                        <div className="flex flex-col">
                                            <span className="text-2xl font-black italic tracking-tighter text-secondary leading-none">{stat.value}</span>
                                            <span className="text-[9px] font-black text-text-muted uppercase tracking-widest mt-1 opacity-60">{stat.label} Matrix</span>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Listings Table - High Density Professional */}
                            <div className="bg-card border border-border-color rounded-sm shadow-sm overflow-hidden flex-1 flex flex-col">
                                <div className="px-4 py-3 bg-card/60 border-b border-border-color flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <Package size={14} className="text-primary" />
                                        <h3 className="text-[11px] font-black uppercase tracking-[0.1em] text-secondary">Operational Fleet / Listings</h3>
                                    </div>
                                    <Link href="/post-ad" className="bg-primary text-white text-[9px] font-black px-3 py-1.5 rounded-xs flex items-center gap-2 hover:bg-primary-hover shadow-lg shadow-primary/20 active:scale-95 transition-all">
                                        <PlusCircle size={12} /> ADD UNIT
                                    </Link>
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
                                                            <h4 className="font-black text-white block truncate text-sm">{ad.title}</h4>
                                                            <div className="flex items-center gap-2 mt-1">
                                                                <span className="text-primary font-bold text-sm">
                                                                    {new Intl.NumberFormat(language === 'ar' ? 'ar-SA' : 'en-US').format(ad.price)} {ad.currency?.code || 'SAR'}
                                                                </span>
                                                                <span className="text-xs text-text-muted">{ad.category}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className={`px-2 py-1 rounded-full text-xs font-bold uppercase ${ad.is_active ? 'bg-green-500 text-white' : 'bg-gray-400 text-white'}`}>
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
                                                            {getRelativeTime(ad.created_at)}
                                                        </span>
                                                    </div>
                                                    <div className="flex gap-2">
                                                        <Link href={`/ads/view?id=${ad.id}`} className="px-3 py-1 bg-secondary text-white rounded text-xs font-bold hover:bg-black transition-all">
                                                            View
                                                        </Link>
                                                        <Link href={`/ads/${ad.id}/edit`} className="px-3 py-1 bg-blue-500 text-white rounded text-xs font-bold hover:bg-blue-600 transition-all">
                                                            Edit
                                                        </Link>
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

                    {/* Listings Tab */}
                    {activeTab === 'listings' && (
                        <div className="bg-card border border-border-color rounded-sm shadow-sm overflow-hidden flex-1 flex flex-col">
                            <div className="px-4 py-3 bg-card/60 border-b border-border-color flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Package size={14} className="text-primary" />
                                    <h3 className="text-[11px] font-black uppercase tracking-[0.1em] text-secondary">My Listings</h3>
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
                                                                <span className="font-black text-secondary block truncate group-hover:text-primary transition-colors uppercase tracking-tight">{ad.title}</span>
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
                                                            <span className={`px-2 py-0.5 rounded-full text-[7px] font-black uppercase tracking-widest shadow-sm ${ad.is_active ? 'bg-green-500 text-white' : 'bg-gray-400 text-white'}`}>
                                                                {ad.is_active ? 'Operation: Active' : 'Operation: Pause'}
                                                            </span>
                                                            <span className="text-[7px] font-black text-gray-300 uppercase italic">Code: {ad.id?.substring(0, 8)}</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 text-center">
                                                        <span className="text-[13px] font-black text-secondary">{ad.views || 0}</span>
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

                    {/* Messages Tab */}
                    {activeTab === 'messages' && (
                        <div className="bg-white border border-gray-200 p-6 rounded-sm shadow-sm text-center">
                            <MessageSquare size={48} className="text-gray-300 mx-auto mb-4" />
                            <h3 className="text-lg font-black text-text-muted uppercase tracking-tight">
                                {language === 'ar' ? 'الرسائل' : 'Messages'}
                            </h3>
                            <p className="text-[12px] text-gray-500 mt-2">
                                {language === 'ar' ? 'لا توجد رسائل جديدة' : 'No new messages'}
                            </p>
                        </div>
                    )}

                    {/* Settings Tab */}
                    {activeTab === 'settings' && (
                        <div className="space-y-4">
                            <div className="bg-white border border-gray-200 p-6 rounded-sm shadow-sm">
                                <h3 className="text-lg font-black text-secondary uppercase tracking-tight mb-4">
                                    {language === 'ar' ? 'إعدادات الحساب' : 'Account Settings'}
                                </h3>
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between p-4 border border-gray-200 rounded-sm">
                                        <div>
                                            <h4 className="font-black text-secondary text-[14px]">
                                                {language === 'ar' ? 'الإشعارات' : 'Notifications'}
                                            </h4>
                                            <p className="text-[10px] text-gray-500">
                                                {language === 'ar' ? 'تلقي إشعارات حول الإعلانات والرسائل' : 'Receive notifications about ads and messages'}
                                            </p>
                                        </div>
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input type="checkbox" className="sr-only peer" defaultChecked />
                                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                                        </label>
                                    </div>

                                    <div className="flex items-center justify-between p-4 border border-gray-200 rounded-sm">
                                        <div>
                                            <h4 className="font-black text-secondary text-[14px]">
                                                {language === 'ar' ? 'الخصوصية' : 'Privacy'}
                                            </h4>
                                            <p className="text-[10px] text-gray-500">
                                                {language === 'ar' ? 'إظهار معلومات الاتصال للجميع' : 'Show contact information to everyone'}
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

            {/* Delete Confirmation Modal */}
            {deleteModal.open && (
                <>
                    <div className="fixed inset-0 bg-solid-overlay z-[50] flex items-center justify-center p-4">
                        <div className="bg-white border-2 border-gray-200 rounded-md shadow-2xl max-w-md w-full p-6" dir={language === 'ar' ? 'rtl' : 'ltr'}>
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                                    <Trash2 size={20} className="text-red-500" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-black text-secondary uppercase tracking-tight">{language === 'ar' ? 'تأكيد الحذف' : 'Confirm Delete'}</h3>
                                    <p className="text-sm text-gray-600">{language === 'ar' ? 'هل أنت متأكد من حذف هذا الإعلان؟' : 'Are you sure you want to delete this ad?'}</p>
                                </div>
                            </div>

                            <div className="bg-card p-3 rounded-md mb-6">
                                <p className="text-sm font-bold text-secondary">{deleteModal.adTitle}</p>
                                <p className="text-xs text-gray-500 mt-1">{language === 'ar' ? 'لا يمكن التراجع عن هذا الإجراء' : 'This action cannot be undone'}</p>
                            </div>

                            <div className="flex gap-3 justify-end">
                                <button
                                    onClick={closeDeleteModal}
                                    className="px-4 py-2 border border-border-color text-text-main rounded-md hover:bg-card/60 transition-all"
                                >
                                    {language === 'ar' ? 'إلغاء' : 'Cancel'}
                                </button>
                                <button
                                    onClick={() => deleteAd(deleteModal.adId!)}
                                    className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-all"
                                >
                                    {language === 'ar' ? 'حذف' : 'Delete'}
                                </button>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
