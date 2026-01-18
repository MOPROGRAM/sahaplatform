const express = require('express');
const http = require('http');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
const { Server } = require('socket.io');
require('dotenv').config();

// Fix DATABASE_URL to start with protocol if missing
if (process.env.DATABASE_URL) {
    console.log('DATABASE_URL before fix:', process.env.DATABASE_URL);
    process.env.DATABASE_URL = process.env.DATABASE_URL.trim();
    if (!process.env.DATABASE_URL.startsWith('file') && !process.env.DATABASE_URL.includes('://')) {
        process.env.DATABASE_URL = 'postgresql://' + process.env.DATABASE_URL;
    }
    console.log('DATABASE_URL after fix:', process.env.DATABASE_URL);
} else {
    console.log('DATABASE_URL is not set');
}

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

// Middleware
app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors({ origin: '*' }));
app.use(morgan('dev'));
app.use(express.json());

// Database setup
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Complete database initialization endpoint
app.post('/api/setup-database', async (req, res) => {
    try {
        console.log('🔄 بدء إعداد قاعدة البيانات...');

        // Create all tables using raw SQL
        console.log('📦 إنشاء جميع الجداول...');

        // Basic tables
        await prisma.$executeRaw`CREATE TABLE IF NOT EXISTS "Currency" ("id" TEXT NOT NULL PRIMARY KEY, "name" TEXT NOT NULL, "nameAr" TEXT NOT NULL, "nameEn" TEXT NOT NULL, "code" TEXT NOT NULL UNIQUE, "symbol" TEXT NOT NULL, "isActive" BOOLEAN NOT NULL DEFAULT true, "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP(3) NOT NULL);`;
        await prisma.$executeRaw`CREATE TABLE IF NOT EXISTS "Country" ("id" TEXT NOT NULL PRIMARY KEY, "name" TEXT NOT NULL, "nameAr" TEXT NOT NULL, "nameEn" TEXT NOT NULL, "code" TEXT NOT NULL UNIQUE, "phoneCode" TEXT NOT NULL, "currencyId" TEXT NOT NULL, "flag" TEXT, "isActive" BOOLEAN NOT NULL DEFAULT true, "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP(3) NOT NULL);`;
        await prisma.$executeRaw`CREATE TABLE IF NOT EXISTS "City" ("id" TEXT NOT NULL PRIMARY KEY, "name" TEXT NOT NULL, "nameAr" TEXT NOT NULL, "nameEn" TEXT NOT NULL, "countryId" TEXT NOT NULL, "latitude" REAL, "longitude" REAL, "isActive" BOOLEAN NOT NULL DEFAULT true, "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP(3) NOT NULL);`;

        // Auth tables
        await prisma.$executeRaw`CREATE TABLE IF NOT EXISTS "Account" ("id" TEXT NOT NULL PRIMARY KEY, "userId" TEXT NOT NULL, "type" TEXT NOT NULL, "provider" TEXT NOT NULL, "providerAccountId" TEXT NOT NULL, "refresh_token" TEXT, "access_token" TEXT, "expires_at" INTEGER, "token_type" TEXT, "scope" TEXT, "id_token" TEXT, "session_state" TEXT);`;
        await prisma.$executeRaw`CREATE TABLE IF NOT EXISTS "Session" ("id" TEXT NOT NULL PRIMARY KEY, "sessionToken" TEXT NOT NULL UNIQUE, "userId" TEXT NOT NULL, "expires" TIMESTAMP(3) NOT NULL);`;
        await prisma.$executeRaw`CREATE TABLE IF NOT EXISTS "User" ("id" TEXT NOT NULL PRIMARY KEY, "name" TEXT, "email" TEXT NOT NULL UNIQUE, "emailVerified" TIMESTAMP(3), "image" TEXT, "password" TEXT, "role" TEXT NOT NULL DEFAULT 'USER', "verified" BOOLEAN NOT NULL DEFAULT false, "phone" TEXT, "phoneVerified" BOOLEAN NOT NULL DEFAULT false, "countryId" TEXT, "cityId" TEXT, "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP(3) NOT NULL);`;

        // Ads tables
        await prisma.$executeRaw`CREATE TABLE IF NOT EXISTS "Ad" ("id" TEXT NOT NULL PRIMARY KEY, "title" TEXT NOT NULL, "titleAr" TEXT, "titleEn" TEXT, "description" TEXT NOT NULL, "descriptionAr" TEXT, "descriptionEn" TEXT, "price" REAL, "currencyId" TEXT NOT NULL DEFAULT 'sar', "category" TEXT NOT NULL, "cityId" TEXT, "latitude" REAL, "longitude" REAL, "images" TEXT NOT NULL DEFAULT '[]', "video" TEXT, "isBoosted" BOOLEAN NOT NULL DEFAULT false, "isActive" BOOLEAN NOT NULL DEFAULT true, "views" INTEGER NOT NULL DEFAULT 0, "authorId" TEXT NOT NULL, "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP(3) NOT NULL);`;

        console.log('✅ تم إنشاء جميع الجداول');

        // Insert basic data
        console.log('🌱 إدراج البيانات الأساسية...');

        // Insert currencies (ignore if exists)
        await prisma.$executeRaw`
            INSERT OR IGNORE INTO "Currency" (id, code, symbol, name, nameAr, nameEn, "isActive")
            VALUES
            ('sar', 'sar', 'ر.س', 'Saudi Riyal', 'الريال السعودي', 'Saudi Riyal', true),
            ('aed', 'aed', 'د.إ', 'UAE Dirham', 'الدرهم الإماراتي', 'UAE Dirham', true),
            ('egp', 'egp', 'ج.م', 'Egyptian Pound', 'الجنيه المصري', 'Egyptian Pound', true),
            ('usd', 'usd', '$', 'US Dollar', 'الدولار الأمريكي', 'US Dollar', true);
        `;

        // Insert countries (ignore if exists)
        await prisma.$executeRaw`
            INSERT OR IGNORE INTO "Country" (id, code, name, nameAr, nameEn, "phoneCode", "currencyId", flag, "isActive")
            VALUES
            ('SA', 'SA', 'Saudi Arabia', 'المملكة العربية السعودية', 'Saudi Arabia', '+966', 'sar', '🇸🇦', true),
            ('AE', 'AE', 'UAE', 'الإمارات العربية المتحدة', 'UAE', '+971', 'aed', '🇦🇪', true),
            ('EG', 'EG', 'Egypt', 'مصر', 'Egypt', '+20', 'egp', '🇪🇬', true);
        `;

        // Insert cities (ignore if exists)
        await prisma.$executeRaw`
            INSERT OR IGNORE INTO "City" (id, name, nameAr, nameEn, "countryId", latitude, longitude, "isActive")
            VALUES
            ('riyadh', 'Riyadh', 'الرياض', 'Riyadh', 'SA', 24.7136, 46.6753, true),
            ('dubai', 'Dubai', 'دبي', 'Dubai', 'AE', 25.2048, 55.2708, true),
            ('cairo', 'Cairo', 'القاهرة', 'Cairo', 'EG', 30.0444, 31.2357, true);
        `;

        console.log('✅ تم إعداد قاعدة البيانات بالكامل');

        res.json({
            success: true,
            message: 'تم إعداد قاعدة البيانات بالكامل بنجاح! 🎉',
            data: {
                currencies: 4,
                countries: 3,
                cities: 3,
                tables: ['Currency', 'Country', 'City', 'Account', 'Session', 'User', 'Ad']
            }
        });

    } catch (error) {
        console.error('❌ خطأ في إعداد قاعدة البيانات:', error);
        res.status(500).json({
            success: false,
            error: 'خطأ في إعداد قاعدة البيانات',
            details: error.message
        });
    }
});

