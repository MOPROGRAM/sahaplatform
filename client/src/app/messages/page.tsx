"use client";

import { useState, useEffect } from "react";
import { MessageSquare, Search, Loader2, ShieldCheck, Clock, ChevronRight, Inbox, Filter } from "lucide-react";
import Link from "next/link";
import { apiService } from "@/lib/api";
import { useAuthStore } from "@/store/useAuthStore";
import { useLanguage } from "@/lib/language-context";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ChatWindow from "@/components/ChatWindow";

export default function MessagesPage() {
    const { user } = useAuthStore();
    const { language, t } = useLanguage();
    const [conversations, setConversations] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedId, setSelectedId] = useState<string | null>(null);

    useEffect(() => {
        if (user) fetchConversations();
    }, [user]);

    const fetchConversations = async () => {
        setLoading(true);
        try {
            const data = await apiService.get('/conversations');
            setConversations(data);
            if (data.length > 0 && !selectedId) {
                // Not automatically selecting to show inbox overview on mobile
            }
        } catch (error) {
            console.error("Failed to fetch conversations:", error);
        } finally {
            setLoading(false);
        }
    };

    if (!user) return <div className="p-20 text-center font-black">PLEASE LOGIN TO VIEW MESSAGES</div>;

    return (
        <div className="bg-[#f0f2f5] min-h-screen flex flex-col" dir={language === 'ar' ? 'rtl' : 'ltr'}>
            <Header />

            <main className="max-w-7xl mx-auto w-full flex-1 flex gap-px bg-gray-200 border-x border-gray-200 shadow-2xl my-2">
                {/* Conversations Sidebar (1/3) */}
                <aside className="w-full md:w-96 bg-white flex flex-col font-cairo">
                    <div className="p-4 border-b border-gray-100 bg-gray-50/50 flex flex-col gap-3">
                        <div className="flex items-center justify-between">
                            <h2 className="text-[13px] font-black uppercase tracking-widest flex items-center gap-2">
                                <Inbox size={16} className="text-primary" />
                                {language === 'ar' ? 'صندوق الرسائل' : 'HUB INBOX'}
                            </h2>
                            <button className="text-gray-400 hover:text-primary"><Filter size={14} /></button>
                        </div>
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Filter transmissions..."
                                className="w-full bg-white border border-gray-200 px-3 py-2 rounded-xs text-[10px] font-black uppercase outline-none focus:border-primary transition-all placeholder:opacity-50"
                            />
                            <Search size={12} className="absolute right-3 top-2.5 text-gray-300" />
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto custom-scrollbar">
                        {loading ? (
                            <div className="p-10 flex items-center justify-center"><Loader2 className="animate-spin text-primary opacity-20" /></div>
                        ) : conversations.length > 0 ? (
                            <div className="flex flex-col">
                                {conversations.map((conv) => {
                                    const otherMember = conv.participants.find((p: any) => p.id !== user.id) || { name: 'User' };
                                    const isActive = selectedId === conv.id;
                                    return (
                                        <button
                                            key={conv.id}
                                            onClick={() => setSelectedId(conv.id)}
                                            className={`p-4 border-b border-gray-50 flex gap-3 transition-all hover:bg-gray-50 text-right ${isActive ? 'bg-primary/5 border-r-4 border-r-primary' : ''}`}
                                        >
                                            <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center font-black text-primary border border-gray-200 shrink-0">
                                                {otherMember.name.substring(0, 2).toUpperCase()}
                                            </div>
                                            <div className="flex-1 min-w-0 flex flex-col gap-0.5">
                                                <div className="flex justify-between items-center">
                                                    <span className="text-[11px] font-black text-secondary truncate flex items-center gap-1 uppercase tracking-tight">
                                                        {otherMember.name}
                                                        <ShieldCheck size={12} className="text-blue-500" />
                                                    </span>
                                                    <span className="text-[8px] font-black text-gray-400 uppercase">{new Date(conv.lastMessageTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                                </div>
                                                <div className="flex justify-between items-center">
                                                    <p className="text-[10px] font-bold text-gray-400 truncate opacity-70 italic">
                                                        {conv.lastMessage || 'No messages yet'}
                                                    </p>
                                                    {conv._count?.messages > 0 && <span className="w-2 h-2 bg-primary rounded-full shadow-[0_0_5px_rgba(var(--primary-rgb),0.5)]"></span>}
                                                </div>
                                                {conv.ad && (
                                                    <span className="text-[8px] font-black text-primary bg-primary/5 px-1.5 py-0.5 rounded-xs w-fit uppercase tracking-tighter mt-1 italic">
                                                        Topic: {conv.ad.title}
                                                    </span>
                                                )}
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="p-20 text-center flex flex-col items-center gap-3">
                                <MessageSquare size={48} className="text-gray-100" />
                                <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest leading-relaxed">System Inbox Clear.<br />No active transmissions.</span>
                            </div>
                        )}
                    </div>
                </aside>

                {/* Chat Window Area (2/3) */}
                <section className="flex-1 bg-white flex flex-col relative overflow-hidden">
                    {selectedId ? (
                        <div className="h-full">
                            <ChatWindow conversationId={selectedId} />
                        </div>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center bg-[#fafafa]">
                            <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-2xl border border-gray-100 mb-6">
                                <svg viewBox="0 0 100 40" className="w-12 h-12 text-primary opacity-20" fill="none" stroke="currentColor" strokeWidth="10" strokeLinecap="round">
                                    <path d="M 10 15 L 10 10 L 90 10 L 90 20 M 10 20 L 10 30 L 90 30 L 90 25" />
                                </svg>
                            </div>
                            <h3 className="text-[14px] font-black uppercase tracking-[0.3em] text-gray-300">Secure Link IDLE</h3>
                            <p className="text-[9px] font-black text-gray-200 uppercase mt-2 tracking-widest">Select a channel to begin transmission</p>
                        </div>
                    )}
                </section>
            </main>
            <Footer />
        </div>
    );
}
