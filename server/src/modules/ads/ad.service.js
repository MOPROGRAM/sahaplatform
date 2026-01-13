const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const getAllAds = async (filters) => {
    const { category, cityId, minPrice, maxPrice, searchQuery } = filters;

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
};

const createAd = async (adData, userId) => {
    return await prisma.ad.create({
        data: {
            ...adData,
            authorId: userId
        }
    });
};

const getAdById = async (id) => {
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
};

module.exports = {
    getAllAds,
    createAd,
    getAdById
};
