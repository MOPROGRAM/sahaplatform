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
    { code: 'LB', nameAr: 'لبنان', nameEn: 'Lebanon', phoneCode: '+961', currencyCode: 'USD', flag: '🇱🇧' },
    { code: 'IQ', nameAr: 'العراق', nameEn: 'Iraq', phoneCode: '+964', currencyCode: 'USD', flag: '🇮🇶' },
    { code: 'SY', nameAr: 'سوريا', nameEn: 'Syria', phoneCode: '+963', currencyCode: 'USD', flag: '🇸🇾' },
    { code: 'YE', nameAr: 'اليمن', nameEn: 'Yemen', phoneCode: '+967', currencyCode: 'USD', flag: '🇾🇪' },
    { code: 'TN', nameAr: 'تونس', nameEn: 'Tunisia', phoneCode: '+216', currencyCode: 'USD', flag: '🇹🇳' },
    { code: 'DZ', nameAr: 'الجزائر', nameEn: 'Algeria', phoneCode: '+213', currencyCode: 'USD', flag: '🇩🇿' },
    { code: 'MA', nameAr: 'المغرب', nameEn: 'Morocco', phoneCode: '+212', currencyCode: 'USD', flag: '🇲🇦' },
    { code: 'LY', nameAr: 'ليبيا', nameEn: 'Libya', phoneCode: '+218', currencyCode: 'USD', flag: '🇱🇾' },
    { code: 'SD', nameAr: 'السودان', nameEn: 'Sudan', phoneCode: '+249', currencyCode: 'USD', flag: '🇸🇩' },
    { code: 'SO', nameAr: 'الصومال', nameEn: 'Somalia', phoneCode: '+252', currencyCode: 'USD', flag: '🇸🇴' },
    { code: 'DJ', nameAr: 'جيبوتي', nameEn: 'Djibouti', phoneCode: '+253', currencyCode: 'USD', flag: '🇩🇯' },
    { code: 'KM', nameAr: 'جزر القمر', nameEn: 'Comoros', phoneCode: '+269', currencyCode: 'USD', flag: '🇰🇲' },
    { code: 'US', nameAr: 'الولايات المتحدة', nameEn: 'United States', phoneCode: '+1', currencyCode: 'USD', flag: '🇺🇸' },
    { code: 'GB', nameAr: 'المملكة المتحدة', nameEn: 'United Kingdom', phoneCode: '+44', currencyCode: 'GBP', flag: '🇬🇧' },
    { code: 'DE', nameAr: 'ألمانيا', nameEn: 'Germany', phoneCode: '+49', currencyCode: 'EUR', flag: '🇩🇪' },
    { code: 'FR', nameAr: 'فرنسا', nameEn: 'France', phoneCode: '+33', currencyCode: 'EUR', flag: '🇫🇷' },
    { code: 'IT', nameAr: 'إيطاليا', nameEn: 'Italy', phoneCode: '+39', currencyCode: 'EUR', flag: '🇮🇹' },
    { code: 'ES', nameAr: 'إسبانيا', nameEn: 'Spain', phoneCode: '+34', currencyCode: 'EUR', flag: '🇪🇸' },
    { code: 'TR', nameAr: 'تركيا', nameEn: 'Turkey', phoneCode: '+90', currencyCode: 'USD', flag: '🇹🇷' },
    { code: 'IR', nameAr: 'إيران', nameEn: 'Iran', phoneCode: '+98', currencyCode: 'USD', flag: '🇮🇷' },
    { code: 'PK', nameAr: 'باكستان', nameEn: 'Pakistan', phoneCode: '+92', currencyCode: 'USD', flag: '🇵🇰' },
    { code: 'IN', nameAr: 'الهند', nameEn: 'India', phoneCode: '+91', currencyCode: 'USD', flag: '🇮🇳' },
    { code: 'CN', nameAr: 'الصين', nameEn: 'China', phoneCode: '+86', currencyCode: 'USD', flag: '🇨🇳' },
    { code: 'JP', nameAr: 'اليابان', nameEn: 'Japan', phoneCode: '+81', currencyCode: 'USD', flag: '🇯🇵' },
    { code: 'KR', nameAr: 'كوريا الجنوبية', nameEn: 'South Korea', phoneCode: '+82', currencyCode: 'USD', flag: '🇰🇷' },
    { code: 'AU', nameAr: 'أستراليا', nameEn: 'Australia', phoneCode: '+61', currencyCode: 'USD', flag: '🇦🇺' },
    { code: 'CA', nameAr: 'كندا', nameEn: 'Canada', phoneCode: '+1', currencyCode: 'USD', flag: '🇨🇦' },
    { code: 'BR', nameAr: 'البرازيل', nameEn: 'Brazil', phoneCode: '+55', currencyCode: 'USD', flag: '🇧🇷' },
    { code: 'MX', nameAr: 'المكسيك', nameEn: 'Mexico', phoneCode: '+52', currencyCode: 'USD', flag: '🇲🇽' },
    { code: 'AR', nameAr: 'الأرجنتين', nameEn: 'Argentina', phoneCode: '+54', currencyCode: 'USD', flag: '🇦🇷' },
    { code: 'ZA', nameAr: 'جنوب أفريقيا', nameEn: 'South Africa', phoneCode: '+27', currencyCode: 'USD', flag: '🇿🇦' },
    { code: 'NG', nameAr: 'نيجيريا', nameEn: 'Nigeria', phoneCode: '+234', currencyCode: 'USD', flag: '🇳🇬' },
    { code: 'KE', nameAr: 'كينيا', nameEn: 'Kenya', phoneCode: '+254', currencyCode: 'USD', flag: '🇰🇪' },
    { code: 'GH', nameAr: 'غانا', nameEn: 'Ghana', phoneCode: '+233', currencyCode: 'USD', flag: '🇬🇭' },
    { code: 'UG', nameAr: 'أوغندا', nameEn: 'Uganda', phoneCode: '+256', currencyCode: 'USD', flag: '🇺🇬' },
];

