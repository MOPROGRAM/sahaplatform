const express = require('express');
const router = express.Router();
const adService = require('./ad.service');
const authMiddleware = require('../../middleware/auth');

// Get all ads with filters
router.get('/', async (req, res) => {
    res.set('Cache-Control', 'no-cache');
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
        const ads = await adService.getAllAds({ userId: req.user.id });
        res.json(ads);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get ad by ID
router.get('/:id', async (req, res) => {
    res.set('Cache-Control', 'no-cache');
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

// Update ad (protected)
router.put('/:id', authMiddleware, async (req, res) => {
    try {
        const adData = req.body;
        const ad = await adService.updateAd(req.params.id, adData, req.user.id);
        res.json(ad);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Delete ad (protected)
router.delete('/:id', authMiddleware, async (req, res) => {
    try {
        const ad = await adService.deleteAd(req.params.id, req.user.id);
        res.json({ message: 'Ad deleted successfully' });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

module.exports = router;
