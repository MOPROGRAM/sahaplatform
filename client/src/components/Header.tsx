"use client";

import Link from "next/link";
import { Search, PlusCircle, MessageSquare, Bell, User, LayoutDashboard, LogOut, ShieldCheck, Globe } from "lucide-react";
import { useState, useEffect } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import { useLanguage } from "@/lib/language-context";
import { apiService } from "@/lib/api";

export default function Header() {
    const { user, logout } = useAuthStore();
    const { language, setLanguage, t } = useLanguage();
    const [unreadCount, setUnreadCount] = useState(0);
    const [isScrolled, setIsScrolled] = useState(false);

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
        <header className={`bg-white border-b border-gray-200 shadow-sm sticky top-0 z-[100] transition-all ${isScrolled ? 'py-1' : 'py-2'}`}>
            <div className="max-w-7xl mx-auto px-4 flex items-center gap-6">
                {/* Brand - Sharp High Density */}
                <Link href="/" className="flex flex-col group shrink-0">
                    <span className="text-3xl font-[1000] tracking-tighter text-black leading-none uppercase -mb-0.5">{t('siteName')}</span>
                    <div className="h-1.5 w-full bg-primary mt-1.5 shadow-sm shadow-primary/20 group-hover:scale-x-105 transition-transform origin-left"></div>
                </Link>

                {/* Micro Search Bar */}
                <div className="flex-1 max-w-xl relative group">
                    <div className="flex border border-gray-200 rounded-sm overflow-hidden bg-gray-50 focus-within:border-primary focus-within:bg-white transition-all shadow-sm">
                        <input
                            type="text"
                            placeholder={t('searchPlaceholder')}
                            className="flex-1 px-4 py-2.5 text-[15px] outline-none font-bold bg-transparent placeholder:text-gray-500 placeholder:font-medium"
                        />
                        <button className="px-4 text-secondary group-focus-within:text-primary transition-colors hover:scale-110 active:scale-95">
                            <Search size={20} />
                        </button>
                    </div>
                </div>

                {/* Action Grid - Ultra Density */}
                <div className="flex items-center gap-3">
                    <div className="hidden lg:flex items-center gap-3 border-r border-gray-100 pr-3 mr-1">
                        <button onClick={() => setLanguage(language === 'ar' ? 'en' : 'ar')} className="btn-saha-outline !px-3 !py-1 !text-[11px] !border-b-[3px]">
                            <Globe size={14} /> {language === 'ar' ? 'English' : 'العربية'}
                        </button>
                    </div>

                    {user ? (
                        <div className="flex items-center gap-3">
                            <Link href="/dashboard" className="flex items-center gap-2 px-2 py-1 hover:bg-gray-50 rounded-md transition-all group border border-transparent hover:border-gray-200">
                                <div className="w-9 h-9 bg-primary/10 rounded-full flex items-center justify-center text-[15px] font-[1000] text-primary border-2 border-primary/20 uppercase">
                                    {user.name?.substring(0, 1)}
                                </div>
                                <div className="hidden sm:flex flex-col leading-none">
                                    <span className="text-[13px] font-[1000] text-black uppercase tracking-tight">{user.name}</span>
                                    <span className="text-[10px] font-bold text-gray-400 mt-1">{user.role === 'ADMIN' ? t('adminLabel') : t('merchantLabel')}</span>
                                </div>
                            </Link>
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
