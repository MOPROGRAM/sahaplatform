"use client";

import { Logo } from "@/components/Logo";
import Link from "next/link";
import { Search, PlusCircle, MessageSquare, Bell, User, LayoutDashboard, LogOut, ShieldCheck, Globe, Moon, Sun, ChevronDown, Settings, X, MapPin, Menu, Banknote } from "lucide-react";
import { useState, useEffect, useCallback, useRef } from "react";
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
    const [showMobileMenu, setShowMobileMenu] = useState(false);
    const [showSearch, setShowSearch] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [isMounted, setIsMounted] = useState(false);

    const regionRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
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
        <header className={`sticky top-0 z-[100] backdrop-blur-lg border-b border-border-color bg-white/80 dark:bg-[#0a0a0a]/90 ${headerShrunk ? "py-2 shadow-lg" : "py-3"} relative`}>

            <div className="relative">
                <div className="max-w-[1920px] mx-auto px-4 flex items-center justify-between gap-4 relative z-50">
                    {/* Brand & Logo */}
                    <div className="flex items-center gap-4 shrink-0">
                        {/* Mobile Menu Button Removed - Moved to Bottom Nav */}
                        
                        <Link href="/" className="group flex items-center gap-2 relative" prefetch={false}>
                            {/* Hover Glow Effect */}
                            <div className="hover-glow-circle" />

                            <div className="relative flex items-center gap-2">
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
                            </div>
                        </Link>
                    </div>

                    {/* Region & Currency Selector - Desktop only */}
                    <div className="hidden md:block relative" ref={regionRef}>
                        <button
                            onClick={() => setShowRegion(!showRegion)}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 dark:bg-slate-900 border border-border-color rounded-full hover:border-primary transition-all group"
                        >
                            <MapPin size={12} className="text-primary" />
                            <span className="text-[10px] font-black uppercase tracking-widest text-text-main">{t(country as any)} | {t(currency as any)}</span>
                            <ChevronDown size={10} className="text-gray-400 group-hover:text-primary transition-colors" />
                        </button>

                        {showRegion && (
                            <div className="absolute top-full mt-3 left-0 w-72 bg-white/80 dark:bg-[#1a1a1a]/80 backdrop-blur-xl shadow-[0_20px_50px_rgba(0,0,0,0.2)] p-5 z-[1010] animate-in fade-in zoom-in-95 duration-200 border border-white/20 dark:border-white/10 rounded-3xl">
                                <div className="space-y-6">
                                    <div>
                                        <div className="flex items-center gap-2 mb-3">
                                            <MapPin size={12} className="text-primary" />
                                            <h4 className="text-[10px] font-black uppercase tracking-widest text-text-muted">{t('country')}</h4>
                                        </div>
                                        <div className="grid grid-cols-2 gap-2">
                                            {['sa', 'ae', 'kw', 'qa', 'bh', 'om', 'eg'].map(c => (
                                                <button
                                                    key={c}
                                                    onClick={() => handleRegionSelect(c)}
                                                    className={`px-3 py-2.5 text-[10px] font-black rounded-xl border transition-all uppercase tracking-tighter ${country === c ? 'border-primary text-primary bg-primary/5' : 'border-border-color text-text-main hover:border-primary/30 hover:bg-gray-50 dark:hover:bg-white/5'}`}
                                                >
                                                    {t(c as any)}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="pt-4 border-t border-border-color">
                                        <div className="flex items-center gap-2 mb-3">
                                            <Banknote size={12} className="text-primary" />
                                            <h4 className="text-[10px] font-black uppercase tracking-widest text-text-muted">{t('currency')}</h4>
                                        </div>
                                        <div className="p-3 bg-primary/5 rounded-xl border border-primary/20 flex items-center justify-between">
                                            <span className="text-[11px] font-black text-primary uppercase tracking-widest">
                                                {t(currency as any)}
                                            </span>
                                            <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Search Bar - Responsive Toggle */}
                    <div className="hidden md:block flex-1 relative mx-4 max-w-md">
                        <div className="flex border border-border-color rounded-full bg-gray-100/50 dark:bg-white/5 focus-within:bg-white dark:focus-within:bg-[#1a1a1a] focus-within:border-primary/50 transition-all duration-300 shadow-sm hover:shadow-md group items-center">
                            <Search size={18} className="text-text-muted ml-4 shrink-0 transition-colors group-focus-within:text-primary" />
                            <input
                                type="text"
                                placeholder={t("searchPlaceholder")}
                                className="flex-1 px-3 py-2 bg-transparent outline-none text-sm font-bold text-text-main placeholder-gray-400 dark:placeholder-gray-500"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                onKeyDown={(e) => { if (e.key === "Enter") { handleSearchSubmit(); } }}
                            />
                            {searchQuery && (
                                <button
                                    type="button"
                                    onClick={() => { setSearchQuery(""); handleSearchSubmit(); }}
                                    className="p-1 mr-4 text-gray-400 hover:text-red-500 transition-all hover:scale-110"
                                >
                                    <X size={14} />
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Navigation & Actions */}
                    <nav className="hidden xl:flex items-center gap-8 text-sm font-bold uppercase tracking-widest">
                        <Link href="/ads" className={`transition-colors ${pathname?.startsWith("/ads") ? "text-primary border-b-2 border-primary pb-1" : "text-text-main hover:text-primary"}`}>{t("categories")}</Link>
                    </nav>

                    {/* Action Grid */}
                    <div className="flex items-center gap-3 shrink-0">

                        <div className="hidden sm:flex items-center gap-2 text-gray-500 dark:text-gray-400">
                            {isMounted ? (
                                <button onClick={toggleTheme} className="p-2 border border-border-color rounded-full hover:border-primary hover:text-primary transition-colors">
                                    {theme === "light" ? <Moon size={18} /> : <Sun size={18} />}
                                </button>
                            ) : (
                                <div className="w-[38px] h-[38px]" />
                            )}
                            <button onClick={() => setLanguage(language === "ar" ? "en" : "ar")} className="p-2 border border-border-color rounded-full hover:border-primary hover:text-primary transition-colors">
                                <Globe size={18} />
                            </button>
                        </div>

                        {user ? (
                            <div className="relative z-[1000]">
                                <button
                                    onClick={() => setShowUserMenu(!showUserMenu)}
                                    className="flex items-center gap-2 px-2 py-1 hover:bg-primary/10 rounded-full transition-all border border-transparent hover:border-primary/20"
                                >
                                    <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-primary font-bold text-sm uppercase shrink-0">
                                        {(user.name || user.email || 'U').substring(0, 1).toUpperCase()}
                                    </div>
                                    <div className="hidden md:block text-start">
                                        <p className="text-sm font-bold text-text-main leading-none truncate max-w-[100px]">{user.name || user.email?.split('@')[0] || t('guest' as any)}</p>
                                    </div>
                                    <ChevronDown size={12} className="text-gray-400" />
                                </button>

                                {showUserMenu && (
                                    <div className="absolute top-full right-0 mt-2 w-56 bg-white text-black dark:bg-gray-800 dark:text-white py-2 z-[2000] rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
                                        <div className="space-y-1 p-1">
                                            {(user.role === "ADMIN" || user.email === "motwasel@yahoo.com") && (
                                                <Link href="/admin" className="flex items-center gap-3 px-4 py-2 text-[11px] font-black uppercase tracking-widest text-[#0ea5e9] hover:bg-sky-50 dark:hover:bg-sky-900/10 transition-colors" onClick={() => setShowUserMenu(false)}>
                                                    <ShieldCheck size={14} />
                                                    {t("systemManagement")}
                                                </Link>
                                            )}
                                            <Link href="/dashboard" className="flex items-center gap-3 px-4 py-2 text-[11px] font-black uppercase tracking-widest text-text-main hover:bg-primary/10 transition-colors" prefetch={false} onClick={() => setShowUserMenu(false)}>
                                                <LayoutDashboard size={14} />
                                                {t("dashboard")}
                                            </Link>
                                            <Link href="/ads/my" className="flex items-center gap-3 px-4 py-2 text-[11px] font-black uppercase tracking-widest text-text-main hover:bg-primary/10 transition-colors" prefetch={false} onClick={() => setShowUserMenu(false)}>
                                                <ShieldCheck size={14} />
                                                {t("myAds")}
                                            </Link>
                                            <Link href="/messages" className="flex items-center gap-3 px-4 py-2 text-[11px] font-black uppercase tracking-widest text-text-main hover:bg-primary/10 transition-colors" prefetch={false} onClick={() => setShowUserMenu(false)}>
                                                <MessageSquare size={14} />
                                                {t("messages")}
                                                {unreadCount > 0 && (
                                                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[8px] font-black rounded-full flex items-center justify-center">{unreadCount}</span>
                                                )}
                                            </Link>
                                            <Link href="/notifications" className="flex items-center gap-3 px-4 py-2 text-[11px] font-black uppercase tracking-widest text-text-main hover:bg-primary/10 transition-colors" prefetch={false} onClick={() => setShowUserMenu(false)}>
                                                <Bell size={14} />
                                                {t("notifications")}
                                            </Link>
                                            <Link href="/settings" className="flex items-center gap-3 px-4 py-2 text-[11px] font-black uppercase tracking-widest text-text-main hover:bg-primary/10 transition-colors" prefetch={false} onClick={() => setShowUserMenu(false)}>
                                                <Settings size={14} />
                                                {t("settings")}
                                            </Link>
                                            <div className="border-t border-border-color my-1"></div>
                                            <button onClick={() => { logout(); setShowUserMenu(false); }} className="flex items-center gap-3 px-4 py-2 text-[11px] font-black uppercase tracking-widest text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors w-full">
                                                <LogOut size={14} />
                                                {t("logout")}
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <Link href="/login" className="hidden sm:flex btn-saha-attract !px-4 !py-1.5 !text-[11px] !border-b-[3px]">{t("login")}</Link>
                        )}

                        <Link href="/post-ad" className="hidden sm:flex btn-saha-primary !px-5 !py-1.5 !text-[12px] !border-b-[3px]">
                            <PlusCircle size={16} />
                            {t("postAd")}
                        </Link>
                    </div>
                </div>
            </div>
        </header>
    );
}
