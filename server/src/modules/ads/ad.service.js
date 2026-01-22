const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const getAllAds = async (filters) => {
    const { category, cityId, minPrice, maxPrice, search, location, type, priceRange, hasMedia, limit, sortBy, sortOrder, userId } = filters;

    try {
        const where = {};
        if (userId) {
            where.userId = userId;
        } else {
            where.isActive = true;
        }

        // Category filter
        if (category) where.category = category;

        // City filter
        if (cityId) where.cityId = cityId;

        // Search filter
        if (search && typeof search === 'string') {
            where.OR = [
                { title: { contains: search.toLowerCase() } },
                { titleAr: { contains: search.toLowerCase() } },
                { titleEn: { contains: search.toLowerCase() } },
                { description: { contains: search.toLowerCase() } },
                { descriptionAr: { contains: search.toLowerCase() } },
                { descriptionEn: { contains: search.toLowerCase() } }
            ];
        }

        // Location filter (search in location field)
        if (location) {
            const locations = Array.isArray(location) ? location : location.split(',');
            where.OR = where.OR || [];
            locations.forEach(loc => {
                where.OR.push({ location: { contains: loc.trim() } });
            });
        }

        // Type filter (search in title/description)
        if (type) {
            const types = Array.isArray(type) ? type : type.split(',');
            where.OR = where.OR || [];
            types.forEach(t => {
                where.OR.push(
                    { title: { contains: t.trim() } },
                    { description: { contains: t.trim() } }
                );
            });
        }

        // Price range filter
        if (priceRange) {
            const ranges = Array.isArray(priceRange) ? priceRange : priceRange.split(',');
            where.OR = where.OR || [];
            ranges.forEach(range => {
                const [min, max] = range.split('-').map(r => parseFloat(r));
                const priceCondition = {};
                if (!isNaN(min)) priceCondition.gte = min;
                if (!isNaN(max) && max < Infinity) priceCondition.lte = max;
                if (Object.keys(priceCondition).length > 0) {
                    where.OR.push({ price: priceCondition });
                }
            });
        }

        // Legacy price filters
        if (minPrice || maxPrice) {
            where.price = {};
            if (minPrice) where.price.gte = parseFloat(minPrice);
            if (maxPrice) where.price.lte = parseFloat(maxPrice);
        }

        // Media filter
        if (hasMedia === true) {
            where.OR = where.OR || [];
            where.OR.push(
                { images: { not: { equals: '[]' } } },
                { latitude: { not: null } },
                { allowNoMedia: true }
            );
        }

        // Sorting
        const orderBy = [];
        if (sortBy === 'created_at') {
            orderBy.push({ createdAt: sortOrder === 'asc' ? 'asc' : 'desc' });
        } else {
            orderBy.push({ isBoosted: 'desc' }, { createdAt: 'desc' });
        }

        const queryOptions = {
            where,
            include: {
                user: {
                    select: { id: true, name: true, verified: true, phone: true }
                },
                city: {
                    include: {
                        country: true
                    }
                },
                currency: true
            },
            orderBy
        };

        // Limit
        if (limit) {
            queryOptions.take = parseInt(limit);
        }

        const ads = await prisma.ad.findMany(queryOptions);

        // Ensure all ads have valid createdAt
        return ads.map(ad => ({
            ...ad,
            createdAt: ad.createdAt || new Date().toISOString()
        }));
    } catch (error) {
        console.log('Database error:', error.message);
        return [];
    }
};

const createAd = async (adData, userId) => {
    try {
        // Remove userId from adData if it exists to avoid duplication with userId param
        const { userId, ...data } = adData;
        // Normalize currencyId to lowercase
        if (data.currencyId) data.currencyId = data.currencyId.toLowerCase();
        return await prisma.ad.create({
            data: {
                ...data,
                userId: userId
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
                user: {
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

const updateAd = async (id, adData, userId) => {
    try {
        const ad = await prisma.ad.findUnique({ where: { id } });
        if (!ad) throw new Error('Ad not found');
        if (ad.userId !== userId) throw new Error('Unauthorized');

        return await prisma.ad.update({
            where: { id },
            data: adData
        });
    } catch (error) {
        console.error('Database error:', error.message);
        throw new Error('Failed to update ad');
    }
};

const deleteAd = async (id, userId) => {
    try {
        const ad = await prisma.ad.findUnique({ where: { id } });
        if (!ad) throw new Error('Ad not found');
        if (ad.userId !== userId) throw new Error('Unauthorized');

        // Soft delete
        return await prisma.ad.update({
            where: { id },
            data: { isActive: false }
        });
    } catch (error) {
        console.error('Database error:', error.message);
        throw new Error('Failed to delete ad');
    }
};

module.exports = {
    getAllAds,
    createAd,
    getAdById,
    updateAd,
    deleteAd
};
