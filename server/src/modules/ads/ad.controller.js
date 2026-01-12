const express = require('express');
const router = express.Router();
const adService = require('./ad.service');
const authMiddleware = require('../../middleware/auth');

// Get all ads with filters
router.get('/', async (req, res) => {
    try {
        const ads = await adService.getAllAds(req.query);
        res.json(ads);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Post a new ad (protected)
router.post('/', authMiddleware, async (req, res) => {
    try {
        const userId = req.user.id;
        const newAd = await adService.createAd(req.body, userId);
        res.status(201).json(newAd);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

module.exports = router;
