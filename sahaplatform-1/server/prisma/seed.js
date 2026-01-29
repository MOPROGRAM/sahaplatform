const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const currencies = [
    { code: 'SAR', symbol: 'ر.س', nameAr: 'الريال السعودي', nameEn: 'Saudi Riyal' },
    { code: 'AED', symbol: 'د.إ', nameAr: 'الدرهم الإماراتي', nameEn: 'UAE Dirham' },
    { code: 'EGP', symbol: 'ج.م', nameAr: 'الجنيه المصري', nameEn: 'Egyptian Pound' },
    { code: 'KWD', symbol: 'د.ك', nameAr: 'الدينار الكويتي', nameEn: 'Kuwaiti Dinar' },
    { code: 'BHD', symbol: 'د.ب', nameAr: 'الدينار البحريني', nameEn: 'Bahraini Dinar' },
    { code: 'QAR', symbol: 'ر.ق', nameAr: 'الريال القطري', nameEn: 'Qatari Riyal' },
    { code: 'OMR', symbol: 'ر.ع', nameAr: 'الريال العماني', nameEn: 'Omani Riyal' },
    { code: 'JOD', symbol: 'د.أ', nameAr: 'الدينار الأردني', nameEn: 'Jordanian Dinar' },
    { code: 'USD', symbol: '$', nameAr: 'الدولار الأمريكي', nameEn: 'US Dollar' },
    { code: 'EUR', symbol: '€', nameAr: 'اليورو', nameEn: 'Euro' },
    { code: 'GBP', symbol: '£', nameAr: 'الجنيه الإسترليني', nameEn: 'British Pound' },
];

const countries = [
    { code: 'SA', nameAr: 'المملكة العربية السعودية', nameEn: 'Saudi Arabia', phoneCode: '+966', currencyCode: 'SAR', flag: '🇸🇦' },
    { code: 'AE', nameAr: 'الإمارات العربية المتحدة', nameEn: 'United Arab Emirates', phoneCode: '+971', currencyCode: 'AED', flag: '🇦🇪' },
    { code: 'EG', nameAr: 'مصر', nameEn: 'Egypt', phoneCode: '+20', currencyCode: 'EGP', flag: '🇪🇬' },
    { code: 'KW', nameAr: 'الكويت', nameEn: 'Kuwait', phoneCode: '+965', currencyCode: 'KWD', flag: '🇰🇼' },
    { code: 'BH', nameAr: 'البحرين', nameEn: 'Bahrain', phoneCode: '+973', currencyCode: 'BHD', flag: '🇧🇭' },
    { code: 'QA', nameAr: 'قطر', nameEn: 'Qatar', phoneCode: '+974', currencyCode: 'QAR', flag: '🇶🇦' },
    { code: 'OM', nameAr: 'عمان', nameEn: 'Oman', phoneCode: '+968', currencyCode: 'OMR', flag: '🇴🇲' },
    { code: 'JO', nameAr: 'الأردن', nameEn: 'Jordan', phoneCode: '+962', currencyCode: 'JOD', flag: '🇯🇴' },
    { code: 'US', nameAr: 'الولايات المتحدة', nameEn: 'United States', phoneCode: '+1', currencyCode: 'USD', flag: '🇺🇸' },
    { code: 'GB', nameAr: 'المملكة المتحدة', nameEn: 'United Kingdom', phoneCode: '+44', currencyCode: 'GBP', flag: '🇬🇧' },
];

const cities = [
    { nameAr: 'الرياض', nameEn: 'Riyadh', countryCode: 'SA', lat: 24.7136, lng: 46.6753 },
    { nameAr: 'جدة', nameEn: 'Jeddah', countryCode: 'SA', lat: 21.4858, lng: 39.1925 },
    { nameAr: 'مكة المكرمة', nameEn: 'Mecca', countryCode: 'SA', lat: 21.3891, lng: 39.8579 },
    { nameAr: 'دبي', nameEn: 'Dubai', countryCode: 'AE', lat: 25.2048, lng: 55.2708 },
    { nameAr: 'أبوظبي', nameEn: 'Abu Dhabi', countryCode: 'AE', lat: 24.4539, lng: 54.3773 },
    { nameAr: 'القاهرة', nameEn: 'Cairo', countryCode: 'EG', lat: 30.0444, lng: 31.2357 },
];