const cities = [
    // Saudi Arabia
    { nameAr: 'الرياض', nameEn: 'Riyadh', countryCode: 'SA', lat: 24.7136, lng: 46.6753 },
    { nameAr: 'جدة', nameEn: 'Jeddah', countryCode: 'SA', lat: 21.4858, lng: 39.1925 },
    { nameAr: 'مكة المكرمة', nameEn: 'Mecca', countryCode: 'SA', lat: 21.3891, lng: 39.8579 },
    { nameAr: 'المدينة المنورة', nameEn: 'Medina', countryCode: 'SA', lat: 24.5247, lng: 39.5692 },
    { nameAr: 'الدمام', nameEn: 'Dammam', countryCode: 'SA', lat: 26.4207, lng: 50.0888 },
    { nameAr: 'الخبر', nameEn: 'Khobar', countryCode: 'SA', lat: 26.2172, lng: 50.1971 },
    { nameAr: 'الظهران', nameEn: 'Dhahran', countryCode: 'SA', lat: 26.2361, lng: 50.0393 },
    { nameAr: 'الطائف', nameEn: 'Taif', countryCode: 'SA', lat: 21.2703, lng: 40.4158 },
    { nameAr: 'تبوك', nameEn: 'Tabuk', countryCode: 'SA', lat: 28.3838, lng: 36.5549 },
    { nameAr: 'أبها', nameEn: 'Abha', countryCode: 'SA', lat: 18.2164, lng: 42.5053 },

    // UAE
    { nameAr: 'دبي', nameEn: 'Dubai', countryCode: 'AE', lat: 25.2048, lng: 55.2708 },
    { nameAr: 'أبوظبي', nameEn: 'Abu Dhabi', countryCode: 'AE', lat: 24.4539, lng: 54.3773 },
    { nameAr: 'الشارقة', nameEn: 'Sharjah', countryCode: 'AE', lat: 25.3374, lng: 55.4121 },
    { nameAr: 'عجمان', nameEn: 'Ajman', countryCode: 'AE', lat: 25.4052, lng: 55.5136 },
    { nameAr: 'رأس الخيمة', nameEn: 'Ras Al Khaimah', countryCode: 'AE', lat: 25.6741, lng: 55.9804 },
    { nameAr: 'الفجيرة', nameEn: 'Fujairah', countryCode: 'AE', lat: 25.1122, lng: 56.3414 },

    // Egypt
    { nameAr: 'القاهرة', nameEn: 'Cairo', countryCode: 'EG', lat: 30.0444, lng: 31.2357 },
    { nameAr: 'الإسكندرية', nameEn: 'Alexandria', countryCode: 'EG', lat: 31.2001, lng: 29.9187 },
    { nameAr: 'الجيزة', nameEn: 'Giza', countryCode: 'EG', lat: 29.9870, lng: 31.2118 },
    { nameAr: 'شبرا الخيمة', nameEn: 'Shubra El-Kheima', countryCode: 'EG', lat: 30.1286, lng: 31.2422 },
    { nameAr: 'بورسعيد', nameEn: 'Port Said', countryCode: 'EG', lat: 31.2565, lng: 32.2841 },
    { nameAr: 'السويس', nameEn: 'Suez', countryCode: 'EG', lat: 29.9668, lng: 32.5498 },
    { nameAr: 'المنصورة', nameEn: 'Mansoura', countryCode: 'EG', lat: 31.0364, lng: 31.3807 },
    { nameAr: 'طنطا', nameEn: 'Tanta', countryCode: 'EG', lat: 30.7885, lng: 31.0019 },
    { nameAr: 'أسيوط', nameEn: 'Asyut', countryCode: 'EG', lat: 27.1801, lng: 31.1837 },
    { nameAr: 'الأقصر', nameEn: 'Luxor', countryCode: 'EG', lat: 25.6872, lng: 32.6396 },

    // Kuwait
    { nameAr: 'الكويت', nameEn: 'Kuwait City', countryCode: 'KW', lat: 29.3759, lng: 47.9774 },
    { nameAr: 'حولي', nameEn: 'Hawalli', countryCode: 'KW', lat: 29.3328, lng: 48.0286 },
    { nameAr: 'الفروانية', nameEn: 'Farwaniya', countryCode: 'KW', lat: 29.2775, lng: 47.9589 },
    { nameAr: 'الجهراء', nameEn: 'Jahra', countryCode: 'KW', lat: 29.3375, lng: 47.6581 },

    // Bahrain
    { nameAr: 'المنامة', nameEn: 'Manama', countryCode: 'BH', lat: 26.2235, lng: 50.5876 },
    { nameAr: 'المحرق', nameEn: 'Muharraq', countryCode: 'BH', lat: 26.2682, lng: 50.6119 },
    { nameAr: 'مدينة عيسى', nameEn: 'Isa Town', countryCode: 'BH', lat: 26.1736, lng: 50.5478 },

    // Qatar
    { nameAr: 'الدوحة', nameEn: 'Doha', countryCode: 'QA', lat: 25.2854, lng: 51.5310 },
    { nameAr: 'الريان', nameEn: 'Al Rayyan', countryCode: 'QA', lat: 25.2919, lng: 51.4244 },
    { nameAr: 'الوكرة', nameEn: 'Al Wakrah', countryCode: 'QA', lat: 25.1653, lng: 51.5976 },

    // Oman
    { nameAr: 'مسقط', nameEn: 'Muscat', countryCode: 'OM', lat: 23.5880, lng: 58.3829 },
    { nameAr: 'صلالة', nameEn: 'Salalah', countryCode: 'OM', lat: 17.0151, lng: 54.0924 },
    { nameAr: 'صحار', nameEn: 'Sohar', countryCode: 'OM', lat: 24.3461, lng: 56.7075 },

    // Jordan
    { nameAr: 'عمان', nameEn: 'Amman', countryCode: 'JO', lat: 31.9632, lng: 35.9304 },
    { nameAr: 'الزرقاء', nameEn: 'Zarqa', countryCode: 'JO', lat: 32.0608, lng: 36.0942 },
    { nameAr: 'إربد', nameEn: 'Irbid', countryCode: 'JO', lat: 32.5556, lng: 35.8543 },
];

