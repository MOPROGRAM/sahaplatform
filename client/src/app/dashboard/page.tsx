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
    Loader2
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { apiService } from "@/lib/api";

export default function DashboardPage() {
    const { user, logout } = useAuthStore();
    const router = useRouter();
    const [ads, setAds] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState([
        { label: "إجمالي المشاهدات", value: "0", icon: <Eye size={16} />, color: "text-blue-500" },
        { label: "الرسائل النشطة", value: "0", icon: <MessageSquare size={16} />, color: "text-green-500" },
        { label: "الإعلانات النشطة", value: "0", icon: <Package size={16} />, color: "text-orange-500" },
        { label: "المتابعين", value: "0", icon: <TrendingUp size={16} />, color: "text-purple-500" },
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

            // Calculate real stats
            const totalViews = myAds.reduce((acc: number, ad: any) => acc + (ad.views || 0), 0);
            const activeAds = myAds.filter((ad: any) => ad.isActive).length;

            setStats([
                { label: "إجمالي المشاهدات", value: totalViews.toString(), icon: <Eye size={16} />, color: "text-blue-500" },
                { label: "الرسائل النشطة", value: "0", icon: <MessageSquare size={16} />, color: "text-green-500" },
                { label: "الإعلانات النشطة", value: activeAds.toString(), icon: <Package size={16} />, color: "text-orange-500" },
                { label: "المتابعين", value: "0", icon: <TrendingUp size={16} />, color: "text-purple-500" },
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
        <div className="bg-[#f2f4f7] dark:bg-slate-950 min-h-screen flex" dir="rtl">
            {/* Sidebar Navigation */}
            <aside className="w-64 bg-white dark:bg-slate-900 border-l border-gray-200 dark:border-gray-800 py-8 px-4 flex flex-col hidden md:flex">
                <div className="flex flex-col items-center mb-10">
                    <div className="w-20 h-20 bg-primary/10 rounded-full mb-3 flex items-center justify-center border-4 border-white shadow-sm overflow-hidden">
                        <span className="text-2xl font-black text-primary">{user.name?.substring(0, 2).toUpperCase()}</span>
                    </div>
                    <h3 className="font-bold text-sm">{user.name}</h3>
                    {user.verified && <span className="text-[11px] text-primary font-bold bg-primary/10 px-2 py-0.5 rounded-full mt-1">تاجر موثوق</span>}
                </div>

                <nav className="flex flex-col gap-1 flex-1">
                    {[
                        { label: "الرئيسية", icon: <LayoutDashboard size={18} />, active: true },
                        { label: "إعلاناتي", icon: <Package size={18} /> },
                        { label: "الدردشة", icon: <MessageSquare size={18} />, count: 0 },
                        { label: "المفضلة", icon: <Heart size={18} /> },
                        { label: "الإعدادات", icon: <Settings size={18} /> },
                    ].map((item, i) => (
                        <button
                            key={i}
                            className={`flex items-center justify-between px-4 py-3 rounded-sm transition-all ${item.active ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-gray-500 hover:bg-gray-50 dark:hover:bg-slate-800'}`}
                        >
                            <div className="flex items-center gap-3">
                                {item.icon}
                                <span className="text-sm font-medium">{item.label}</span>
                            </div>
                            {item.count > 0 && <span className="bg-red-500 text-white text-[10px] px-1.5 rounded-full">{item.count}</span>}
                        </button>
                    ))}
                </nav>

                <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 px-4 py-3 text-red-500 hover:bg-red-50 rounded-sm transition-all mt-auto border-t border-gray-50 dark:border-gray-800"
                >
                    <LogOut size={18} />
                    <span className="text-sm font-medium">تسجيل الخروج</span>
                </button>
            </aside>

            {/* Main Content */}
            <main className="flex-1 p-4 md:p-10 overflow-y-auto">
                <div className="max-w-[1000px] mx-auto">
                    <div className="flex justify-between items-center mb-8">
                        <h2 className="text-xl font-black">مرحباً بعودتك، {user.name?.split(' ')[0]} 👋</h2>
                        <Link href="/post-ad" className="bg-primary text-white px-6 py-2 rounded-sm text-sm font-bold shadow-lg shadow-primary/20">أضف إعلان جديد</Link>
                    </div>

                    {/* Quick Stats */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
                        {stats.map((stat, i) => (
                            <div key={i} className="bg-white dark:bg-slate-900 p-4 rounded-sm border border-gray-100 dark:border-gray-800 shadow-sm transition-transform hover:scale-[1.02]">
                                <div className="flex justify-between items-start mb-2">
                                    <span className={`p-2 bg-gray-50 dark:bg-slate-800 rounded-sm ${stat.color}`}>{stat.icon}</span>
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-2xl font-black">{stat.value}</span>
                                    <span className="text-[11px] text-gray-400 font-bold uppercase">{stat.label}</span>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Recent Ads Table */}
                    <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-gray-800 rounded-sm shadow-sm overflow-hidden min-h-[300px]">
                        <div className="p-5 border-b border-gray-50 dark:border-gray-800 flex justify-between items-center">
                            <h3 className="font-bold text-sm uppercase text-gray-400">آخر الإعلانات المنشورة</h3>
                        </div>

                        {loading ? (
                            <div className="flex items-center justify-center p-20">
                                <Loader2 className="animate-spin text-primary" size={32} />
                            </div>
                        ) : ads.length > 0 ? (
                            <div className="overflow-x-auto">
                                <table className="w-full text-right text-sm">
                                    <thead className="bg-gray-50 dark:bg-slate-800 text-[11px] font-bold text-gray-400 uppercase">
                                        <tr>
                                            <th className="px-5 py-3">الإعلان</th>
                                            <th className="px-5 py-3 text-center">الحالة</th>
                                            <th className="px-5 py-3 text-center">المشاهدات</th>
                                            <th className="px-5 py-3 text-left">التاريخ</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                                        {ads.map(ad => (
                                            <tr key={ad.id} className="hover:bg-gray-50/50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer group">
                                                <td className="px-5 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 bg-gray-100 dark:bg-slate-800 rounded-sm shrink-0 flex items-center justify-center">
                                                            <Package size={16} className="text-gray-300" />
                                                        </div>
                                                        <div className="flex flex-col">
                                                            <span className="font-bold group-hover:text-primary transition-colors">{ad.title}</span>
                                                            <span className="text-xs text-primary font-bold">{ad.price} ر.س</span>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-5 py-4 text-center">
                                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${ad.isActive ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                                                        {ad.isActive ? 'نشط' : 'منتهي'}
                                                    </span>
                                                </td>
                                                <td className="px-5 py-4 text-center">
                                                    <div className="flex items-center justify-center gap-1 text-gray-400">
                                                        <Eye size={12} />
                                                        <span className="text-xs font-bold">{ad.views}</span>
                                                    </div>
                                                </td>
                                                <td className="px-5 py-4 text-left">
                                                    <div className="flex flex-col text-[11px] text-gray-400">
                                                        <span className="flex items-center gap-1 justify-end"><Clock size={10} /> {new Date(ad.createdAt).toLocaleDateString('ar-SA')}</span>
                                                        <Link href={`/ads/view?id=${ad.id}`} className="text-primary hover:underline mt-1 flex items-center gap-1 justify-end">رابط الإعلان <ExternalLink size={10} /></Link>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className="p-20 text-center text-gray-400">
                                <Package className="mx-auto mb-4 opacity-20" size={48} />
                                <p>لم تقم بنشر أي إعلانات حتى الآن.</p>
                            </div>
                        )}
                    </div>

                    {/* Account Upgrade Banner */}
                    <div className="mt-8 bg-gradient-to-r from-secondary to-slate-800 p-6 rounded-sm text-white flex flex-col md:flex-row justify-between items-center gap-6">
                        <div className="flex flex-col gap-1">
                            <h4 className="text-lg font-black italic">SAHA PRO</h4>
                            <p className="text-sm opacity-70">احصل على وصول حصري لقاعدة بيانات المتقدمين للوظائف وإحصائيات العقارات المتقدمة.</p>
                        </div>
                        <button className="bg-white text-secondary px-8 py-3 rounded-sm font-bold text-sm hover:bg-primary hover:text-white transition-all whitespace-nowrap">الترقية الآن</button>
                    </div>
                </div>
            </main>
        </div>
    );
}