async function main() {
    console.log('🌍 Seeding global data...');

    // 1. Create Currencies with fixed IDs
    for (const curr of currencies) {
        const id = curr.code.toLowerCase();
        await prisma.currency.upsert({
            where: { id },
            update: {},
            create: {
                id,
                code: curr.code,
                symbol: curr.symbol,
                name: curr.nameEn,
                nameAr: curr.nameAr,
                nameEn: curr.nameEn,
            }
        });
    }

    // 2. Create Countries
    for (const c of countries) {
        const currencyId = c.currencyCode.toLowerCase();
        await prisma.country.upsert({
            where: { code: c.code },
            update: {},
            create: {
                code: c.code,
                name: c.nameEn,
                nameAr: c.nameAr,
                nameEn: c.nameEn,
                phoneCode: c.phoneCode,
                currencyId,
                flag: c.flag
            }
        });
    }

    // 3. Create Cities
    for (const city of cities) {
        const country = await prisma.country.findUnique({ where: { code: city.countryCode } });
        if (country) {
            await prisma.city.upsert({
                where: {
                    name_countryId: {
                        name: city.nameAr,
                        countryId: country.id
                    }
                },
                update: {},
                create: {
                    name: city.nameAr,
                    nameAr: city.nameAr,
                    nameEn: city.nameEn,
                    countryId: country.id,
                    latitude: city.lat,
                    longitude: city.lng
                }
            });
        }
    }



    // 4. Create test user
    const testUser = await prisma.user.upsert({
        where: { email: 'test@example.com' },
        update: {},
        create: {
            name: 'Test User',
            email: 'test@example.com',
            password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password
            role: 'USER',
            verified: true,
            phone: '+966501234567',
            phoneVerified: true,
            countryId: (await prisma.country.findUnique({ where: { code: 'SA' } })).id,
            cityId: (await prisma.city.findFirst({ where: { nameAr: 'الرياض' } })).id
        }
    });

    // 4.1. Create admin user
    const adminUser = await prisma.user.upsert({
        where: { email: 'motwasel@yahoo.com' },
        update: {},
        create: {
            name: 'Saha Administrator',
            email: 'motwasel@yahoo.com',
            password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password: "password"
            role: 'ADMIN',
            verified: true,
            phone: '+966500000000',
            phoneVerified: true,
            countryId: (await prisma.country.findUnique({ where: { code: 'SA' } })).id,
            cityId: (await prisma.city.findFirst({ where: { nameAr: 'الرياض' } })).id
        }
    });

    // 5. Create test ads with different categories and created_at dates
    const ads = [
        {
            title: 'شقة للإيجار في الرياض',
            titleAr: 'شقة للإيجار في الرياض',
            titleEn: 'Apartment for rent in Riyadh',
            description: 'شقة ممتازة للإيجار في حي النخيل',
            descriptionAr: 'شقة ممتازة للإيجار في حي النخيل',
            descriptionEn: 'Excellent apartment for rent in Al Nakheel district',
            price: 2500,
            category: 'realestate',
            location: 'الرياض',
            images: JSON.stringify(['https://via.placeholder.com/400x300/FF6B6B/FFFFFF?text=شقة+للإيجار']),
            createdAt: new Date(Date.now() - 5 * 60 * 1000), // 5 minutes ago
        },
        {
            title: 'سيارة تويوتا كامري 2020',
            titleAr: 'سيارة تويوتا كامري 2020',
            titleEn: 'Toyota Camry 2020',
            description: 'سيارة بحالة ممتازة، كيلومترات قليلة',
            descriptionAr: 'سيارة بحالة ممتازة، كيلومترات قليلة',
            descriptionEn: 'Car in excellent condition, low mileage',
            price: 85000,
            category: 'cars',
            location: 'جدة',
            images: JSON.stringify(['https://via.placeholder.com/400x300/4ECDC4/FFFFFF?text=تويوتا+كامري']),
            createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
        },
        {
            title: 'مطور برمجيات - React/Node.js',
            titleAr: 'مطور برمجيات - React/Node.js',
            titleEn: 'Software Developer - React/Node.js',
            description: 'مطلوب مطور برمجيات ذو خبرة في React وNode.js',
            descriptionAr: 'مطلوب مطور برمجيات ذو خبرة في React وNode.js',
            descriptionEn: 'Software developer needed with experience in React and Node.js',
            price: null,
            category: 'jobs',
            location: 'دبي',
            images: JSON.stringify([]),
            createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
        },
        {
            title: 'لابتوب ديل للبيع',
            titleAr: 'لابتوب ديل للبيع',
            titleEn: 'Dell Laptop for sale',
            description: 'لابتوب ديل i7، ذاكرة 16GB، حالة ممتازة',
            descriptionAr: 'لابتوب ديل i7، ذاكرة 16GB، حالة ممتازة',
            descriptionEn: 'Dell i7 laptop, 16GB RAM, excellent condition',
            price: 3500,
            category: 'electronics',
            location: 'الرياض',
            images: JSON.stringify(['https://via.placeholder.com/400x300/45B7D1/FFFFFF?text=لابتوب+ديل']),
            createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
        },
        {
            title: 'خدمة تصميم مواقع إلكترونية',
            titleAr: 'خدمة تصميم مواقع إلكترونية',
            titleEn: 'Website Design Service',
            description: 'تصميم مواقع احترافية بأسعار تنافسية',
            descriptionAr: 'تصميم مواقع احترافية بأسعار تنافسية',
            descriptionEn: 'Professional website design at competitive prices',
            price: 5000,
            category: 'services',
            location: 'الرياض',
            images: JSON.stringify(['https://via.placeholder.com/400x300/FFA07A/FFFFFF?text=تصميم+مواقع']),
            createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 1 week ago
        },
        {
            title: 'وظيفة مهندس مدني',
            titleAr: 'وظيفة مهندس مدني',
            titleEn: 'Civil Engineer Job',
            description: 'مطلوب مهندس مدني للعمل في مشاريع البنية التحتية',
            descriptionAr: 'مطلوب مهندس مدني للعمل في مشاريع البنية التحتية',
            descriptionEn: 'Civil engineer needed for infrastructure projects',
            price: null,
            category: 'jobs',
            location: 'جدة',
            images: JSON.stringify([]),
            createdAt: new Date(Date.now() - 10 * 60 * 1000), // 10 minutes ago
        },
        {
            title: 'شقة للبيع في حي المروج',
            titleAr: 'شقة للبيع في حي المروج',
            titleEn: 'Apartment for sale in Al Muruj district',
            description: 'شقة 3 غرف نوم مع حديقة خاصة',
            descriptionAr: 'شقة 3 غرف نوم مع حديقة خاصة',
            descriptionEn: '3 bedroom apartment with private garden',
            price: 1200000,
            category: 'realestate',
            location: 'الرياض',
            images: JSON.stringify(['https://via.placeholder.com/400x300/FFA07A/FFFFFF?text=شقة+للبيع']),
            createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000), // 4 days ago
        }
    ];

    for (const ad of ads) {
        await prisma.ad.create({
            data: {
                title: ad.title,
                titleAr: ad.titleAr,
                titleEn: ad.titleEn,
                description: ad.description,
                descriptionAr: ad.descriptionAr,
                descriptionEn: ad.descriptionEn,
                price: ad.price,
                category: ad.category,
                location: ad.location,
                images: ad.images,
                userId: testUser.id,
                createdAt: ad.createdAt,
            }
        });
    }

    console.log('✅ Global data and test ads seeding completed!');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
