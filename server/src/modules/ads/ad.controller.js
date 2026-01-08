const express = require('express');
const router = express.Router();
const adService = require('./ad.service');

// Get all ads with filters
router.get('/', async (req, res) => {
    try {
        const ads = await adService.getAllAds(req.query);
        res.json(ads);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Post a new ad
router.post('/', async (req, res) => {
    try {
        // Note: userId should come from auth middleware
        const userId = req.body.userId || "mock-user-id";
        const newAd = await adService.createAd(req.body, userId);
        res.status(201).json(newAd);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

module.exports = router;
