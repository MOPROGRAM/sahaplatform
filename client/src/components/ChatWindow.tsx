"use client";

import { useState, useEffect, useRef } from "react";
import { Send, User, ChevronRight, MoreVertical, Phone, ShieldCheck } from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";

interface Message {
    id: string;
    senderId: string;
    content: string;
    timestamp: string;
}

export default function ChatWindow() {
    const { user } = useAuthStore();
    const [messages, setMessages] = useState<Message[]>([
        { id: '1', senderId: 'seller', content: 'أهلاً بك، نعم الشقة لاتزال متوفرة.', timestamp: '10:00 AM' },
        { id: '2', senderId: 'user', content: 'ممتاز، هل السعر قابل للتفاوض؟', timestamp: '10:05 AM' },
    ]);
    const [input, setInput] = useState("");
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        scrollRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const handleSend = () => {
        if (!input.trim()) return;
        const newMessage: Message = {
            id: Date.now().toString(),
            senderId: 'user',
            content: input,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        setMessages([...messages, newMessage]);
        setInput("");
    };

    return (
        <div className="flex flex-col h-[600px] bg-white dark:bg-slate-900 border border-gray-200 dark:border-gray-800 rounded-sm shadow-xl overflow-hidden">
            {/* Chat Header */}
            <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-gray-50/50 dark:bg-slate-800/50">
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center text-primary font-bold">
                            مح
                        </div>
                        <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                    </div>
                    <div className="flex flex-col">
                        <span className="text-sm font-bold flex items-center gap-1">
                            محمد العلي
                            <ShieldCheck size={14} className="text-blue-500" />
                        </span>
                        <span className="text-[10px] text-gray-400">متصل الآن - تاجر عقارات</span>
                    </div>
                </div>
                <div className="flex items-center gap-4 text-gray-400">
                    <button className="hover:text-primary"><Phone size={18} /></button>
                    <button className="hover:text-primary"><MoreVertical size={18} /></button>
                </div>
            </div>

            {/* Security Tip Overlay */}
            <div className="bg-blue-50 dark:bg-blue-900/20 p-2 text-center border-b border-blue-100 dark:border-blue-800">
                <p className="text-[10px] text-blue-600 dark:text-blue-400">
                    نصيحة: تجنب التعامل المالي خارج المنصة لضمان حقك. لا تشارك رموز التحقق أبداً.
                </p>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] bg-fixed opacity-95">
                {messages.map((msg) => (
                    <div
                        key={msg.id}
                        className={`flex ${msg.senderId === 'user' ? 'justify-start' : 'justify-end'}`}
                    >
                        <div className={`max-w-[80%] p-3 rounded-sm text-sm shadow-sm ${msg.senderId === 'user'
                                ? 'bg-primary text-white rounded-br-none'
                                : 'bg-white dark:bg-slate-800 border border-gray-100 dark:border-gray-700 rounded-bl-none'
                            }`}>
                            <p>{msg.content}</p>
                            <span className={`text-[9px] mt-1 block ${msg.senderId === 'user' ? 'text-white/70' : 'text-gray-400'}`}>
                                {msg.timestamp}
                            </span>
                        </div>
                    </div>
                ))}
                <div ref={scrollRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-slate-900">
                <div className="flex gap-2">
                    <input
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                        placeholder="اكتب رسالتك لـ محمد..."
                        className="flex-1 bg-gray-50 dark:bg-slate-800 border-none outline-none p-3 rounded-sm text-sm focus:ring-1 ring-primary transition-all"
                    />
                    <button
                        onClick={handleSend}
                        className="bg-primary text-white p-3 rounded-sm hover:bg-primary-dark transition-all active:scale-95 shadow-lg shadow-primary/20"
                    >
                        <Send size={20} className="transform rotate-180" />
                    </button>
                </div>
            </div>
        </div>
    );
}
