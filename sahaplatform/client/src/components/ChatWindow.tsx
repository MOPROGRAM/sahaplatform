"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { Send, ShieldCheck, MapPin, Paperclip, FileText, ImageIcon, Loader2, X, Download, Check, CheckCheck, Star, Mic, Video, Music, MoreVertical, Trash, Play, Pause, Phone, PhoneOff, Maximize2, Plus, Minus, AlertTriangle } from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";
import { conversationsService } from "@/lib/conversations";
import { supabase } from "@/lib/supabase";
// import { io } from "socket.io-client";
import { useLanguage } from "@/lib/language-context";
import VideoCall from "./VideoCall";

// Error Boundary Component
class ChatErrorBoundary extends React.Component<{children: React.ReactNode, language: string}, {hasError: boolean}> {
  constructor(props: {children: React.ReactNode, language: string}) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: any) {
    return { hasError: true };
  }

  componentDidCatch(error: any, errorInfo: any) {
    console.error("Chat Window Error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col h-[600px] items-center justify-center bg-red-50 border border-red-100 rounded-sm p-6 text-center" dir={this.props.language === 'ar' ? 'rtl' : 'ltr'}>
            <AlertTriangle className="text-red-500 mb-4" size={48} />
            <h3 className="text-lg font-bold text-red-700 mb-2">
                {this.props.language === 'ar' ? 'حدث خطأ غير متوقع' : 'Something went wrong'}
            </h3>
            <p className="text-xs text-red-600 mb-6 max-w-xs mx-auto">
                {this.props.language === 'ar' 
                    ? 'نواجه مشكلة في تحميل المحادثة. حاول تحديث الصفحة.' 
                    : 'We encountered an issue loading the chat. Please try refreshing.'}
            </p>
            <button 
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-red-600 text-white rounded-full text-xs font-bold hover:bg-red-700 transition-colors"
            >
                {this.props.language === 'ar' ? 'تحديث الصفحة' : 'Refresh Page'}
            </button>
        </div>
      );
    }
    return this.props.children;
  }
}

