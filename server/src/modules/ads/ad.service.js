const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const getAllAds = async (filters) => {
    const { category, location, minPrice, maxPrice, searchQuery } = filters;

    return await prisma.ad.findMany({
        where: {
            AND: [
                category ? { category } : {},
                location ? { location: { contains: location, mode: 'insensitive' } } : {},
                searchQuery ? {
                    OR: [
                        { title: { contains: searchQuery, mode: 'insensitive' } },
                        { description: { contains: searchQuery, mode: 'insensitive' } }
                    ]
                } : {},
                minPrice ? { price: { gte: parseFloat(minPrice) } } : {},
                maxPrice ? { price: { lte: parseFloat(maxPrice) } } : {},
            ]
        },
        include: {
            author: {
                select: { name: true, verified: true }
            }
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
    return await prisma.ad.findUnique({
        where: { id },
        include: {
            author: {
                select: { name: true, verified: true, phone: true, location: true }
            }
        }
    });
};

module.exports = {
    getAllAds,
    createAd,
    getAdById
};
