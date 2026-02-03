"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Send, ShieldCheck, MapPin, Paperclip, FileText, ImageIcon, Loader2, X, Download, Check, CheckCheck, Star, Mic, Video, Trash2 } from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";
import { conversationsService } from "@/lib/conversations";
import { supabase } from "@/lib/supabase";
// import { io } from "socket.io-client";
import { useLanguage } from "@/lib/language-context";

interface Message {
    id: string;
    sender_id: string;
    content: string;
    message_type: 'text' | 'image' | 'file' | 'voice' | 'location';
    file_url?: string;
    file_name?: string;
    is_read?: boolean;
    created_at: string;
    sender?: {
        id?: string;
        name?: string;
        email?: string;
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
    const [mounted, setMounted] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);
    // const socketRef = useRef<any>(null);

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        let channel: any;
        if (conversationId) {
            fetchChatData();

            // Subscribe to new messages
            channel = conversationsService.subscribeToConversation(conversationId, (payload) => {
                // Handle both snake_case (Postgres standard) and camelCase (Prisma) payload keys
                const newItem = payload.new;
                const newItemConversationId = newItem.conversationId || newItem.conversation_id;

                if (payload.eventType === 'INSERT' && newItemConversationId === conversationId) {
                    const newMessage = newItem;

                    // Transform raw DB fields to UI interface
                    const processedMessage: Message = {
                        id: newMessage.id,
                        sender_id: newMessage.senderId || newMessage.sender_id,
                        content: newMessage.content,
                        message_type: (newMessage.messageType || newMessage.message_type || 'text') as any,
                        is_read: newMessage.is_read !== undefined ? newMessage.is_read : (newMessage.isRead !== undefined ? newMessage.isRead : false),
                        created_at: newMessage.createdAt || newMessage.created_at || new Date().toISOString(),
                        sender: { name: '...' } // Temporary placeholder
                    };

                    // Optimistically add message
                    setMessages(prev => {
                        if (prev.find(m => m.id === processedMessage.id)) return prev;
                        return [...prev, processedMessage];
                    });

                    // Fetch sender name immediately
                    supabase
                        .from('users')
                        .select('name')
                        .eq('id', processedMessage.sender_id)
                        .single()
                        .then(({ data: userData }) => {
                            if (userData) {
                                setMessages(prev => prev.map(m =>
                                    m.id === processedMessage.id
                                        ? { ...m, sender: { name: userData.name } }
                                        : m
                                ));
                            }
                        });
                } else if (payload.eventType === 'UPDATE' && newItemConversationId === conversationId) {
                    setMessages(prev => prev.map(m =>
                        m.id === newItem.id
                            ? { ...m, is_read: newItem.is_read }
                            : m
                    ));
                }
            });
        }
        return () => {
            if (channel) {
                conversationsService.unsubscribe(channel);
            }
        };
    }, [conversationId]); // Removed fetchChatData from deps to avoid loop if it changes

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

    const fetchChatData = useCallback(async () => {
        setLoading(true);
        try {
            const data = await conversationsService.getConversation(conversationId);
            if (data) {
                const processedMessages = (data.messages || []).map((msg: any) => ({
                    ...msg,
                    // Ensure snake_case properties are present (service returns both)
                    sender_id: msg.sender_id || msg.senderId,
                    message_type: msg.message_type || msg.messageType,
                    created_at: msg.created_at || msg.createdAt,
                    sender: msg.sender || { name: 'Unknown' }
                }));
                setMessages(processedMessages);
                setParticipants(data.conversation.participants || []);
                setAdInfo(data.conversation.ad);

                // Mark messages as read
                conversationsService.markAsRead(conversationId);
            }
        } catch (error) {
            console.error("Failed to fetch chat:", error);
        } finally {
            setLoading(false);
        }
    }, [conversationId]);

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
            const sentMessage = await conversationsService.sendMessage(conversationId, payload.content, payload.messageType);

            // Normalize returned fields (snake_case)
            const id = sentMessage.id;
            const contentResp = sentMessage.content;
            const messageType = sentMessage.message_type || type;
            const createdAt = sentMessage.created_at || new Date().toISOString();
            const senderId = sentMessage.sender_id || user?.id;

            // Add message locally immediately
            const newMessage: Message = {
                id: id,
                sender_id: senderId,
                content: contentResp,
                message_type: messageType as any,
                created_at: createdAt,
                sender: { name: user?.name || 'You' }
            };
            setMessages(prev => [...prev, newMessage]);

            if (type === 'text') setInput("");
        } catch (error: any) {
            console.error("Failed to send message:", error);
            alert((error && error.message) ? error.message : (language === 'ar' ? 'فشل في إرسال الرسالة' : 'Failed to send message'));
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

    const handleDownload = async (url: string, fileName: string) => {
        try {
            const response = await fetch(url);
            const blob = await response.blob();
            const blobUrl = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = blobUrl;
            link.download = fileName;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(blobUrl);
        } catch (error) {
            console.error('Download failed:', error);
            window.open(url, '_blank');
        }
    };

    const [showRateModal, setShowRateModal] = useState(false);
    const [userRating, setUserRating] = useState(0);
    const [ratingComment, setRatingComment] = useState("");
    const [ratingLoading, setRatingLoading] = useState(false);

    const handleRateUser = async () => {
        if (!userRating || !otherMember.id) return;
        setRatingLoading(true);
        try {
            const { error } = await supabase
                .from('user_ratings')
                .upsert({
                    seller_id: otherMember.id,
                    buyer_id: user?.id,
                    rating: userRating,
                    comment: ratingComment
                });
            if (error) throw error;
            setShowRateModal(false);
            setUserRating(0);
            setRatingComment("");
            alert(language === 'ar' ? 'شكراً لتقييمك!' : 'Thank you for your rating!');
        } catch (error) {
            console.error("Rating failed:", error);
            alert(language === 'ar' ? 'فشل التقييم' : 'Rating failed');
        } finally {
            setRatingLoading(false);
        }
    };

    const handleDeleteMessage = async (messageId: string) => {
        if (!confirm(language === 'ar' ? 'هل تريد حذف هذه الرسالة؟' : 'Are you sure you want to delete this message?')) {
            return;
        }

        try {
            await conversationsService.deleteMessage(messageId);
            setMessages(prev => prev.filter(msg => msg.id !== messageId));
        } catch (error: any) {
            console.error("Failed to delete message:", error);
            alert(error.message || (language === 'ar' ? 'فشل في حذف الرسالة' : 'Failed to delete message'));
        }
    };

    const handleDeleteConversation = async () => {
        if (!confirm(language === 'ar' ? 'هل تريد حذف هذه المحادثة؟' : 'Are you sure you want to delete this conversation?')) {
            return;
        }

        try {
            await conversationsService.deleteConversation(conversationId);
            if (onClose) onClose();
            alert(language === 'ar' ? 'تم حذف المحادثة' : 'Conversation deleted');
        } catch (error: any) {
            console.error("Failed to delete conversation:", error);
            alert(error.message || (language === 'ar' ? 'فشل في حذف المحادثة' : 'Failed to delete conversation'));
        }
    };

    const handleFileUpload = async (file: File, type: 'file' | 'image') => {
        const fileName = `${Date.now()}-${file.name}`;
        const bucket = type === 'image' ? 'chat-images' : 'chat-files';
        const { error } = await supabase.storage
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

    // تسجيل صوتي مباشر
    const [isRecording, setIsRecording] = useState(false);
    const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
    const [audioChunks, setAudioChunks] = useState<Blob[]>([]);

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const recorder = new MediaRecorder(stream);
            const chunks: Blob[] = [];

            recorder.ondataavailable = (e) => {
                if (e.data.size > 0) {
                    chunks.push(e.data);
                }
            };

            recorder.onstop = async () => {
                const audioBlob = new Blob(chunks, { type: 'audio/webm' });
                const audioFile = new File([audioBlob], `voice-message-${Date.now()}.webm`, { type: 'audio/webm' });
                
                // رفع الملف الصوتي
                const uploadData = await handleFileUpload(audioFile, 'file');
                if (uploadData) {
                    handleSend('voice', `Voice message`, uploadData);
                }

                // إيقاف الميكروفون
                stream.getTracks().forEach(track => track.stop());
                setAudioChunks([]);
            };

            recorder.start();
            setMediaRecorder(recorder);
            setIsRecording(true);
            setAudioChunks([]);

        } catch (error) {
            console.error('Error starting recording:', error);
            alert(language === 'ar' ? 'لا يمكن الوصول إلى الميكروفون' : 'Cannot access microphone');
        }
    };

    const stopRecording = () => {
        if (mediaRecorder && isRecording) {
            mediaRecorder.stop();
            setIsRecording(false);
            setMediaRecorder(null);
        }
    };

    const otherMember = participants.find(p => p.id !== user?.id) || { name: "User", role: "Member" };

    if (!mounted) return null;

    if (loading) return (
        <div className="flex flex-col h-[500px] bg-white/80 dark:bg-[#1a1a1a]/80 backdrop-blur-xl border border-white/20 dark:border-white/10 rounded-sm items-center justify-center">
            <Loader2 className="animate-spin text-primary" size={32} />
            <span className="text-[10px] font-black uppercase tracking-widest mt-4 opacity-40">Connecting to Saha Link...</span>
        </div>
    );

    return (
        <div className="flex flex-col h-[600px] bg-white/80 dark:bg-[#1a1a1a]/80 backdrop-blur-xl border border-white/20 dark:border-white/10 rounded-sm shadow-2xl overflow-hidden" dir={language === 'ar' ? 'rtl' : 'ltr'}>
            {/* Header - High Density */}
            <div className="p-3 border-b border-gray-100 flex justify-between items-center bg-gray-50">
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
                            <span className="text-[9px] font-black text-text-muted uppercase tracking-tighter">Active - Verified {otherMember.role}</span>
                        </div>
                    </div>
                    {/* Rate Seller Button */}
                    <button
                        onClick={() => setShowRateModal(true)}
                        className="flex items-center gap-1 px-2 py-1 bg-yellow-400/10 text-yellow-600 hover:bg-yellow-400 hover:text-white rounded-lg text-[9px] font-black transition-all border border-yellow-400/20 mr-2"
                    >
                        <Star size={10} className="fill-current" />
                        {(t as any)("rateSeller")}
                    </button>
                </div>
                <div className="flex items-center gap-3">
                    {adInfo && (
                        <div className="hidden md:flex items-center gap-2 px-2 py-1 bg-card border border-[#2a2d3a] rounded-xs">
                            <div className="w-6 h-6 bg-gray-50 rounded-xs flex items-center justify-center"><ImageIcon size={12} className="text-gray-300" /></div>
                            <span className="text-[9px] font-black text-secondary truncate max-w-[100px] uppercase italic">{adInfo.title}</span>
                        </div>
                    )}
                    <button
                        onClick={handleDeleteConversation}
                        className="p-1.5 hover:bg-red-50 text-text-muted hover:text-red-500 transition-all rounded-xs"
                        title={language === 'ar' ? 'حذف المحادثة' : 'Delete conversation'}
                    >
                        <Trash2 size={16} />
                    </button>
                    <button onClick={onClose} className="p-1.5 hover:bg-red-50 text-text-muted hover:text-red-500 transition-all rounded-xs"><X size={16} /></button>
                </div>
            </div>

            {/* Safety Bar */}
            <div className="bg-primary/10 py-1.5 px-3 border-b border-primary/20 flex items-center gap-2">
                <div className="text-primary"><ShieldCheck size={12} /></div>
                <p className="text-[9px] font-black text-primary uppercase italic tracking-tight">Security Alert: Always keep transactions within Saha platform.</p>
            </div>

            {/* Messages Area - High Density */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#fcfcfc] custom-scrollbar">
                {messages.map((msg, idx) => {
                    const isMe = msg.sender_id === user?.id;
                    const isImage = msg.message_type === 'image' || (msg.file_url && /\.(jpg|jpeg|png|gif|webp)$/i.test(msg.file_url));

                    return (
                        <div key={msg.id || idx} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                            <div className={`relative max-w-[75%] px-3 py-2 shadow-sm transition-all hover:shadow-md ${isMe
                                ? 'bg-[#d9fdd3] dark:bg-[#005c4b] text-gray-900 dark:text-white rounded-2xl rounded-tr-none'
                                : 'bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 text-gray-800 dark:text-gray-100 rounded-2xl rounded-tl-none'}`}>

                                {msg.message_type === 'text' && <p className="text-[11px] font-bold leading-relaxed whitespace-pre-wrap">{msg.content}</p>}

                                {isImage && msg.file_url && (
                                    <div className="mb-1">
                                        <div className="relative group overflow-hidden rounded-lg border border-black/10">
                                            <img
                                                src={msg.file_url}
                                                alt="Attachment"
                                                className="max-w-[250px] max-h-[250px] object-cover cursor-pointer hover:scale-105 transition-transform duration-300"
                                                onClick={() => window.open(msg.file_url, '_blank')}
                                                onError={(e) => {
                                                    e.currentTarget.src = '/placeholder-image.png'; // Fallback
                                                    e.currentTarget.onerror = null; // Prevent loop
                                                }}
                                            />
                                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                                                <Download className="text-white opacity-80" size={24} />
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => handleDownload(msg.file_url!, msg.file_name || 'image.jpg')}
                                            className={`flex items-center gap-1 mt-1 text-[9px] font-black hover:underline ${isMe ? 'text-primary' : 'text-primary'}`}
                                        >
                                            <Download size={10} /> {language === 'ar' ? 'تحميل الصورة' : 'Download Image'}
                                        </button>
                                    </div>
                                )}

                                {msg.message_type === 'location' && (
                                    <div className="space-y-2">
                                        <div className={`flex items-center gap-2 text-[10px] font-black border-b pb-1 mb-1 ${isMe ? 'border-black/5' : 'border-black/5'}`}>
                                            <MapPin size={12} /> SHARED LOCATION
                                        </div>
                                        <iframe
                                            width="200"
                                            height="150"
                                            className="rounded-lg border-0"
                                            src={`https://www.openstreetmap.org/export/embed.html?bbox=${parseFloat(msg.content.split('mlon=')[1].split('#')[0]) - 0.01}%2C${parseFloat(msg.content.split('mlat=')[1].split('&')[0]) - 0.01}%2C${parseFloat(msg.content.split('mlon=')[1].split('#')[0]) + 0.01}%2C${parseFloat(msg.content.split('mlat=')[1].split('&')[0]) + 0.01}&layer=mapnik&marker=${msg.content.split('mlat=')[1].split('&')[0]}%2C${msg.content.split('mlon=')[1].split('#')[0]}`}
                                        ></iframe>
                                        <a href={msg.content} target="_blank" className="text-[9px] underline block mt-1 opacity-70">VIEW ON FULL MAP</a>
                                    </div>
                                )}

                                {msg.message_type === 'file' && !isImage && (
                                    <div className={`flex items-center gap-3 p-2 rounded-lg ${isMe ? 'bg-black/5' : 'bg-gray-100'}`}>
                                        <FileText size={24} className={'text-primary'} />
                                        <div className="flex flex-col min-w-0">
                                            <span className="text-[10px] font-black truncate max-w-[150px]"
>{msg.file_name || 'Attached File'}</span>
                                            <button
                                                onClick={() => handleDownload(msg.file_url!, msg.file_name || 'file')}
                                                className={`flex items-center justify-start gap-1 text-[9px] font-black hover:underline text-primary text-right`}
                                            >
                                                <Download size={10} /> {language === 'ar' ? 'تحميل' : 'DOWNLOAD NOW'}
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {msg.message_type === 'voice' && msg.file_url && (
                                    <div className={`flex items-center gap-3 p-3 rounded-lg ${isMe ? 'bg-blue-50 border border-blue-200' : 'bg-gray-100 border border-gray-200'}`}>
                                        <Mic size={20} className="text-blue-600" />
                                        <div className="flex flex-col flex-1">
                                            <span className="text-[10px] font-black text-blue-800">VOICE MESSAGE</span>
                                            <audio controls className="w-full mt-2 h-8">
                                                <source src={msg.file_url} type="audio/mpeg" />
                                                Your browser does not support the audio element.
                                            </audio>
                                            <button
                                                onClick={() => handleDownload(msg.file_url!, msg.file_name || 'voice-message.mp3')}
                                                className="flex items-center gap-1 text-[9px] font-black text-blue-600 hover:underline mt-2"
                                            >
                                                <Download size={10} /> {language === 'ar' ? 'تحميل الصوت' : 'Download Audio'}
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {msg.message_type === 'video' && msg.file_url && (
                                    <div className="space-y-2">
                                        <div className={`flex items-center gap-2 text-[10px] font-black border-b pb-1 mb-2 ${isMe ? 'border-black/5' : 'border-black/5'}`}>
                                            <Video size={12} /> VIDEO MESSAGE
                                        </div>
                                        <video controls className="w-full max-w-[300px] rounded-lg border">
                                            <source src={msg.file_url} type="video/mp4" />
                                            Your browser does not support the video element.
                                        </video>
                                        <button
                                            onClick={() => handleDownload(msg.file_url!, msg.file_name || 'video-message.mp4')}
                                            className={`flex items-center gap-1 text-[9px] font-black hover:underline ${isMe ? 'text-primary' : 'text-primary'}`}
                                        >
                                            <Download size={10} /> {language === 'ar' ? 'تحميل الفيديو' : 'Download Video'}
                                        </button>
                                    </div>
                                )}

                                <div className={`flex items-center justify-end gap-1 mt-1 select-none`}>
                                    <span className={`text-[9px] font-medium ${isMe ? 'text-gray-500 dark:text-gray-300' : 'text-gray-400'}`}>
                                        {(() => {
                                            const date = new Date(msg.created_at);
                                            return isNaN(date.getTime()) ? '...' : date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                                        })()}
                                    </span>
                                    {isMe && (
                                        <span className={msg.is_read ? 'text-blue-500' : 'text-gray-400'}>
                                            {msg.is_read ? <CheckCheck size={14} /> : <Check size={14} />}
                                        </span>
                                    )}
                                    {isMe && (
                                        <button
                                            onClick={() => handleDeleteMessage(msg.id)}
                                            className="text-red-400 hover:text-red-600 transition-colors ml-1"
                                            title={language === 'ar' ? 'حذف الرسالة' : 'Delete message'}
                                        >
                                            <Trash2 size={12} />
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                })}
                <div ref={scrollRef} />
            </div>

            {/* Input Tools - Compressed */}
            <div className="p-2 bg-card border-t border-[#2a2d3a] flex gap-2 overflow-x-auto no-scrollbar">
                <button onClick={shareLocation} className="flex items-center gap-1.5 px-3 py-1.5 bg-card border border-[#2a2d3a] rounded-sm text-[9px] font-black text-gray-500 hover:text-primary hover:border-primary transition-all whitespace-nowrap shadow-sm active:scale-95">
                    <MapPin size={12} /> SHARE LOCATION
                </button>
                
                {/* زر تسجيل صوتي مباشر */}
                <button 
                    onClick={isRecording ? stopRecording : startRecording}
                    className={`flex items-center gap-1.5 px-3 py-1.5 border rounded-sm text-[9px] font-black transition-all whitespace-nowrap shadow-sm active:scale-95 ${
                        isRecording 
                            ? 'bg-red-500 text-white border-red-600 hover:bg-red-600' 
                            : 'bg-card border-[#2a2d3a] text-gray-500 hover:text-primary hover:border-primary'
                    }`}
                >
                    {isRecording ? (
                        <>
                            <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                            RECORDING...
                        </>
                    ) : (
                        <>
                            <Mic size={12} /> RECORD VOICE
                        </>
                    )}
                </button>
                <label className="flex items-center gap-1.5 px-3 py-1.5 bg-card border border-[#2a2d3a] rounded-sm text-[9px] font-black text-gray-500 hover:text-primary hover:border-primary transition-all cursor-pointer whitespace-nowrap shadow-sm active:scale-95">
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
                <label className="flex items-center gap-1.5 px-3 py-1.5 bg-card border border-[#2a2d3a] rounded-sm text-[9px] font-black text-gray-500 hover:text-primary hover:border-primary transition-all cursor-pointer whitespace-nowrap shadow-sm active:scale-95">
                    <ImageIcon size={12} /> SEND IMAGE
                    <input type="file" accept="image/*" className="hidden" onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                            const uploadData = await handleFileUpload(file, 'image');
                            if (uploadData) {
                                handleSend('image', `Image: ${file.name}`, uploadData);
                            }
                        }
                    }} />
                </label>
                <label className="flex items-center gap-1.5 px-3 py-1.5 bg-card border border-[#2a2d3a] rounded-sm text-[9px] font-black text-gray-500 hover:text-primary hover:border-primary transition-all cursor-pointer whitespace-nowrap shadow-sm active:scale-95">
                    <Mic size={12} /> VOICE MESSAGE
                    <input type="file" accept="audio/*" className="hidden" onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                            const uploadData = await handleFileUpload(file, 'file');
                            if (uploadData) {
                                handleSend('voice', `Voice message`, uploadData);
                            }
                        }
                    }} />
                </label>
                <label className="flex items-center gap-1.5 px-3 py-1.5 bg-card border border-[#2a2d3a] rounded-sm text-[9px] font-black text-gray-500 hover:text-primary hover:border-primary transition-all cursor-pointer whitespace-nowrap shadow-sm active:scale-95">
                    <Video size={12} /> VIDEO MESSAGE
                    <input type="file" accept="video/*" className="hidden" onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                            const uploadData = await handleFileUpload(file, 'file');
                            if (uploadData) {
                                handleSend('video', `Video message`, uploadData);
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

            {/* Rating Modal Overlays */}
            {showRateModal && (
                <div className="absolute inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-zinc-900 rounded-3xl w-full max-w-sm p-6 shadow-2xl border border-white/10 animate-in zoom-in-95 duration-200">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-sm font-black uppercase tracking-widest text-text-main">{(t as any)("rateSeller")}</h3>
                            <button onClick={() => setShowRateModal(false)} className="text-text-muted hover:text-text-main"><X size={16} /></button>
                        </div>

                        <div className="flex flex-col items-center gap-4">
                            <div className="flex items-center gap-2">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <button
                                        key={star}
                                        onClick={() => setUserRating(star)}
                                        className={`transition-all hover:scale-125 ${userRating >= star ? 'text-yellow-400' : 'text-gray-300'}`}
                                    >
                                        <Star size={32} className={userRating >= star ? 'fill-current' : ''} />
                                    </button>
                                ))}
                            </div>

                            <textarea
                                value={ratingComment}
                                onChange={(e) => setRatingComment(e.target.value)}
                                placeholder={language === 'ar' ? 'أضف تعليقاً (اختياري)...' : 'Add a comment (optional)...'}
                                className="w-full bg-gray-50 dark:bg-black/20 border border-gray-100 dark:border-white/5 rounded-2xl p-4 text-xs font-bold outline-none focus:border-primary transition-all resize-none h-24"
                            />

                            <button
                                onClick={handleRateUser}
                                disabled={!userRating || ratingLoading}
                                className="w-full py-3 bg-primary text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-lg shadow-primary/20 hover:bg-primary-hover disabled:opacity-50 active:scale-95 transition-all"
                            >
                                {ratingLoading ? "..." : (t as any)("ratingSubmitted")}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
