"use client";

import { useState, useEffect } from "react";
import { Phone, PhoneOff, User } from "lucide-react";
import { useLanguage } from "@/lib/language-context";

interface IncomingCallNotificationProps {
    callData: any;
    onAccept: () => void;
    onReject: () => void;
}

export default function IncomingCallNotification({ 
    callData, 
    onAccept, 
    onReject 
}: IncomingCallNotificationProps) {
    const { language } = useLanguage();
    const [timeRemaining, setTimeRemaining] = useState(30); // 30 ثانية للرد

    useEffect(() => {
        const timer = setInterval(() => {
            setTimeRemaining(prev => {
                if (prev <= 1) {
                    onReject();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [onReject]);

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-6 w-full max-w-sm mx-4 shadow-2xl animate-pulse">
                <div className="text-center">
                    <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
                        <Phone size={40} className="text-white rotate-90" />
                    </div>
                    
                    <h2 className="text-xl font-black text-text-main mb-2">
                        {language === 'ar' ? 'مكالمة واردة' : 'Incoming Call'}
                    </h2>
                    
                    <div className="bg-gray-100 rounded-lg p-4 mb-6">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                                <User size={20} className="text-primary" />
                            </div>
                            <div className="text-left">
                                <p className="font-black text-text-main text-sm">
                                    {callData.callerName || 'مستخدم مجهول'}
                                </p>
                                <p className="text-[10px] text-text-muted uppercase tracking-wider">
                                    {language === 'ar' ? 'من محادثة الإعلان' : 'From ad conversation'}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-blue-50 rounded-lg p-3 mb-6">
                        <p className="text-[11px] font-black text-blue-700">
                            {language === 'ar' 
                                ? `الرد خلال ${timeRemaining} ثانية` 
                                : `Respond within ${timeRemaining} seconds`
                            }
                        </p>
                    </div>

                    <div className="flex justify-center gap-4">
                        <button
                            onClick={onAccept}
                            className="w-16 h-16 bg-green-500 hover:bg-green-600 text-white rounded-full flex items-center justify-center transition-all active:scale-95 shadow-lg"
                        >
                            <Phone size={28} className="rotate-90" />
                        </button>
                        
                        <button
                            onClick={onReject}
                            className="w-16 h-16 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center transition-all active:scale-95 shadow-lg"
                        >
                            <PhoneOff size={28} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}