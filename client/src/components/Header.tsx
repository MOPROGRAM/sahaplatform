"use client";

import Link from "next/link";
import { Search, PlusCircle, MessageSquare, Bell, User, LayoutDashboard, LogOut, ShieldCheck, Globe, Moon, Sun, MapPin, ChevronDown, Settings, X } from "lucide-react";
import { useState, useEffect, useCallback } from "react";
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
    const [showRegion, setShowRegion] = useState(false);
    const [showUserMenu, setShowUserMenu] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");

    const currencyMap: Record<string, string> = {
        sa: "sar",
        ae: "aed",
        kw: "kwd",
        qa: "qar",
        bh: "bhd",
        om: "omr",
        eg: "egp"
    };

    const fetchUnreadCount = useCallback(async () => {
        try {
            const conversations = await conversationsService.getConversations();
            setUnreadCount(conversations.filter(c => (c as any).unread).length || 0);
        } catch (e) {
            console.error(e);
        }
    }, [user]);

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

    const handleRegionSelect = (c: string) => {
        setCountry(c);
        setCurrency(currencyMap[c] || "sar");
        setShowRegion(false);
    };

    const handleSearchSubmit = () => {
        if (searchQuery.trim()) {
            router.push(`/ads?search=${encodeURIComponent(searchQuery)}`);
        }
    };

    return (
        <header className={`sticky top-0 z-[100] transition-all duration-300 bg-white/95 backdrop-blur-lg border-b border-border-color ${headerShrunk ? "py-2 shadow-lg" : "py-3"}`}>
            <div className="max-w-7xl mx-auto px-4 flex items-center gap-6">
                {/* Brand */}
                <Link href="/" className="group shrink-0">
                    <span className="text-3xl font-[1000] tracking-tighter text-primary italic transition-transform group-hover:scale-105">{t("siteName")}</span>
                </Link>

                {/* Search Bar - Floating Effect Achieved via Sticky Header and Scroll Logic */}
                <div className="flex-1 max-w-xl relative group">
                    <div className="glow-input flex border border-border-color rounded-full bg-gray-100 focus-within:border-primary transition-all shadow-sm hover:shadow-md">
                        <Search size={18} className="text-text-muted ml-4 shrink-0" />
                        <input
                            type="text"
                            placeholder={t("searchPlaceholder")}
                            className="flex-1 px-3 py-2.5 bg-transparent outline-none text-sm font-medium text-gray-700 placeholder-gray-400"
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
                    <Link href="/ads" className={`transition-colors ${pathname?.startsWith("/ads") ? "text-primary border-b-2 border-primary pb-1" : "text-secondary hover:text-primary"}`}>{t("ads")}</Link>
                    <Link href="/advertise" className={`transition-colors ${pathname === "/advertise" ? "text-primary border-b-2 border-primary" : "text-secondary hover:text-primary"}`}>{t("advertise")}</Link>
                </nav>

                {/* Action Grid */}
                <div className="flex items-center gap-3 shrink-0">

                    <div className="hidden lg:flex items-center gap-2 text-gray-500">
                        <button onClick={toggleTheme} className="p-2 hover:text-primary transition-colors">
                            {theme === "light" ? <Moon size={18} /> : <Sun size={18} />}
                        </button>
                        <button onClick={() => setLanguage(language === "ar" ? "en" : "ar")} className="p-2 hover:text-primary transition-colors">
                            <Globe size={18} />
                        </button>
                    </div>

                    {user ? (
                        <div className="relative">
                            <button
                                onClick={() => setShowUserMenu(!showUserMenu)}
                                className="flex items-center gap-2 px-2 py-1 hover:bg-primary/10 rounded-lg transition-all group border border-transparent hover:border-primary/20"
                            >
                                <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-primary font-bold text-sm uppercase shrink-0">
                                    {user.name?.substring(0, 1)}
                                </div>
                                <ChevronDown size={12} className="text-gray-400" />
                            </button>

                            {showUserMenu && (
                                <>
                                    <div className="fixed inset-0 z-[105]" onClick={() => setShowUserMenu(false)}></div>
                                    <div className="absolute top-full right-0 mt-2 w-48 bg-card-bg border-2 border-border-color shadow-[0_20px_50px_rgba(0,0,0,0.15)] rounded-md py-2 z-[110] animate-in fade-in duration-200">
                                        <div className="space-y-1">
                                            {user.role === "ADMIN" && (
                                                <Link href="/admin" className="flex items-center gap-3 px-4 py-2 text-[11px] font-black uppercase tracking-widest text-[#0ea5e9] hover:bg-sky-50 dark:hover:bg-sky-900/10 transition-colors" onClick={() => setShowUserMenu(false)}>
                                                    <Settings size={14} />
                                                    {t("systemManagement")} {/* Using t() for System Management */}
                                                </Link>
                                            )}
                                            <Link href="/dashboard" className="flex items-center gap-3 px-4 py-2 text-[11px] font-black uppercase tracking-widest text-text-main hover:bg-primary/10 transition-colors" onClick={() => setShowUserMenu(false)}>
                                                <LayoutDashboard size={14} />
                                                {t("dashboard")}
                                            </Link>
                                            <Link href="/ads/my" className="flex items-center gap-3 px-4 py-2 text-[11px] font-black uppercase tracking-widest text-text-main hover:bg-primary/10 transition-colors" onClick={() => setShowUserMenu(false)}>
                                                <ShieldCheck size={14} />
                                                {t("myAds")}
                                            </Link>
                                            <Link href="/messages" className="flex items-center gap-3 px-4 py-2 text-[11px] font-black uppercase tracking-widest text-text-main hover:bg-primary/10 transition-colors relative" onClick={() => setShowUserMenu(false)}>
                                                <MessageSquare size={14} />
                                                {t("messages")}
                                                {unreadCount > 0 && (
                                                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[8px] font-black rounded-full flex items-center justify-center">{unreadCount}</span>
                                                )}
                                            </Link>
                                            <Link href="/notifications" className="flex items-center gap-3 px-4 py-2 text-[11px] font-black uppercase tracking-widest text-text-main hover:bg-primary/10 transition-colors" onClick={() => setShowUserMenu(false)}>
                                                <Bell size={14} />
                                                {t("notifications")}
                                            </Link>
                                            <Link href="/settings" className="flex items-center gap-3 px-4 py-2 text-[11px] font-black uppercase tracking-widest text-text-main hover:bg-primary/10 transition-colors" onClick={() => setShowUserMenu(false)}>
                                                <User size={14} />
                                                {t("settings")}
                                            </Link>
                                            <div className="border-t border-border-color my-1"></div>
                                            <button onClick={() => { logout(); setShowUserMenu(false); }} className="flex items-center gap-3 px-4 py-2 text-[11px] font-black uppercase tracking-widest text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors w-full text-left">
                                                <LogOut size={14} />
                                                {t("logout")}
                                            </button>
                                        </div>
                                    </div>
                                </>
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

            {/* Promoted Ads Banner (sticky under header content) */}
            <div className="w-full">
                <PromotedBanner />
            </div>
        </header>
    );
}
