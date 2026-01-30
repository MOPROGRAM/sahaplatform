"use client";

import { useState, useEffect, useRef } from "react";
import { Phone, PhoneOff, Mic, MicOff, Volume2, User } from "lucide-react";
import { useLanguage } from "@/lib/language-context";

interface VoiceCallProps {
    callerId: string;
    calleeId: string;
    onEndCall: () => void;
    isIncoming?: boolean;
}

export default function VoiceCall({ 
    callerId, 
    calleeId, 
    onEndCall, 
    isIncoming = false 
}: VoiceCallProps) {
    const { language } = useLanguage();
    const [isConnected, setIsConnected] = useState(false);
    const [isMuted, setIsMuted] = useState(false);
    const [callDuration, setCallDuration] = useState(0);
    const [connectionStatus, setConnectionStatus] = useState('connecting');
    
    const localAudioRef = useRef<HTMLAudioElement>(null);
    const remoteAudioRef = useRef<HTMLAudioElement>(null);
    const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
    const localStreamRef = useRef<MediaStream | null>(null);
    const callTimerRef = useRef<NodeJS.Timeout | null>(null);

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

                // معالجة حالة الاتصال
                peerConnectionRef.current.oniceconnectionstatechange = () => {
                    const state = peerConnectionRef.current?.iceConnectionState;
                    console.log('ICE Connection State:', state);
                    
                    if (state === 'connected' || state === 'completed') {
                        setIsConnected(true);
                        setConnectionStatus('connected');
                        
                        // بدء مؤقت المكالمة
                        startCallTimer();
                    } else if (state === 'disconnected' || state === 'failed') {
                        setConnectionStatus('disconnected');
                        endCall();
                    }
                };

                // إنشاء عرض الاتصال للمكالمات الصادرة
                if (!isIncoming) {
                    const offer = await peerConnectionRef.current.createOffer();
                    await peerConnectionRef.current.setLocalDescription(offer);
                    // هنا سنرسل العرض إلى الخادم
                    console.log('Created offer:', offer);
                }

                setConnectionStatus('ready');

            } catch (error) {
                console.error('Error initializing WebRTC:', error);
                setConnectionStatus('error');
            }
        };

        initWebRTC();

        return () => {
            cleanupCall();
        };
    }, [isIncoming]);

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

    const endCall = () => {
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
            case 'connecting':
                return language === 'ar' ? 'جارٍ الاتصال...' : 'Connecting...';
            case 'connected':
                return language === 'ar' ? 'متصل' : 'Connected';
            case 'ready':
                return language === 'ar' ? 'جاهز' : 'Ready';
            case 'disconnected':
                return language === 'ar' ? 'انقطع الاتصال' : 'Disconnected';
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
                <div className="text-center mb-6">
                    <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 border-4 border-primary/20">
                        <User size={40} className="text-primary" />
                    </div>
                    <h2 className="text-xl font-black text-text-main mb-2">
                        {isIncoming ? 
                            (language === 'ar' ? 'مكالمة واردة' : 'Incoming Call') :
                            (language === 'ar' ? 'مكالمة صوتية' : 'Voice Call')
                        }
                    </h2>
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
                        className={`w-14 h-14 rounded-full flex items-center justify-center transition-all ${
                            isMuted 
                                ? 'bg-red-500 hover:bg-red-600 text-white' 
                                : 'bg-gray-200 hover:bg-gray-300 text-text-main'
                        }`}
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
                {!isConnected && connectionStatus !== 'error' && (
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