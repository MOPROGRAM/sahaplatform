const express = require('express');
const router = express.Router();

// مخزن مؤقت للمكالمات (في الإنتاج استخدم Redis أو قاعدة بيانات)
const activeCalls = new Map();
const callOffers = new Map();
const userSockets = new Map();

// تسجيل اتصال المستخدم
router.post('/register', (req, res) => {
    try {
        const { userId, socketId } = req.body;
        
        if (!userId || !socketId) {
            return res.status(400).json({ error: 'userId and socketId required' });
        }

        userSockets.set(userId, socketId);
        console.log(`User registered: ${userId} with socket ${socketId}`);
        
        res.json({ success: true, message: 'User registered for calls' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// بدء مكالمة جديدة
router.post('/start-call', (req, res) => {
    try {
        const { callerId, calleeId, conversationId } = req.body;
        
        if (!callerId || !calleeId || !conversationId) {
            return res.status(400).json({ error: 'callerId, calleeId, and conversationId required' });
        }

        // التحقق من أن المستلم متصل
        const calleeSocket = userSockets.get(calleeId);
        if (!calleeSocket) {
            return res.status(404).json({ error: 'Callee is not online' });
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

        activeCalls.set(callId, callData);
        callOffers.set(callId, []);

        console.log(`Call initiated: ${callId}`);

        res.json({ 
            success: true, 
            callId,
            message: 'Call started successfully'
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// قبول المكالمة
router.post('/accept-call/:callId', (req, res) => {
    try {
        const { callId } = req.params;
        const { userId } = req.body;

        const call = activeCalls.get(callId);
        if (!call) {
            return res.status(404).json({ error: 'Call not found' });
        }

        if (call.calleeId !== userId) {
            return res.status(403).json({ error: 'Not authorized to accept this call' });
        }

        // تحديث حالة المكالمة
        call.status = 'accepted';
        call.acceptedAt = new Date();
        activeCalls.set(callId, call);

        console.log(`Call accepted: ${callId}`);

        res.json({ 
            success: true, 
            message: 'Call accepted successfully'
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// رفض المكالمة
router.post('/reject-call/:callId', (req, res) => {
    try {
        const { callId } = req.params;
        const { userId } = req.body;

        const call = activeCalls.get(callId);
        if (!call) {
            return res.status(404).json({ error: 'Call not found' });
        }

        // التحقق من التصريح
        if (call.calleeId !== userId && call.callerId !== userId) {
            return res.status(403).json({ error: 'Not authorized to reject this call' });
        }

        // تحديث حالة المكالمة
        call.status = 'rejected';
        call.rejectedAt = new Date();
        activeCalls.set(callId, call);

        console.log(`Call rejected: ${callId}`);

        res.json({ 
            success: true, 
            message: 'Call rejected successfully'
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// إنهاء المكالمة
router.post('/end-call/:callId', (req, res) => {
    try {
        const { callId } = req.params;
        const { userId } = req.body;

        const call = activeCalls.get(callId);
        if (!call) {
            return res.status(404).json({ error: 'Call not found' });
        }

        // التحقق من التصريح
        if (call.callerId !== userId && call.calleeId !== userId) {
            return res.status(403).json({ error: 'Not authorized to end this call' });
        }

        // تحديث حالة المكالمة
        call.status = 'ended';
        call.endedAt = new Date();
        activeCalls.set(callId, call);

        console.log(`Call ended: ${callId}`);

        res.json({ 
            success: true, 
            message: 'Call ended successfully'
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// الحصول على حالة المكالمة
router.get('/call-status/:callId', (req, res) => {
    try {
        const { callId } = req.params;
        const call = activeCalls.get(callId);

        if (!call) {
            return res.status(404).json({ error: 'Call not found' });
        }

        res.json({ 
            success: true, 
            call: {
                callId: call.callId,
                status: call.status,
                callerId: call.callerId,
                calleeId: call.calleeId,
                duration: call.acceptedAt ? 
                    Math.floor((new Date() - call.acceptedAt) / 1000) : 0
            }
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// إرسال عرض SDP
router.post('/send-offer/:callId', (req, res) => {
    try {
        const { callId } = req.params;
        const { userId, offer } = req.body;

        const call = activeCalls.get(callId);
        if (!call) {
            return res.status(404).json({ error: 'Call not found' });
        }

        // تخزين العرض
        if (!callOffers.has(callId)) {
            callOffers.set(callId, []);
        }
        
        callOffers.get(callId).push({
            from: userId,
            offer: offer,
            timestamp: new Date()
        });

        console.log(`SDP offer received for call: ${callId}`);

        res.json({ 
            success: true, 
            message: 'Offer received successfully'
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// الحصول على عروض SDP
router.get('/get-offers/:callId', (req, res) => {
    try {
        const { callId } = req.params;
        const offers = callOffers.get(callId) || [];

        res.json({ 
            success: true, 
            offers: offers
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;