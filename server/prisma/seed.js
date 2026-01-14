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

    console.log('✅ Global data seeding completed!');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