interface Message {
    id: string;
    sender_id: string;
    content: string;
    message_type: 'text' | 'image' | 'file' | 'voice' | 'audio' | 'location' | 'video' | 'call';
    file_url?: string;
    file_name?: string;
    file_size?: number;
    duration?: number;
    is_read?: boolean;
    read_at?: string;
    is_edited?: boolean;
    deleted_at?: string;
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

function ChatWindowContent({ conversationId, onClose }: ChatWindowProps) {
    const { user } = useAuthStore();
    const { language } = useLanguage();
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
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
    
    // Video Call State
    const [isInCall, setIsInCall] = useState(false);
    const [currentCallId, setCurrentCallId] = useState<string | null>(null);
    const [isCaller, setIsCaller] = useState(false);
    const [incomingCall, setIncomingCall] = useState<{ id: string, caller_id: string, call_type: 'video' | 'audio' } | null>(null);
    const [callType, setCallType] = useState<'video' | 'audio'>('video');
    const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
    const [selectedMedia, setSelectedMedia] = useState<{ url: string, type: 'image' | 'video' } | null>(null);
    const [zoom, setZoom] = useState(1);
    const isSendingRef = useRef(false);
    const messageIdsRef = useRef<Set<string>>(new Set());
    const pendingSigRef = useRef<Map<string, string>>(new Map());

    // const socketRef = useRef<any>(null);

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        let channel: any;
        let callChannel: any;
        if (conversationId) {
            // Validate session before starting
            (async () => {
                try {
                     // Force refresh session first as requested
                     const { data: { session }, error } = await supabase.auth.refreshSession();
                     if (error || !session) {
                         console.error('Session expired or invalid:', error);
                         return;
                     }
                     
                     fetchChatData();
                     setupSubscription();
                     setupCallSubscription();
                } catch (e) {
                    console.error("Auth check failed", e);
                }
            })();

            const setupCallSubscription = () => {
                 // Listen for incoming calls
                 callChannel = supabase.channel(`calls:${conversationId}`)
                    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'calls', filter: `receiver_id=eq.${user?.id}` }, (payload) => {
                         if (payload.new.status === 'pending') {
                             setIncomingCall({ 
                                id: payload.new.id, 
                                caller_id: payload.new.caller_id,
                                call_type: payload.new.call_type || 'video' 
                             });
                         }
                    })
                    .subscribe();
            };

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
                            read_at: newMessage.read_at,
                            is_edited: newMessage.is_edited,
                            deleted_at: newMessage.deleted_at,
                            created_at: newMessage.createdAt || newMessage.created_at || new Date().toISOString(),
                            sender: { name: '...' } // Temporary placeholder
                        };
    
                        // Compute signature to match optimistic message
                        const sig = [
                            processedMessage.sender_id || '',
                            processedMessage.message_type || '',
                            processedMessage.content || '',
                            (newMessage.file_url || '')
                        ].join('|').slice(0, 512);

                        // Optimistically add message
                        setMessages(prev => {
                            const existsById = prev.some(m => m.id === processedMessage.id);
                            if (existsById) {
                                messageIdsRef.current.add(processedMessage.id);
                                return prev.map(m => m.id === processedMessage.id ? { ...m, ...processedMessage } : m);
                            }

                            // Try to find an optimistic message by signature
                        const optimisticId = pendingSigRef.current.get(sig);
                        if (optimisticId) {
                            messageIdsRef.current.add(processedMessage.id);
                            // Do not delete from ref inside updater to avoid Strict Mode side effects
                            return prev.map(m => m.id === optimisticId ? { ...processedMessage } : m);
                        }

                            // Fallback: append if unique
                            const next = [...prev, processedMessage];
                            messageIdsRef.current.add(processedMessage.id);
                            return next;
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
            if (callChannel) {
                supabase.removeChannel(callChannel);
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
                const mimeType = mediaRecorder.mimeType || 'audio/webm';
                const ext = mimeType.split('/')[1]?.split(';')[0] || 'webm';
                const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });
                const audioFile = new File([audioBlob], `voice-note-${Date.now()}.${ext}`, { type: mimeType });
                
                // Upload and send
                const uploadData = await handleFileUpload(audioFile, 'audio');
                if (uploadData) {
                    handleSend('audio', 'Voice Note', { ...uploadData, duration: recordingTime });
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
            alert(language === 'ar' ? 'فشل الوصول للميكروفون' : 'Could not access microphone');
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
                messageIdsRef.current = new Set(processedMessages.map((m: any) => m.id));
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

    const handleDeleteMessage = async (messageId: string) => {
        if (!confirm(language === 'ar' ? 'هل أنت متأكد من حذف هذه الرسالة؟' : 'Are you sure you want to delete this message?')) return;
        
        const message = messages.find(m => m.id === messageId);
        if (!message) return;

        try {
            await conversationsService.deleteMessage(messageId, message.created_at);
            setMessages(prev => prev.map(m => m.id === messageId ? { ...m, deleted_at: new Date().toISOString(), content: 'This message was deleted' } : m));
        } catch (error: any) {
            console.error("Failed to delete message:", error);
            alert((error && error.message) ? error.message : (language === 'ar' ? 'فشل حذف الرسالة' : 'Failed to delete message'));
        }
    };

    const handleSend = async (type: 'text' | 'image' | 'file' | 'voice' | 'location' | 'video' | 'audio' | 'call' = 'text', content?: string, fileData?: any) => {
        if (sending) return; // Prevent duplicate sends

        const messageContent = content || input;
        if (!messageContent.trim() && type === 'text') return;

        setSending(true);
        try {
            if (editingMessageId && type === 'text') {
                 const message = messages.find(m => m.id === editingMessageId);
                 if (message) {
                    await conversationsService.editMessage(editingMessageId, messageContent, message.created_at);
                    setMessages(prev => prev.map(m => m.id === editingMessageId ? { ...m, content: messageContent, is_edited: true } : m));
                 }
                 setEditingMessageId(null);
                 setInput("");
            } else {
                const payload = {
                    content: messageContent,
                    messageType: type,
                    ...fileData
                };
                
                const targetUser = participants.find(p => p.id !== user?.id);
                // Build an optimistic message with a temporary id
                const tempId = `temp-${Date.now()}-${Math.random().toString(36).slice(2)}`;
                const senderId = user?.id || '';
                const optimisticMessage: Message = {
                    id: tempId,
                    sender_id: senderId,
                    content: payload.content,
                    message_type: payload.messageType as any,
                    created_at: new Date().toISOString(),
                    sender: { name: user?.name || 'You' },
                    ...fileData
                };

                // Signature used to reconcile realtime insert and server response
                const sig = [
                    senderId,
                    payload.messageType || '',
                    payload.content || '',
                    (fileData?.file_url || '')
                ].join('|').slice(0, 512);
                pendingSigRef.current.set(sig, tempId);

                // Add optimistic message
                setMessages(prev => [...prev, optimisticMessage]);

                // Send to server
                const sentMessage = await conversationsService.sendMessage(
                    conversationId,
                    payload.content,
                    payload.messageType,
                    fileData,
                    targetUser?.id
                );

                // Normalize server fields
                const serverMessage: Message = {
                    id: sentMessage.id,
                    sender_id: sentMessage.sender_id || senderId,
                    content: sentMessage.content,
                    message_type: (sentMessage.message_type || payload.messageType) as any,
                    created_at: sentMessage.created_at || optimisticMessage.created_at,
                    sender: { name: user?.name || 'You' },
                    ...fileData
                };

                // Reconcile optimistic with server response (avoid duplicate)
                setMessages(prev => {
                    const optimisticId = pendingSigRef.current.get(sig);
                    if (optimisticId) {
                        pendingSigRef.current.delete(sig);
                        messageIdsRef.current.add(serverMessage.id);
                        return prev.map(m => m.id === optimisticId ? { ...serverMessage } : m);
                    }
                    // If not found, ensure we don't duplicate by id
                    const existsById = prev.some(m => m.id === serverMessage.id);
                    if (existsById) {
                        return prev.map(m => m.id === serverMessage.id ? { ...m, ...serverMessage } : m);
                    }
                    return [...prev, serverMessage];
                });
    
                if (type === 'text') setInput("");
            }
        } catch (error: any) {
            console.error("Failed to send message:", error);
            alert((error && error.message) ? error.message : (language === 'ar' ? 'فشل في إرسال الرسالة' : 'Failed to send message'));
        } finally {
            isSendingRef.current = false;
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

    const handleVideoCall = async () => {
        startCall('video');
    };

    const handleVoiceCall = async () => {
        startCall('audio');
    };

    const startCall = async (type: 'video' | 'audio') => {
        try {
            // Create a new call record
            const { data: callData, error } = await supabase
                .from('calls')
                .insert({
                    conversation_id: conversationId,
                    caller_id: user?.id,
                    receiver_id: otherMember.id,
                    status: 'pending',
                    call_type: type
                })
                .select()
                .single();

            if (error) throw error;

            setCurrentCallId(callData.id);
            setCallType(type);
            setIsCaller(true);
            setIsInCall(true);

            // Send call message notification
            const messageText = type === 'video' 
                ? (language === 'ar' ? '📞 مكالمة فيديو' : '📞 Video Call')
                : (language === 'ar' ? '📞 مكالمة صوتية' : '📞 Voice Call');
            handleSend('call', messageText);
        } catch (error) {
            console.error('Failed to start call:', error);
            alert(language === 'ar' ? 'فشل بدء المكالمة' : 'Failed to start call');
        }
    };

    const acceptCall = () => {
        if (incomingCall) {
            setCurrentCallId(incomingCall.id);
            setCallType(incomingCall.call_type);
            setIsCaller(false);
            setIsInCall(true);
            setIncomingCall(null);
        }
    };

    const rejectCall = async () => {
        if (incomingCall) {
             await supabase.from('calls').update({ status: 'rejected' }).eq('id', incomingCall.id);
             setIncomingCall(null);
        }
    };

    const handleFileUpload = async (file: File, type: 'file' | 'image' | 'voice' | 'video' | 'audio') => {
        try {
            // Start progress simulation
            setUploadProgress(10);
            const interval = setInterval(() => {
                setUploadProgress(prev => {
                    if (prev >= 90) {
                        clearInterval(interval);
                        return 90;
                    }
                    return prev + 10;
                });
            }, 300);

            // Upload via service (which uses Supabase storage)
            const uploadResult = await conversationsService.uploadFile(file, conversationId);
            
            // Complete progress
            clearInterval(interval);
            setUploadProgress(100);
            
            // Reset after delay
            setTimeout(() => setUploadProgress(0), 1000);
            
            return uploadResult;
        } catch (error) {
            console.error('Error uploading file:', error);
            setUploadProgress(0);
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
            
            {/* Video Call Overlay */}
            {isInCall && currentCallId && (
                <VideoCall 
                    callId={currentCallId} 
                    isCaller={isCaller} 
                    conversationId={conversationId} 
                    otherMemberId={otherMember.id}
                    callType={callType}
                    onEnd={() => {
                        setIsInCall(false);
                        setCurrentCallId(null);
                    }}
                />
            )}

            {/* Incoming Call Notification */}
            {incomingCall && !isInCall && (
                <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 bg-black/80 text-white px-6 py-4 rounded-full flex items-center gap-6 shadow-2xl animate-in slide-in-from-top-4 border border-white/10">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-green-500 rounded-full animate-pulse">
                            {incomingCall.call_type === 'video' ? <Video size={20} className="text-white" /> : <Phone size={20} className="text-white" />}
                        </div>
                        <div className="flex flex-col">
                            <span className="text-sm font-bold">{otherMember.name}</span>
                            <span className="text-[10px] opacity-70 uppercase tracking-widest">
                                {language === 'ar' 
                                    ? (incomingCall.call_type === 'video' ? 'يتصل بك فيديو...' : 'يتصل بك صوتي...') 
                                    : (incomingCall.call_type === 'video' ? 'Incoming Video Call...' : 'Incoming Voice Call...')}
                            </span>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                         <button 
                            onClick={rejectCall}
                            className="p-3 bg-red-500 rounded-full hover:bg-red-600 transition-colors"
                        >
                            <PhoneOff size={20} />
                        </button>
                        <button 
                            onClick={acceptCall}
                            className="p-3 bg-green-500 rounded-full hover:bg-green-600 transition-colors"
                        >
                            <Phone size={20} />
                        </button>
                    </div>
                </div>
            )}

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
                        onClick={handleVoiceCall} 
                        className="p-1.5 hover:bg-blue-50 text-text-muted hover:text-blue-500 transition-all rounded-xs"
                        title={language === 'ar' ? 'مكالمة صوتية' : 'Voice Call'}
                    >
                        <Phone size={16} />
                    </button>
                    <button 
                        onClick={handleVideoCall} 
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
                    const canManage = isMe && !msg.deleted_at && (new Date().getTime() - new Date(msg.created_at).getTime()) / 60000 <= 60;
                    const isImage = msg.message_type === 'image' || (msg.file_url && /\.(jpg|jpeg|png|gif|webp)(\?.*)?$/i.test(msg.file_url));
                    const isVideo = msg.message_type === 'video' || (msg.message_type !== 'audio' && msg.message_type !== 'voice' && msg.file_url && /\.(mp4|webm|ogg|mov)(\?.*)?$/i.test(msg.file_url));
                    const isVoice = msg.message_type === 'voice' || msg.message_type === 'audio' || (msg.file_url && /\.(mp3|wav|ogg|webm)(\?.*)?$/i.test(msg.file_url) && !isVideo);
                    
                    return (
                        <div key={msg.id || idx} className={`flex flex-col group ${isMe ? 'items-end' : 'items-start'}`}>
                            <div className={`relative max-w-[75%] px-3 py-2 shadow-sm transition-all hover:shadow-md ${isMe
                                ? 'bg-[#d9fdd3] dark:bg-[#005c4b] text-gray-900 dark:text-white rounded-2xl rounded-tr-none'
                                : 'bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 text-gray-800 dark:text-gray-100 rounded-2xl rounded-tl-none'}`}>

                                {msg.message_type === 'text' && (
                                    <p className={`text-[11px] font-bold leading-relaxed whitespace-pre-wrap ${msg.deleted_at ? 'italic opacity-60' : ''}`}>
                                        {msg.content}
                                        {msg.is_edited && !msg.deleted_at && <span className="text-[8px] opacity-50 mx-1">{language === 'ar' ? '(معدلة)' : '(edited)'}</span>}
                                    </p>
                                )}

                                {canManage && (
                                    <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <div className="relative group/menu">
                                            <MoreVertical size={12} className="text-gray-400 cursor-pointer" />
                                            <div className="absolute right-0 top-full bg-white shadow-md rounded-md p-1 hidden group-hover/menu:block z-10 min-w-[80px]">
                                                <button 
                                                    onClick={() => {
                                                        setEditingMessageId(msg.id);
                                                        setInput(msg.content);
                                                    }}
                                                    className="block w-full text-left px-2 py-1 text-[10px] hover:bg-gray-100 text-blue-600"
                                                >
                                                    {language === 'ar' ? 'تعديل' : 'Edit'}
                                                </button>
                                                <button 
                                                    onClick={() => handleDeleteMessage(msg.id)}
                                                    className="block w-full text-left px-2 py-1 text-[10px] hover:bg-gray-100 text-red-600"
                                                >
                                                    {language === 'ar' ? 'حذف' : 'Delete'}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {isImage && msg.file_url && (
                                    <div className="mb-1">
                                        <div className="relative group overflow-hidden rounded-lg border border-black/10">
                                            <img 
                                                src={msg.file_url} 
                                                alt="Attachment" 
                                                className="max-w-[250px] max-h-[250px] object-cover cursor-pointer hover:scale-105 transition-transform duration-300" 
                                                onClick={() => setSelectedMedia({ url: msg.file_url!, type: 'image' })}
                                                onError={(e) => {
                                                    (e.target as HTMLImageElement).src = '/placeholder-image.png';
                                                }}
                                            />
                                        </div>
                                    </div>
                                )}

                                {isVideo && msg.file_url && (
                                    <div className="mb-1 relative group">
                                        <video 
                                            src={msg.file_url} 
                                            controls 
                                            className="max-w-[250px] max-h-[250px] rounded-lg border border-black/10"
                                        />
                                        <button 
                                            onClick={() => setSelectedMedia({ url: msg.file_url!, type: 'video' })}
                                            className="absolute top-2 right-2 p-1.5 bg-black/50 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/70"
                                            title={language === 'ar' ? 'تكبير' : 'Expand'}
                                        >
                                            <Maximize2 size={14} /> 
                                        </button>
                                    </div>
                                )}



                                {msg.file_url && !isImage && !isVideo && !isVoice && (
                                    <div className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-100 dark:border-gray-600 mb-1">
                                        <div className="p-2 bg-white dark:bg-gray-600 rounded-md shadow-sm">
                                            <FileText size={20} className="text-primary" />
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-[10px] font-bold text-gray-700 dark:text-gray-200 truncate max-w-[150px]">
                                                {msg.file_name || 'Attachment'}
                                            </span>
                                            <span className="text-[9px] text-gray-400">
                                                {msg.file_size ? `${(msg.file_size / 1024).toFixed(1)} KB` : 'File'}
                                            </span>
                                        </div>
                                        <a 
                                            href={msg.file_url} 
                                            download={msg.file_name || "download"} 
                                            target="_blank" 
                                            rel="noopener noreferrer"
                                            className="ml-2 p-1.5 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-full text-gray-500 transition-colors"
                                        >
                                            <Download size={14} />
                                        </a>
                                    </div>
                                )}


                                {isVoice && msg.file_url && (
                                    <div className="flex items-center gap-3 min-w-[200px] py-1">
                                        <button 
                                            onClick={(e) => {
                                                const audio = (e.currentTarget.parentElement?.querySelector('audio') as HTMLAudioElement);
                                                if (audio.paused) {
                                                    audio.play();
                                                } else {
                                                    audio.pause();
                                                }
                                            }}
                                            className="w-10 h-10 bg-primary text-white rounded-full flex items-center justify-center shadow-md hover:bg-primary/90 transition-all active:scale-95 shrink-0"
                                        >
                                            <Play size={18} fill="currentColor" />
                                        </button>
                                        
                                        <div className="flex-1 flex flex-col gap-1">
                                            <div className="h-1.5 w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden relative">
                                                <div className="absolute inset-0 bg-primary/30 w-full" />
                                                <div className="absolute inset-y-0 left-0 bg-primary w-0 transition-all duration-100" />
                                            </div>
                                            
                                            <div className="flex justify-between items-center px-0.5">
                                                <span className="text-[9px] text-gray-500 font-mono">
                                                    {msg.duration ? formatTime(msg.duration) : '0:00'}
                                                </span>
                                                <a 
                                                    href={msg.file_url} 
                                                    download 
                                                    target="_blank" 
                                                    className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors text-gray-400 hover:text-primary"
                                                >
                                                    <Download size={12} />
                                                </a>
                                            </div>
                                        </div>

                                        <audio 
                                            src={msg.file_url}
                                            preload="metadata"
                                            className="hidden"
                                            onTimeUpdate={(e) => {
                                                const audio = e.currentTarget;
                                                const progress = (audio.currentTime / audio.duration) * 100;
                                                const bar = audio.parentElement?.querySelector('.bg-primary.w-0') as HTMLElement;
                                                if (bar) bar.style.width = `${progress}%`;
                                            }}
                                            onPlay={(e) => {
                                                const btn = e.currentTarget.parentElement?.querySelector('button');
                                                if (btn) btn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="6" y="4" width="4" height="16"></rect><rect x="14" y="4" width="4" height="16"></rect></svg>';
                                            }}
                                            onPause={(e) => {
                                                const btn = e.currentTarget.parentElement?.querySelector('button');
                                                if (btn) btn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>';
                                            }}
                                            onEnded={(e) => {
                                                const audio = e.currentTarget;
                                                const bar = audio.parentElement?.querySelector('.bg-primary.w-0') as HTMLElement;
                                                if (bar) bar.style.width = '0%';
                                            }}
                                        />
                                    </div>
                                )}

                                {msg.message_type === 'call' && (
                                    <div className={`flex items-center gap-3 p-3 rounded-lg border ${isMe ? 'bg-white/10 border-white/20' : 'bg-gray-50 border-gray-100'}`}>
                                        <div className={`p-2 rounded-full ${isMe ? 'bg-white/20 text-white' : 'bg-red-100 text-red-500'}`}>
                                            <Video size={20} />
                                        </div>
                                        <div className="flex flex-col">
                                            <span className={`text-xs font-bold ${isMe ? 'text-white' : 'text-gray-800'}`}>{msg.content}</span>
                                            <span className={`text-[9px] ${isMe ? 'text-white/70' : 'text-gray-400'}`}>
                                                {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </div>
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
                {/* Upload Progress Bar */}
                {uploadProgress > 0 && (
                    <div className="absolute top-0 left-0 right-0 h-1 bg-gray-100">
                        <div 
                            className="h-full bg-primary transition-all duration-300 ease-out"
                            style={{ width: `${uploadProgress}%` }}
                        />
                    </div>
                )}
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
                        else if (file.type.startsWith('audio/')) type = 'audio';

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
            {/* Lightbox Modal */}
            {selectedMedia && (
                <div className="absolute inset-0 z-50 bg-black/95 flex items-center justify-center p-4 animate-in fade-in duration-200">
                    {/* Controls */}
                    <div className="absolute top-4 right-4 flex items-center gap-2 z-50">
                        {selectedMedia.type === 'image' && (
                            <>
                                <button 
                                    onClick={() => setZoom(prev => Math.min(prev + 0.5, 3))}
                                    className="text-white/70 hover:text-white p-2 rounded-full hover:bg-white/10 transition-colors"
                                >
                                    <Plus size={24} />
                                </button>
                                <button 
                                    onClick={() => setZoom(prev => Math.max(prev - 0.5, 1))}
                                    className="text-white/70 hover:text-white p-2 rounded-full hover:bg-white/10 transition-colors"
                                >
                                    <Minus size={24} />
                                </button>
                            </>
                        )}
                        <button 
                            onClick={() => { setSelectedMedia(null); setZoom(1); }}
                            className="text-white/70 hover:text-white p-2 rounded-full hover:bg-white/10 transition-colors"
                        >
                            <X size={24} />
                        </button>
                    </div>

                    {selectedMedia.type === 'image' ? (
                        <div 
                            className="w-full h-full flex items-center justify-center overflow-hidden"
                            onWheel={(e) => {
                                // Optional: Handle wheel zoom if needed, but keeping it simple for now
                            }}
                        >
                            <img 
                                src={selectedMedia.url} 
                                alt="Full preview" 
                                className="max-w-full max-h-full object-contain rounded-sm shadow-2xl transition-transform duration-200 ease-out"
                                style={{ transform: `scale(${zoom})`, cursor: zoom > 1 ? 'grab' : 'zoom-in' }}
                                onClick={() => setZoom(prev => prev === 1 ? 2 : 1)}
                            />
                        </div>
                    ) : (
                        <video 
                            src={selectedMedia.url} 
                            controls 
                            autoPlay
                            className="max-w-full max-h-full rounded-sm shadow-2xl"
                        />
                    )}
                </div>
            )}
        </div>
    );
}

export default function ChatWindow(props: ChatWindowProps) {
    const { language } = useLanguage();
    return (
        <ChatErrorBoundary language={language}>
            <ChatWindowContent {...props} />
        </ChatErrorBoundary>
    );
}
