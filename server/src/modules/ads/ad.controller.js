const express = require('express');
const router = express.Router();
const adService = require('./ad.service');
const authMiddleware = require('../../middleware/auth');

// Get all ads with filters
router.get('/', async (req, res) => {
    try {
        const filters = req.query;
        const ads = await adService.getAllAds(filters);
        res.json(ads);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get ads by authenticated user (protected)
router.get('/my', authMiddleware, async (req, res) => {
    try {
        const ads = await adService.getAllAds({ authorId: req.user.id });
        res.json(ads);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get ad by ID
router.get('/:id', async (req, res) => {
    try {
        const ad = await adService.getAdById(req.params.id);
        if (!ad) return res.status(404).json({ error: 'Ad not found' });
        res.json(ad);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Post a new ad (protected)
router.post('/', authMiddleware, async (req, res) => {
    try {
        const adData = req.body;
        const ad = await adService.createAd(adData, req.user.id);
        res.status(201).json(ad);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

module.exports = router;
