const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Get all countries
router.get('/', async (req, res) => {
    try {
        const countries = await prisma.country.findMany({
            where: { isActive: true },
            include: {
                cities: {
                    where: { isActive: true },
                    select: {
                        id: true,
                        name: true,
                        nameAr: true,
                        nameEn: true,
                        latitude: true,
                        longitude: true
                    }
                },
                currency: true
            },
            orderBy: { nameAr: 'asc' }
        });
        res.json(countries);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get country by ID
router.get('/:id', async (req, res) => {
    try {
        const country = await prisma.country.findUnique({
            where: { id: req.params.id },
            include: {
                cities: {
                    where: { isActive: true }
                },
                currency: true
            }
        });
        if (!country) {
            return res.status(404).json({ error: 'Country not found' });
        }
        res.json(country);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;