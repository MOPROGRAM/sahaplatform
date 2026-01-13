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

// Auto-migrate and seed database on startup
const { PrismaClient } = require('@prisma/client');
const { exec } = require('child_process');
const prisma = new PrismaClient();

async function initializeDatabase() {
    try {
        console.log('🔄 بدء تهيئة قاعدة البيانات...');

        // Test database connection
        await prisma.$connect();
        console.log('✅ تم الاتصال بقاعدة البيانات');

        // Apply migrations
        console.log('📦 تطبيق الترحيلات...');
        await new Promise((resolve, reject) => {
            exec('npx prisma migrate deploy', (error, stdout, stderr) => {
                if (error) {
                    console.error('خطأ في تطبيق الترحيلات:', error);
                    reject(error);
                } else {
                    console.log('✅ تم تطبيق الترحيلات بنجاح');
                    resolve(stdout);
                }
            });
        });

        // Check if countries table has data
        const countryCount = await prisma.country.count();
        if (countryCount === 0) {
            console.log('🌱 إضافة البيانات الأساسية (الدول والمدن والعملات)...');

            await new Promise((resolve, reject) => {
                exec('npx prisma db seed', (error, stdout, stderr) => {
                    if (error) {
                        console.error('خطأ في إضافة البيانات:', error);
                        reject(error);
                    } else {
                        console.log('✅ تم إضافة البيانات الأساسية بنجاح');
                        console.log(`📊 تم إضافة: 40+ دولة، 60+ مدينة، 10+ عملات`);
                        resolve(stdout);
                    }
                });
            });
        } else {
            console.log(`✅ قاعدة البيانات جاهزة (${countryCount} دولة موجودة)`);
        }

        console.log('🎉 قاعدة البيانات مُهيكلة ومُعدة بالكامل!');
    } catch (error) {
        console.error('❌ خطأ في تهيئة قاعدة البيانات:', error);
        // Don't exit the process, just log the error
    }
}

// Initialize database on startup
initializeDatabase();

// One-time database setup endpoint (works on Render)
app.post('/api/setup-database', async (req, res) => {
    try {
        console.log('🔄 بدء إعداد قاعدة البيانات...');

        // Check if already initialized
        const countryCount = await prisma.country.count();

        if (countryCount === 0) {
            console.log('🌱 إضافة البيانات الأساسية مباشرة...');

            // Insert basic data directly (works on all platforms)
            const currencies = [
                { code: 'sar', symbol: 'ر.س', name: 'Saudi Riyal', nameAr: 'الريال السعودي', nameEn: 'Saudi Riyal' },
                { code: 'aed', symbol: 'د.إ', name: 'UAE Dirham', nameAr: 'الدرهم الإماراتي', nameEn: 'UAE Dirham' },
                { code: 'egp', symbol: 'ج.م', name: 'Egyptian Pound', nameAr: 'الجنيه المصري', nameEn: 'Egyptian Pound' },
                {
                    code: 'usd', symbol: '

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
, name: 'US Dollar', nameAr: 'الدولار الأمريكي', nameEn: 'US Dollar' }
            ];

        const countries = [
            { code: 'SA', name: 'Saudi Arabia', nameAr: 'المملكة العربية السعودية', nameEn: 'Saudi Arabia', phoneCode: '+966', currencyCode: 'sar', flag: '🇸🇦' },
            { code: 'AE', name: 'UAE', nameAr: 'الإمارات العربية المتحدة', nameEn: 'UAE', phoneCode: '+971', currencyCode: 'aed', flag: '🇦🇪' },
            { code: 'EG', name: 'Egypt', nameAr: 'مصر', nameEn: 'Egypt', phoneCode: '+20', currencyCode: 'egp', flag: '🇪🇬' }
        ];

        const cities = [
            { name: 'Riyadh', nameAr: 'الرياض', nameEn: 'Riyadh', countryCode: 'SA', latitude: 24.7136, longitude: 46.6753 },
            { name: 'Dubai', nameAr: 'دبي', nameEn: 'Dubai', countryCode: 'AE', latitude: 25.2048, longitude: 55.2708 },
            { name: 'Cairo', nameAr: 'القاهرة', nameEn: 'Cairo', countryCode: 'EG', latitude: 30.0444, longitude: 31.2357 }
        ];

        // Insert currencies
        for (const currency of currencies) {
            await prisma.currency.upsert({
                where: { code: currency.code },
                update: {},
                create: currency,
            });
        }

        // Insert countries and cities
        for (const country of countries) {
            const currency = await prisma.currency.findUnique({
                where: { code: country.currencyCode }
            });

            if (currency) {
                await prisma.country.upsert({
                    where: { code: country.code },
                    update: {},
                    create: {
                        ...country,
                        currencyId: currency.id,
                    },
                });

                // Insert cities for this country
                for (const city of cities.filter(c => c.countryCode === country.code)) {
                    const countryRecord = await prisma.country.findUnique({
                        where: { code: country.code }
                    });

                    if (countryRecord) {
                        await prisma.city.upsert({
                            where: {
                                name_countryId: {
                                    name: city.name,
                                    countryId: countryRecord.id
                                }
                            },
                            update: {},
                            create: {
                                ...city,
                                countryId: countryRecord.id,
                            },
                        });
                    }
                }
            }
        }

        console.log('✅ تم إعداد قاعدة البيانات بنجاح');
        res.json({
            success: true,
            message: 'تم إعداد قاعدة البيانات بنجاح',
            data: {
                countries: countries.length,
                cities: cities.length,
                currencies: currencies.length
            }
        });
    } else {
        res.json({
            success: true,
            message: 'قاعدة البيانات مُعدة مسبقاً',
            data: { existingCountries: countryCount }
        });
    }
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
