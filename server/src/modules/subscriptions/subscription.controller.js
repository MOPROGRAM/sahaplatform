const express = require('express');
const router = express.Router();
const subscriptionService = require('./subscription.service');
const authMiddleware = require('../../middleware/auth');

router.post('/', authMiddleware, async (req, res) => {
    try {
        const { planName, price } = req.body;
        const subscription = await subscriptionService.createSubscription(req.user.id, planName, price);
        res.status(201).json(subscription);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

router.get('/my', authMiddleware, async (req, res) => {
    try {
        const subscriptions = await subscriptionService.getUserSubscriptions(req.user.id);
        res.json(subscriptions);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
