"use client";

import { useAuthStore } from "@/store/useAuthStore";
import { useState, useEffect } from "react";
import {
    ShieldCheck,
    Users,
    Package,
    BarChart3,
    Settings,
    Search,
    PlusCircle,
    LogOut,
    AlertTriangle,
    CheckCircle2,
    XCircle,
    Eye,
    ChevronRight,
    Loader2
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { apiService } from "@/lib/api";
import { useLanguage } from "@/lib/language-context";

export default function AdminDashboard() {
    const { user, logout } = useAuthStore();
    const { language, t } = useLanguage();
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        totalUsers: 0,
        totalAds: 0,
        activeSubscriptions: 0,
        pendingReports: 0
    });
    const [recentAds, setRecentAds] = useState<any[]>([]);
    const [view, setView] = useState('overview'); // overview, users, ads, settings

    useEffect(() => {
        // Strict Admin Check
        if (!user || user.role !== 'ADMIN') {
            router.push('/');
            return;
        }
        fetchAdminData();
    }, [user, router]);

    const fetchAdminData = async () => {
        setLoading(true);
        try {
            // In a real system, these would be specific admin endpoints
            const allAds = await apiService.get('/ads');
            setRecentAds(allAds.slice(0, 10));

            // Mocking some admin stats for now
            setStats({
                totalUsers: 1420,
                totalAds: allAds.length,
                activeSubscriptions: 85,
                pendingReports: 3
            });
        } catch (error) {
            console.error("Admin data fetch failed:", error);
        } finally {
            setLoading(false);
        }
    };

    if (!user || user.role !== 'ADMIN') return null;

    return (
        <div className="min-h-screen bg-[#0f111a] text-white flex flex-col" dir={language === 'ar' ? 'rtl' : 'ltr'}>
            {/* Admin Top Bar */}
            <header className="bg-black/50 backdrop-blur-md border-b border-white/10 py-2 px-6 flex justify-between items-center sticky top-0 z-50">
                <div className="flex items-center gap-4">
                    <div className="w-8 h-8 bg-primary rounded-xs flex items-center justify-center shadow-lg shadow-primary/20">
                        <ShieldCheck size={18} className="text-white" />
                    </div>
                    <div>
                        <h1 className="text-xs font-black uppercase tracking-[0.2em]">{language === 'ar' ? 'لوحة تحكم الإدارة' : 'SYSTEM ADMINISTRATION'}</h1>
                        <p className="text-[8px] font-bold text-primary/80 uppercase">SAHA HUB • v2.0.4</p>
                    </div>
                </div>

                <div className="flex items-center gap-6">
                    <div className="flex items-center gap-3 px-3 py-1 bg-white/5 rounded-xs border border-white/5">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                        <span className="text-[10px] font-black uppercase tracking-wider">{language === 'ar' ? 'النظام متصل' : 'CORE ONLINE'}</span>
                    </div>
                    <button onClick={() => { logout(); router.push('/'); }} className="text-[10px] font-black text-red-500 hover:text-red-400 flex items-center gap-2">
                        <LogOut size={14} />
                        {language === 'ar' ? 'خروج' : 'TERMINATE'}
                    </button>
                </div>
            </header>

            <div className="flex flex-1 overflow-hidden">
                {/* Admin Sidebar */}
                <aside className="w-56 bg-black/30 border-r border-white/5 p-4 flex flex-col gap-1 shrink-0">
                    <div className="text-[9px] font-black text-gray-500 uppercase tracking-widest mb-4 px-2">Main Navigation</div>
                    {[
                        { id: 'overview', label: language === 'ar' ? 'نظرة عامة' : 'System Overview', icon: <BarChart3 size={16} /> },
                        { id: 'users', label: language === 'ar' ? 'المستخدمين' : 'User Database', icon: <Users size={16} /> },
                        { id: 'ads', label: language === 'ar' ? 'الإعلانات' : 'Ads Moderation', icon: <Package size={16} /> },
                        { id: 'settings', label: language === 'ar' ? 'الإعدادات' : 'Global Settings', icon: <Settings size={16} /> }
                    ].map((item) => (
                        <button
                            key={item.id}
                            onClick={() => setView(item.id)}
                            className={`flex items-center gap-3 px-3 py-2.5 rounded-xs text-[11px] font-bold transition-all ${view === item.id ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}
                        >
                            {item.icon}
                            {item.label}
                        </button>
                    ))}

                    <div className="mt-auto p-3 bg-primary/5 border border-primary/10 rounded-xs">
                        <div className="flex items-center gap-2 mb-2">
                            <AlertTriangle size={14} className="text-primary" />
                            <span className="text-[10px] font-black text-primary uppercase">Security Log</span>
                        </div>
                        <p className="text-[9px] text-gray-500 font-bold leading-tight">Last admin login from 192.168.1.1 at 10:45 AM.</p>
                    </div>
                </aside>

                {/* Admin Body */}
                <main className="flex-1 overflow-y-auto p-6">
                    {loading ? (
                        <div className="h-full flex flex-col items-center justify-center opacity-20">
                            <Loader2 className="animate-spin mb-4" size={48} />
                            <span className="text-[10px] font-black uppercase tracking-widest italic">Syncing with Mainframe...</span>
                        </div>
                    ) : (
                        <div className="max-w-6xl mx-auto space-y-6">
                            {/* Stats Grid */}
                            <div className="grid grid-cols-4 gap-4">
                                {[
                                    { label: 'Total Users', value: stats.totalUsers, icon: <Users size={18} />, color: 'text-blue-500' },
                                    { label: 'Active Ads', value: stats.totalAds, icon: <Package size={18} />, color: 'text-orange-500' },
                                    { label: 'Subscriptions', value: stats.activeSubscriptions, icon: <CheckCircle2 size={18} />, color: 'text-green-500' },
                                    { label: 'Pending Reports', value: stats.pendingReports, icon: <AlertTriangle size={18} />, color: 'text-red-500' }
                                ].map((s, i) => (
                                    <div key={i} className="bg-white/5 border border-white/10 p-4 rounded-xs flex flex-col gap-2 hover:bg-white/[0.07] transition-all">
                                        <div className="flex justify-between items-center">
                                            <span className={`w-8 h-8 flex items-center justify-center rounded-xs bg-black/30 ${s.color}`}>{s.icon}</span>
                                            <span className="text-[8px] font-black text-white/30 uppercase">Live Update</span>
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-3xl font-black italic tracking-tighter leading-none">{s.value}</span>
                                            <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest mt-1">{s.label}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Tables Container */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* Recent Ads Feed */}
                                <div className="bg-white/5 border border-white/10 rounded-xs overflow-hidden flex flex-col">
                                    <div className="p-3 border-b border-white/10 flex justify-between items-center bg-black/20">
                                        <h3 className="text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                                            <Package size={14} className="text-primary" />
                                            Live Ad Stream
                                        </h3>
                                        <button className="text-[9px] font-black text-primary hover:underline">VIEW ALL</button>
                                    </div>
                                    <div className="divide-y divide-white/5">
                                        {recentAds.map((ad, i) => (
                                            <div key={ad.id} className="p-3 flex items-center justify-between hover:bg-white/[0.03] transition-colors group">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 bg-black/40 border border-white/5 rounded-xs flex items-center justify-center text-[10px] font-black italic text-white/20">#{i + 1}</div>
                                                    <div className="flex flex-col min-w-0">
                                                        <span className="text-[11px] font-black truncate group-hover:text-primary transition-colors">{ad.title}</span>
                                                        <span className="text-[9px] text-gray-500 font-bold uppercase">{ad.category} • {ad.location}</span>
                                                    </div>
                                                </div>
                                                <button className="w-6 h-6 flex items-center justify-center bg-white/5 rounded-xs hover:bg-primary hover:text-white transition-all">
                                                    <ChevronRight size={14} />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* System Logs / Recent Users */}
                                <div className="bg-white/5 border border-white/10 rounded-xs overflow-hidden flex flex-col">
                                    <div className="p-3 border-b border-white/10 flex justify-between items-center bg-black/20">
                                        <h3 className="text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                                            <Users size={14} className="text-blue-500" />
                                            Recent Access
                                        </h3>
                                    </div>
                                    <div className="p-3 space-y-3">
                                        {[
                                            { user: 'Ahmed K.', action: 'Listed a new Ad: Real Estate', time: '2m ago' },
                                            { user: 'Sarah S.', action: 'Renewed Premium Subscription', time: '15m ago' },
                                            { user: 'System', action: 'Daily database backup successful', time: '1h ago' },
                                            { user: 'Admin', action: 'Approved 15 pending merchant accounts', time: '3h ago' }
                                        ].map((log, i) => (
                                            <div key={i} className="flex gap-3 text-[10px] border-b border-white/5 pb-2 last:border-0">
                                                <span className="text-primary font-black shrink-0">[{log.time}]</span>
                                                <div className="flex flex-col">
                                                    <span className="font-black text-white/90">{log.user}</span>
                                                    <span className="text-gray-500 font-medium">{log.action}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Alert Banner */}
                            <div className="bg-red-500/10 border border-red-500/20 p-3 flex items-center justify-between rounded-xs">
                                <div className="flex items-center gap-3">
                                    <XCircle size={18} className="text-red-500" />
                                    <div className="flex flex-col">
                                        <span className="text-[10px] font-black uppercase text-red-500 tracking-widest">Urgent Maintenance</span>
                                        <p className="text-[9px] font-bold text-gray-400">Database optimization scheduled for 03:00 AM UTC. Please notify active users.</p>
                                    </div>
                                </div>
                                <button className="bg-red-500 text-white px-4 py-1 text-[9px] font-black rounded-xs">BROADCAST</button>
                            </div>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
}
