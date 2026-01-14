const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const getAllAds = async (filters) => {
    const { category, cityId, minPrice, maxPrice, searchQuery, authorId } = filters;

    try {
        return await prisma.ad.findMany({
            where: {
                AND: [
                    authorId ? { authorId } : { isActive: true }, // If searching my ads, show all. Otherwise only active.
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
        console.log('Database error:', error.message);
        return [];
    }
};

const createAd = async (adData, userId) => {
    try {
        // Remove authorId from adData if it exists to avoid duplication with userId param
        const { authorId, ...data } = adData;
        return await prisma.ad.create({
            data: {
                ...data,
                authorId: userId
            }
        });
    } catch (error) {
        console.error('Database error:', error.message);
        throw new Error('فشل في إنشاء الإعلان. تأكد من أن قاعدة البيانات جاهزة.');
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
