"use client";

import { useState, useEffect, useRef } from "react";
import { Send, User, ChevronRight, MoreVertical, Phone, ShieldCheck, Briefcase, MapPin, Paperclip, FileText, ImageIcon, Loader2, X, Mic } from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";
import { conversationsService } from "@/lib/conversations";
import { supabase } from "@/lib/supabase";
// import { io } from "socket.io-client";
import { useLanguage } from "@/lib/language-context";

interface Message {
    id: string;
    senderId: string;
    content: string;
    messageType: 'text' | 'image' | 'file' | 'voice' | 'location';
    fileUrl?: string;
    fileName?: string;
    createdAt: string;
    sender: {
        name: string;
        image?: string;
    };
}

interface ChatWindowProps {
    conversationId: string;
    onClose?: () => void;
}

export default function ChatWindow({ conversationId, onClose }: ChatWindowProps) {
    const { user } = useAuthStore();
    const { language, t } = useLanguage();
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const [participants, setParticipants] = useState<any[]>([]);
    const [adInfo, setAdInfo] = useState<any>(null);
    const [isRecording, setIsRecording] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);
    // const socketRef = useRef<any>(null);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);

    useEffect(() => {
        let channel: any;
        if (conversationId) {
            fetchChatData();

            // Subscribe to new messages
            channel = conversationsService.subscribeToConversation(conversationId, (payload) => {
                console.log('[CHAT-REALTIME] Payload received:', payload);
                if (payload.eventType === 'INSERT') {
                    const newMessage = payload.new;

                    // Transform raw DB fields to UI interface
                    const processedMessage: Message = {
                        id: newMessage.id,
                        senderId: newMessage.sender_id,
                        content: newMessage.content,
                        messageType: newMessage.message_type,
                        createdAt: newMessage.created_at,
                        sender: { name: 'User' } // Default name since joins don't come in realtime
                    };

                    setMessages(prev => {
                        if (prev.find(m => m.id === processedMessage.id)) return prev;
                        return [...prev, processedMessage];
                    });
                }
            });
        }
        return () => {
            if (channel) {
                conversationsService.unsubscribe(channel);
            }
        };
    }, [conversationId]);

    useEffect(() => {
        scrollRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    // Socket functionality disabled for now
    // const setupSocket = () => {
    //     const socketUrl = process.env.NEXT_PUBLIC_API_URL || '';
    //     socketRef.current = io(socketUrl);

    //     socketRef.current.on('receive_message', (message: Message) => {
    //         if (message.id && !messages.find(m => m.id === message.id)) {
    //             setMessages(prev => [...prev, message]);
    //         }
    //     });
    // };

    const fetchChatData = async () => {
        setLoading(true);
        try {
            const data = await conversationsService.getConversation(conversationId);
            if (data) {
                const processedMessages = (data.messages || []).map((msg: any) => ({
                    ...msg,
                    senderId: msg.senderid || msg.senderId,
                    messageType: msg.messagetype || msg.messageType,
                    createdAt: msg.createdat || msg.createdAt,
                    sender: msg.sender || { name: 'Unknown' }
                }));
                setMessages(processedMessages);
                setParticipants(data.conversation.participants || []);
                setAdInfo(data.conversation.ad);
            }
        } catch (error) {
            console.error("Failed to fetch chat:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSend = async (type: 'text' | 'image' | 'file' | 'voice' | 'location' = 'text', content?: string, fileData?: any) => {
        const messageContent = content || input;
        if (!messageContent.trim() && type === 'text') return;

        setSending(true);
        try {
            const payload = {
                content: messageContent,
                messageType: type,
                ...fileData
            };
            await conversationsService.sendMessage(conversationId, payload.content, payload.messageType);

            // Message will be added via Supabase Realtime subscription
            if (type === 'text') setInput("");
        } catch (error) {
            console.error("Failed to send message:", error);
        } finally {
            setSending(false);
        }
    };

    const shareLocation = () => {
        if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition((position) => {
                const { latitude, longitude } = position.coords;
                const mapUrl = `https://www.openstreetmap.org/?mlat=${latitude}&mlon=${longitude}#map=16/${latitude}/${longitude}`;
                handleSend('location', mapUrl);
            });
        }
    };

    const handleFileUpload = async (file: File, type: 'file' | 'image') => {
        const fileName = `${Date.now()}-${file.name}`;
        const bucket = type === 'image' ? 'chat-images' : 'chat-files';
        const { data, error } = await supabase.storage
            .from(bucket)
            .upload(fileName, file);

        if (error) {
            console.error('Error uploading file:', error);
            return null;
        }

        const { data: urlData } = supabase.storage
            .from(bucket)
            .getPublicUrl(fileName);

        return { fileUrl: urlData.publicUrl, fileName: file.name, fileSize: file.size };
    };

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const mediaRecorder = new MediaRecorder(stream);
            mediaRecorderRef.current = mediaRecorder;
            audioChunksRef.current = [];

            mediaRecorder.ondataavailable = (event) => {
                audioChunksRef.current.push(event.data);
            };

            mediaRecorder.onstop = async () => {
                const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
                const file = new File([audioBlob], 'voice-message.wav', { type: 'audio/wav' });
                const uploadData = await handleFileUpload(file, 'file');
                if (uploadData) {
                    handleSend('voice', 'Voice message', uploadData);
                }
            };

            mediaRecorder.start();
            setIsRecording(true);
        } catch (error) {
            console.error('Error starting recording:', error);
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
            setIsRecording(false);
        }
    };

    const otherMember = participants.find(p => p.id !== user?.id) || { name: "User", role: "Member" };

    if (loading) return (
        <div className="flex flex-col h-[500px] bg-white border border-gray-200 rounded-sm items-center justify-center">
            <Loader2 className="animate-spin text-primary" size={32} />
            <span className="text-[10px] font-black uppercase tracking-widest mt-4 opacity-40">Connecting to Saha Link...</span>
        </div>
    );

    return (
        <div className="flex flex-col h-[600px] bg-white border border-gray-200 rounded-sm shadow-2xl overflow-hidden" dir={language === 'ar' ? 'rtl' : 'ltr'}>
            {/* Header - High Density */}
            <div className="p-3 border-b border-gray-100 flex justify-between items-center bg-gray-50/80 backdrop-blur-md">
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-primary/10 rounded-full flex items-center justify-center text-primary font-black border border-primary/20 text-xs shadow-sm">
                        {otherMember.name?.substring(0, 2).toUpperCase()}
                    </div>
                    <div className="flex flex-col">
                        <span className="text-[12px] font-black flex items-center gap-1 text-secondary uppercase tracking-tight">
                            {otherMember.name}
                            <ShieldCheck size={14} className="text-blue-500 fill-blue-500/10" />
                        </span>
                        <div className="flex items-center gap-1.5 mt-0.5">
                            <span className="w-1.5 h-1.5 bg-green-500 rounded-full shadow-[0_0_8px_rgba(34,197,94,0.6)]"></span>
                            <span className="text-[9px] font-black text-gray-400 uppercase tracking-tighter">Active - Verified {otherMember.role}</span>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    {adInfo && (
                        <div className="hidden md:flex items-center gap-2 px-2 py-1 bg-white border border-gray-100 rounded-xs">
                            <div className="w-6 h-6 bg-gray-50 rounded-xs flex items-center justify-center"><ImageIcon size={12} className="text-gray-300" /></div>
                            <span className="text-[9px] font-black text-secondary truncate max-w-[100px] uppercase italic">{adInfo.title}</span>
                        </div>
                    )}
                    <button onClick={onClose} className="p-1.5 hover:bg-red-50 text-gray-400 hover:text-red-500 transition-all rounded-xs"><X size={16} /></button>
                </div>
            </div>

            {/* Safety Bar */}
            <div className="bg-orange-50/50 py-1.5 px-3 border-b border-orange-100/50 flex items-center gap-2">
                <div className="text-orange-600"><ShieldCheck size={12} /></div>
                <p className="text-[9px] font-black text-orange-800 uppercase italic tracking-tight">Security Alert: Always keep transactions within Saha platform.</p>
            </div>

            {/* Messages Area - High Density */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#fcfcfc] custom-scrollbar">
                {messages.map((msg, idx) => (
                    <div key={msg.id || idx} className={`flex flex-col ${msg.senderId === user?.id ? 'items-end' : 'items-start'}`}>
                        <div className={`max-w-[75%] px-3 py-2 rounded-sm shadow-sm transition-all hover:shadow-md ${msg.senderId === user?.id
                            ? 'bg-primary text-white rounded-br-none'
                            : 'bg-white border border-gray-100 text-secondary rounded-bl-none'}`}>

                            {msg.messageType === 'text' && <p className="text-[11px] font-bold leading-relaxed">{msg.content}</p>}

                            {msg.messageType === 'location' && (
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2 text-[10px] font-black border-b border-black/5 pb-1 mb-1">
                                        <MapPin size={12} /> SHARED LOCATION
                                    </div>
                                    <iframe
                                        width="200"
                                        height="150"
                                        className="rounded-xs border-0"
                                        src={`https://www.openstreetmap.org/export/embed.html?bbox=${parseFloat(msg.content.split('mlon=')[1].split('#')[0]) - 0.01}%2C${parseFloat(msg.content.split('mlat=')[1].split('&')[0]) - 0.01}%2C${parseFloat(msg.content.split('mlon=')[1].split('#')[0]) + 0.01}%2C${parseFloat(msg.content.split('mlat=')[1].split('&')[0]) + 0.01}&layer=mapnik&marker=${msg.content.split('mlat=')[1].split('&')[0]}%2C${msg.content.split('mlon=')[1].split('#')[0]}`}
                                    ></iframe>
                                    <a href={msg.content} target="_blank" className="text-[9px] underline block mt-1 opacity-70">VIEW ON FULL MAP</a>
                                </div>
                            )}

                            {msg.messageType === 'file' && (
                                <div className="flex items-center gap-3 bg-black/5 p-2 rounded-xs">
                                    <FileText size={20} className="text-primary" />
                                    <div className="flex flex-col min-w-0">
                                        <span className="text-[10px] font-black truncate">{msg.fileName || 'Attached File'}</span>
                                        <a href={msg.fileUrl} target="_blank" className="text-[9px] font-black text-primary hover:underline">DOWNLOAD NOW</a>
                                    </div>
                                </div>
                            )}

                            <span className={`text-[8px] font-black mt-1.5 block uppercase tracking-tighter ${msg.senderId === user?.id ? 'text-white/60' : 'text-gray-400'}`}>
                                {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                        </div>
                    </div>
                ))}
                <div ref={scrollRef} />
            </div>

            {/* Input Tools - Compressed */}
            <div className="p-2 bg-gray-50 border-t border-gray-100 flex gap-2 overflow-x-auto no-scrollbar">
                <button onClick={shareLocation} className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-200 rounded-sm text-[9px] font-black text-gray-500 hover:text-primary hover:border-primary transition-all whitespace-nowrap shadow-sm active:scale-95">
                    <MapPin size={12} /> SHARE LOCATION
                </button>
                <label className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-200 rounded-sm text-[9px] font-black text-gray-500 hover:text-primary hover:border-primary transition-all cursor-pointer whitespace-nowrap shadow-sm active:scale-95">
                    <Paperclip size={12} /> ATTACH DOCUMENT
                    <input type="file" className="hidden" onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                            const uploadData = await handleFileUpload(file, 'file');
                            if (uploadData) {
                                handleSend('file', `Attached: ${file.name}`, uploadData);
                            }
                        }
                    }} />
                </label>
            </div>

            {/* Input Main */}
            <div className="p-3 bg-white">
                <div className="flex gap-2">
                    <input
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                        placeholder={language === 'ar' ? `اكتب رسالة لـ ${otherMember.name}...` : `Message ${otherMember.name}...`}
                        className="flex-1 bg-gray-50 border border-gray-100 outline-none px-4 py-2.5 rounded-sm text-[11px] font-bold focus:border-primary transition-all placeholder:font-black placeholder:uppercase placeholder:text-[9px] placeholder:tracking-widest"
                    />
                    <button
                        onClick={() => handleSend()}
                        disabled={sending || !input.trim()}
                        className="bg-primary text-white p-2.5 rounded-sm hover:bg-primary-hover disabled:opacity-50 transition-all shadow-lg shadow-primary/20 active:scale-90"
                    >
                        {sending ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} className={language === 'ar' ? 'rotate-180' : ''} />}
                    </button>
                </div>
            </div>
        </div>
    );
}
