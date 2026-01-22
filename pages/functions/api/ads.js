import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

function verifyToken(token) {
    try {
        return jwt.verify(token, process.env.JWT_SECRET || 'default-secret');
    } catch (error) {
        return null;
    }
}

export async function onRequest(context) {
    const { request } = context;

    if (request.method === 'POST') {
        // Create ad
        try {
            const authHeader = request.headers.get('Authorization');
            if (!authHeader || !authHeader.startsWith('Bearer ')) {
                return new Response(JSON.stringify({ error: 'Access denied' }), {
                    status: 401,
                    headers: { 'Content-Type': 'application/json' }
                });
            }

            const token = authHeader.replace('Bearer ', '');
            const decoded = verifyToken(token);
            if (!decoded) {
                return new Response(JSON.stringify({ error: 'Invalid token' }), {
                    status: 401,
                    headers: { 'Content-Type': 'application/json' }
                });
            }

            const adData = await request.json();

            // Remove authorId if exists
            const { authorId, ...data } = adData;
            if (data.currencyId) data.currencyId = data.currencyId.toLowerCase();

            const ad = await prisma.ad.create({
                data: {
                    ...data,
                    authorId: decoded.id
                }
            });

            return new Response(JSON.stringify(ad), {
                status: 201,
                headers: { 'Content-Type': 'application/json' }
            });
        } catch (error) {
            console.error('Error creating ad:', error);
            return new Response(JSON.stringify({ error: error.message }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }
    } else if (request.method === 'GET') {
        // Get ads
        try {
            const url = new URL(request.url);
            const filters = Object.fromEntries(url.searchParams);

            const ads = await getAllAds(filters);

            return new Response(JSON.stringify(ads), {
                headers: { 'Content-Type': 'application/json' }
            });
        } catch (error) {
            return new Response(JSON.stringify({ error: error.message }), {
                status: 500,
                headers: { 'Content-Type': 'application/json' }
            });
        }
    }

    return new Response('Method not allowed', { status: 405 });
}

// Copy getAllAds logic
async function getAllAds(filters) {
    const { category, cityId, minPrice, maxPrice, search, location, type, priceRange, hasMedia, limit, sortBy, sortOrder, authorId } = filters;

    try {
        const where = {};
        if (authorId) {
            where.authorId = authorId;
        } else {
            where.isActive = true;
        }

        if (category) where.category = category;
        if (cityId) where.cityId = cityId;

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

        // Add other filters similarly...

        const queryOptions = {
            where,
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
            orderBy: [{ isBoosted: 'desc' }, { createdAt: 'desc' }]
        };

        if (limit) {
            queryOptions.take = parseInt(limit);
        }

        const ads = await prisma.ad.findMany(queryOptions);

        return ads.map(ad => ({
            ...ad,
            createdAt: ad.createdAt || new Date().toISOString()
        }));
    } catch (error) {
        console.log('Database error:', error.message);
        return [];
    }
}