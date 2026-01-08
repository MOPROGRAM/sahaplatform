const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log('Seeding database...');

    // Create a default user
    const user = await prisma.user.upsert({
        where: { email: 'admin@saha.com' },
        update: {},
        create: {
            email: 'admin@saha.com',
            password: 'password123', // In real app, this should be hashed
            name: 'مدير ساحة',
            role: 'ADMIN',
            verified: true,
        },
    });

    const merchant = await prisma.user.upsert({
        where: { email: 'merchant@saha.com' },
        update: {},
        create: {
            email: 'merchant@saha.com',
            password: 'password123',
            name: 'شركة الرواد العقارية',
            role: 'MERCHANT',
            verified: true,
        },
    });

    // Create sample ads
    const ads = [
        {
            title: 'شقة فاخرة للبيع - حي الملقا',
            description: 'شقة 3 غرف وصالة في موقع متميز بالرياض.',
            price: 1250000,
            category: 'Real Estate',
            location: 'الرياض، حي الملقا',
            authorId: merchant.id,
        },
        {
            title: 'مطلوب مبرمج واجهات - React/Next.js',
            description: 'شركة تقنية ناشئة تبحث عن مبرمج واجهات بخبرة سنتين.',
            price: 15000,
            category: 'Jobs',
            location: 'الرياض، عن بعد',
            authorId: user.id,
        },
        {
            title: 'سيارة تويوتا كامري 2024 - جديدة',
            description: 'تويوتا كامري فئة GLE، اللون أبيض، فتحة سقف.',
            price: 115000,
            category: 'Vehicles',
            location: 'جدة، حي السامر',
            authorId: merchant.id,
        }
    ];

    for (const ad of ads) {
        await prisma.ad.create({ data: ad });
    }

    console.log('Seeding finished!');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
