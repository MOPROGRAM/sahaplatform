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
                <Link href="/" className="flex items-center gap-2 group shrink-0">
                    <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center p-1.5 shadow-md shadow-primary/20 group-hover:scale-105 transition-transform">
                        <svg viewBox="0 0 100 40" className="w-full h-full text-white" fill="none" stroke="currentColor" strokeWidth="10" strokeLinecap="round">
                            <path d="M 10 15 L 10 10 L 90 10 L 90 20 M 10 20 L 10 30 L 90 30 L 90 25" />
                        </svg>
                    </div>
                    <div className="flex flex-col">
                        <span className="text-lg font-black tracking-tighter text-secondary leading-none">{t('siteName')}</span>
                        <span className="text-[7px] font-black uppercase tracking-widest text-primary opacity-80 mt-0.5">Premier Hub v2.1</span>
                    </div>
                </Link>

                {/* Micro Search Bar */}
                <div className="flex-1 max-w-xl relative group">
                    <div className="flex border border-gray-200 rounded-sm overflow-hidden bg-gray-50 focus-within:border-primary focus-within:bg-white transition-all shadow-sm">
                        <input
                            type="text"
                            placeholder={t('searchPlaceholder')}
                            className="flex-1 px-3 py-1.5 text-[11px] outline-none font-bold bg-transparent"
                        />
                        <button className="px-3 text-gray-400 group-focus-within:text-primary transition-colors">
                            <Search size={14} />
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
                        <div className="flex items-center gap-3">
                            <Link href="/dashboard" className="flex items-center gap-2 px-2 py-1.5 hover:bg-gray-50 rounded-xs transition-all group">
                                <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center text-[10px] font-black text-primary border border-primary/20 uppercase">
                                    {user.name?.substring(0, 1)}
                                </div>
                                <div className="hidden sm:flex flex-col">
                                    <span className="text-[10px] font-black text-secondary leading-none uppercase">{user.name}</span>
                                    <span className="text-[7px] font-black text-primary tracking-widest uppercase mt-0.5">{user.role === 'ADMIN' ? 'Chief Admin' : 'Merchant'}</span>
                                </div>
                            </Link>
                            {user.role === 'ADMIN' && (
                                <Link href="/admin" className="p-1.5 bg-red-500 text-white rounded-xs hover:bg-red-600 transition-colors shadow-lg shadow-red-500/20 active:scale-90">
                                    <ShieldCheck size={14} />
                                </Link>
                            )}
                        </div>
                    ) : (
                        <Link href="/login" className="text-[10px] font-black text-gray-400 hover:text-primary border border-gray-200 px-3 py-1.5 rounded-sm uppercase tracking-widest">{t('login')}</Link>
                    )}

                    <Link href="/post-ad" className="bg-primary text-white px-4 py-1.5 rounded-sm text-[11px] font-black flex items-center gap-2 hover:bg-primary-hover shadow-lg shadow-primary/20 transition-all hover:-translate-y-0.5 active:translate-y-0 shrink-0 uppercase tracking-widest">
                        <PlusCircle size={14} />
                        {t('postAd')}
                    </Link>
                </div>
            </div>
        </header>
    );
}
