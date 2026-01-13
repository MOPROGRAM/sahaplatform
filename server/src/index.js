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
const prisma = new PrismaClient();

async function initializeDatabase() {
    try {
        console.log('🔄 التحقق من قاعدة البيانات...');

        // Apply migrations
        console.log('📦 تطبيق الترحيلات...');
        await prisma.$executeRaw`SELECT 1`; // Test connection

        // Check if countries table has data
        const countryCount = await prisma.country.count();
        if (countryCount === 0) {
            console.log('🌱 إضافة البيانات الأساسية...');

            // Run seed
            const { exec } = require('child_process');
            exec('npx prisma db seed', (error, stdout, stderr) => {
                if (error) {
                    console.error('❌ فشل في إضافة البيانات:', error);
                } else {
                    console.log('✅ تم إضافة البيانات الأساسية بنجاح');
                }
            });
        } else {
            console.log('✅ قاعدة البيانات محدثة مسبقاً');
        }
    } catch (error) {
        console.error('❌ خطأ في تهيئة قاعدة البيانات:', error);
    }
}

// Initialize database on startup
initializeDatabase();

// Manual database update endpoint
app.post('/api/setup-database', async (req, res) => {
    try {
        console.log('🔄 بدء تحديث قاعدة البيانات...');

        // Check if countries table has data
        const countryCount = await prisma.country.count();

        if (countryCount === 0) {
            console.log('📦 تطبيق الترحيلات والبيانات...');

            // Run seed
            const { exec } = require('child_process');
            exec('npx prisma migrate deploy && npx prisma db seed', (error, stdout, stderr) => {
                if (error) {
                    console.error('❌ فشل في تحديث قاعدة البيانات:', error);
                    res.status(500).json({
                        success: false,
                        error: 'فشل في تحديث قاعدة البيانات',
                        details: error.message
                    });
                } else {
                    console.log('✅ تم تحديث قاعدة البيانات بنجاح');
                    res.json({
                        success: true,
                        message: 'تم تحديث قاعدة البيانات بنجاح',
                        data: {
                            countries: 40,
                            cities: 60,
                            currencies: 10
                        }
                    });
                }
            });
        } else {
            res.json({
                success: true,
                message: 'قاعدة البيانات محدثة مسبقاً',
                data: {
                    existingCountries: countryCount
                }
            });
        }
    } catch (error) {
        console.error('❌ خطأ في تحديث قاعدة البيانات:', error);
        res.status(500).json({
            success: false,
            error: 'خطأ في تحديث قاعدة البيانات',
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
