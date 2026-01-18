"use client";

import { useAuthStore } from "@/store/useAuthStore";
import { useState, useEffect } from "react";
import {
    LayoutDashboard,
    Package,
    MessageSquare,
    Heart,
    Settings,
    LogOut,
    Eye,
    TrendingUp,
    Clock,
    ExternalLink,
    ChevronRight,
    Loader2,
    PlusCircle,
    Search,
    ShieldCheck,
    Edit,
    Trash2
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { apiService } from "@/lib/api";
import { useLanguage } from "@/lib/language-context";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

interface Ad {
    id: string;
    title: string;
    price: number;
    category: string;
    isActive: boolean;
    views: number;
    currency?: {
        code: string;
    };
}

export default function DashboardPage() {
    const { language, t, currency } = useLanguage();
    const { user, logout } = useAuthStore();
    const router = useRouter();
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
    }, [user, router]);

    const fetchDashboardData = async () => {
        try {
            const myAds = await apiService.get('/ads/my');
            const activeAdsOnly = myAds.filter((ad: any) => ad.isActive);
            setAds(activeAdsOnly);

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
    };

    const deleteAd = async (adId: string) => {
        try {
            await apiService.delete('/ads/' + adId);
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
        <div className="bg-[#f0f2f5] min-h-screen flex flex-col" dir={language === 'ar' ? 'rtl' : 'ltr'}>
            <Header />

            <div className="max-w-7xl mx-auto w-full flex-1 flex flex-col md:flex-row gap-4 p-4">
                {/* Left Mini Sidebar - Professional Tech Style */}
                <aside className="w-full md:w-56 space-y-3 shrink-0">
                    <div className="bg-white border border-gray-200 p-5 rounded-sm shadow-sm relative overflow-hidden group">
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

                    <nav className="bg-white border border-gray-200 rounded-sm overflow-hidden shadow-sm">
                        {[
                            { label: t('overview'), icon: <LayoutDashboard size={14} />, active: true, path: "/dashboard" },
                            { label: t('myListings'), icon: <Package size={14} />, path: "/ads/my" },
                            { label: t('messages'), icon: <MessageSquare size={14} />, path: "/messages" },
                            { label: t('settings'), icon: <Settings size={14} />, path: "/settings" },
                        ].map((item, i) => (
                            <Link key={i} href={item.path || "#"} className={`w-full flex items-center gap-3 px-4 py-3 text-[10px] font-black uppercase tracking-widest border-b border-gray-50 last:border-0 transition-all ${item.active ? 'text-primary bg-primary/[0.03] border-r-2 border-r-primary' : 'text-gray-400 hover:bg-gray-50 hover:text-secondary'}`}>
                                {item.icon}
                                <span>{item.label}</span>
                            </Link>
                        ))}
                    </nav>

                    <button onClick={() => logout()} className="w-full flex items-center gap-3 px-4 py-3 text-[10px] font-black uppercase tracking-widest text-red-500 bg-red-50/50 hover:bg-red-50 transition-all border border-red-100/50 rounded-sm">
                        <LogOut size={14} />
                        <span>Sign Out System</span>
                    </button>
                </aside>

                {/* Main Content Area */}
                <main className="flex-1 flex flex-col gap-4">
                    {/* Compact Stats Grid */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                        {stats.map((stat, i) => (
                            <div key={i} className="bg-white border border-gray-200 p-4 rounded-sm flex flex-col gap-2 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
                                <div className={`absolute bottom-0 right-0 w-12 h-12 ${stat.color} opacity-[0.03] -mr-4 -mb-4 group-hover:scale-150 transition-transform`}>{stat.icon}</div>
                                <span className={`w-8 h-8 flex items-center justify-center rounded-xs bg-gray-50 ${stat.color} p-1 border border-black/5 shadow-inner`}>
                                    {stat.icon}
                                </span>
                                <div className="flex flex-col">
                                    <span className="text-2xl font-black italic tracking-tighter text-secondary leading-none">{stat.value}</span>
                                    <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest mt-1 opacity-60">{stat.label} Matrix</span>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Listings Table - High Density Professional */}
                    <div className="bg-white border border-gray-200 rounded-sm shadow-sm overflow-hidden flex-1 flex flex-col">
                        <div className="px-4 py-3 bg-gray-50/50 border-b border-gray-100 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Package size={14} className="text-primary" />
                                <h3 className="text-[11px] font-black uppercase tracking-[0.1em] text-secondary">Operational Fleet / Listings</h3>
                            </div>
                            <Link href="/post-ad" className="bg-primary text-white text-[9px] font-black px-3 py-1.5 rounded-xs flex items-center gap-2 hover:bg-primary-hover shadow-lg shadow-primary/20 active:scale-95 transition-all">
                                <PlusCircle size={12} /> ADD UNIT
                            </Link>
                        </div>

                        <div className="overflow-x-auto">
                            {loading ? (
                                <div className="h-48 flex items-center justify-center"><Loader2 className="animate-spin text-primary opacity-20" /></div>
                            ) : ads.length > 0 ? (
                                <table className="w-full text-[10px] border-collapse">
                                    <thead>
                                        <tr className="bg-gray-100/50 text-gray-400 font-black uppercase text-[8px] tracking-widest border-b border-gray-200">
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
                                                        <div className="w-9 h-9 bg-gray-50 border border-gray-100 rounded-xs flex items-center justify-center shrink-0 shadow-inner group-hover:border-primary/20 transition-colors">
                                                            <Package size={16} className="text-gray-300 group-hover:text-primary transition-colors" />
                                                        </div>
                                                        <div className="min-w-0">
                                                            <span className="font-black text-secondary block truncate group-hover:text-primary transition-colors uppercase tracking-tight">{ad.title}</span>
                                                            <div className="flex items-center gap-2 mt-0.5">
                                                                <span className="text-primary font-black italic">{new Intl.NumberFormat(language === 'ar' ? 'ar-SA' : 'en-US').format(ad.price)} {ad.currency?.code || 'SAR'}</span>
                                                                <span className="w-1 h-1 bg-gray-200 rounded-full"></span>
                                                                <span className="text-[8px] font-black text-gray-400 uppercase tracking-tighter">{ad.category}</span>
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
                                                    <div className="flex flex-col items-center">
                                                        <span className="text-[13px] font-black text-secondary leading-none">{ad.views || 0}</span>
                                                        <span className="text-[7px] font-black text-gray-400 uppercase tracking-tighter mt-1 italic">Total Imprints</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <div className="flex flex-col items-end gap-1.5">
                                                        <div className="flex items-center gap-1">
                                                            <Link href={`/ads/view?id=${ad.id}`} className="px-2 py-1 bg-secondary text-white rounded-xs text-[8px] font-black uppercase tracking-widest hover:bg-black transition-all shadow-sm">Inspect</Link>
                                                            <Link href={`/ads/edit?id=${ad.id}`} className="px-2 py-1 bg-blue-500 text-white rounded-xs text-[8px] font-black uppercase tracking-widest hover:bg-blue-600 transition-all shadow-sm">
                                                                <Edit size={10} />
                                                            </Link>
                                                            <button onClick={() => openDeleteModal(ad.id, ad.title)} className="px-2 py-1 bg-red-500 text-white rounded-xs text-[8px] font-black uppercase tracking-widest hover:bg-red-600 transition-all shadow-sm">
                                                                <Trash2 size={10} />
                                                            </button>
                                                        </div>
                                                        <div className="flex items-center gap-1 text-[8px] font-black text-gray-300 uppercase tracking-tighter">
                                                            <Clock size={8} /> {getRelativeTime(ad.createdAt)}
                                                        </div>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            ) : (
                                <div className="flex-1 flex flex-col items-center justify-center text-gray-400 gap-3 p-16">
                                    <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center border border-gray-100 shadow-inner">
                                        <Package size={32} className="opacity-10" />
                                    </div>
                                    <div className="text-center">
                                        <h4 className="text-[11px] font-black uppercase tracking-[0.2em] text-gray-300">No Mission Data Found</h4>
                                        <p className="text-[9px] font-bold text-gray-300 uppercase italic mt-1 font-cairo">ابدأ رحلتك بنشر إعلانك الأول الآن</p>
                                    </div>
                                    <Link href="/post-ad" className="mt-4 bg-primary text-white text-[9px] font-black px-6 py-2 rounded-xs shadow-xl shadow-primary/20 hover:-translate-y-1 transition-all uppercase tracking-widest">Post Ad Now</Link>
                                </div>
                            )}
                        </div>
                    </div>
                </main>
            </div>
            <Footer />

            {/* Delete Confirmation Modal */}
            {deleteModal.open && (
                <>
                    <div className="fixed inset-0 bg-black/50 z-[50] flex items-center justify-center p-4">
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

                            <div className="bg-gray-50 p-3 rounded-md mb-6">
                                <p className="text-sm font-bold text-secondary">{deleteModal.adTitle}</p>
                                <p className="text-xs text-gray-500 mt-1">{language === 'ar' ? 'لا يمكن التراجع عن هذا الإجراء' : 'This action cannot be undone'}</p>
                            </div>

                            <div className="flex gap-3 justify-end">
                                <button
                                    onClick={closeDeleteModal}
                                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-all"
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
