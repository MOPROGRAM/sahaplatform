"use client";

import { useState, useEffect, useRef } from "react";
import { Phone, PhoneOff, Mic, MicOff, Volume2, User, X } from "lucide-react";
import { useLanguage } from "@/lib/language-context";
import { io, Socket } from "socket.io-client";

interface VoiceCallProps {
    callerId: string;
    calleeId: string;
    conversationId: string;
    onEndCall: () => void;
    isIncoming?: boolean;
    callData?: any;
}

export default function VoiceCall({ 
    callerId, 
    calleeId, 
    conversationId,
    onEndCall, 
    isIncoming = false,
    callData
}: VoiceCallProps) {
    const { language } = useLanguage();
    const [isConnected, setIsConnected] = useState(false);
    const [isMuted, setIsMuted] = useState(false);
    const [callDuration, setCallDuration] = useState(0);
    const [connectionStatus, setConnectionStatus] = useState(isIncoming ? 'ringing' : 'connecting');
    const [socket, setSocket] = useState<Socket | null>(null);
    const [callId, setCallId] = useState<string>('');
    
    const localAudioRef = useRef<HTMLAudioElement>(null);
    const remoteAudioRef = useRef<HTMLAudioElement>(null);
    const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
    const localStreamRef = useRef<MediaStream | null>(null);
    const callTimerRef = useRef<NodeJS.Timeout | null>(null);

    // إعداد Socket.IO
    useEffect(() => {
        const socketInstance = io(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000');
        
        socketInstance.on('connect', () => {
            console.log('Connected to signaling server');
            // تسجيل المستخدم
            socketInstance.emit('register_user', { userId: callerId });
        });

        // استقبال عرض SDP
        socketInstance.on('receive_offer', async (data) => {
            console.log('Received offer:', data);
            if (peerConnectionRef.current) {
                await peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(data.offer));
                
                // إنشاء وإرسال الإجابة
                const answer = await peerConnectionRef.current.createAnswer();
                await peerConnectionRef.current.setLocalDescription(answer);
                
                socketInstance.emit('send_answer', {
                    callId: data.callId,
                    answer: peerConnectionRef.current.localDescription,
                    targetUserId: data.from
                });
            }
        });

        // استقبال إجابة SDP
        socketInstance.on('receive_answer', async (data) => {
            console.log('Received answer:', data);
            if (peerConnectionRef.current) {
                await peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(data.answer));
                setIsConnected(true);
                setConnectionStatus('connected');
                startCallTimer();
            }
        });

        // استقبال مرشحات ICE
        socketInstance.on('receive_ice_candidate', async (data) => {
            console.log('Received ICE candidate:', data);
            if (peerConnectionRef.current) {
                await peerConnectionRef.current.addIceCandidate(new RTCIceCandidate(data.candidate));
            }
        });

        // قبول المكالمة
        socketInstance.on('call_accepted', (data) => {
            console.log('Call accepted:', data);
            setConnectionStatus('connected');
            setIsConnected(true);
            startCallTimer();
        });

        // رفض المكالمة
        socketInstance.on('call_rejected', (data) => {
            console.log('Call rejected:', data);
            setConnectionStatus('rejected');
            setTimeout(() => {
                endCall();
            }, 2000);
        });

        // إنهاء المكالمة
        socketInstance.on('call_ended', (data) => {
            console.log('Call ended by other party:', data);
            setConnectionStatus('ended');
            endCall();
        });

        setSocket(socketInstance);

        return () => {
            socketInstance.disconnect();
        };
    }, [callerId]);

    // إعداد WebRTC
    useEffect(() => {
        const initWebRTC = async () => {
            try {
                // إنشاء اتصال WebRTC
                const configuration = {
                    iceServers: [
                        { urls: 'stun:stun.l.google.com:19302' },
                        { urls: 'stun:stun1.l.google.com:19302' }
                    ]
                };

                peerConnectionRef.current = new RTCPeerConnection(configuration);

                // الحصول على صوت المستخدم
                const stream = await navigator.mediaDevices.getUserMedia({ 
                    audio: true,
                    video: false 
                });
                
                localStreamRef.current = stream;
                
                // إضافة المسار الصوتي المحلي
                stream.getAudioTracks().forEach(track => {
                    peerConnectionRef.current?.addTrack(track, stream);
                });

                // إعداد مستمع للأصوات البعيدة
                peerConnectionRef.current.ontrack = (event) => {
                    if (remoteAudioRef.current) {
                        remoteAudioRef.current.srcObject = event.streams[0];
                    }
                };

                // معالجة مرشحات ICE
                peerConnectionRef.current.onicecandidate = (event) => {
                    if (event.candidate && socket) {
                        socket.emit('send_ice_candidate', {
                            candidate: event.candidate,
                            targetUserId: isIncoming ? callerId : calleeId
                        });
                    }
                };

                // معالجة حالة الاتصال
                peerConnectionRef.current.oniceconnectionstatechange = () => {
                    const state = peerConnectionRef.current?.iceConnectionState;
                    console.log('ICE Connection State:', state);
                    
                    if (state === 'connected' || state === 'completed') {
                        if (!isConnected) {
                            setIsConnected(true);
                            setConnectionStatus('connected');
                            startCallTimer();
                        }
                    } else if (state === 'disconnected' || state === 'failed') {
                        setConnectionStatus('disconnected');
                        endCall();
                    }
                };

                // إنشاء عرض الاتصال للمكالمات الصادرة
                if (!isIncoming) {
                    // بدء المكالمة عبر API
                    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/calls/start-call`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            callerId,
                            calleeId,
                            conversationId
                        })
                    });
                    
                    const result = await response.json();
                    if (result.success) {
                        setCallId(result.callId);
                        
                        const offer = await peerConnectionRef.current.createOffer();
                        await peerConnectionRef.current.setLocalDescription(offer);
                        
                        // إرسال العرض عبر Socket.IO
                        socket?.emit('send_offer', {
                            callId: result.callId,
                            offer: peerConnectionRef.current.localDescription,
                            targetUserId: calleeId
                        });
                        
                        // إرسال إشعار المكالمة الواردة
                        socket?.emit('incoming_call', {
                            calleeId,
                            callData: {
                                callId: result.callId,
                                callerId,
                                conversationId,
                                timestamp: new Date()
                            }
                        });
                    }
                } else {
                    // للمكالمات الواردة، استخدم callId من props
                    if (callData?.callId) {
                        setCallId(callData.callId);
                    }
                }

                setConnectionStatus('ready');

            } catch (error) {
                console.error('Error initializing WebRTC:', error);
                setConnectionStatus('error');
            }
        };

        if (socket) {
            initWebRTC();
        }

        return () => {
            cleanupCall();
        };
    }, [socket, isIncoming, callData]);

    const startCallTimer = () => {
        callTimerRef.current = setInterval(() => {
            setCallDuration(prev => prev + 1);
        }, 1000);
    };

    const formatCallDuration = (seconds: number): string => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const toggleMute = () => {
        if (localStreamRef.current) {
            const audioTracks = localStreamRef.current.getAudioTracks();
            audioTracks.forEach(track => {
                track.enabled = isMuted;
            });
            setIsMuted(!isMuted);
        }
    };

    const endCall = async () => {
        // إبلاغ الخادم بإنهاء المكالمة
        if (callId) {
            try {
                await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/calls/end-call/${callId}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ userId: callerId })
                });
                
                socket?.emit('end_call', {
                    callId,
                    otherPartyId: isIncoming ? callerId : calleeId
                });
            } catch (error) {
                console.error('Error ending call:', error);
            }
        }
        
        cleanupCall();
        onEndCall();
    };

    const cleanupCall = () => {
        // إيقاف المؤقت
        if (callTimerRef.current) {
            clearInterval(callTimerRef.current);
            callTimerRef.current = null;
        }

        // إيقاف المسارات الصوتية
        if (localStreamRef.current) {
            localStreamRef.current.getTracks().forEach(track => track.stop());
        }

        // إغلاق اتصال WebRTC
        if (peerConnectionRef.current) {
            peerConnectionRef.current.close();
        }

        // إيقاف الصوت
        if (localAudioRef.current) {
            localAudioRef.current.srcObject = null;
        }
        if (remoteAudioRef.current) {
            remoteAudioRef.current.srcObject = null;
        }
    };

    const getConnectionStatusText = () => {
        switch (connectionStatus) {
            case 'ringing':
                return language === 'ar' ? 'يرنّ...' : 'Ringing...';
            case 'connecting':
                return language === 'ar' ? 'جارٍ الاتصال...' : 'Connecting...';
            case 'connected':
                return language === 'ar' ? 'متصل' : 'Connected';
            case 'ready':
                return language === 'ar' ? 'جاهز' : 'Ready';
            case 'disconnected':
                return language === 'ar' ? 'انقطع الاتصال' : 'Disconnected';
            case 'rejected':
                return language === 'ar' ? 'تم رفض المكالمة' : 'Call rejected';
            case 'ended':
                return language === 'ar' ? 'انتهت المكالمة' : 'Call ended';
            case 'error':
                return language === 'ar' ? 'خطأ في الاتصال' : 'Connection error';
            default:
                return '';
        }
    };

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-6 w-full max-w-md mx-4 shadow-2xl">
                {/* رأس المكالمة */}
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-black text-text-main">
                        {isIncoming ? 
                            (language === 'ar' ? 'مكالمة واردة' : 'Incoming Call') :
                            (language === 'ar' ? 'مكالمة صوتية' : 'Voice Call')
                        }
                    </h2>
                    <button 
                        onClick={endCall}
                        className="p-2 hover:bg-red-50 rounded-full transition-colors"
                    >
                        <X size={20} className="text-text-muted" />
                    </button>
                </div>

                <div className="text-center mb-6">
                    <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 border-4 border-primary/20">
                        <User size={40} className="text-primary" />
                    </div>
                    <p className="text-text-muted text-sm">
                        {getConnectionStatusText()}
                    </p>
                    {isConnected && (
                        <p className="text-primary font-black text-lg mt-2">
                            {formatCallDuration(callDuration)}
                        </p>
                    )}
                </div>

                {/* مؤشرات الصوت */}
                {isConnected && (
                    <div className="flex justify-center items-center gap-4 mb-6">
                        <div className="flex items-center gap-2">
                            <Volume2 size={16} className="text-green-500" />
                            <span className="text-[10px] font-black text-green-600 uppercase">
                                {language === 'ar' ? 'سماع' : 'speaker'}
                            </span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Mic size={16} className={`${isMuted ? 'text-red-500' : 'text-green-500'}`} />
                            <span className={`text-[10px] font-black uppercase ${isMuted ? 'text-red-600' : 'text-green-600'}`}>
                                {isMuted ? (language === 'ar' ? 'مكتوم' : 'muted') : (language === 'ar' ? 'مفعل' : 'active')}
                            </span>
                        </div>
                    </div>
                )}

                {/* أزرار التحكم */}
                <div className="flex justify-center gap-4">
                    <button
                        onClick={toggleMute}
                        disabled={!isConnected}
                        className={`w-14 h-14 rounded-full flex items-center justify-center transition-all ${
                            isMuted 
                                ? 'bg-red-500 hover:bg-red-600 text-white' 
                                : 'bg-gray-200 hover:bg-gray-300 text-text-main'
                        } ${!isConnected ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                        {isMuted ? <MicOff size={24} /> : <Mic size={24} />}
                    </button>
                    
                    <button
                        onClick={endCall}
                        className="w-14 h-14 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center transition-all active:scale-95 shadow-lg"
                    >
                        <PhoneOff size={24} />
                    </button>
                </div>

                {/* عناصر الصوت المخفية */}
                <audio ref={localAudioRef} autoPlay muted playsInline />
                <audio ref={remoteAudioRef} autoPlay playsInline />

                {/* رسالة الحالة */}
                {!isConnected && connectionStatus !== 'error' && connectionStatus !== 'rejected' && (
                    <div className="mt-4 p-3 bg-blue-50 rounded-lg text-center">
                        <p className="text-[11px] font-black text-blue-700">
                            {language === 'ar' 
                                ? 'جارٍ إعداد الاتصال الصوتي...' 
                                : 'Setting up audio connection...'
                            }
                        </p>
                    </div>
                )}

                {connectionStatus === 'error' && (
                    <div className="mt-4 p-3 bg-red-50 rounded-lg text-center">
                        <p className="text-[11px] font-black text-red-700">
                            {language === 'ar' 
                                ? 'فشل في إنشاء الاتصال. يرجى المحاولة مرة أخرى.' 
                                : 'Failed to establish connection. Please try again.'
                            }
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}