"use client";

// export const runtime = 'edge';

import { useState, useEffect } from "react";
import { 
    Bell, 
    MessageSquare, 
    Tag, 
    Heart, 
    ShieldCheck, 
    Clock, 
    Trash2,
    Loader2,
    Settings
} from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useAuthStore } from "@/store/useAuthStore";
import { useLanguage } from "@/lib/language-context";

export default function NotificationsPage() {
    const { user } = useAuthStore();
    const { language, t } = useLanguage();
    const [notifications, setNotifications] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user) {
            // Simulate loading
            setTimeout(() => {
                setNotifications([]);
                setLoading(false);
            }, 1000);
        }
    }, [user]);

    if (!user) return null;

    return (
        <div className="min-h-screen flex flex-col bg-gray-bg">
            <Header />

            <main className="max-w-[1920px] mx-auto w-full flex-1 p-4 flex flex-col gap-4">
                <div className="flex items-end justify-between bento-card p-6 bg-white dark:bg-[#1a1a1a]">
                    <div>
                        <h1 className="text-2xl font-black text-text-main uppercase tracking-tighter italic leading-none mb-2">
                            {t('notificationCenter')}
                        </h1>
                        <p className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em]">{t('sahaAlerts')}</p>
                    </div>
                    <button className="p-2 hover:bg-gray-100 dark:hover:bg-white/5 rounded-full transition-colors text-text-muted">
                        <Settings size={20} />
                    </button>
                </div>

                <div className="flex-1 bento-card bg-white dark:bg-[#1a1a1a] shadow-premium p-1 flex flex-col">
                    {loading ? (
                        <div className="flex-1 flex flex-col items-center justify-center p-20 opacity-20">
                            <Loader2 className="animate-spin" size={32} />
                        </div>
                    ) : notifications.length > 0 ? (
                        <div className="divide-y divide-border-color">
                            {notifications.map((notif) => (
                                <div key={notif.id} className="p-4 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors flex gap-4">
                                    <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                                        <Bell size={18} />
                                    </div>
                                    <div className="flex-1">
                                        <h4 className="text-sm font-black text-text-main">{notif.title}</h4>
                                        <p className="text-xs text-text-muted mt-1">{notif.message}</p>
                                        <span className="text-[8px] font-black text-text-muted uppercase mt-2 block italic">{notif.time}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center p-20 text-center opacity-30 gap-4">
                            <div className="w-20 h-20 rounded-full bg-primary/5 flex items-center justify-center text-primary/20">
                                <Bell size={40} />
                            </div>
                            <div className="space-y-1">
                                <span className="text-[10px] font-black uppercase tracking-[0.3em]">{t('noNotifications')}</span>
                                <p className="text-[9px] font-bold uppercase tracking-widest">{t('systemIdling')}</p>
                            </div>
                        </div>
                    )}
                </div>
            </main>

            <Footer />
        </div>
    );
}