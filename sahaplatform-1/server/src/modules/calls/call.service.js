// خدمة إدارة المكالمات الصوتية
class CallService {
    constructor() {
        this.activeCalls = new Map();
        this.callOffers = new Map();
        this.userSockets = new Map();
    }

    // تسجيل المستخدم
    registerUser(userId, socketId) {
        this.userSockets.set(userId, socketId);
        console.log(`User registered: ${userId} with socket ${socketId}`);
        return true;
    }

    // إلغاء تسجيل المستخدم
    unregisterUser(userId) {
        this.userSockets.delete(userId);
        console.log(`User unregistered: ${userId}`);
        return true;
    }

    // بدء مكالمة جديدة
    startCall(callerId, calleeId, conversationId) {
        // التحقق من أن المستلم متصل
        const calleeSocket = this.userSockets.get(calleeId);
        if (!calleeSocket) {
            throw new Error('Callee is not online');
        }

        // إنشاء معرف المكالمة
        const callId = `${callerId}-${calleeId}-${Date.now()}`;
        
        // تخزين تفاصيل المكالمة
        const callData = {
            callId,
            callerId,
            calleeId,
            conversationId,
            status: 'ringing',
            createdAt: new Date()
        };

        this.activeCalls.set(callId, callData);
        this.callOffers.set(callId, []);

        console.log(`Call initiated: ${callId}`);
        return callData;
    }

    // قبول المكالمة
    acceptCall(callId, userId) {
        const call = this.activeCalls.get(callId);
        if (!call) {
            throw new Error('Call not found');
        }

        if (call.calleeId !== userId) {
            throw new Error('Not authorized to accept this call');
        }

        // تحديث حالة المكالمة
        call.status = 'accepted';
        call.acceptedAt = new Date();
        this.activeCalls.set(callId, call);

        console.log(`Call accepted: ${callId}`);
        return call;
    }

    // رفض المكالمة
    rejectCall(callId, userId) {
        const call = this.activeCalls.get(callId);
        if (!call) {
            throw new Error('Call not found');
        }

        // التحقق من التصريح
        if (call.calleeId !== userId && call.callerId !== userId) {
            throw new Error('Not authorized to reject this call');
        }

        // تحديث حالة المكالمة
        call.status = 'rejected';
        call.rejectedAt = new Date();
        this.activeCalls.set(callId, call);

        console.log(`Call rejected: ${callId}`);
        return call;
    }

    // إنهاء المكالمة
    endCall(callId, userId) {
        const call = this.activeCalls.get(callId);
        if (!call) {
            throw new Error('Call not found');
        }

        // التحقق من التصريح
        if (call.callerId !== userId && call.calleeId !== userId) {
            throw new Error('Not authorized to end this call');
        }

        // تحديث حالة المكالمة
        call.status = 'ended';
        call.endedAt = new Date();
        this.activeCalls.set(callId, call);

        console.log(`Call ended: ${callId}`);
        return call;
    }

    // الحصول على حالة المكالمة
    getCallStatus(callId) {
        const call = this.activeCalls.get(callId);
        if (!call) {
            throw new Error('Call not found');
        }

        return {
            callId: call.callId,
            status: call.status,
            callerId: call.callerId,
            calleeId: call.calleeId,
            duration: call.acceptedAt ? 
                Math.floor((new Date() - call.acceptedAt) / 1000) : 0
        };
    }

    // إرسال عرض SDP
    sendOffer(callId, userId, offer) {
        const call = this.activeCalls.get(callId);
        if (!call) {
            throw new Error('Call not found');
        }

        // تخزين العرض
        if (!this.callOffers.has(callId)) {
            this.callOffers.set(callId, []);
        }
        
        this.callOffers.get(callId).push({
            from: userId,
            offer: offer,
            timestamp: new Date()
        });

        console.log(`SDP offer received for call: ${callId}`);
        return true;
    }

    // الحصول على عروض SDP
    getOffers(callId) {
        return this.callOffers.get(callId) || [];
    }

    // الحصول على socket ID للمستخدم
    getUserSocket(userId) {
        return this.userSockets.get(userId);
    }

    // الحصول على جميع المكالمات النشطة للمستخدم
    getUserActiveCalls(userId) {
        const userCalls = [];
        for (const [callId, callData] of this.activeCalls) {
            if (callData.callerId === userId || callData.calleeId === userId) {
                userCalls.push({
                    callId: callData.callId,
                    status: callData.status,
                    otherParty: callData.callerId === userId ? callData.calleeId : callData.callerId,
                    createdAt: callData.createdAt
                });
            }
        }
        return userCalls;
    }
}

module.exports = new CallService();