
import React, { useEffect, useRef, useState } from 'react';
import { Video, Mic, MicOff, VideoOff, PhoneOff, Phone, MonitorSmartphone } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useLanguage } from '@/lib/language-context';

interface VideoCallProps {
    callId: string;
    isCaller: boolean;
    conversationId: string;
    otherMemberId: string;
    callType?: 'video' | 'audio';
    onEnd: () => void;
}

const SERVERS = {
    iceServers: [
        {
            urls: ['stun:stun1.l.google.com:19302', 'stun:stun2.l.google.com:19302'],
        },
    ],
    iceCandidatePoolSize: 10,
};

export default function VideoCall({ callId, isCaller, conversationId, otherMemberId, callType = 'video', onEnd }: VideoCallProps) {
    const { language } = useLanguage();
    const [localStream, setLocalStream] = useState<MediaStream | null>(null);
    const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
    const [isMuted, setIsMuted] = useState(false);
    const [isVideoOff, setIsVideoOff] = useState(callType === 'audio');
    const [status, setStatus] = useState<'connecting' | 'connected' | 'ended'>('connecting');
    
    const localVideoRef = useRef<HTMLVideoElement>(null);
    const remoteVideoRef = useRef<HTMLVideoElement>(null);
    const peerConnection = useRef<RTCPeerConnection | null>(null);

    useEffect(() => {
        setupCall();
        return () => {
            cleanup();
        };
    }, []);

    const cleanup = () => {
        if (localStream) {
            localStream.getTracks().forEach(track => track.stop());
        }
        if (peerConnection.current) {
            peerConnection.current.close();
        }
    };

    const setupCall = async () => {
        try {
            const constraints = {
                video: callType === 'video',
                audio: true
            };
            
            const stream = await navigator.mediaDevices.getUserMedia(constraints);
            setLocalStream(stream);
            if (localVideoRef.current && callType === 'video') {
                localVideoRef.current.srcObject = stream;
            }

            peerConnection.current = new RTCPeerConnection(SERVERS);

            stream.getTracks().forEach((track) => {
                peerConnection.current?.addTrack(track, stream);
            });

            peerConnection.current.ontrack = (event) => {
                const [remoteStream] = event.streams;
                setRemoteStream(remoteStream);
                if (remoteVideoRef.current) {
                    remoteVideoRef.current.srcObject = remoteStream;
                }
            };

            peerConnection.current.onconnectionstatechange = () => {
                if (peerConnection.current?.connectionState === 'connected') {
                    setStatus('connected');
                }
            };

            // ICE Candidate Exchange via Realtime
            peerConnection.current.onicecandidate = async (event) => {
                if (event.candidate) {
                    await supabase.channel(`call:${callId}`).send({
                        type: 'broadcast',
                        event: 'ice-candidate',
                        payload: { candidate: event.candidate, from: isCaller ? 'caller' : 'callee' }
                    });
                }
            };

            // Subscribe to signaling
            const channel = supabase.channel(`call:${callId}`)
                .on('broadcast', { event: 'ice-candidate' }, async ({ payload }) => {
                    const fromRole = payload.from;
                    const myRole = isCaller ? 'caller' : 'callee';
                    if (fromRole !== myRole && peerConnection.current) {
                         try {
                            await peerConnection.current.addIceCandidate(new RTCIceCandidate(payload.candidate));
                        } catch (e) {
                            console.error('Error adding received ice candidate', e);
                        }
                    }
                })
                .subscribe();


            if (isCaller) {
                // Create Offer
                const offerDescription = await peerConnection.current.createOffer();
                await peerConnection.current.setLocalDescription(offerDescription);

                const offer = {
                    sdp: offerDescription.sdp,
                    type: offerDescription.type,
                };

                await supabase.from('calls').update({ offer }).eq('id', callId);

                // Listen for answer
                const sub = supabase.channel(`call_db:${callId}`)
                    .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'calls', filter: `id=eq.${callId}` }, async (payload) => {
                        const data = payload.new;
                        if (data.answer && !peerConnection.current?.currentRemoteDescription) {
                            const answerDescription = new RTCSessionDescription(data.answer);
                            await peerConnection.current?.setRemoteDescription(answerDescription);
                        }
                        if (data.status === 'ended' || data.status === 'rejected') {
                            endCall();
                        }
                    })
                    .subscribe();

            } else {
                // Fetch offer and create Answer
                const { data: callData } = await supabase.from('calls').select('*').eq('id', callId).single();
                
                if (callData?.offer) {
                    const offerDescription = new RTCSessionDescription(callData.offer);
                    await peerConnection.current.setRemoteDescription(offerDescription);

                    const answerDescription = await peerConnection.current.createAnswer();
                    await peerConnection.current.setLocalDescription(answerDescription);

                    const answer = {
                        type: answerDescription.type,
                        sdp: answerDescription.sdp,
                    };

                    await supabase.from('calls').update({ answer, status: 'active' }).eq('id', callId);
                }

                 // Listen for end
                 const sub = supabase.channel(`call_db:${callId}`)
                 .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'calls', filter: `id=eq.${callId}` }, async (payload) => {
                     const data = payload.new;
                     if (data.status === 'ended') {
                         endCall();
                     }
                 })
                 .subscribe();
            }

        } catch (error) {
            console.error('Error starting call:', error);
            alert('Could not start video call');
            onEnd();
        }
    };

    const endCall = async () => {
        cleanup();
        setStatus('ended');
        // Update DB if not already ended
        await supabase.from('calls').update({ status: 'ended', ended_at: new Date().toISOString() }).eq('id', callId);
        onEnd();
    };

    const toggleMute = () => {
        if (localStream) {
            localStream.getAudioTracks().forEach(track => track.enabled = !track.enabled);
            setIsMuted(!isMuted);
        }
    };

    const toggleVideo = () => {
        // Only allow toggling video if it was a video call to start with, or we upgrade logic (later)
        // For now, if audio-only, video toggle might enable camera but let's keep it simple.
        if (localStream && callType === 'video') {
            localStream.getVideoTracks().forEach(track => track.enabled = !track.enabled);
            setIsVideoOff(!isVideoOff);
        }
    };

    return (
        <div className="fixed inset-0 z-50 bg-black/90 flex flex-col items-center justify-center">
            <div className="relative w-full h-full flex items-center justify-center p-4">
                 {/* Remote Video (Main) */}
                {remoteStream && callType === 'video' ? (
                    <video
                        ref={remoteVideoRef}
                        autoPlay
                        playsInline
                        className="w-full h-full object-contain rounded-lg"
                    />
                ) : (
                    <div className="flex flex-col items-center justify-center text-white">
                        <div className="w-32 h-32 bg-gray-700 rounded-full flex items-center justify-center mb-6 animate-pulse">
                            {callType === 'video' ? <Video size={64} className="text-gray-400" /> : <Mic size={64} className="text-gray-400" />}
                        </div>
                        <h3 className="text-2xl font-bold mb-2">{language === 'ar' ? 'متصل' : 'Connected'}</h3>
                        <p className="opacity-70">{status === 'connecting' ? (language === 'ar' ? 'جاري الاتصال...' : 'Connecting...') : (language === 'ar' ? 'مكالمة جارية' : 'Call in progress')}</p>
                    </div>
                )}

                {/* Local Video (PiP) */}
                {callType === 'video' && (
                    <div className="absolute top-4 right-4 w-32 h-48 bg-black border border-gray-700 rounded-lg overflow-hidden shadow-2xl">
                        <video
                            ref={localVideoRef}
                            autoPlay
                            playsInline
                            muted
                            className={`w-full h-full object-cover ${isVideoOff ? 'hidden' : ''}`}
                        />
                        {isVideoOff && (
                            <div className="w-full h-full flex items-center justify-center bg-gray-800 text-white">
                                <VideoOff size={24} />
                            </div>
                        )}
                    </div>
                )}

                {/* Controls */}
                <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-4 bg-gray-900/80 p-4 rounded-full backdrop-blur-sm border border-white/10">
                    <button
                        onClick={toggleMute}
                        className={`p-4 rounded-full transition-all ${isMuted ? 'bg-red-500 text-white' : 'bg-gray-700 text-white hover:bg-gray-600'}`}
                    >
                        {isMuted ? <MicOff size={24} /> : <Mic size={24} />}
                    </button>
                    {callType === 'video' && (
                        <button
                            onClick={toggleVideo}
                            className={`p-4 rounded-full transition-all ${isVideoOff ? 'bg-red-500 text-white' : 'bg-gray-700 text-white hover:bg-gray-600'}`}
                        >
                            {isVideoOff ? <VideoOff size={24} /> : <Video size={24} />}
                        </button>
                    )}
                    <button
                        onClick={endCall}
                        className="p-4 rounded-full bg-red-600 text-white hover:bg-red-700 transition-all shadow-lg shadow-red-600/30"
                    >
                        <PhoneOff size={24} />
                    </button>
                </div>
            </div>
        </div>
    );
}
