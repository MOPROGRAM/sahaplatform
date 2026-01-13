const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const getAllAds = async (filters) => {
    const { category, cityId, minPrice, maxPrice, searchQuery } = filters;

    try {
        return await prisma.ad.findMany({
            where: {
                AND: [
                    { isActive: true }, // Only show active ads
                    category ? { category } : {},
                    cityId ? { cityId } : {},
                    searchQuery ? {
                        OR: [
                            { title: { contains: searchQuery, mode: 'insensitive' } },
                            { titleAr: { contains: searchQuery, mode: 'insensitive' } },
                            { titleEn: { contains: searchQuery, mode: 'insensitive' } },
                            { description: { contains: searchQuery, mode: 'insensitive' } },
                            { descriptionAr: { contains: searchQuery, mode: 'insensitive' } },
                            { descriptionEn: { contains: searchQuery, mode: 'insensitive' } }
                        ]
                    } : {},
                    minPrice ? { price: { gte: parseFloat(minPrice) } } : {},
                    maxPrice ? { price: { lte: parseFloat(maxPrice) } } : {},
                ]
            },
            include: {
                author: {
                    select: { id: true, name: true, verified: true, phone: true }
                },
                city: {
                    include: {
                        country: true
                    }
                },
                currency: true
            },
            orderBy: { createdAt: 'desc' }
        });
    } catch (error) {
        // If tables don't exist yet, return empty array
        console.log('Database not initialized yet, returning empty ads');
        return [];
    }
};

const createAd = async (adData, userId) => {
    try {
        return await prisma.ad.create({
            data: {
                ...adData,
                authorId: userId
            }
        });
    } catch (error) {
        console.error('Database not initialized yet:', error.message);
        throw new Error('قاعدة البيانات غير مهيكلة بعد. يرجى تشغيل /api/setup-database أولاً');
    }
};

const getAdById = async (id) => {
    try {
        // Increment view count
        await prisma.ad.update({
            where: { id },
            data: { views: { increment: 1 } }
        });

        return await prisma.ad.findUnique({
            where: { id },
            include: {
                author: {
                    select: { id: true, name: true, verified: true, phone: true, email: true }
                },
                city: {
                    include: {
                        country: true
                    }
                },
                currency: true,
                conversations: {
                    include: {
                        messages: {
                            orderBy: { createdAt: 'desc' },
                            take: 1
                        }
                    }
                }
            }
        });
    } catch (error) {
        console.log('Database not initialized yet, returning null');
        return null;
    }
};

module.exports = {
    getAllAds,
    createAd,
    getAdById
};
