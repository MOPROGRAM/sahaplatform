const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = new PrismaClient();

const register = async (email, password, name) => {
    try {
        const normalizedEmail = email.trim().toLowerCase();
        const existingUser = await prisma.user.findUnique({ where: { email: normalizedEmail } });
        if (existingUser) throw new Error('User already exists');

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await prisma.user.create({
            data: { email: normalizedEmail, password: hashedPassword, name },
            select: { id: true, email: true, name: true, role: true }
        });
        return user;
    } catch (error) {
        if (error.message.includes('does not exist')) {
            throw new Error('قاعدة البيانات غير مهيكلة بعد. يرجى تشغيل /api/setup-database أولاً');
        }
        throw error;
    }
};

const login = async (email, password) => {
    try {
        const normalizedEmail = email.trim().toLowerCase();
        const user = await prisma.user.findUnique({ where: { email: normalizedEmail } });

        if (!user) {
            console.log(`Login failed: User not found for ${normalizedEmail}`);
            throw new Error('Invalid credentials');
        }

        const isValid = await bcrypt.compare(password, user.password);
        if (!isValid) {
            console.log(`Login failed: Password mismatch for ${normalizedEmail}`);
            throw new Error('Invalid credentials');
        }

        const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '7d' });
        return {
            token,
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role,
                verified: user.verified
            }
        };
    } catch (error) {
        if (error.message.includes('does not exist')) {
            throw new Error('قاعدة البيانات غير مهيكلة بعد. يرجى تشغيل /api/setup-database أولاً');
        }
        throw error;
    }
};

module.exports = { register, login };