"use client";

import { useState, useEffect } from "react";
import { Bell, ShieldCheck, Zap, Info, Package, MessageSquare, Loader2, Trash2, CheckCircle2, AlertCircle } from "lucide-react";
import Link from "next/link";
import { useAuthStore } from "@/store/useAuthStore";
import { useLanguage } from "@/lib/language-context";
import Header from "@/components/Header";

interface Notification {
    id: string;
    title: string;
    message: string;
    type: 'info' | 'success' | 'warning' | 'ad' | 'message';
    createdAt: string;
    isRead: boolean;
}

export default function NotificationsPage() {
    const { user } = useAuthStore();
    const { language, t } = useLanguage();
    const [notifications, setNotifications] = useState<Notification[]>([
        { id: '1', title: 'Welcome to Saha Hub', message: 'Your professional account is now active. Explore the marketplace.', type: 'success', createdAt: new Date().toISOString(), isRead: false },
        { id: '2', title: 'Ad Approved', message: 'Your listing "Luxury Villa" has been verified and published.', type: 'ad', createdAt: new Date(Date.now() - 3600000).toISOString(), isRead: true },
        { id: '3', title: 'New Message', message: 'Ahmed sent you a inquiry about your car.', type: 'message', createdAt: new Date(Date.now() - 7200000).toISOString(), isRead: false },
        { id: '4', title: 'System Maintenance', message: 'Engine upgrade scheduled for 2:00 AM UTC.', type: 'warning', createdAt: new Date(Date.now() - 86400000).toISOString(), isRead: true },
    ]);
    const [loading, setLoading] = useState(false);

    if (!user) return <div className="p-20 text-center font-black">LOGIN REQUIRED</div>;

    const getIcon = (type: string) => {
        switch (type) {
            case 'success': return <CheckCircle2 size={16} className="text-green-500" />;
            case 'warning': return <AlertCircle size={16} className="text-orange-500" />;
            case 'ad': return <Package size={16} className="text-primary" />;
            case 'message': return <MessageSquare size={16} className="text-blue-500" />;
            default: return <Info size={16} className="text-gray-400" />;
        }
    };

    return (
        <div className="bg-[#f0f2f5] min-h-screen flex flex-col" dir={language === 'ar' ? 'rtl' : 'ltr'}>
            <Header />

            <main className="max-w-3xl mx-auto w-full p-4 flex-1 flex flex-col gap-4">
                <div className="flex items-center justify-between px-1">
                    <h1 className="text-[14px] font-black uppercase tracking-[0.2em] text-secondary flex items-center gap-3">
                        <Bell size={18} className="text-primary animate-pulse" />
                        Command Notifications Matrix
                    </h1>
                    <button className="text-[10px] font-black text-gray-400 hover:text-primary transition-colors uppercase tracking-widest italic">Mark All as Processed</button>
                </div>

                <div className="space-y-2">
                    {notifications.length > 0 ? (
                        notifications.map((notif) => (
                            <div
                                key={notif.id}
                                className={`bg-white border border-gray-200 p-4 rounded-sm shadow-sm flex gap-4 transition-all hover:border-primary group relative overflow-hidden ${!notif.isRead ? 'border-r-4 border-r-primary' : ''}`}
                            >
                                <div className={`w-10 h-10 rounded-xs flex items-center justify-center shrink-0 border border-gray-50 shadow-inner ${!notif.isRead ? 'bg-primary/5' : 'bg-gray-50'}`}>
                                    {getIcon(notif.type)}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-start">
                                        <h3 className={`text-[12px] font-black uppercase tracking-tight text-secondary ${!notif.isRead ? 'opacity-100' : 'opacity-70'}`}>
                                            {notif.title}
                                        </h3>
                                        <span className="text-[8px] font-black text-gray-400 uppercase italic whitespace-nowrap">{new Date(notif.createdAt).toLocaleDateString()}</span>
                                    </div>
                                    <p className="text-[10px] font-bold text-gray-500 mt-1 leading-relaxed opacity-80 italic">
                                        {notif.message}
                                    </p>
                                </div>
                                <div className="flex flex-col justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button className="p-2 text-gray-300 hover:text-red-500"><Trash2 size={14} /></button>
                                </div>
                                {!notif.isRead && (
                                    <div className="absolute top-0 right-0 w-8 h-8 bg-primary/5 rounded-full -mr-4 -mt-4"></div>
                                )}
                            </div>
                        ))
                    ) : (
                        <div className="p-20 bg-white border border-dashed border-gray-300 rounded-sm text-center flex flex-col items-center gap-3">
                            <Zap size={32} className="text-gray-200" />
                            <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest leading-relaxed">System Quiet.<br />No Active Signals.</span>
                        </div>
                    )}
                </div>

                {/* Footer Tips for Notifications */}
                <div className="bg-blue-900 text-white p-4 rounded-sm shadow-xl shadow-blue-900/20 flex gap-4 items-center mt-6">
                    <ShieldCheck size={32} className="opacity-50 shrink-0" />
                    <div className="flex flex-col">
                        <span className="text-[11px] font-black uppercase tracking-widest italic leading-none">Pro Safeguard Info</span>
                        <p className="text-[9px] font-bold mt-1.5 opacity-80 leading-relaxed uppercase tracking-tighter">Enable desktop alerts in settings to never miss a high-priority trade or message transmission from other verified merchants.</p>
                    </div>
                </div>
            </main>
        </div>
    );
}
