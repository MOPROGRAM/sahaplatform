"use client";

// export const runtime = 'edge';

import { useState, useEffect, useCallback } from "react";
import { 
    Search, 
    MessageSquare, 
    User, 
    Clock, 
    Check, 
    CheckCheck, 
    ShieldCheck, 
    Inbox,
    PlusCircle,
    Loader2,
    Trash2,
    RefreshCw
} from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useAuthStore } from "@/store/useAuthStore";
import { conversationsService, Conversation } from "@/lib/conversations";
import ChatWindow from "@/components/ChatWindow";
import { useLanguage } from "@/lib/language-context";

export default function MessagesPage() {
    const { user } = useAuthStore();
    const { language, t } = useLanguage();
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [showDeleted, setShowDeleted] = useState(false);

    const fetchConversations = useCallback(async () => {
        try {
            const data = await conversationsService.getConversations(showDeleted);
            setConversations(data);
        } catch (error) {
            console.error("Failed to fetch conversations:", error);
        } finally {
            setLoading(false);
        }
    }, [showDeleted]);

    useEffect(() => {
        if (user) {
            fetchConversations();
        }
    }, [user, fetchConversations]);

    const handleRestore = async (e: React.MouseEvent, conversationId: string) => {
        e.stopPropagation();
        try {
            await conversationsService.restoreConversation(conversationId);
            fetchConversations();
        } catch (error) {
            console.error('Failed to restore:', error);
        }
    };

    const handleDeleteConversation = async (e: React.MouseEvent, conversationId: string) => {
        e.stopPropagation();
        if (!confirm(language === 'ar' ? 'هل أنت متأكد من حذف هذه المحادثة؟' : 'Are you sure you want to delete this conversation?')) return;
        
        try {
            await conversationsService.hideConversation(conversationId);
            if (selectedId === conversationId) setSelectedId(null);
            fetchConversations();
        } catch (error) {
            console.error('Failed to delete conversation:', error);
            alert(language === 'ar' ? 'فشل حذف المحادثة' : 'Failed to delete conversation');
        }
    };

    const filteredConversations = conversations.filter(conv => {
        const otherMember = conv.participants.find(p => p.id !== user?.id);
        return otherMember?.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
               conv.ad?.title.toLowerCase().includes(searchTerm.toLowerCase());
    });

    if (!user) return null;

    return (
        <div className="min-h-screen flex flex-col bg-gray-bg">
            <Header />

            <main className="max-w-[1920px] mx-auto w-full flex-1 flex overflow-hidden p-4 gap-4">
                {/* Left Sidebar - Chat List */}
                <aside className="w-full md:w-80 lg:w-96 flex flex-col gap-3 shrink-0">
                    <div className="bento-card p-4 flex items-center justify-between bg-white dark:bg-[#1a1a1a]">
                        <h2 className="text-[12px] font-black uppercase tracking-[0.2em] flex items-center gap-2">
                            <Inbox size={16} className="text-primary" />
                            {language === 'ar' ? 'صندوق الرسائل' : 'hub inbox'}
                        </h2>
                    </div>

                    <div className="relative group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-primary transition-colors" size={16} />
                        <input 
                            type="text"
                            placeholder={language === 'ar' ? 'بحث في المحادثات...' : 'filter conversations...'}
                            className="bento-input pl-12 bg-white dark:bg-[#1a1a1a]"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    <div className="flex-1 overflow-y-auto bento-card p-1 bg-white dark:bg-[#1a1a1a] custom-scrollbar">
                        {loading ? (
                            <div className="flex flex-col items-center justify-center p-20 opacity-20">
                                <Loader2 className="animate-spin" size={32} />
                            </div>
                        ) : filteredConversations.length > 0 ? (
                            filteredConversations.map((conv) => {
                                const otherMember = conv.participants.find(p => p.id !== user?.id) || { name: 'Unknown' };
                                const isSelected = selectedId === conv.id;

                                return (
                                    <button 
                                        key={conv.id}
                                        onClick={() => setSelectedId(conv.id)}
                                        className={`w-full flex items-center gap-4 p-3 rounded-2xl transition-all mb-1 ${isSelected ? 'bg-primary/10 border border-primary/20' : 'hover:bg-gray-50 dark:hover:bg-white/5 border border-transparent'}`}
                                    >
                                        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-black border border-primary/10 shadow-inner shrink-0 text-sm">
                                            {otherMember.name?.substring(0, 2).toUpperCase()}
                                        </div>
                                        <div className="flex-1 min-w-0 text-right">
                                            <div className="flex justify-between items-start">
                                                <h4 className={`text-[12px] font-black truncate uppercase tracking-tight ${isSelected ? 'text-primary' : 'text-text-main'}`}>{otherMember.name}</h4>
                                                <span className="text-[8px] font-black text-text-muted uppercase" suppressHydrationWarning>
                                                    {conv?.last_message_time ? new Date(conv.last_message_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-1 mt-0.5 mb-1">
                                                {conv.ad ? (
                                                    <span className="text-[9px] font-bold text-secondary bg-secondary/10 px-1.5 py-0.5 rounded">
                                                        {conv.ad.title}
                                                    </span>
                                                ) : (
                                                    <span className="text-[9px] font-bold text-blue-500 bg-blue-500/10 px-1.5 py-0.5 rounded flex items-center gap-1">
                                                        <ShieldCheck size={8} />
                                                        {language === 'ar' ? 'دعم فني' : 'SUPPORT'}
                                                    </span>
                                                )}
                                            </div>
                                            <div className="flex justify-between items-center mt-1">
                                                <p className="text-[10px] font-bold text-text-muted truncate">
                                                    {conv.last_message || (language === 'ar' ? 'لا توجد رسائل بعد' : 'no messages yet')}
                                                </p>
                                                <div className="flex items-center gap-2">
                                                    {showDeleted ? (
                                                        <button 
                                                            onClick={(e) => handleRestore(e, conv.id)}
                                                            className="p-1 hover:bg-green-50 text-green-500 rounded transition-colors"
                                                            title={language === 'ar' ? 'استرجاع' : 'Restore'}
                                                        >
                                                            <RefreshCw size={12} />
                                                        </button>
                                                    ) : (
                                                        <button 
                                                            onClick={(e) => handleDeleteConversation(e, conv.id)}
                                                            className="p-1.5 opacity-0 group-hover:opacity-100 hover:text-red-600 hover:bg-red-50 text-text-muted rounded-full transition-all duration-200"
                                                            title={language === 'ar' ? 'حذف' : 'Delete'}
                                                        >
                                                            <Trash2 size={14} />
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </button>
                                );
                            })
                        ) : (
                            <div className="p-12 text-center flex flex-col items-center gap-3 opacity-30">
                                <MessageSquare size={32} />
                                <span className="text-[10px] font-black uppercase tracking-widest">{language === 'ar' ? 'لا توجد محادثات' : 'archive empty'}</span>
                            </div>
                        )}
                    </div>
                </aside>

                {/* Main Chat Area */}
                <section className="flex-1 bento-card bg-white dark:bg-[#1a1a1a] flex flex-col overflow-hidden relative border-none shadow-premium">
                    {selectedId ? (
                        <ChatWindow conversationId={selectedId} onClose={() => setSelectedId(null)} />
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center p-12 text-center">
                            <div className="w-24 h-24 bg-primary/5 rounded-full flex items-center justify-center text-primary/20 mb-6">
                                <MessageSquare size={48} />
                            </div>
                            <h3 className="text-xl font-black text-text-main uppercase tracking-tighter mb-2 italic">
                                {language === 'ar' ? 'بوابة التواصل المشفرة' : 'secured communications portal'}
                            </h3>
                            <p className="text-text-muted font-bold text-xs uppercase tracking-widest max-w-xs">
                                {language === 'ar' ? 'اختر محادثة من القائمة للبدء، في المراسلة الفورية.' : 'select a terminal from the left to initialize real-time synchronization.'}
                            </p>
                        </div>
                    )}
                </section>
            </main>

            <Footer />
        </div>
    );
}