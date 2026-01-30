"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Send, ShieldCheck, MapPin, Paperclip, FileText, ImageIcon, Loader2, X, Mic, Phone } from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";
import { conversationsService } from "@/lib/conversations";
import { supabase } from "@/lib/supabase";
import { storageService } from "@/lib/storage";
import VoiceCall from "@/components/VoiceCall";
import IncomingCallNotification from "@/components/IncomingCallNotification";
import { io, Socket } from "socket.io-client";
// import { io } from "socket.io-client";
import { useLanguage } from "@/lib/language-context";

interface Message {
    id: string;
    senderId: string;
    content: string;
    messageType: 'text' | 'image' | 'file' | 'video' | 'audio' | 'voice' | 'call' | 'location';
    fileUrl?: string;
    fileName?: string;
    duration?: number; // for audio messages
    createdAt: string;
    updatedAt?: string; // for edit tracking
    isEdited?: boolean; // flag for edited messages
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
    const { language } = useLanguage();
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const [participants, setParticipants] = useState<any[]>([]);
    const [adInfo, setAdInfo] = useState<any>(null);
    const [isRecording, setIsRecording] = useState(false);
    const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
    const [audioChunks, setAudioChunks] = useState<Blob[]>([]);
    const [recordingTime, setRecordingTime] = useState(0);
    const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
    const [editInput, setEditInput] = useState("");
    const [showVoiceCall, setShowVoiceCall] = useState(false);
    const [incomingCall, setIncomingCall] = useState<any>(null);
    const [socket, setSocket] = useState<Socket | null>(null);
    const recordingTimerRef = useRef<NodeJS.Timeout | null>(null);
    const scrollRef = useRef<HTMLDivElement>(null);
    // const socketRef = useRef<any>(null);

