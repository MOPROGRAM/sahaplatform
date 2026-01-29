"use client";

export const runtime = "edge";


import { useAuthStore } from "@/store/useAuthStore";
import { useState, useEffect, useCallback } from "react";
import {
    ShieldCheck,
    Users,
    Package,
    BarChart3,
    Search,
    LogOut,
    AlertTriangle,
    CheckCircle2,
    ChevronRight,
    Loader2,
    Clock,
    DollarSign,
    Check,
    X,
    Trash2,
    ExternalLink,
    Sparkles,
    Flag,
    MessageSquare
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useLanguage } from "@/lib/language-context";

export default function AdminDashboard() {
    const { user, logout } = useAuthStore();
    const { language } = useLanguage();
    const router = useRouter();

    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        totalUsers: 0,
        totalAds: 0,
        pendingSubscriptions: 0,
        activeSubscriptions: 0,
        totalReports: 0,
        supportTickets: 0
    });

    const [dataList, setDataList] = useState<any[]>([]);
    const [view, setView] = useState('overview'); // overview, users, ads, subscriptions, reports, messages
    const [searchTerm, setSearchTerm] = useState('');
    const [actionLoading, setActionLoading] = useState<string | null>(null);

    const fetchDashboardData = useCallback(async () => {
        setLoading(true);
        try {
            if (view === 'overview') {
                const [usersCount, adsCount, subsPending, subsActive, reportsCount, supportCount] = await Promise.all([
                    (supabase as any).from('users').select('*', { count: 'exact', head: true }),
                    (supabase as any).from('ads').select('*', { count: 'exact', head: true }),
                    (supabase as any).from('subscription_requests').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
                    (supabase as any).from('subscription_requests').select('*', { count: 'exact', head: true }).eq('status', 'completed'),
                    (supabase as any).from('reports').select('*', { count: 'exact', head: true }),
                    (supabase as any).from('conversations').select('*', { count: 'exact', head: true }).is('ad_id', null)
                ]);

                setStats({
                    totalUsers: usersCount.count || 0,
                    totalAds: adsCount.count || 0,
                    pendingSubscriptions: subsPending.count || 0,
                    activeSubscriptions: subsActive.count || 0,
                    totalReports: reportsCount.error ? 0 : (reportsCount.count || 0),
                    supportTickets: supportCount.count || 0
                });

                // Fetch recent ads for overview
                const { data: recentAds } = await (supabase as any)
                    .from('ads')
                    .select('*')
                    .order('created_at', { ascending: false })
                    .limit(5);
                setDataList(recentAds || []);

            } else if (view === 'users') {
                const { data } = await (supabase as any)
                    .from('users')
                    .select('*')
                    .order('created_at', { ascending: false });
                setDataList(data || []);
            } else if (view === 'ads') {
                const { data } = await (supabase as any)
                    .from('ads')
                    .select('*')
                    .order('created_at', { ascending: false });
                setDataList(data || []);
            } else if (view === 'subscriptions') {
                const { data } = await (supabase as any)
                    .from('subscription_requests')
                    .select('*')
                    .order('created_at', { ascending: false });
                setDataList(data || []);
            } else if (view === 'reports') {
                 const { data, error } = await (supabase as any)
                    .from('reports')
                    .select('*')
                    .order('created_at', { ascending: false });
                if (error) {
                    console.warn("Reports table might not exist", error);
                    setDataList([]); 
                } else {
                    setDataList(data || []);
                }
            } else if (view === 'messages') {
                const { data } = await (supabase as any)
                    .from('conversations')
                    .select(`
                        *,
                        participants:conversation_participants(
                            user:users!user_id(id, name, email)
                        )
                    `)
                    .is('ad_id', null)
                    .order('last_message_time', { ascending: false });
                setDataList(data || []);
            }
        } catch (error) {
            console.error("Fetch failed:", error);
        } finally {
            setLoading(false);
        }
    }, [view]);

    useEffect(() => {
        // Strict Admin Check - Allow motwasel@yahoo.com
        if (!user || (user.role !== 'ADMIN' && user.email !== 'motwasel@yahoo.com')) {
            router.push('/');
            return;
        }
        fetchDashboardData();
    }, [user, router, view, fetchDashboardData]);

    const handleUpdateAdStatus = async (id: string, active: boolean) => {
        setActionLoading(id);
        try {
            await (supabase as any).from('ads').update({ is_active: active }).eq('id', id);
            fetchDashboardData();
        } catch (err) {
            console.error(err);
        } finally {
            setActionLoading(null);
        }
    };

    const handleUpdateSubStatus = async (id: string, status: string) => {
        setActionLoading(id);
        try {
            if (status === 'completed') {
                const { data: request } = await (supabase as any)
                    .from('subscription_requests')
                    .select('*')
                    .eq('id', id)
                    .single();

                if (request && request.message && request.user_id) {
                    const pointsMatch = request.message.match(/\[System\] Points: (\d+)/);
                    if (pointsMatch && pointsMatch[1]) {
                        const pointsToAdd = parseInt(pointsMatch[1]);
                        if (pointsToAdd > 0 && request.user_id) {
                            const { data: userData, error: pointsError } = await (supabase as any)
                                .from('users')
                                .select('points')
                                .eq('id', request.user_id)
                                .single();

                            if (!pointsError) {
                                const currentPoints = (userData && typeof userData.points === 'number') ? userData.points : 0;
                                const newPoints = currentPoints + pointsToAdd;

                                await (supabase as any)
                                    .from('users')
                                    .update({ points: newPoints })
                                    .eq('id', request.user_id);
                            } else {
                                console.warn('Points column fetch failed or user not found', pointsError);
                            }
                        }
                    }
                }
            }

            await (supabase as any).from('subscription_requests').update({ status }).eq('id', id);
            fetchDashboardData();
        } catch (err) {
            console.error(err);
        } finally {
            setActionLoading(null);
        }
    };

    const handleDeleteAd = async (id: string) => {
        if (!confirm('Are you sure you want to delete this ad?')) return;
        setActionLoading(id);
        try {
            await (supabase as any).from('ads').delete().eq('id', id);
            fetchDashboardData();
        } catch (err) {
            console.error(err);
        } finally {
            setActionLoading(null);
        }
    };

    const handleToggleBoost = async (id: string, boost: boolean) => {
        setActionLoading(id);
        try {
            await (supabase as any).from('ads').update({ is_boosted: boost }).eq('id', id);
            fetchDashboardData();
        } catch (err) {
            console.error(err);
        } finally {
            setActionLoading(null);
        }
    };

    const handleResolveReport = async (id: string) => {
        setActionLoading(id);
        try {
            // Assuming we delete the report when resolved
            await (supabase as any).from('reports').delete().eq('id', id);
            fetchDashboardData();
        } catch (err) {
            console.error(err);
        } finally {
            setActionLoading(null);
        }
    };

    if (!user || (user.role !== 'ADMIN' && user.email !== 'motwasel@yahoo.com')) return null;

    return (
        <div className="min-h-screen bg-gray-bg text-[#e1e1e1] flex flex-col font-sans" dir={language === 'ar' ? 'rtl' : 'ltr'}>
            {/* Minimal High-Tech Top Bar */}
            <header className="bg-card border-b border-border-color h-14 flex items-center justify-between px-6 sticky top-0 z-50">
                <div className="flex items-center gap-4">
                    <div className="w-9 h-9 bg-primary/20 border border-primary/50 text-primary flex items-center justify-center rounded-sm">
                        <ShieldCheck size={20} />
                    </div>
                    <div>
                        <h1 className="text-[11px] font-black uppercase tracking-[0.2em] leading-none mb-1">
                            {language === 'ar' ? 'بوابة الإشراف المركزية' : 'CENTRAL ADMINISTRATION PORTAL'}
                        </h1>
                        <div className="flex items-center gap-2">
                            <span className="text-[8px] font-bold text-gray-500 tracking-widest">{language === 'ar' ? 'نواة صحة 3.0' : 'saha core v3.0'}</span>
                            <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.5)]"></div>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-6">
                    <div className="hidden md:flex items-center gap-4 border-l border-border-color pl-6 h-14">
                        <div className="flex flex-col items-end">
                            <span className="text-[10px] font-black text-white leading-none uppercase">{user.name}</span>
                            <span className="text-[8px] font-bold text-primary uppercase mt-1">{language === 'ar' ? 'مدير عام' : 'SUPER_ADMIN'}</span>
                        </div>
                        <button onClick={() => { logout(); router.push('/'); }} className="w-8 h-8 rounded-full bg-card hover:bg-red-500/20 text-text-muted hover:text-red-500 flex items-center justify-center transition-all border border-transparent hover:border-red-500/30">
                            <LogOut size={16} />
                        </button>
                    </div>
                </div>
            </header>

            <div className="flex flex-1 overflow-hidden">
                {/* Sleek Dark Sidebar */}
                <aside className="w-64 bg-gray-bg border-r border-border-color p-4 flex flex-col gap-1.5">
                    <div className="text-[9px] font-black text-gray-500 uppercase tracking-[0.2em] mb-4 mt-2 px-3">{language === 'ar' ? 'وحدات النظام' : 'System Modules'}</div>
                    {[
                        { id: 'overview', label: language === 'ar' ? 'نظرة عامة' : 'DASHBOARD OVERVIEW', icon: <BarChart3 size={18} /> },
                        { id: 'messages', label: language === 'ar' ? 'رسائل الدعم' : 'SUPPORT MESSAGES', icon: <MessageSquare size={18} />, badge: stats.supportTickets },
                        { id: 'subscriptions', label: language === 'ar' ? 'طلبات الاشتراكات' : 'PAID AD REQUESTS', icon: <DollarSign size={18} />, badge: stats.pendingSubscriptions },
                        { id: 'reports', label: language === 'ar' ? 'البلاغات' : 'USER REPORTS', icon: <Flag size={18} />, badge: stats.totalReports > 0 ? stats.totalReports : undefined },
                        { id: 'ads', label: language === 'ar' ? 'إدارة الإعلانات' : 'AD MODERATION', icon: <Package size={18} /> },
                        { id: 'users', label: language === 'ar' ? 'قاعدة المستخدمين' : 'USER DATABASE', icon: <Users size={18} /> },
                    ].map((item) => (
                        <button
                            key={item.id}
                            onClick={() => setView(item.id)}
                            className={`flex items-center justify-between group px-4 py-3 rounded-sm transition-all duration-200 border ${view === item.id
                                ? 'bg-primary/10 border-primary/30 text-primary shadow-[inset_0_0_20px_rgba(var(--primary-color),0.05)]'
                                : 'text-text-muted border-transparent hover:bg-card hover:text-white'}`}
                        >
                            <div className="flex items-center gap-3">
                                {item.icon}
                                <span className="text-[11px] font-black tracking-wider">{item.label}</span>
                            </div>
                            {item.badge ? (
                                <span className="bg-primary text-black text-[9px] font-black w-4 h-4 flex items-center justify-center rounded-full animate-pulse">
                                    {item.badge}
                                </span>
                            ) : (
                                <ChevronRight size={14} className={`opacity-0 group-hover:opacity-100 transition-all ${language === 'ar' ? 'rotate-180' : ''}`} />
                            )}
                        </button>
                    ))}
                </aside>

                {/* Main Content Area */}
                <main className="flex-1 overflow-y-auto bg-gray-bg p-8 custom-scrollbar">
                    {loading ? (
                        <div className="h-full flex flex-col items-center justify-center">
                            <div className="relative w-16 h-16">
                                <Loader2 className="animate-spin text-primary absolute inset-0" size={64} strokeWidth={1} />
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <ShieldCheck size={24} className="text-primary/50" />
                                </div>
                            </div>
                            <span className="text-[10px] font-black uppercase tracking-[0.3em] mt-8 text-primary animate-pulse">{language === 'ar' ? 'جاري تهيئة الواجهة...' : 'Initializing Interface...'}</span>
                        </div>
                    ) : (
                        <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">

                            {/* Page Heading */}
                            <div className="flex items-end justify-between border-b border-white/5 pb-6">
                                <div>
                                    <h2 className="text-3xl font-black uppercase tracking-tighter leading-none mb-2 italic">
                                        {view === 'overview' && (language === 'ar' ? 'النظرة العامة' : 'SYSTEM STATUS')}
                                        {view === 'messages' && (language === 'ar' ? 'رسائل الدعم الفني' : 'SUPPORT CENTER')}
                                        {view === 'subscriptions' && (language === 'ar' ? 'الاشتراكات المدفوعة' : 'FINANCIAL OPS')}
                                        {view === 'reports' && (language === 'ar' ? 'بلاغات المستخدمين' : 'USER REPORTS')}
                                        {view === 'ads' && (language === 'ar' ? 'الرقابة على الإعلانات' : 'CONTENT MODERATION')}
                                        {view === 'users' && (language === 'ar' ? 'قاعدة البيانات' : 'USER INFRASTRUCTURE')}
                                    </h2>
                                    <p className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em]">Real-time synchronization active &bull; No latency detected</p>
                                </div>

                                {view !== 'overview' && (
                                    <div className="relative group">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-primary transition-colors" size={14} />
                                        <input
                                            type="text"
                                            placeholder="FILTER ARCHIVES..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            className="bg-card border border-border-color rounded-sm py-2 pl-9 pr-4 text-[11px] font-bold outline-none focus:border-primary/50 focus:ring-4 ring-primary/5 transition-all w-64 uppercase tracking-wider"
                                        />
                                    </div>
                                )}
                            </div>

                            {view === 'overview' && (
                                <>
                                    {/* Advanced Bento Grid Stats */}
                                    <div className="bento-grid">
                                        {[
                                            { label: 'Network Nodes', value: stats.totalUsers, icon: <Users size={20} />, color: 'bg-blue-500/10 border-blue-500/20 text-blue-500', trend: '+12% INC', size: 'bento-small' },
                                            { label: 'Active Assets', value: stats.totalAds, icon: <Package size={20} />, color: 'bg-primary/10 border-primary/20 text-primary', trend: 'STABLE', size: 'bento-small' },
                                            { label: 'Pending Subs', value: stats.pendingSubscriptions, icon: <Clock size={20} />, color: 'bg-yellow-500/10 border-yellow-500/20 text-yellow-500', trend: 'CRITICAL', highlight: stats.pendingSubscriptions > 0, size: 'bento-large' },
                                            { label: 'Completed Rev', value: stats.activeSubscriptions, icon: <DollarSign size={20} />, color: 'bg-green-500/10 border-green-500/20 text-green-500', trend: 'OPTIMIZED', size: 'bento-small' }
                                        ].map((s, i) => (
                                            <div key={i} className={`depth-card group relative p-6 overflow-hidden ${s.size} ${s.highlight ? 'ring-1 ring-primary/50' : ''}`}>
                                                <div className="flex justify-between items-start mb-4">
                                                    <div className={`w-10 h-10 flex items-center justify-center rounded-sm ${s.color}`}>
                                                        {s.icon}
                                                    </div>
                                                    <span className={`text-[8px] font-black uppercase tracking-widest ${s.color} opacity-80`}>{s.trend}</span>
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-4xl font-black tracking-tighter italic leading-none mb-2">{s.value}</span>
                                                    <span className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">{s.label}</span>
                                                </div>
                                                {/* Futuristic Decor - solid shape (no blur) */}
                                                <div className="absolute -bottom-2 -right-2 w-16 h-16 bg-card rounded-full group-hover:bg-primary/10 transition-all"></div>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Action Feed */}
                                    <div className="bento-grid">
                                        <div className="depth-card flex flex-col min-h-[400px] bento-large">
                                            <div className="p-4 border-b border-border-color flex justify-between items-center">
                                                <h3 className="text-[11px] font-black tracking-[0.2em] flex items-center gap-2">
                                                    <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                                                    {language === 'ar' ? 'أحدث الأصول' : 'RECENT ASSETS'}
                                                </h3>
                                                <button onClick={() => setView('ads')} className="text-[9px] font-black text-primary hover:tracking-widest transition-all uppercase">DECRYPT ALL</button>
                                            </div>
                                            <div className="flex-1 overflow-y-auto">
                                                {dataList.length === 0 ? (
                                                    <div className="h-full flex flex-col items-center justify-center opacity-30 italic p-12 text-center">
                                                        <Package size={32} className="mb-4" />
                                                        <span className="text-[10px] font-black uppercase">Archive Empty</span>
                                                    </div>
                                                ) : (
                                                    dataList.map((ad, i) => (
                                                        <div key={ad.id} className="p-4 flex items-center justify-between border-b border-border-color hover:bg-card transition-all group">
                                                            <div className="flex items-center gap-4">
                                                                <div className="w-10 h-10 bg-card border border-border-color flex items-center justify-center text-[10px] font-black italic text-gray-600">ID.{i + 1}</div>
                                                                <div className="flex flex-col">
                                                                    <span className="text-[12px] font-black group-hover:text-primary transition-colors">{ad.title}</span>
                                                                    <span className="text-[9px] text-gray-500 font-bold uppercase tracking-wider">{ad.category} &bull; {ad.location}</span>
                                                                </div>
                                                            </div>
                                                            <Link href={`/ads/view?id=${ad.id}`} target="_blank" className="w-8 h-8 flex items-center justify-center bg-card rounded-sm hover:bg-primary hover:text-black transition-all">
                                                                <ChevronRight size={16} />
                                                            </Link>
                                                        </div>
                                                    ))
                                                )}
                                            </div>
                                        </div>

                                        <div className="depth-card flex flex-col min-h-[400px] bento-small">
                                            <div className="p-4 border-b border-border-color flex items-center gap-2">
                                                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                                                <h3 className="text-[11px] font-black tracking-[0.2em]">SECURITY BROADCAST</h3>
                                            </div>
                                            <div className="p-6 space-y-6">
                                                {[
                                                    { icon: <Clock size={16} />, title: "NEW ENTRY DETECTED", desc: "A user has registered from a new IP segment.", time: "18:04:12" },
                                                    { icon: <DollarSign size={16} />, title: "REVENUE OPPORTUNITY", desc: "Premium ad request awaiting manual verification.", time: "17:42:01", highlight: true },
                                                    { icon: <AlertTriangle size={16} />, title: "ASSET MODERATION", desc: "User reported a suspicious listing in Real Estate section.", time: "15:20:55" },
                                                    { icon: <CheckCircle2 size={16} />, title: "SYNC SUCCESSFUL", desc: "Full database backup committed to secondary server cluster.", time: "12:00:00" },
                                                ].map((log, i) => (
                                                    <div key={i} className={`flex gap-4 p-4 rounded-sm border ${log.highlight ? 'bg-primary/10 border-primary/30' : 'bg-card border-border-color'}`}>
                                                        <div className={log.highlight ? 'text-primary' : 'text-gray-500'}>{log.icon}</div>
                                                        <div className="flex flex-col">
                                                            <div className="flex items-center gap-2 mb-1">
                                                                <span className={`text-[10px] font-black uppercase tracking-widest ${log.highlight ? 'text-primary' : 'text-white'}`}>{log.title}</span>
                                                                <span className="text-[8px] font-bold text-gray-500">@{log.time}</span>
                                                            </div>
                                                            <p className="text-[10px] font-bold text-text-muted italic">&quot;{log.desc}&quot;</p>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </>
                            )}

                            {view !== 'overview' && (
                                <div className="depth-card overflow-hidden shadow-2xl">
                                    <table className="w-full text-left">
                                        <thead>
                                            <tr className="bg-card border-b border-border-color">
                                                <th className="p-4 text-[10px] font-black uppercase tracking-widest text-gray-500">Identification / Meta</th>
                                                <th className="p-4 text-[10px] font-black uppercase tracking-widest text-gray-500">Current Status</th>
                                                <th className="p-4 text-[10px] font-black uppercase tracking-widest text-gray-500">Operation / Action</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-white/[0.03]">
                                            {dataList.filter(item =>
                                                view === 'users' ? (item.name?.toLowerCase().includes(searchTerm.toLowerCase()) || item.email?.toLowerCase().includes(searchTerm.toLowerCase())) :
                                                    view === 'ads' ? (item.title?.toLowerCase().includes(searchTerm.toLowerCase())) :
                                                    view === 'reports' ? (item.reason?.toLowerCase().includes(searchTerm.toLowerCase()) || item.ad_id?.includes(searchTerm)) :
                                                    view === 'messages' ? (
                                                        item.participants?.some((p: any) => p.user.name?.toLowerCase().includes(searchTerm.toLowerCase())) ||
                                                        item.last_message?.toLowerCase().includes(searchTerm.toLowerCase())
                                                    ) :
                                                        (item.user_name?.toLowerCase().includes(searchTerm.toLowerCase()) || item.package_name?.toLowerCase().includes(searchTerm.toLowerCase()))
                                            ).map((item) => (
                                                <tr key={item.id} className="hover:bg-card transition-colors group">
                                                    <td className="p-4">
                                                        {view === 'users' && (
                                                            <div className="flex flex-col">
                                                                <span className="text-[12px] font-black text-white group-hover:text-primary transition-colors">{item.name}</span>
                                                                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{item.email}</span>
                                                                <span className="text-[8px] font-black text-primary/50 uppercase mt-1 tracking-[0.2em]">{item.role || 'USER'}</span>
                                                            </div>
                                                        )}
                                                        {view === 'ads' && (
                                                            <div className="flex flex-col">
                                                                <span className="text-[12px] font-black text-white group-hover:text-primary transition-colors">{item.title}</span>
                                                                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{item.category} &bull; {item.location}</span>
                                                                <span className="text-[8px] font-black text-gray-600 uppercase mt-1">ID: {item.id}</span>
                                                            </div>
                                                        )}
                                                        {view === 'subscriptions' && (
                                                            <div className="flex flex-col">
                                                                <span className="text-[12px] font-black text-white group-hover:text-primary transition-colors truncate max-w-[200px]">{item.package_name}</span>
                                                                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{item.user_name} &bull; {item.user_phone}</span>
                                                                <span className="text-[10px] font-black text-primary uppercase mt-1">{item.package_price}</span>
                                                                {item.message && item.message.includes('Payment Verified') && (
                                                                    <span className="text-[8px] font-mono text-green-500 mt-1 bg-green-500/5 p-1 rounded border border-green-500/10 block whitespace-pre-wrap">
                                                                        {item.message.split('[System]')[1] || 'Payment Info Available'}
                                                                    </span>
                                                                )}
                                                            </div>
                                                        )}
                                                        {view === 'reports' && (
                                                            <div className="flex flex-col">
                                                                <span className="text-[12px] font-black text-white group-hover:text-primary transition-colors">{item.reason || 'No Reason Provided'}</span>
                                                                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">AD ID: {item.ad_id}</span>
                                                                <span className="text-[8px] font-black text-red-500 uppercase mt-1">REPORT ID: {item.id}</span>
                                                            </div>
                                                        )}
                                                        {view === 'messages' && (
                                                            <div className="flex flex-col">
                                                                <span className="text-[12px] font-black text-white group-hover:text-primary transition-colors">
                                                                    {item.participants?.find((p: any) => p.user.id !== user?.id)?.user?.name || 'Unknown User'}
                                                                </span>
                                                                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest truncate max-w-[200px]">
                                                                    {item.last_message || 'No messages'}
                                                                </span>
                                                                <span className="text-[8px] font-black text-primary/50 uppercase mt-1 tracking-[0.2em]">TICKET ID: {item.id.substring(0, 8)}</span>
                                                            </div>
                                                        )}
                                                    </td>
                                                    <td className="p-4">
                                                        {view === 'users' && (
                                                            <div className="flex items-center gap-2">
                                                                {item.verified ? (
                                                                    <span className="bg-green-500/10 text-green-500 border border-green-500/20 px-2 py-1 text-[9px] font-black uppercase tracking-widest rounded-sm">VERIFIED</span>
                                                                ) : (
                                                                    <span className="bg-primary/10 text-primary border border-primary/20 px-2 py-1 text-[9px] font-black uppercase tracking-widest rounded-sm">PENDING_KYC</span>
                                                                )}
                                                            </div>
                                                        )}
                                                        {view === 'ads' && (
                                                            <div className="flex items-center gap-2">
                                                                {item.is_active ? (
                                                                    <span className="bg-green-500/10 text-green-500 border border-green-500/20 px-2 py-1 text-[9px] font-black uppercase tracking-widest rounded-sm">BROADCASTING</span>
                                                                ) : (
                                                                    <span className="bg-red-500/10 text-red-500 border border-red-500/20 px-2 py-1 text-[9px] font-black uppercase tracking-widest rounded-sm">OFFLINE</span>
                                                                )}
                                                                {item.is_boosted && (
                                                                    <span className="bg-primary/20 text-primary border border-primary/30 px-2 py-1 text-[9px] font-black uppercase tracking-widest rounded-sm">BOOSTED</span>
                                                                )}
                                                            </div>
                                                        )}
                                                        {view === 'subscriptions' && (
                                                            <div className="flex items-center gap-2">
                                                                <span className={`px-2 py-1 text-[9px] font-black uppercase tracking-widest rounded-sm border ${item.status === 'completed' ? 'bg-green-500/10 text-green-500 border-green-500/20' :
                                                                    item.status === 'pending' ? 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20' :
                                                                        'bg-red-500/10 text-red-500 border-red-500/20'
                                                                    }`}>
                                                                    {item.status}
                                                                </span>
                                                            </div>
                                                        )}
                                                        {view === 'reports' && (
                                                            <div className="flex items-center gap-2">
                                                                <span className="bg-red-500/10 text-red-500 border border-red-500/20 px-2 py-1 text-[9px] font-black uppercase tracking-widest rounded-sm">PENDING REVIEW</span>
                                                            </div>
                                                        )}
                                                        {view === 'messages' && (
                                                            <div className="flex items-center gap-2">
                                                                 <span className="text-[10px] font-mono text-gray-400" suppressHydrationWarning>
                                                                     {item?.last_message_time ? new Date(item.last_message_time).toLocaleString(language === 'ar' ? 'ar-EG' : 'en-US') : ''}
                                                                 </span>
                                                            </div>
                                                        )}
                                                    </td>
                                                    <td className="p-4">
                                                        <div className="flex items-center gap-2">
                                                            {view === 'ads' && (
                                                                <>
                                                                    <button
                                                                        disabled={actionLoading === item.id}
                                                                        onClick={() => handleUpdateAdStatus(item.id, !item.is_active)}
                                                                        className={`w-8 h-8 flex items-center justify-center rounded-sm transition-all ${item.is_active ? 'bg-primary/10 text-primary hover:bg-primary hover:text-white' : 'bg-green-500/10 text-green-500 hover:bg-green-500 hover:text-white'}`}
                                                                    >
                                                                        {item.is_active ? <X size={16} /> : <Check size={16} />}
                                                                    </button>
                                                                    <button
                                                                        disabled={actionLoading === item.id}
                                                                        onClick={() => handleToggleBoost(item.id, !item.is_boosted)}
                                                                        className={`w-8 h-8 flex items-center justify-center rounded-sm transition-all ${item.is_boosted ? 'bg-primary/20 text-primary hover:bg-primary hover:text-white glow-active' : 'bg-card text-gray-700 hover:bg-primary/10'}`}
                                                                    >
                                                                        <Sparkles size={14} />
                                                                    </button>
                                                                    <Link href={`/ads/view?id=${item.id}`} target="_blank" className="w-8 h-8 flex items-center justify-center rounded-sm bg-blue-500/10 text-blue-500 hover:bg-blue-500 hover:text-white transition-all">
                                                                        <ExternalLink size={16} />
                                                                    </Link>
                                                                    <button
                                                                        disabled={actionLoading === item.id}
                                                                        onClick={() => handleDeleteAd(item.id)}
                                                                        className="w-8 h-8 flex items-center justify-center rounded-sm bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-all"
                                                                    >
                                                                        <Trash2 size={16} />
                                                                    </button>
                                                                </>
                                                            )}
                                                            {view === 'subscriptions' && (
                                                                <>
                                                                    <button
                                                                        disabled={actionLoading === item.id}
                                                                        onClick={() => handleUpdateSubStatus(item.id, 'completed')}
                                                                        className="flex items-center gap-2 px-3 py-1.5 rounded-sm bg-green-500/20 text-green-500 text-[9px] font-black uppercase tracking-widest hover:bg-green-500 hover:text-black transition-all"
                                                                    >
                                                                        <Check size={12} />
                                                                        Approve
                                                                    </button>
                                                                    <button
                                                                        disabled={actionLoading === item.id}
                                                                        onClick={() => handleUpdateSubStatus(item.id, 'cancelled')}
                                                                        className="flex items-center gap-2 px-3 py-1.5 rounded-sm bg-red-500/20 text-red-500 text-[9px] font-black uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all"
                                                                    >
                                                                        <X size={12} />
                                                                        Reject
                                                                    </button>
                                                                </>
                                                            )}
                                                            {view === 'reports' && (
                                                                <>
                                                                    <Link href={`/ads/view?id=${item.ad_id}`} target="_blank" className="w-8 h-8 flex items-center justify-center rounded-sm bg-blue-500/10 text-blue-500 hover:bg-blue-500 hover:text-white transition-all">
                                                                        <ExternalLink size={16} />
                                                                    </Link>
                                                                    <button
                                                                        disabled={actionLoading === item.id}
                                                                        onClick={() => handleResolveReport(item.id)}
                                                                        className="w-8 h-8 flex items-center justify-center rounded-sm bg-green-500/10 text-green-500 hover:bg-green-500 hover:text-white transition-all"
                                                                        title="Resolve (Delete Report)"
                                                                    >
                                                                        <Check size={16} />
                                                                    </button>
                                                                    <button
                                                                        disabled={actionLoading === item.id}
                                                                        onClick={() => handleDeleteAd(item.ad_id)}
                                                                        className="w-8 h-8 flex items-center justify-center rounded-sm bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-all"
                                                                        title="Delete Ad"
                                                                    >
                                                                        <Trash2 size={16} />
                                                                    </button>
                                                                </>
                                                            )}
                                                            {view === 'users' && (
                                                                <button className="flex items-center gap-2 px-3 py-1.5 rounded-sm bg-primary/20 text-primary text-[9px] font-black uppercase tracking-widest hover:bg-primary hover:text-black transition-all">
                                                                    <ShieldCheck size={12} />
                                                                    Manage
                                                                </button>
                                                            )}
                                                            {view === 'messages' && (
                                                                <button
                                                                    onClick={() => router.push(`/messages?id=${item.id}`)}
                                                                    className="flex items-center gap-2 bg-primary/10 text-primary border border-primary/20 px-3 py-1.5 text-[9px] font-black uppercase tracking-widest rounded-sm hover:bg-primary hover:text-black transition-all"
                                                                >
                                                                    <MessageSquare size={14} />
                                                                    {language === 'ar' ? 'رد' : 'REPLY'}
                                                                </button>
                                                            )}
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}

                        </div>
                    )}
                </main>
            </div>
        </div>
    );
}
