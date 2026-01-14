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
    Search
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { apiService } from "@/lib/api";
import { useLanguage } from "@/lib/language-context";

export default function DashboardPage() {
    const { user, logout } = useAuthStore();
    const { language, t } = useLanguage();
    const router = useRouter();
    const [ads, setAds] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState([
        { label: "المشاهدات", value: "0", icon: <Eye size={12} />, color: "text-blue-500" },
        { label: "الرسائل", value: "0", icon: <MessageSquare size={12} />, color: "text-green-500" },
        { label: "الإعلانات", value: "0", icon: <Package size={12} />, color: "text-orange-500" },
        { label: "المتابعين", value: "0", icon: <TrendingUp size={12} />, color: "text-purple-500" },
    ]);

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
            setAds(myAds);

            const totalViews = myAds.reduce((acc: number, ad: any) => acc + (ad.views || 0), 0);
            const activeAds = myAds.filter((ad: any) => ad.isActive).length;

            setStats([
                { label: "المشاهدات", value: totalViews.toString(), icon: <Eye size={12} />, color: "text-blue-500" },
                { label: "الرسائل", value: "0", icon: <MessageSquare size={12} />, color: "text-green-500" },
                { label: "الإعلانات", value: activeAds.toString(), icon: <Package size={12} />, color: "text-orange-500" },
                { label: "المتابعين", value: "0", icon: <TrendingUp size={12} />, color: "text-purple-500" },
            ]);
        } catch (error) {
            console.error("Failed to fetch dashboard data:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        logout();
        router.push('/');
    };

    if (!user) return null;

    return (
        <div className="bg-[#f0f2f5] min-h-screen flex flex-col" dir={language === 'ar' ? 'rtl' : 'ltr'}>
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

                    <nav className="hidden lg:flex items-center gap-4 text-[10px] font-black uppercase tracking-widest text-gray-400">
                        <Link href="/dashboard" className="text-primary border-b-2 border-primary pb-0.5">Overview</Link>
                        <Link href="/ads/my" className="hover:text-secondary">My Ads</Link>
                        <Link href="/messages" className="hover:text-secondary">Messages</Link>
                    </nav>

                    <div className="flex-1 max-w-sm ml-auto flex border border-gray-200 rounded-sm overflow-hidden bg-gray-50">
                        <input type="text" placeholder="Search dashboard..." className="flex-1 px-3 py-1 text-[10px] outline-none font-bold bg-transparent" />
                        <button className="px-2 text-gray-400"><Search size={12} /></button>
                    </div>

                    <button onClick={handleLogout} className="text-[10px] font-black text-red-500 flex items-center gap-1 hover:opacity-70">
                        <LogOut size={12} />
                        {t('logout')}
                    </button>
                </div>
            </header>

            <div className="max-w-7xl mx-auto w-full flex-1 flex gap-4 p-4">
                {/* Left Mini Sidebar */}
                <aside className="w-48 space-y-2 shrink-0 hidden md:block">
                    <div className="bg-white border border-gray-200 p-4 text-center rounded-sm">
                        <div className="w-12 h-12 bg-primary/10 rounded-full mx-auto mb-2 flex items-center justify-center border border-primary/20">
                            <span className="text-sm font-black text-primary">{user.name?.substring(0, 2).toUpperCase()}</span>
                        </div>
                        <h4 className="text-[11px] font-black text-secondary">{user.name}</h4>
                        <span className="text-[8px] font-black text-primary bg-primary/10 px-1.5 py-0.5 rounded-full mt-1 inline-block uppercase tracking-tighter">Verified Merchant</span>
                    </div>

                    <nav className="bg-white border border-gray-200 rounded-sm">
                        {[
                            { label: "Overview", icon: <LayoutDashboard size={14} />, active: true },
                            { label: "My Listings", icon: <Package size={14} /> },
                            { label: "Messages", icon: <MessageSquare size={14} /> },
                            { label: "Favorites", icon: <Heart size={14} /> },
                            { label: "Settings", icon: <Settings size={14} /> },
                        ].map((item, i) => (
                            <button key={i} className={`w-full flex items-center gap-3 px-3 py-2 text-[10px] font-bold border-b border-gray-50 last:border-0 ${item.active ? 'text-primary bg-primary/5 border-r-2 border-r-primary' : 'text-gray-500 hover:bg-gray-50'}`}>
                                {item.icon}
                                <span>{item.label}</span>
                            </button>
                        ))}
                    </nav>
                </aside>

                {/* Main Content Area */}
                <main className="flex-1 flex flex-col gap-4">
                    {/* Compact Stats Row */}
                    <div className="grid grid-cols-4 gap-2">
                        {stats.map((stat, i) => (
                            <div key={i} className="bg-white border border-gray-200 p-3 rounded-sm flex flex-col gap-1 shadow-sm">
                                <span className={`w-6 h-6 flex items-center justify-center rounded-sm bg-gray-50 ${stat.color}`}>{stat.icon}</span>
                                <div className="flex flex-col mt-1">
                                    <span className="text-base font-black leading-none">{stat.value}</span>
                                    <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">{stat.label}</span>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Listings Table - High Density */}
                    <div className="bg-white border border-gray-200 rounded-sm shadow-sm overflow-hidden flex-1 flex flex-col min-h-[400px]">
                        <div className="px-4 py-2 border-b border-gray-100 flex items-center justify-between">
                            <h3 className="text-[10px] font-black uppercase tracking-widest text-secondary">Recent Listings</h3>
                            <Link href="/post-ad" className="text-primary text-[9px] font-black flex items-center gap-1 hover:underline">
                                <PlusCircle size={10} /> {t('postAd')}
                            </Link>
                        </div>

                        {loading ? (
                            <div className="flex-1 flex items-center justify-center"><Loader2 className="animate-spin text-primary opacity-20" /></div>
                        ) : ads.length > 0 ? (
                            <table className="w-full text-[10px]">
                                <thead className="bg-gray-50 text-gray-400 font-black uppercase text-[8px]">
                                    <tr>
                                        <th className="px-4 py-2 text-left">Listing Name</th>
                                        <th className="px-4 py-2 text-center">Status</th>
                                        <th className="px-4 py-2 text-center">Views</th>
                                        <th className="px-4 py-2 text-right">Date</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {ads.map(ad => (
                                        <tr key={ad.id} className="hover:bg-primary/5 transition-colors cursor-pointer group">
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-8 h-8 bg-gray-50 border border-gray-100 rounded-xs flex items-center justify-center shrink-0">
                                                        <Package size={14} className="text-gray-200" />
                                                    </div>
                                                    <div className="min-w-0">
                                                        <span className="font-black text-secondary block truncate group-hover:text-primary">{ad.title}</span>
                                                        <span className="text-primary font-bold">{new Intl.NumberFormat('ar-SA').format(ad.price)} SAR</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 text-center">
                                                <span className={`px-1.5 py-0.5 rounded-full text-[8px] font-black uppercase ${ad.isActive ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                                                    {ad.isActive ? 'Active' : 'Ended'}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-center font-bold text-gray-400">
                                                {ad.views || 0}
                                            </td>
                                            <td className="px-4 py-3 text-right">
                                                <div className="flex flex-col items-end">
                                                    <span className="text-gray-400 font-bold">{new Date(ad.createdAt).toLocaleDateString()}</span>
                                                    <Link href={`/ads/view?id=${ad.id}`} className="text-primary hover:underline flex items-center gap-1">Open <ExternalLink size={8} /></Link>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        ) : (
                            <div className="flex-1 flex flex-col items-center justify-center text-gray-300 gap-2">
                                <Package size={40} className="opacity-10" />
                                <span className="text-[10px] font-black uppercase italic tracking-widest">No Active Listings Found</span>
                            </div>
                        )}
                    </div>
                </main>
            </div>
        </div>
    );
}
