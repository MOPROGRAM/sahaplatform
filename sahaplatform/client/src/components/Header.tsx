"use client";

import { Logo } from "@/components/Logo";
import Link from "next/link";
import { Search, PlusCircle, MessageSquare, Bell, User, LayoutDashboard, LogOut, ShieldCheck, Globe, Moon, Sun, ChevronDown, Settings, X, MapPin } from "lucide-react";
import { useState, useEffect, useCallback, useRef } from "react";
import PromotedBanner from "@/components/PromotedBanner";
import { useRouter, usePathname } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";
import { useLanguage } from "@/lib/language-context";
import { conversationsService } from "@/lib/conversations";

export default function Header() {
    const { user, logout } = useAuthStore();
    const { language, setLanguage, t, theme, toggleTheme, country, setCountry, currency, setCurrency } = useLanguage();
    const router = useRouter();
    const pathname = usePathname();
    const [unreadCount, setUnreadCount] = useState(0);
    const [headerShrunk, setHeaderShrunk] = useState(false);
    const [showUserMenu, setShowUserMenu] = useState(false);
    const [showRegion, setShowRegion] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [mounted, setMounted] = useState(false);
    
    const userMenuRef = useRef<HTMLDivElement>(null);
    const regionRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
                setShowUserMenu(false);
            }
            if (regionRef.current && !regionRef.current.contains(event.target as Node)) {
                setShowRegion(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        setShowUserMenu(false);
    }, [pathname]);

    const currencyMap: Record<string, string> = {
        sa: 'sar',
        ae: 'aed',
        kw: 'kwd',
        qa: 'qar',
        bh: 'bhd',
        om: 'omr',
        eg: 'egp'
    };

    const handleRegionSelect = (c: string) => {
        setCountry(c);
        setCurrency(currencyMap[c] || 'sar');
        setShowRegion(false);
    };

    const fetchUnreadCount = useCallback(async () => {
        try {
            const conversations = await conversationsService.getConversations();
            setUnreadCount(conversations.filter(c => (c as any).unread).length || 0);
        } catch (e) {
            console.error(e);
        }
    }, []);

    useEffect(() => {
        const handleScroll = () => {
            setHeaderShrunk(window.scrollY > 80);
        };
        window.addEventListener("scroll", handleScroll);
        if (user) fetchUnreadCount();
        const interval = setInterval(() => {
            if (user) fetchUnreadCount();
        }, 30000);
        return () => {
            window.removeEventListener("scroll", handleScroll);
            clearInterval(interval);
        };
    }, [user, fetchUnreadCount]);

    const handleSearchSubmit = () => {
        if (searchQuery.trim()) {
            router.push(`/ads?search=${encodeURIComponent(searchQuery)}`);
        }
    };

    return (
        <header className={`sticky top-0 z-[100] backdrop-blur-lg border-b border-border-color bg-white/80 dark:bg-[#0a0a0a]/90 ${headerShrunk ? "py-2 shadow-lg" : "py-3"}`}>
            <div className="relative">
                <div className="max-w-[1920px] mx-auto px-4 flex items-center gap-6 relative z-10">
                {/* Brand */}
                <Link href="/" className="group shrink-0 flex items-center gap-2" prefetch={false}>
                    {/* Mobile Logo */}
                    <Logo className="h-9 w-auto sm:hidden text-primary transition-all duration-1000 group-hover:scale-110" strokeWidth="8.11" />
                    
                    {/* Desktop Logo (Name + Underline) */}
                    <div className="hidden sm:flex flex-col items-center">
                        <span 
                            className="text-3xl font-black tracking-tighter italic transition-all duration-1000 group-hover:scale-105 leading-none text-primary"
                        >
                            {t("siteName")}
                        </span>
                        <Logo 
                            viewBox="14 22 72 36" 
                            preserveAspectRatio="none"
                            className="h-4 w-[101.1%] transition-all duration-1000 group-hover:scale-110 text-primary"
                            strokeWidth="8.11"
                        />
                    </div>
                </Link>

                {/* Region & Currency Selector */}
                <div className="relative" ref={regionRef}>
                    <button
                        onClick={() => setShowRegion(!showRegion)}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 dark:bg-slate-900 border border-border-color rounded-full hover:border-primary transition-all group"
                    >
                        <MapPin size={12} className="text-primary" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-text-main">{t(country as any)} | {t(currency as any)}</span>
                        <ChevronDown size={10} className="text-gray-400 group-hover:text-primary transition-colors" />
                    </button>

                    {showRegion && (
                        <div className="absolute top-full mt-2 left-0 w-64 bento-card bg-white dark:bg-[#1a1a1a] shadow-2xl p-4 z-[1010] animate-in fade-in zoom-in-95 duration-200 border border-gray-100 dark:border-white/10">
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
                    )}
                </div>

                {/* Search Bar - Floating Effect Achieved via Sticky Header and Scroll Logic */}
                <div className="flex-1 max-w-xl relative group">
                    <div className="glow-input flex border border-border-color rounded-full bg-gray-100 dark:bg-gray-900 focus-within:border-primary transition-all shadow-sm hover:shadow-md">
                        <Search size={18} className="text-text-muted ml-4 shrink-0" />
                        <input
                            type="text"
                            placeholder={t("searchPlaceholder")}
                            className="flex-1 px-3 py-2.5 bg-transparent outline-none text-sm font-medium text-gray-700 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-500"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onKeyDown={(e) => { if (e.key === "Enter") handleSearchSubmit(); }}
                        />
                        {searchQuery && (
                            <button
                                type="button"
                                onClick={() => { setSearchQuery(""); handleSearchSubmit(); }}
                                className="p-1 mr-2 text-gray-400 hover:text-red-500 transition-colors"
                            >
                                <X size={14} />
                            </button>
                        )}
                    </div>
                </div>

                {/* Navigation & Actions */}
                <nav className="hidden lg:flex items-center gap-8 text-sm font-bold uppercase tracking-widest">
                    <Link href="/ads" className={`transition-colors ${pathname?.startsWith("/ads") ? "text-primary border-b-2 border-primary pb-1" : "text-text-main hover:text-primary"}`}>{t("categories")}</Link>
                </nav>

                {/* Action Grid */}
                <div className="flex items-center gap-3 shrink-0">

                    <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
                        <button onClick={toggleTheme} className="p-2 border border-border-color rounded-full hover:border-primary hover:text-primary transition-colors">
                            {mounted ? (theme === "light" ? <Moon size={18} /> : <Sun size={18} />) : <Moon size={18} className="opacity-0" />}
                        </button>
                        <button onClick={() => setLanguage(language === "ar" ? "en" : "ar")} className="p-2 border border-border-color rounded-full hover:border-primary hover:text-primary transition-colors">
                            <Globe size={18} />
                        </button>
                    </div>

                    {mounted && user ? (
                        <div className="relative" ref={userMenuRef}>
                            <button
                                onClick={() => setShowUserMenu(!showUserMenu)}
                                className="flex items-center gap-2 px-2 py-1 hover:bg-primary/10 rounded-full transition-all group border border-transparent hover:border-primary/20"
                            >
                                <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-primary font-bold text-sm uppercase shrink-0">
                                    {(user.name || user.email || 'U').substring(0, 1).toUpperCase()}
                                </div>
                                <div className="hidden md:block text-start">
                                    <p className="text-sm font-bold text-text-main leading-none">{user.name || user.email?.split('@')[0] || t('guest')}</p>
                                </div>
                                <ChevronDown size={12} className="text-gray-400" />
                            </button>

                            {showUserMenu && (
                                <div className="absolute top-full right-0 mt-2 w-56 bento-card bg-white dark:bg-[#1a1a1a] shadow-2xl py-2 z-[1010] animate-in fade-in duration-200 rounded-2xl border border-gray-100 dark:border-white/10">
                                    <div className="space-y-1 p-1">
                                        {(user.role === "ADMIN" || user.email === "motwasel@yahoo.com") && (
                                            <Link href="/admin" className="flex items-center gap-3 px-4 py-2 text-[11px] font-black uppercase tracking-widest text-[#0ea5e9] hover:bg-sky-50 dark:hover:bg-sky-900/10 transition-colors relative z-10" onClick={() => setShowUserMenu(false)}>
                                                <ShieldCheck size={14} />
                                                {t("systemManagement")}
                                            </Link>
                                        )}
                                        <Link href="/dashboard" className="flex items-center gap-3 px-4 py-2 text-[11px] font-black uppercase tracking-widest text-text-main hover:bg-primary/10 transition-colors relative z-10" prefetch={false} onClick={() => setShowUserMenu(false)}>
                                            <LayoutDashboard size={14} />
                                            {t("dashboard")}
                                        </Link>
                                        <Link href="/ads/my" className="flex items-center gap-3 px-4 py-2 text-[11px] font-black uppercase tracking-widest text-text-main hover:bg-primary/10 transition-colors relative z-10" prefetch={false} onClick={() => setShowUserMenu(false)}>
                                            <ShieldCheck size={14} />
                                            {t("myAds")}
                                        </Link>
                                        <Link href="/messages" className="flex items-center gap-3 px-4 py-2 text-[11px] font-black uppercase tracking-widest text-text-main hover:bg-primary/10 transition-colors relative z-10" prefetch={false} onClick={() => setShowUserMenu(false)}>
                                            <MessageSquare size={14} />
                                            {t("messages")}
                                            {unreadCount > 0 && (
                                                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[8px] font-black rounded-full flex items-center justify-center">{unreadCount}</span>
                                            )}
                                        </Link>
                                        <Link href="/notifications" className="flex items-center gap-3 px-4 py-2 text-[11px] font-black uppercase tracking-widest text-text-main hover:bg-primary/10 transition-colors relative z-10" prefetch={false} onClick={() => setShowUserMenu(false)}>
                                            <Bell size={14} />
                                            {t("notifications")}
                                        </Link>
                                        <Link href="/settings" className="flex items-center gap-3 px-4 py-2 text-[11px] font-black uppercase tracking-widest text-text-main hover:bg-primary/10 transition-colors relative z-10" prefetch={false} onClick={() => setShowUserMenu(false)}>
                                            <Settings size={14} />
                                            {t("settings")}
                                        </Link>
                                        <div className="border-t border-border-color my-1"></div>
                                        <button onClick={() => { logout(); setShowUserMenu(false); }} className={`flex items-center gap-3 px-4 py-2 text-[11px] font-black uppercase tracking-widest text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors w-full relative z-10 ${language === 'ar' ? 'text-right' : 'text-left'}`}>
                                            <LogOut size={14} />
                                            {t("logout")}
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : (
                        <Link href="/login" className="btn-saha-attract !px-4 !py-1.5 !text-[11px] !border-b-[3px]">{t("login")}</Link>
                    )}

                    <Link href="/post-ad" className="btn-saha-primary !px-5 !py-1.5 !text-[12px] !border-b-[3px]">
                        <PlusCircle size={16} />
                        {t("postAd")}
                    </Link>
                </div>
                </div>
            </div>

            {/* Promoted Ads Banner (sticky under header content) */}
            {(() => {
                const hiddenPaths = [
                    '/help', 
                    '/advertise', 
                    '/profile', 
                    '/messages', 
                    '/dashboard', 
                    '/ads/my', 
                    '/settings', 
                    '/notifications',
                    '/login',
                    '/admin'
                ];
                const shouldShow = !hiddenPaths.some(path => pathname?.startsWith(path));
                
                return shouldShow ? (
                    <div className="w-full">
                        <PromotedBanner />
                    </div>
                ) : null;
            })()}
        </header>
    );
}
