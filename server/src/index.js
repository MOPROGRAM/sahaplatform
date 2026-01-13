const express = require('express');
const http = require('http');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const { Server } = require('socket.io');
require('dotenv').config();

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

        // Create tables using raw SQL
        console.log('📦 إنشاء الجداول...');

        await prisma.$executeRaw`
            CREATE TABLE IF NOT EXISTS "Currency" (
                "id" TEXT NOT NULL PRIMARY KEY,
                "name" TEXT NOT NULL,
                "nameAr" TEXT NOT NULL,
                "nameEn" TEXT NOT NULL,
                "code" TEXT NOT NULL UNIQUE,
                "symbol" TEXT NOT NULL,
                "isActive" BOOLEAN NOT NULL DEFAULT true,
                "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
                "updatedAt" TIMESTAMP(3) NOT NULL
            );
        `;

        await prisma.$executeRaw`
            CREATE TABLE IF NOT EXISTS "Country" (
                "id" TEXT NOT NULL PRIMARY KEY,
                "name" TEXT NOT NULL,
                "nameAr" TEXT NOT NULL,
                "nameEn" TEXT NOT NULL,
                "code" TEXT NOT NULL UNIQUE,
                "phoneCode" TEXT NOT NULL,
                "currencyId" TEXT NOT NULL,
                "flag" TEXT,
                "isActive" BOOLEAN NOT NULL DEFAULT true,
                "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
                "updatedAt" TIMESTAMP(3) NOT NULL,
                CONSTRAINT "Country_currencyId_fkey" FOREIGN KEY ("currencyId") REFERENCES "Currency"("id") ON DELETE RESTRICT ON UPDATE CASCADE
            );
        `;

        await prisma.$executeRaw`
            CREATE TABLE IF NOT EXISTS "City" (
                "id" TEXT NOT NULL PRIMARY KEY,
                "name" TEXT NOT NULL,
                "nameAr" TEXT NOT NULL,
                "nameEn" TEXT NOT NULL,
                "countryId" TEXT NOT NULL,
                "latitude" REAL,
                "longitude" REAL,
                "isActive" BOOLEAN NOT NULL DEFAULT true,
                "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
                "updatedAt" TIMESTAMP(3) NOT NULL,
                CONSTRAINT "City_countryId_fkey" FOREIGN KEY ("countryId") REFERENCES "Country"("id") ON DELETE RESTRICT ON UPDATE CASCADE
            );
        `;

        await prisma.$executeRaw`
            CREATE UNIQUE INDEX IF NOT EXISTS "Currency_code_key" ON "Currency"("code");
        `;

        await prisma.$executeRaw`
            CREATE UNIQUE INDEX IF NOT EXISTS "Country_code_key" ON "Country"("code");
        `;

        await prisma.$executeRaw`
            CREATE UNIQUE INDEX IF NOT EXISTS "City_name_countryId_key" ON "City"("name", "countryId");
        `;

        console.log('✅ تم إنشاء الجداول');

        // Insert basic data
        console.log('🌱 إدراج البيانات الأساسية...');

        // Currencies
        await prisma.$executeRaw`
            INSERT OR IGNORE INTO "Currency" (id, code, symbol, name, nameAr, nameEn, "isActive", "createdAt", "updatedAt")
            VALUES ('sar', 'sar', 'ر.س', 'Saudi Riyal', 'الريال السعودي', 'Saudi Riyal', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
        `;

        await prisma.$executeRaw`
            INSERT OR IGNORE INTO "Currency" (id, code, symbol, name, nameAr, nameEn, "isActive", "createdAt", "updatedAt")
            VALUES ('aed', 'aed', 'د.إ', 'UAE Dirham', 'الدرهم الإماراتي', 'UAE Dirham', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
        `;

        await prisma.$executeRaw`
            INSERT OR IGNORE INTO "Currency" (id, code, symbol, name, nameAr, nameEn, "isActive", "createdAt", "updatedAt")
            VALUES ('egp', 'egp', 'ج.م', 'Egyptian Pound', 'الجنيه المصري', 'Egyptian Pound', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
        `;

        await prisma.$executeRaw`
            INSERT OR IGNORE INTO "Currency" (id, code, symbol, name, nameAr, nameEn, "isActive", "createdAt", "updatedAt")
            VALUES ('usd', 'usd', '$', 'US Dollar', 'الدولار الأمريكي', 'US Dollar', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
        `;

        // Countries
        await prisma.$executeRaw`
            INSERT OR IGNORE INTO "Country" (id, code, name, nameAr, nameEn, "phoneCode", "currencyId", flag, "isActive", "createdAt", "updatedAt")
            VALUES ('SA', 'SA', 'Saudi Arabia', 'المملكة العربية السعودية', 'Saudi Arabia', '+966', 'sar', '🇸🇦', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
        `;

        await prisma.$executeRaw`
            INSERT OR IGNORE INTO "Country" (id, code, name, nameAr, nameEn, "phoneCode", "currencyId", flag, "isActive", "createdAt", "updatedAt")
            VALUES ('AE', 'AE', 'UAE', 'الإمارات العربية المتحدة', 'UAE', '+971', 'aed', '🇦🇪', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
        `;

        await prisma.$executeRaw`
            INSERT OR IGNORE INTO "Country" (id, code, name, nameAr, nameEn, "phoneCode", "currencyId", flag, "isActive", "createdAt", "updatedAt")
            VALUES ('EG', 'EG', 'Egypt', 'مصر', 'Egypt', '+20', 'egp', '🇪🇬', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
        `;

        // Cities
        await prisma.$executeRaw`
            INSERT OR IGNORE INTO "City" (id, name, nameAr, nameEn, "countryId", latitude, longitude, "isActive", "createdAt", "updatedAt")
            VALUES ('riyadh', 'Riyadh', 'الرياض', 'Riyadh', 'SA', 24.7136, 46.6753, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
        `;

        await prisma.$executeRaw`
            INSERT OR IGNORE INTO "City" (id, name, nameAr, nameEn, "countryId", latitude, longitude, "isActive", "createdAt", "updatedAt")
            VALUES ('dubai', 'Dubai', 'دبي', 'Dubai', 'AE', 25.2048, 55.2708, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
        `;

        await prisma.$executeRaw`
            INSERT OR IGNORE INTO "City" (id, name, nameAr, nameEn, "countryId", latitude, longitude, "isActive", "createdAt", "updatedAt")
            VALUES ('cairo', 'Cairo', 'القاهرة', 'Cairo', 'EG', 30.0444, 31.2357, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
        `;

        console.log('✅ تم إعداد قاعدة البيانات بالكامل');

        res.json({
            success: true,
            message: 'تم إعداد قاعدة البيانات بالكامل بنجاح',
            data: {
                currencies: 4,
                countries: 3,
                cities: 3,
                tablesCreated: ['Currency', 'Country', 'City']
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

// Routes Placeholder
app.get('/', (req, res) => {
    res.json({ message: "Welcome to Saha Platform API (ساحة)" });
});

// Import Modules
const authRoutes = require('./modules/auth/auth.controller');
const adRoutes = require('./modules/ads/ad.controller');
const conversationRoutes = require('./modules/conversations/conversation.controller');
const countryRoutes = require('./modules/countries/country.controller');
const authMiddleware = require('./middleware/auth');

app.use('/api/auth', authRoutes);
app.use('/api/ads', adRoutes);
app.use('/api/conversations', conversationRoutes);
app.use('/api/countries', countryRoutes);

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

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`🚀 Saha Server running on port ${PORT}`);
});