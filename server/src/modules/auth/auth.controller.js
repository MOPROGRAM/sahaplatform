const express = require('express');
const router = express.Router();
const authService = require('./auth.service');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const authMiddleware = require('../../middleware/auth');

router.post('/register', async (req, res) => {
    try {
        const { email, password, name, userType } = req.body;
        const user = await authService.register(email, password, name, userType);
        res.status(201).json({ message: 'User registered successfully', user });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const result = await authService.login(email, password);
        res.json(result);
    } catch (error) {
        res.status(401).json({ error: error.message });
    }
});

router.get('/me', authMiddleware, async (req, res) => {
    try {
        const { PrismaClient } = require('@prisma/client');
        const prisma = new PrismaClient();
        const user = await prisma.user.findUnique({
            where: { id: req.user.id },
            select: { id: true, email: true, name: true, role: true, userType: true, verified: true }
        });
        res.json(user);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.put('/me', authMiddleware, async (req, res) => {
    try {
        const { name, email, currentPassword, newPassword } = req.body;
        const { PrismaClient } = require('@prisma/client');
        const prisma = new PrismaClient();

        const user = await prisma.user.findUnique({ where: { id: req.user.id } });
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        const updateData = {};

        // Update basic info
        if (name) updateData.name = name;
        if (email && email !== user.email) {
            // Check if email is already taken
            const existingUser = await prisma.user.findUnique({ where: { email } });
            if (existingUser) {
                return res.status(400).json({ error: 'Email already in use' });
            }
            updateData.email = email;
        }

        // Update password if provided
        if (newPassword) {
            if (!currentPassword) {
                return res.status(400).json({ error: 'Current password is required to change password' });
            }

            const isValidPassword = await bcrypt.compare(currentPassword, user.password);
            if (!isValidPassword) {
                return res.status(400).json({ error: 'Current password is incorrect' });
            }

            updateData.password = await bcrypt.hash(newPassword, 12);
        }

        const updatedUser = await prisma.user.update({
            where: { id: req.user.id },
            data: updateData,
            select: { id: true, email: true, name: true, role: true, userType: true, verified: true }
        });

        res.json({ message: 'Profile updated successfully', user: updatedUser });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.delete('/me', authMiddleware, async (req, res) => {
    try {
        const { PrismaClient } = require('@prisma/client');
        const prisma = new PrismaClient();

        // Delete all related data first
        await prisma.account.deleteMany({ where: { userId: req.user.id } });
        await prisma.session.deleteMany({ where: { userId: req.user.id } });
        await prisma.message.deleteMany({
            where: {
                OR: [
                    { senderId: req.user.id },
                    { receiverId: req.user.id }
                ]
            }
        });
        await prisma.conversation.deleteMany({ where: { participants: { some: { id: req.user.id } } } });
        await prisma.payment.deleteMany({ where: { userId: req.user.id } });
        await prisma.subscription.deleteMany({ where: { userId: req.user.id } });
        await prisma.ad.deleteMany({ where: { userId: req.user.id } });

        // Finally delete the user
        await prisma.user.delete({ where: { id: req.user.id } });

        res.json({ message: 'Account deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.post('/make-admin', async (req, res) => {
    try {
        const { email, secret } = req.body;
        // Simple protection for the admin creation endpoint
        if (secret !== 'SAHA_ADMIN_SECRET_2026') {
            return res.status(403).json({ error: 'Access denied' });
        }

        const { PrismaClient } = require('@prisma/client');
        const prisma = new PrismaClient();

        const user = await prisma.user.update({
            where: { email },
            data: { role: 'ADMIN' }
        });

        res.json({
            message: 'User promoted to ADMIN successfully',
            user: { id: user.id, email: user.email, role: user.role }
        });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

module.exports = router;