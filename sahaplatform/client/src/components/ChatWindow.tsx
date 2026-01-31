"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Send, ShieldCheck, MapPin, Paperclip, FileText, ImageIcon, Loader2, X, Download, Check, CheckCheck, Star, Mic, Video, Music, MoreVertical, Trash, Play, Pause } from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";
import { conversationsService } from "@/lib/conversations";
import { supabase } from "@/lib/supabase";
// import { io } from "socket.io-client";
import { useLanguage } from "@/lib/language-context";

interface Message {
    id: string;
    sender_id: string;
    content: string;
    message_type: 'text' | 'image' | 'file' | 'voice' | 'location' | 'video';
    file_url?: string;
    file_name?: string;
    file_size?: number;
    duration?: number;
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
    const { language } = useLanguage();
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const [participants, setParticipants] = useState<any[]>([]);
    const [adInfo, setAdInfo] = useState<any>(null);
    const [mounted, setMounted] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);
    // Rating State
    const [isRatingOpen, setIsRatingOpen] = useState(false);
    const [ratingValue, setRatingValue] = useState(0);
    const [ratingComment, setRatingComment] = useState("");
    const [isSubmittingRating, setIsSubmittingRating] = useState(false);
    
    // File & Recording State
    const [isRecording, setIsRecording] = useState(false);
    const [recordingTime, setRecordingTime] = useState(0);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);
    const recordingTimerRef = useRef<NodeJS.Timeout | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [showAttachments, setShowAttachments] = useState(false);
    
    // const socketRef = useRef<any>(null);

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        let channel: any;
        if (conversationId) {
            // Validate session before starting
            supabase.auth.getSession().then(({ data: { session } }) => {
                if (!session) {
                    // Try to refresh or warn
                     supabase.auth.refreshSession().then(({ data: { session: newSession }, error }) => {
                        if (!newSession || error) {
                            console.error('Session expired in ChatWindow');
                            // Optionally redirect or show error state
                            return;
                        }
                        fetchChatData();
                        setupSubscription();
                     });
                } else {
                    fetchChatData();
                    setupSubscription();
                }
            });

            const setupSubscription = () => {
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
            };
        }
        return () => {
            if (channel) {
                conversationsService.unsubscribe(channel);
            }
        };
    }, [conversationId]);
    
    // Recording Logic
    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const mediaRecorder = new MediaRecorder(stream);
            mediaRecorderRef.current = mediaRecorder;
            audioChunksRef.current = [];

            mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    audioChunksRef.current.push(event.data);
                }
            };

            mediaRecorder.onstop = async () => {
                const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
                const audioFile = new File([audioBlob], `voice-note-${Date.now()}.webm`, { type: 'audio/webm' });
                
                // Upload and send
                const uploadData = await handleFileUpload(audioFile, 'voice');
                if (uploadData) {
                    handleSend('voice', 'Voice Note', { ...uploadData, duration: recordingTime });
                }
                
                // Cleanup
                stream.getTracks().forEach(track => track.stop());
                setRecordingTime(0);
            };

            mediaRecorder.start();
            setIsRecording(true);
            
            // Timer
            recordingTimerRef.current = setInterval(() => {
                setRecordingTime(prev => prev + 1);
            }, 1000);

        } catch (error) {
            console.error('Error accessing microphone:', error);
            alert('Could not access microphone');
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
            if (recordingTimerRef.current) {
                clearInterval(recordingTimerRef.current);
            }
        }
    };

    const cancelRecording = () => {
         if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop(); // This triggers onstop, but we might want to prevent upload
            // Hack: clear chunks so onstop uploads nothing or handle "cancelled" state
            // Better: just stop tracks and reset state without processing
            mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
            setIsRecording(false);
            if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
            setRecordingTime(0);
            audioChunksRef.current = [];
            mediaRecorderRef.current = null; // Prevent onstop logic if possible or handle checks
         }
    };
    
    // Helper to format duration
    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    useEffect(() => {
        scrollRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

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

    const handleSend = async (type: 'text' | 'image' | 'file' | 'voice' | 'location' | 'video' = 'text', content?: string, fileData?: any) => {
        const messageContent = content || input;
        if (!messageContent.trim() && type === 'text') return;

        setSending(true);
        try {
            const payload = {
                content: messageContent,
                messageType: type,
                ...fileData
            };
            const sentMessage = await conversationsService.sendMessage(conversationId, payload.content, payload.messageType, fileData);

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
                sender: { name: user?.name || 'You' },
                ...fileData
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

    const handleFileUpload = async (file: File, type: 'file' | 'image' | 'voice' | 'video') => {
        try {
            // Upload via service (which uses Supabase storage)
            const uploadResult = await conversationsService.uploadFile(file, conversationId);
            return uploadResult;
        } catch (error) {
            console.error('Error uploading file:', error);
            alert(language === 'ar' ? 'فشل رفع الملف' : 'Failed to upload file');
            return null;
        }
    };



    const otherMember = participants.find(p => p.id !== user?.id) || { name: "User", role: "Member" };

    const submitRating = async () => {
        if (!user || !otherMember.id || ratingValue === 0) return;
        
        setIsSubmittingRating(true);
        try {
            const { error } = await supabase
                .from('ratings')
                .insert({
                    rater_id: user.id,
                    rated_user_id: otherMember.id,
                    rating: ratingValue,
                    comment: ratingComment
                });
                
            if (error) throw error;
            
            setIsRatingOpen(false);
            setRatingValue(0);
            setRatingComment("");
            alert(language === 'ar' ? 'تم إرسال تقييمك بنجاح' : 'Rating submitted successfully');
        } catch (error) {
            console.error('Error submitting rating:', error);
            alert(language === 'ar' ? 'حدث خطأ أثناء إرسال التقييم' : 'Error submitting rating');
        } finally {
            setIsSubmittingRating(false);
        }
    };

    if (!mounted) return null;

    if (loading) return (
        <div className="flex flex-col h-[500px] bg-white border border-gray-200 rounded-sm items-center justify-center">
            <Loader2 className="animate-spin text-primary" size={32} />
            <span className="text-[10px] font-black uppercase tracking-widest mt-4 opacity-40">Connecting to Saha Link...</span>
        </div>
    );

    return (
        <div className="flex flex-col h-[600px] bg-white border border-gray-200 rounded-sm shadow-2xl overflow-hidden" dir={language === 'ar' ? 'rtl' : 'ltr'}>
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
                </div>
                <div className="flex items-center gap-3">
                    {adInfo && (
                        <div className="hidden md:flex items-center gap-2 px-2 py-1 bg-card border border-[#2a2d3a] rounded-xs">
                            <div className="w-6 h-6 bg-gray-50 rounded-xs flex items-center justify-center"><ImageIcon size={12} className="text-gray-300" /></div>
                            <span className="text-[9px] font-black text-secondary truncate max-w-[100px] uppercase italic">{adInfo.title}</span>
                        </div>
                    )}
                    <button 
                        onClick={() => alert(language === 'ar' ? 'المكالمات قريبا' : 'Calls coming soon')} 
                        className="p-1.5 hover:bg-blue-50 text-text-muted hover:text-blue-500 transition-all rounded-xs"
                        title={language === 'ar' ? 'مكالمة فيديو' : 'Video Call'}
                    >
                        <Video size={16} />
                    </button>
                    <button 
                        onClick={() => setIsRatingOpen(true)} 
                        className="p-1.5 hover:bg-yellow-50 text-text-muted hover:text-yellow-500 transition-all rounded-xs"
                        title={language === 'ar' ? 'تقييم المعلن' : 'Rate User'}
                    >
                        <Star size={16} />
                    </button>
                    <button onClick={onClose} className="p-1.5 hover:bg-red-50 text-text-muted hover:text-red-500 transition-all rounded-xs"><X size={16} /></button>
                </div>
            </div>

            {/* Rating Modal */}
            {isRatingOpen && (
                <div className="absolute inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-sm p-6 relative animate-in fade-in zoom-in duration-200">
                        <button 
                            onClick={() => setIsRatingOpen(false)}
                            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                        >
                            <X size={20} />
                        </button>
                        
                        <h3 className="text-lg font-black text-secondary mb-4 text-center">
                            {language === 'ar' ? 'تقييم التجربة' : 'Rate Experience'}
                        </h3>
                        
                        <div className="flex justify-center gap-2 mb-6">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                    key={star}
                                    onClick={() => setRatingValue(star)}
                                    className={`transition-all hover:scale-110 ${ratingValue >= star ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
                                >
                                    <Star size={32} />
                                </button>
                            ))}
                        </div>
                        
                        <textarea
                            value={ratingComment}
                            onChange={(e) => setRatingComment(e.target.value)}
                            placeholder={language === 'ar' ? 'اكتب تعليقك هنا...' : 'Write your comment here...'}
                            className="w-full h-24 p-3 border border-gray-200 rounded-md text-sm mb-4 resize-none focus:outline-none focus:ring-2 focus:ring-primary/20"
                        />
                        
                        <button
                            onClick={submitRating}
                            disabled={isSubmittingRating || ratingValue === 0}
                            className="w-full py-2.5 bg-primary text-white rounded-md font-bold text-sm hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {isSubmittingRating && <Loader2 size={16} className="animate-spin" />}
                            {language === 'ar' ? 'إرسال التقييم' : 'Submit Rating'}
                        </button>
                    </div>
                </div>
            )}

            {/* Safety Bar */}
            <div className="bg-primary/10 py-1.5 px-3 border-b border-primary/20 flex items-center gap-2">
                <div className="text-primary"><ShieldCheck size={12} /></div>
                <p className="text-[9px] font-black text-primary uppercase italic tracking-tight">Security Alert: Always keep transactions within Saha platform.</p>
            </div>

            {/* Messages Area - High Density */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#fcfcfc] custom-scrollbar" ref={scrollRef}>
                {messages.map((msg, idx) => {
                    const isMe = msg.sender_id === user?.id;
                    const isImage = msg.message_type === 'image' || (msg.file_url && /\.(jpg|jpeg|png|gif|webp)$/i.test(msg.file_url));
                    const isVideo = msg.message_type === 'video';
                    const isVoice = msg.message_type === 'voice';
                    
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
                                        </div>
                                        <a 
                                            href={msg.file_url} 
                                            download 
                                            target="_blank" 
                                            className={`flex items-center gap-1 mt-1 text-[9px] font-black hover:underline ${isMe ? 'text-primary' : 'text-primary'}`}
                                        >
                                            <Download size={10} /> {language === 'ar' ? 'تحميل الصورة' : 'Download Image'}
                                        </a>
                                    </div>
                                )}

                                {isVideo && msg.file_url && (
                                    <div className="mb-1 min-w-[200px]">
                                        <video controls className="max-w-full rounded-lg border border-black/10">
                                            <source src={msg.file_url} type={msg.file_type || 'video/mp4'} />
                                            Your browser does not support the video tag.
                                        </video>
                                        <a 
                                            href={msg.file_url} 
                                            download 
                                            target="_blank" 
                                            className={`flex items-center gap-1 mt-1 text-[9px] font-black hover:underline ${isMe ? 'text-primary' : 'text-primary'}`}
                                        >
                                            <Download size={10} /> {language === 'ar' ? 'تحميل الفيديو' : 'Download Video'}
                                        </a>
                                    </div>
                                )}

                                {isVoice && msg.file_url && (
                                    <div className="flex flex-col gap-1 min-w-[200px] py-1">
                                        <audio controls className="h-8 w-full max-w-[250px]">
                                            <source src={msg.file_url} type="audio/webm" />
                                            Your browser does not support the audio element.
                                        </audio>
                                        <a 
                                            href={msg.file_url} 
                                            download 
                                            target="_blank" 
                                            className={`flex items-center gap-1 mt-1 text-[9px] font-black hover:underline ${isMe ? 'text-primary' : 'text-primary'}`}
                                        >
                                            <Download size={10} /> {language === 'ar' ? 'تحميل التسجيل' : 'Download Audio'}
                                        </a>
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

                                {msg.message_type === 'file' && !isImage && !isVideo && !isVoice && (
                                    <div className={`flex items-center gap-3 p-2 rounded-lg ${isMe ? 'bg-black/5' : 'bg-gray-100'}`}>
                                        <FileText size={24} className={'text-primary'} />
                                        <div className="flex flex-col min-w-0">
                                            <span className="text-[10px] font-black truncate max-w-[150px]">{msg.file_name || 'Attached File'}</span>
                                            <a href={msg.file_url} download target="_blank" className={`flex items-center gap-1 text-[9px] font-black hover:underline text-primary`}>
                                                <Download size={10} /> {language === 'ar' ? 'تحميل' : 'DOWNLOAD NOW'}
                                            </a>
                                        </div>
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
                                </div>
                            </div>
                        </div>
                    );
                })}
                <div ref={scrollRef} />
            </div>

            {/* Input Area */}
            <div className="p-3 bg-white border-t border-gray-100 relative">
                {/* Hidden File Input */}
                <input 
                    type="file" 
                    ref={fileInputRef} 
                    className="hidden" 
                    onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        
                        let type: any = 'file';
                        if (file.type.startsWith('image/')) type = 'image';
                        else if (file.type.startsWith('video/')) type = 'video';
                        else if (file.type.startsWith('audio/')) type = 'voice';

                        const uploadData = await handleFileUpload(file, type);
                        if (uploadData) {
                             let content = `Attached: ${file.name}`;
                             if (type === 'image') content = 'Image Attachment';
                             if (type === 'video') content = 'Video Attachment';
                             
                             handleSend(type, content, uploadData);
                        }
                        // Reset input
                        if (fileInputRef.current) {
                            fileInputRef.current.value = '';
                            fileInputRef.current.accept = ''; // Reset accept
                        }
                    }} 
                />

                {isRecording ? (
                    <div className="flex items-center gap-3 bg-red-50 p-2 rounded-lg animate-pulse border border-red-100">
                        <div className="w-3 h-3 bg-red-500 rounded-full animate-ping" />
                        <span className="text-xs font-bold text-red-500 flex-1">{language === 'ar' ? 'جاري التسجيل...' : 'Recording...'} {formatTime(recordingTime)}</span>
                        <button onClick={cancelRecording} className="p-2 text-gray-500 hover:text-red-500 transition-colors"><Trash size={18} /></button>
                        <button onClick={stopRecording} className="p-2 bg-red-500 text-white rounded-full shadow-lg shadow-red-500/30 hover:bg-red-600 transition-all"><Send size={18} className={language === 'ar' ? 'rotate-180' : ''} /></button>
                    </div>
                ) : (
                    <div className="flex gap-2 items-end">
                         {/* Attachments Menu */}
                        <div className="relative">
                            <button 
                                onClick={() => setShowAttachments(!showAttachments)}
                                className={`p-2.5 rounded-sm transition-all ${showAttachments ? 'bg-primary/10 text-primary' : 'bg-gray-50 text-gray-400 hover:text-gray-600'}`}
                            >
                                <Paperclip size={18} />
                            </button>
                            
                            {showAttachments && (
                                <div className="absolute bottom-full left-0 mb-2 bg-white rounded-lg shadow-xl border border-gray-100 p-2 flex flex-col gap-1 min-w-[150px] z-50 animate-in fade-in zoom-in duration-200">
                                    <button onClick={() => { setShowAttachments(false); fileInputRef.current?.click(); }} className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded text-xs font-bold text-gray-600 w-full text-left">
                                        <FileText size={14} className="text-blue-500" /> {language === 'ar' ? 'مستند / ملف' : 'Document/File'}
                                    </button>
                                    <button onClick={() => { setShowAttachments(false); if(fileInputRef.current) { fileInputRef.current.accept = 'image/*'; fileInputRef.current.click(); } }} className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded text-xs font-bold text-gray-600 w-full text-left">
                                        <ImageIcon size={14} className="text-purple-500" /> {language === 'ar' ? 'صورة' : 'Image'}
                                    </button>
                                     <button onClick={() => { setShowAttachments(false); if(fileInputRef.current) { fileInputRef.current.accept = 'video/*'; fileInputRef.current.click(); } }} className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded text-xs font-bold text-gray-600 w-full text-left">
                                        <Video size={14} className="text-red-500" /> {language === 'ar' ? 'فيديو' : 'Video'}
                                    </button>
                                    <button onClick={() => { setShowAttachments(false); shareLocation(); }} className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded text-xs font-bold text-gray-600 w-full text-left">
                                        <MapPin size={14} className="text-green-500" /> {language === 'ar' ? 'موقع' : 'Location'}
                                    </button>
                                </div>
                            )}
                        </div>

                        <input
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                            placeholder={language === 'ar' ? `اكتب رسالة لـ ${otherMember.name}...` : `Message ${otherMember.name}...`}
                            className="flex-1 bg-gray-50 border border-gray-100 outline-none px-4 py-2.5 rounded-sm text-[11px] font-bold focus:border-primary transition-all placeholder:font-black placeholder:uppercase placeholder:text-[9px] placeholder:tracking-widest"
                        />
                        
                        {input.trim() ? (
                            <button
                                onClick={() => handleSend()}
                                disabled={sending}
                                className="bg-primary text-white p-2.5 rounded-sm hover:bg-primary-hover disabled:opacity-50 transition-all shadow-lg shadow-primary/20 active:scale-90"
                            >
                                {sending ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} className={language === 'ar' ? 'rotate-180' : ''} />}
                            </button>
                        ) : (
                            <button
                                onClick={startRecording}
                                className="bg-gray-50 text-gray-400 p-2.5 rounded-sm hover:bg-red-50 hover:text-red-500 transition-all active:scale-90"
                                title={language === 'ar' ? 'تسجيل صوتي' : 'Record Voice'}
                            >
                                <Mic size={18} />
                            </button>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