async function main() {
    console.log('🌍 Seeding global data...');

    // Create currencies
    console.log('💰 Creating currencies...');
    for (const currency of currencies) {
        const existingCurrency = await prisma.currency.findUnique({
            where: { code: currency.code.toLowerCase() }
        });

        if (!existingCurrency) {
            await prisma.currency.create({
                data: {
                    code: currency.code.toLowerCase(),
                    symbol: currency.symbol,
                    name: currency.nameEn, // Required field
                    nameAr: currency.nameAr,
                    nameEn: currency.nameEn,
                },
            });
        }
    }

    // Create countries
    console.log('🇺🇳 Creating countries...');
    for (const country of countries) {
        const currency = await prisma.currency.findUnique({
            where: { code: country.currencyCode.toLowerCase() }
        });

        if (currency) {
            const existingCountry = await prisma.country.findUnique({
                where: { code: country.code }
            });

            if (!existingCountry) {
                await prisma.country.create({
                    data: {
                        code: country.code,
                        name: country.nameEn, // Required field
                        nameAr: country.nameAr,
                        nameEn: country.nameEn,
                        phoneCode: country.phoneCode,
                        currencyId: currency.id,
                        flag: country.flag,
                    },
                });
            }
        }
    }

    // Create cities
    console.log('🏙️ Creating cities...');
    for (const city of cities) {
        const country = await prisma.country.findUnique({
            where: { code: city.countryCode }
        });

        if (country) {
            const existingCity = await prisma.city.findUnique({
                where: {
                    name_countryId: {
                        name: city.nameAr,
                        countryId: country.id
                    }
                }
            });

            if (!existingCity) {
                await prisma.city.create({
                    data: {
                        name: city.nameAr, // Required field
                        nameAr: city.nameAr,
                        nameEn: city.nameEn,
                        countryId: country.id,
                        latitude: city.lat,
                        longitude: city.lng,
                    },
                });
            }
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
