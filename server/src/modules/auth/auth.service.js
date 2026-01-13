const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = new PrismaClient();

const register = async (email, password, name) => {
    try {
        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) throw new Error('User already exists');

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await prisma.user.create({
            data: { email, password: hashedPassword, name },
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
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) throw new Error('Invalid credentials');

        const isValid = await bcrypt.compare(password, user.password);
        if (!isValid) throw new Error('Invalid credentials');

        const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '7d' });
        return token;
    } catch (error) {
        if (error.message.includes('does not exist')) {
            throw new Error('قاعدة البيانات غير مهيكلة بعد. يرجى تشغيل /api/setup-database أولاً');
        }
        throw error;
    }
};

module.exports = { register, login };