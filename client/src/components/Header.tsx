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
                <Link href="/" className="flex items-center gap-3 group shrink-0">
                    <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center p-2 shadow-lg shadow-primary/30 group-hover:scale-105 transition-transform">
                        {/* Placeholder for User's Logo - can be replaced with <img src="/logo.png" /> */}
                        <svg viewBox="0 0 100 40" className="w-full h-full text-white" fill="none" stroke="currentColor" strokeWidth="12" strokeLinecap="round">
                            <path d="M 10 15 L 10 10 L 90 10 L 90 20 M 10 20 L 10 30 L 90 30 L 90 25" />
                        </svg>
                    </div>
                    <div className="flex flex-col">
                        <span className="text-2xl font-black tracking-tighter text-secondary leading-none">{t('siteName')}</span>
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary opacity-90 mt-1">Premier Hub v2.1</span>
                    </div>
                </Link>

                {/* Micro Search Bar */}
                <div className="flex-1 max-w-xl relative group">
                    <div className="flex border border-gray-200 rounded-sm overflow-hidden bg-gray-50 focus-within:border-primary focus-within:bg-white transition-all shadow-sm">
                        <input
                            type="text"
                            placeholder={t('searchPlaceholder')}
                            className="flex-1 px-4 py-2.5 text-[14px] outline-none font-bold bg-transparent placeholder:opacity-50"
                        />
                        <button className="px-4 text-gray-400 group-focus-within:text-primary transition-colors hover:scale-110 active:scale-95">
                            <Search size={18} />
                        </button>
                    </div>
                </div>

                {/* Action Grid - Ultra Density */}
                <div className="flex items-center gap-4">
                    <div className="hidden lg:flex items-center gap-4 border-r border-gray-100 pr-4 mr-1">
                        <button onClick={() => setLanguage(language === 'ar' ? 'en' : 'ar')} className="flex items-center gap-1.5 text-[10px] font-black text-gray-400 hover:text-primary transition-colors px-2 py-1 uppercase tracking-tighter">
                            <Globe size={14} /> {language === 'ar' ? 'English' : 'العربية'}
                        </button>

                        {user && (
                            <>
                                <Link href="/messages" className="relative group p-1">
                                    <MessageSquare size={16} className="text-gray-400 group-hover:text-primary transition-colors" />
                                    {unreadCount > 0 && (
                                        <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-red-500 border-2 border-white rounded-full animate-bounce"></span>
                                    )}
                                </Link>
                                <Link href="/notifications" className="group p-1">
                                    <Bell size={16} className="text-gray-400 group-hover:text-primary transition-colors" />
                                </Link>
                            </>
                        )}
                    </div>

                    {user ? (
                        <div className="flex items-center gap-4">
                            <Link href="/dashboard" className="flex items-center gap-3 px-3 py-2 hover:bg-gray-50 rounded-md transition-all group border border-transparent hover:border-gray-100">
                                <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-[12px] font-black text-primary border border-primary/20 uppercase shadow-inner">
                                    {user.name?.substring(0, 1)}
                                </div>
                                <div className="hidden sm:flex flex-col">
                                    <span className="text-[12px] font-black text-secondary leading-none uppercase tracking-tight">{user.name}</span>
                                    <span className="text-[9px] font-black text-primary tracking-widest uppercase mt-1 opacity-80">{user.role === 'ADMIN' ? 'Chief Admin' : 'Merchant'}</span>
                                </div>
                            </Link>
                            {user.role === 'ADMIN' && (
                                <Link href="/admin" className="p-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors shadow-lg shadow-red-500/20 active:scale-90 flex items-center justify-center">
                                    <ShieldCheck size={16} />
                                </Link>
                            )}
                        </div>
                    ) : (
                        <Link href="/login" className="text-[12px] font-black text-secondary hover:text-primary border border-gray-200 px-5 py-2 rounded-md uppercase tracking-widest transition-all hover:border-primary shadow-sm">{t('login')}</Link>
                    )}

                    <Link href="/post-ad" className="bg-primary text-white px-6 py-2.5 rounded-md text-[13px] font-black flex items-center gap-2 hover:bg-primary-hover shadow-xl shadow-primary/30 transition-all hover:-translate-y-0.5 active:translate-y-0 shrink-0 uppercase tracking-widest border-b-4 border-primary-dark">
                        <PlusCircle size={18} />
                        {t('postAd')}
                    </Link>
                </div>
            </div>
        </header>
    );
}
