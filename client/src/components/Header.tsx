"use client";

import Link from "next/link";
import { Search, PlusCircle, MessageSquare, Bell, User, LayoutDashboard, LogOut, ShieldCheck, Globe, Moon, Sun, MapPin, ChevronDown } from "lucide-react";
import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";
import { useLanguage } from "@/lib/language-context";
import { apiService } from "@/lib/api";

export default function Header() {
    const { user, logout } = useAuthStore();
    const { language, setLanguage, t, theme, toggleTheme, country, setCountry, currency, setCurrency } = useLanguage();
    const router = useRouter();
    const pathname = usePathname();
    const [unreadCount, setUnreadCount] = useState(0);
    const [isScrolled, setIsScrolled] = useState(false);
    const [showRegion, setShowRegion] = useState(false);
    const [showUserMenu, setShowUserMenu] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    const currencyMap: Record<string, string> = {
        sa: 'sar',
        ae: 'aed',
        kw: 'kwd',
        qa: 'qar',
        bh: 'bhd',
        om: 'omr',
        eg: 'egp'
    };

    useEffect(() => {
        const handleScroll = () => setIsScrolled(window.scrollY > 0);
        window.addEventListener('scroll', handleScroll);
        if (user) fetchUnreadCount();
        const interval = setInterval(() => {
            if (user) fetchUnreadCount();
        }, 30000); // Check every 30s
        return () => {
            window.removeEventListener('scroll', handleScroll);
            clearInterval(interval);
        };
    }, [user]);

    const handleRegionSelect = (c: string) => {
        setCountry(c);
        setCurrency(currencyMap[c] || 'sar');
        setShowRegion(false);
    };

    const fetchUnreadCount = async () => {
        try {
            const conversations = await apiService.get('/conversations');
            // Simplified unread count logic
            setUnreadCount(conversations.length > 0 ? 2 : 0); // Mocking for now as we don't have separate count API
        } catch (e) {
            console.error(e);
        }
    };

    return (
        <header className={`bg-card border-color shadow-sm sticky top-0 z-[100] transition-all duration-300 ${isScrolled ? 'py-1' : 'py-2'}`}>
            <div className="max-w-7xl mx-auto px-4 flex items-center gap-6">
                {/* Brand - Sharp High Density */}
                <Link href="/" className="flex flex-col group shrink-0">
                    <span className="text-3xl font-[1000] tracking-tighter text-text-main leading-none uppercase -mb-0.5">{t('siteName')}</span>
                    <div className="h-1.5 w-full bg-primary mt-1.5 shadow-md group-hover:scale-x-105 transition-transform origin-left"></div>
                </Link>

                {/* Region & Currency Selector */}
                <div className="relative">
                    <button
                        onClick={() => setShowRegion(!showRegion)}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 dark:bg-slate-900 border border-border-color rounded-md hover:border-primary transition-all group"
                    >
                        <MapPin size={12} className="text-primary" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-text-main">{t(country as any)} | {t(currency as any)}</span>
                        <ChevronDown size={10} className="text-gray-400 group-hover:text-primary transition-colors" />
                    </button>

                    {showRegion && (
                        <>
                            <div className="fixed inset-0 z-[105]" onClick={() => setShowRegion(false)}></div>
                            <div className="absolute top-full mt-2 left-0 w-64 bg-card-bg border-2 border-border-color shadow-[0_20px_50px_rgba(0,0,0,0.15)] rounded-md p-4 z-[110] animate-in fade-in slide-in-from-top-2 duration-200">
                                <div className="space-y-4">
                                    <div>
                                        <h4 className="text-[10px] font-black uppercase tracking-widest text-text-muted mb-2">{t('country')}</h4>
                                        <div className="grid grid-cols-2 gap-2">
                                            {['sa', 'ae', 'kw', 'qa', 'bh', 'om', 'eg'].map(c => (
                                                <button
                                                    key={c}
                                                    onClick={() => handleRegionSelect(c)}
                                                    className={`px-2 py-2 text-[10px] font-bold rounded border transition-all ${country === c ? 'border-primary text-primary bg-primary/5' : 'border-border-color text-text-main hover:bg-gray-50 dark:hover:bg-slate-800'}`}
                                                >
                                                    {t(c as any)}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="pt-3 border-t border-border-color">
                                        <h4 className="text-[10px] font-black uppercase tracking-widest text-text-muted mb-2">{t('currency')}</h4>
                                        <button className="w-full px-2 py-2 text-[10px] font-black text-primary border-2 border-primary bg-primary/5 rounded uppercase tracking-widest">
                                            {t(currency as any)}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </>
                    )}
                </div>

                {/* Micro Search Bar */}
                <div className="flex-1 max-w-xl relative group">
                    <div className="flex border border-border-color rounded-sm overflow-hidden bg-gray-50 focus-within:border-primary focus-within:bg-card-bg transition-all shadow-sm">
                        <input
                            type="text"
                            placeholder={t('searchPlaceholder')}
                            className="flex-1 px-4 py-2.5 text-[14px] outline-none font-bold bg-transparent text-text-main placeholder:text-gray-400"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onKeyDown={(e) => { if (e.key === 'Enter') router.push(`/ads?search=${encodeURIComponent(searchQuery)}`); }}
                        />
                        <button
                            className="px-4 text-text-muted group-focus-within:text-primary transition-colors"
                            onClick={() => router.push(`/ads?search=${encodeURIComponent(searchQuery)}`)}
                        >
                            <Search size={18} />
                        </button>
                    </div>
                </div>

                {/* Navigation */}
                <nav className="hidden md:flex items-center gap-6">
                    <Link href="/" className={`text-[11px] font-black uppercase tracking-widest transition-colors ${pathname === '/' ? 'text-primary border-b-2 border-primary' : 'text-text-main hover:text-primary'}`}>
                        {t('home')}
                    </Link>
                    <Link href="/ads" className={`text-[11px] font-black uppercase tracking-widest transition-colors ${pathname?.startsWith('/ads') ? 'text-primary border-b-2 border-primary' : 'text-text-main hover:text-primary'}`}>
                        {t('ads')}
                    </Link>
                    <Link href="/advertise" className={`text-[11px] font-black uppercase tracking-widest transition-colors ${pathname === '/advertise' ? 'text-primary border-b-2 border-primary' : 'text-text-main hover:text-primary'}`}>
                        {t('advertise')}
                    </Link>
                </nav>

                {/* Action Grid - Ultra Density */}
                <div className="flex items-center gap-3">
                    <div className="hidden lg:flex items-center gap-2 border-r border-border-color pr-3 mr-1">
                        <button
                            onClick={toggleTheme}
                            className="p-2 text-text-muted hover:text-primary transition-colors bg-gray-50 rounded-md border border-border-color"
                        >
                            {theme === 'light' ? <Moon size={16} /> : <Sun size={16} />}
                        </button>
                        <button onClick={() => setLanguage(language === 'ar' ? 'en' : 'ar')} className="btn-saha-outline !px-3 !py-1 !text-[11px] !border-b-[3px]">
                            <Globe size={14} /> {language === 'ar' ? 'English' : 'العربية'}
                        </button>
                    </div>

                    {user ? (
                        <div className="flex items-center gap-3">
                            <div className="relative">
                                <button
                                    onClick={() => setShowUserMenu(!showUserMenu)}
                                    className="flex items-center gap-2 px-2 py-1 hover:bg-gray-50 rounded-md transition-all group border border-transparent hover:border-gray-200"
                                >
                                    <div className="w-9 h-9 bg-primary/10 rounded-full flex items-center justify-center text-[15px] font-[1000] text-primary border-2 border-primary/20 uppercase shrink-0">
                                        {user.name?.substring(0, 1)}
                                    </div>
                                    <div className="hidden sm:flex flex-col leading-none">
                                        <span className="text-[12px] font-[1000] text-text-main uppercase tracking-tight">{user.name}</span>
                                        <span className="text-[9px] font-bold text-text-muted mt-1">{user.role === 'ADMIN' ? t('adminLabel') : t('merchantLabel')}</span>
                                    </div>
                                    <ChevronDown size={12} className="text-gray-400 ml-1" />
                                </button>

                                {showUserMenu && (
                                    <>
                                        <div className="fixed inset-0 z-[105]" onClick={() => setShowUserMenu(false)}></div>
                                        <div className="absolute top-full right-0 mt-2 w-48 bg-card-bg border-2 border-border-color shadow-[0_20px_50px_rgba(0,0,0,0.15)] rounded-md py-2 z-[110] animate-in fade-in slide-in-from-top-2 duration-200">
                                            <div className="space-y-1">
                                                <Link href="/dashboard" className="flex items-center gap-3 px-4 py-2 text-[11px] font-black uppercase tracking-widest text-text-main hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors" onClick={() => setShowUserMenu(false)}>
                                                    <LayoutDashboard size={14} />
                                                    {t('dashboard')}
                                                </Link>
                                                <Link href="/ads/my" className="flex items-center gap-3 px-4 py-2 text-[11px] font-black uppercase tracking-widest text-text-main hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors" onClick={() => setShowUserMenu(false)}>
                                                    <ShieldCheck size={14} />
                                                    {t('myAds')}
                                                </Link>
                                                <Link href="/messages" className="flex items-center gap-3 px-4 py-2 text-[11px] font-black uppercase tracking-widest text-text-main hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors relative" onClick={() => setShowUserMenu(false)}>
                                                    <MessageSquare size={14} />
                                                    {t('messages')}
                                                    {unreadCount > 0 && (
                                                        <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[8px] font-black rounded-full flex items-center justify-center">{unreadCount}</span>
                                                    )}
                                                </Link>
                                                <Link href="/notifications" className="flex items-center gap-3 px-4 py-2 text-[11px] font-black uppercase tracking-widest text-text-main hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors" onClick={() => setShowUserMenu(false)}>
                                                    <Bell size={14} />
                                                    {t('notifications')}
                                                </Link>
                                                <Link href="/settings" className="flex items-center gap-3 px-4 py-2 text-[11px] font-black uppercase tracking-widest text-text-main hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors" onClick={() => setShowUserMenu(false)}>
                                                    <User size={14} />
                                                    {t('settings')}
                                                </Link>
                                                <div className="border-t border-border-color my-1"></div>
                                                <button onClick={() => { logout(); setShowUserMenu(false); }} className="flex items-center gap-3 px-4 py-2 text-[11px] font-black uppercase tracking-widest text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors w-full text-left">
                                                    <LogOut size={14} />
                                                    {t('logout')}
                                                </button>
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    ) : (
                        <Link href="/login" className="btn-saha-attract !px-4 !py-1.5 !text-[11px] !border-b-[3px]">{t('login')}</Link>
                    )}

                    <Link href="/post-ad" className="btn-saha-primary !px-5 !py-1.5 !text-[12px] !border-b-[3px]">
                        <PlusCircle size={16} />
                        {t('postAd')}
                    </Link>
                </div>
            </div>
        </header>
    );
}