    const fetchChatData = useCallback(async () => {
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
    }, [conversationId]);

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
                        senderId: newMessage.senderId || newMessage.sender_id,
                        content: newMessage.content,
                        messageType: newMessage.messageType || newMessage.message_type || 'text',
                        createdAt: newMessage.createdAt || newMessage.created_at || new Date().toISOString(),
                        sender: { name: '...' } // Temporary placeholder
                    };

                    // Optimistically add message
                    setMessages(prev => {
                        if (prev.find(m => m.id === processedMessage.id)) return prev;
                        return [...prev, processedMessage];
                    });

                    // Fetch sender name immediately
                    supabase
                        .from('User')
                        .select('name')
                        .eq('id', processedMessage.senderId)
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
                }
            });
        }
        return () => {
            if (channel) {
                conversationsService.unsubscribe(channel);
            }
        };
    }, [conversationId, fetchChatData]);

    useEffect(() => {
        scrollRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const handleSend = async (type: 'text' | 'image' | 'file' | 'video' | 'audio' | 'voice' | 'call' | 'location' = 'text', content?: string, fileData?: any) => {
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

            // Add message locally immediately
            const newMessage: Message = {
                id: sentMessage.id,
                senderId: user?.id || '',
                content: sentMessage.content,
                messageType: (sentMessage.messageType as any) || type,
                createdAt: sentMessage.createdAt,
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

    const handleFileUpload = async (file: File, type: 'file' | 'image') => {
        try {
            // التحقق من صحة الملف
            if (type === 'image') {
                if (!storageService.validateImageFile(file)) {
                    throw new Error('Invalid image file or size too large');
                }
            } else {
                if (!storageService.validateGeneralFile(file)) {
                    throw new Error('Invalid file type or size too large');
                }
            }

            // رفع الملف باستخدام خدمة التخزين
            const fileUrl = await storageService.uploadMessageFile(file);
            
            return { 
                fileUrl, 
                fileName: file.name, 
                fileSize: file.size 
            };
        } catch (error: any) {
            console.error('Error uploading file:', error);
            alert(error.message || 'Failed to upload file');
            return null;
        }
    };

    // وظائف التسجيل الصوتي
    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const recorder = new MediaRecorder(stream);
            const chunks: Blob[] = [];
            
            recorder.ondataavailable = (e) => {
                chunks.push(e.data);
            };
            
            recorder.onstop = async () => {
                const audioBlob = new Blob(chunks, { type: 'audio/webm' });
                const audioFile = new File([audioBlob], `voice-message-${Date.now()}.webm`, { type: 'audio/webm' });
                
                // رفع الملف الصوتي
                const uploadData = await handleFileUpload(audioFile, 'file');
                if (uploadData) {
                    const duration = Math.floor(recordingTime);
                    handleSend('audio', `Voice message (${duration}s)`, { 
                        ...uploadData, 
                        duration 
                    });
                }
                
                // إيقاف جميع المسارات الصوتية
                stream.getTracks().forEach(track => track.stop());
            };
            
            setMediaRecorder(recorder);
            setAudioChunks(chunks);
            setIsRecording(true);
            setRecordingTime(0);
            
            // بدء المؤقت
            recordingTimerRef.current = setInterval(() => {
                setRecordingTime(prev => prev + 1);
            }, 1000);
            
            recorder.start();
        } catch (error) {
            console.error('Error starting recording:', error);
            alert(language === 'ar' ? 'فشل في بدء التسجيل الصوتي' : 'Failed to start audio recording');
        }
    };

    const stopRecording = () => {
        if (mediaRecorder && isRecording) {
            mediaRecorder.stop();
            setIsRecording(false);
            
            if (recordingTimerRef.current) {
                clearInterval(recordingTimerRef.current);
                recordingTimerRef.current = null;
            }
        }
    };

    // تنظيف عند إلغاء التركيب
    useEffect(() => {
        return () => {
            if (recordingTimerRef.current) {
                clearInterval(recordingTimerRef.current);
            }
            if (mediaRecorder) {
                mediaRecorder.stream.getTracks().forEach(track => track.stop());
            }
        };
    }, [mediaRecorder]);

    // وظائف إدارة الرسائل
    const canModifyMessage = (message: Message): boolean => {
        if (message.senderId !== user?.id) return false;
        
        const createdAt = new Date(message.createdAt);
        const now = new Date();
        const diffInHours = (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60);
        
        return diffInHours < 1; // أقل من ساعة
    };

    const deleteMessage = async (messageId: string) => {
        if (!confirm(language === 'ar' ? 'هل أنت متأكد من حذف هذه الرسالة؟' : 'Are you sure you want to delete this message?')) {
            return;
        }

        try {
            // تحديث الرسالة لتصبح محذوفة (بدلاً من الحذف الفعلي للحفاظ على التاريخ)
            const deletedContent = language === 'ar' ? '[رسالة محذوفة]' : '[message deleted]';
            
            await supabase
                .from('Message')
                .update({ 
                    content: deletedContent,
                    messageType: 'text',
                    fileUrl: null,
                    fileName: null,
                    isRead: true
                })
                .eq('id', messageId);

            // تحديث الواجهة المحلية
            setMessages(prev => prev.map(msg => 
                msg.id === messageId 
                    ? { ...msg, content: deletedContent, messageType: 'text', fileUrl: null, fileName: null }
                    : msg
            ));

        } catch (error) {
            console.error('Error deleting message:', error);
            alert(language === 'ar' ? 'فشل في حذف الرسالة' : 'Failed to delete message');
        }
    };

    const startEditing = (message: Message) => {
        if (!canModifyMessage(message) || message.messageType !== 'text') return;
        
        setEditingMessageId(message.id);
        setEditInput(message.content);
    };

    const saveEdit = async () => {
        if (!editingMessageId || !editInput.trim()) return;

        try {
            const { data, error } = await supabase
                .from('Message')
                .update({ 
                    content: editInput.trim(),
                    updatedAt: new Date().toISOString(),
                    isEdited: true
                })
                .eq('id', editingMessageId)
                .select()
                .single();

            if (error) throw error;

            // تحديث الواجهة المحلية
            setMessages(prev => prev.map(msg => 
                msg.id === editingMessageId 
                    ? { 
                        ...msg, 
                        content: editInput.trim(),
                        updatedAt: data.updatedAt || new Date().toISOString(),
                        isEdited: true
                    }
                    : msg
            ));

            setEditingMessageId(null);
            setEditInput("");

        } catch (error) {
            console.error('Error editing message:', error);
            alert(language === 'ar' ? 'فشل في تعديل الرسالة' : 'Failed to edit message');
        }
    };

    const cancelEdit = () => {
        setEditingMessageId(null);
        setEditInput("");
    };

    const formatTimeDifference = (createdAt: string): string => {
        const created = new Date(createdAt);
        const now = new Date();
        const diffInMinutes = Math.floor((now.getTime() - created.getTime()) / (1000 * 60));
        
        if (diffInMinutes < 1) return language === 'ar' ? 'الآن' : 'now';
        if (diffInMinutes < 60) return `${diffInMinutes}${language === 'ar' ? 'د' : 'm'}`;
        
        const diffInHours = Math.floor(diffInMinutes / 60);
        if (diffInHours < 24) return `${diffInHours}${language === 'ar' ? 'س' : 'h'}`;
        
        const diffInDays = Math.floor(diffInHours / 24);
        return `${diffInDays}${language === 'ar' ? 'ي' : 'd'}`;
    };

    const otherMember = participants.find(p => p.id !== user?.id) || { name: "User", role: "Member" };

    if (loading) return (
        <div className="flex flex-col h-[500px] bg-white border border-gray-200 rounded-sm items-center justify-center">
            <Loader2 className="animate-spin text-primary" size={32} />
            <span className="text-[10px] font-black uppercase tracking-widest mt-4 opacity-40">connecting to saha link...</span>
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
                    <button onClick={onClose} className="p-1.5 hover:bg-red-50 text-text-muted hover:text-red-500 transition-all rounded-xs"><X size={16} /></button>
                </div>
            </div>

            {/* Safety Bar */}
            <div className="bg-orange-50 py-1.5 px-3 border-b border-orange-100 flex items-center gap-2">
                <div className="text-orange-600"><ShieldCheck size={12} /></div>
                <p className="text-[9px] font-black text-orange-800 uppercase italic tracking-tight">
                    {language === 'ar' ? 'تنبيه أمني: حافظ دائماً على معاملاتك داخل منصة ساحة.' : 'security alert: always keep transactions within saha platform.'}
                </p>
            </div>

            {/* Messages Area - High Density */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#fcfcfc] custom-scrollbar">
                {messages.map((msg, idx) => (
                    <div key={msg.id || idx} className={`flex flex-col ${msg.senderId === user?.id ? 'items-end' : 'items-start'}`}>
                        <div className={`max-w-[75%] px-3 py-2 rounded-sm shadow-sm transition-all hover:shadow-md ${msg.senderId === user?.id
                            ? 'bg-primary text-white rounded-br-none'
                            : 'bg-white border border-gray-100 text-secondary rounded-bl-none'}`}>

                            {msg.messageType === 'text' && (
                                <div>
                                    {editingMessageId === msg.id ? (
                                        <div className="flex gap-2">
                                            <input
                                                value={editInput}
                                                onChange={(e) => setEditInput(e.target.value)}
                                                onKeyDown={(e) => e.key === 'Enter' && saveEdit()}
                                                className="flex-1 bg-gray-100 border border-gray-300 px-2 py-1 rounded text-[11px]"
                                                autoFocus
                                            />
                                            <button 
                                                onClick={saveEdit}
                                                className="bg-green-500 text-white px-2 py-1 rounded text-[10px]"
                                            >
                                                ✓
                                            </button>
                                            <button 
                                                onClick={cancelEdit}
                                                className="bg-gray-500 text-white px-2 py-1 rounded text-[10px]"
                                            >
                                                ✕
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="group relative">
                                            <p className="text-[11px] font-bold leading-relaxed">{msg.content}</p>
                                            {msg.isEdited && (
                                                <span className="text-[8px] text-text-muted italic">
                                                    ({language === 'ar' ? 'معدل' : 'edited'})
                                                </span>
                                            )}
                                            {canModifyMessage(msg) && (
                                                <div className="absolute -top-6 right-0 bg-white border border-gray-200 rounded shadow-sm opacity-0 group-hover:opacity-100 transition-opacity flex gap-1 p-1">
                                                    <button 
                                                        onClick={() => startEditing(msg)}
                                                        className="text-[10px] text-blue-500 hover:text-blue-700 p-1"
                                                        title={language === 'ar' ? 'تعديل' : 'edit'}
                                                    >
                                                        ✏️
                                                    </button>
                                                    <button 
                                                        onClick={() => deleteMessage(msg.id)}
                                                        className="text-[10px] text-red-500 hover:text-red-700 p-1"
                                                        title={language === 'ar' ? 'حذف' : 'delete'}
                                                    >
                                                        🗑️
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            )}

                            {msg.messageType === 'location' && (
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2 text-[10px] font-black border-b border-black/5 pb-1 mb-1">
                                        <MapPin size={12} /> {language === 'ar' ? 'الموقع المشارك' : 'shared location'}
                                    </div>
                                    <iframe
                                        width="200"
                                        height="150"
                                        className="rounded-xs border-0"
                                        src={`https://www.openstreetmap.org/export/embed.html?bbox=${parseFloat(msg.content.split('mlon=')[1].split('#')[0]) - 0.01}%2C${parseFloat(msg.content.split('mlat=')[1].split('&')[0]) - 0.01}%2C${parseFloat(msg.content.split('mlon=')[1].split('#')[0]) + 0.01}%2C${parseFloat(msg.content.split('mlat=')[1].split('&')[0]) + 0.01}&layer=mapnik&marker=${msg.content.split('mlat=')[1].split('&')[0]}%2C${msg.content.split('mlon=')[1].split('#')[0]}`}
                                    ></iframe>
                                    <a href={msg.content} target="_blank" className="text-[9px] underline block mt-1 opacity-70">{language === 'ar' ? 'عرض الخريطة الكاملة' : 'view on full map'}</a>
                                </div>
                            )}

                            {msg.messageType === 'file' && (
                                <div className="flex items-center gap-3 bg-card p-2 rounded-xs">
                                    <FileText size={20} className="text-primary" />
                                    <div className="flex flex-col min-w-0">
                                        <span className="text-[10px] font-black truncate">{msg.fileName || (language === 'ar' ? 'ملف مرفق' : 'attached file')}</span>
                                        <a href={msg.fileUrl} target="_blank" className="text-[9px] font-black text-primary hover:underline">{language === 'ar' ? 'تحميل الآن' : 'download now'}</a>
                                    </div>
                                </div>
                            )}

                            {msg.messageType === 'image' && (
                                <div className="space-y-2">
                                    <div className="text-[10px] font-black text-text-muted mb-1">
                                        {language === 'ar' ? 'صورة مشاركة' : 'shared image'}
                                    </div>
                                    <a href={msg.fileUrl} target="_blank" className="block max-w-[200px]">
                                        <img 
                                            src={msg.fileUrl} 
                                            alt={msg.fileName || 'Shared image'}
                                            className="rounded-xs max-w-full max-h-[150px] object-contain border border-gray-200"
                                            onError={(e) => {
                                                e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iI2YwZjBmMCIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTIiIGZpbGw9IiM5OTkiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj7Yr9mF2YrZhdmKPC90ZXh0Pjwvc3ZnPg==';
                                            }}
                                        />
                                    </a>
                                </div>
                            )}

                            {msg.messageType === 'video' && (
                                <div className="space-y-2">
                                    <div className="text-[10px] font-black text-text-muted mb-1">
                                        {language === 'ar' ? 'فيديو مشارك' : 'shared video'}
                                    </div>
                                    <video 
                                        controls
                                        className="rounded-xs max-w-full max-h-[200px] border border-gray-200"
                                        onError={(e) => {
                                            console.error('Video loading error:', e);
                                        }}
                                    >
                                        <source src={msg.fileUrl} type="video/mp4" />
                                        {language === 'ar' ? 'متصفحك لا يدعم تشغيل الفيديو' : 'Your browser does not support video playback'}
                                    </video>
                                </div>
                            )}

                            {msg.messageType === 'audio' && (
                                <div className="space-y-2 max-w-[250px]">
                                    <div className="text-[10px] font-black text-text-muted mb-1">
                                        {language === 'ar' ? 'رسالة صوتية' : 'voice message'}
                                    </div>
                                    <div className="flex items-center gap-2 bg-card p-2 rounded-xs border border-gray-200">
                                        <audio 
                                            controls 
                                            className="flex-1 h-8"
                                            onError={(e) => {
                                                console.error('Audio loading error:', e);
                                            }}
                                        >
                                            <source src={msg.fileUrl} type="audio/webm" />
                                            {language === 'ar' ? 'متصفحك لا يدعم تشغيل الصوت' : 'Your browser does not support audio playback'}
                                        </audio>
                                        {msg.duration && (
                                            <span className="text-[9px] font-black text-text-muted whitespace-nowrap">
                                                {msg.duration}s
                                            </span>
                                        )}
                                    </div>
                                </div>
                            )}

                            <span className={`text-[8px] font-black mt-1.5 block uppercase tracking-tighter ${msg.senderId === user?.id ? 'text-white/60' : 'text-text-muted'}`}>
                                {(() => {
                                    const date = new Date(msg.createdAt);
                                    return isNaN(date.getTime()) ? '...' : date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                                })()}
                            </span>
                        </div>
                    </div>
                ))}
                <div ref={scrollRef} />
            </div>

            {/* Input Tools - Compressed */}
            <div className="p-2 bg-card border-t border-border-color flex gap-2 overflow-x-auto no-scrollbar">
                <button onClick={shareLocation} className="flex items-center gap-1.5 px-3 py-1.5 bg-card border border-border-color rounded-sm text-[9px] font-black text-gray-500 hover:text-primary hover:border-primary transition-all whitespace-nowrap shadow-sm active:scale-95">
                    <MapPin size={12} /> {language === 'ar' ? 'مشاركة الموقع' : 'share location'}
                </button>
                <label className="flex items-center gap-1.5 px-3 py-1.5 bg-card border border-border-color rounded-sm text-[9px] font-black text-gray-500 hover:text-primary hover:border-primary transition-all cursor-pointer whitespace-nowrap shadow-sm active:scale-95">
                    <ImageIcon size={12} /> {language === 'ar' ? 'إرسال صورة' : 'send image'}
                    <input type="file" accept="image/*" className="hidden" onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                            const uploadData = await handleFileUpload(file, 'image');
                            if (uploadData) {
                                handleSend('image', `Shared image: ${file.name}`, uploadData);
                            }
                        }
                    }} />
                </label>
                <label className="flex items-center gap-1.5 px-3 py-1.5 bg-card border border-border-color rounded-sm text-[9px] font-black text-gray-500 hover:text-primary hover:border-primary transition-all cursor-pointer whitespace-nowrap shadow-sm active:scale-95">
                    <FileText size={12} /> {language === 'ar' ? 'إرسال فيديو' : 'send video'}
                    <input type="file" accept="video/*" className="hidden" onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                            const uploadData = await handleFileUpload(file, 'file');
                            if (uploadData) {
                                handleSend('video', `Shared video: ${file.name}`, uploadData);
                            }
                        }
                    }} />
                </label>
                <label className="flex items-center gap-1.5 px-3 py-1.5 bg-card border border-border-color rounded-sm text-[9px] font-black text-gray-500 hover:text-primary hover:border-primary transition-all cursor-pointer whitespace-nowrap shadow-sm active:scale-95">
                    <Paperclip size={12} /> {language === 'ar' ? 'إرفاق مستند' : 'attach document'}
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
                <button 
                    className={`flex items-center gap-1.5 px-3 py-1.5 bg-card border border-border-color rounded-sm text-[9px] font-black transition-all whitespace-nowrap shadow-sm active:scale-95 ${isRecording ? 'bg-red-500 text-white border-red-500 hover:bg-red-600' : 'text-gray-500 hover:text-primary hover:border-primary'}`}
                    onClick={isRecording ? stopRecording : startRecording}
                >
                    <Mic size={12} /> 
                    {isRecording ? 
                        `${language === 'ar' ? 'إيقاف' : 'stop'} (${recordingTime}s)` : 
                        (language === 'ar' ? 'تسجيل صوتي' : 'voice record')
                    }
                </button>
                <button 
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-green-500 hover:bg-green-600 text-white rounded-sm text-[9px] font-black transition-all whitespace-nowrap shadow-sm active:scale-95"
                    onClick={() => setShowVoiceCall(true)}
                >
                    <Phone size={12} className="rotate-90" /> 
                    {language === 'ar' ? 'مكالمة صوتية' : 'voice call'}
                </button>
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
        
        {/* Voice Call Modal */}
        {showVoiceCall && user?.id && (
            <VoiceCall 
                callerId={user.id}
                calleeId={otherMember.id}
                conversationId={conversationId}
                onEndCall={() => setShowVoiceCall(false)}
                isIncoming={false}
            />
        )}
        
        {/* Incoming Call Notification */}
        {incomingCall && (
            <IncomingCallNotification
                callData={incomingCall}
                onAccept={() => {
                    setIncomingCall(null);
                    setShowVoiceCall(true);
                }}
                onReject={() => {
                    setIncomingCall(null);
                    // إبلاغ الخادم برفض المكالمة
                    socket?.emit('reject_call', {
                        callId: incomingCall.callId,
                        callerId: incomingCall.callerId
                    });
                }}
            />
        )}
    );
}