// Serve static files from public directory (frontend build)
app.use(express.static('public'));

// API routes
app.get('/api', (req, res) => {
    res.json({ message: "Welcome to Saha Platform API (ساحة)" });
});

// Import Modules
const authRoutes = require('./modules/auth/auth.controller');
const adRoutes = require('./modules/ads/ad.controller');
const conversationRoutes = require('./modules/conversations/conversation.controller');
const countryRoutes = require('./modules/countries/country.controller');
const subscriptionRoutes = require('./modules/subscriptions/subscription.controller');
const authMiddleware = require('./middleware/auth');

app.use('/api/auth', authRoutes);
app.use('/api/ads', adRoutes);
app.use('/api/conversations', conversationRoutes);
app.use('/api/countries', countryRoutes);
app.use('/api/subscriptions', subscriptionRoutes);

// Serve frontend for all non-API routes
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
});

// Socket.io Logic
io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    socket.on('send_message', (data) => {
        io.emit('receive_message', data);
    });

    socket.on('disconnect', () => {
        console.log('User disconnected');
    });
});

// Documentation route
app.get('/docs', (req, res) => {
    res.sendFile(__dirname + '/docs/index.html');
});

// Health check for Koyeb
app.get('/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`🚀 Saha Platform running on port ${PORT}`);
    console.log(`📚 API Docs: http://localhost:${PORT}/docs`);
    console.log(`🌐 Frontend: http://localhost:${PORT}`);
});