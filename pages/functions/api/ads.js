export async function onRequestGet({ env }) {
    try {
        // Get all ads from D1 database
        const { results } = await env.DB.prepare(`
            SELECT
                id,
                title,
                titleAr,
                titleEn,
                description,
                descriptionAr,
                descriptionEn,
                price,
                currencyId,
                category,
                cityId,
                latitude,
                longitude,
                images,
                video,
                isBoosted,
                isActive,
                views,
                authorId,
                createdAt,
                updatedAt
            FROM Ad
            WHERE isActive = 1
            ORDER BY createdAt DESC
            LIMIT 50
        `).all();

        // Transform data to match frontend expectations
        const ads = results.map(ad => ({
            id: ad.id,
            title: ad.title || ad.titleAr || ad.titleEn,
            description: ad.description || ad.descriptionAr || ad.descriptionEn,
            price: ad.price,
            currency: ad.currencyId || 'SAR',
            category: ad.category,
            location: ad.cityId || 'Unknown',
            latitude: ad.latitude,
            longitude: ad.longitude,
            images: ad.images ? JSON.parse(ad.images) : [],
            video: ad.video,
            isBoosted: ad.isBoosted === 1,
            views: ad.views,
            author: {
                id: ad.authorId,
                name: 'User', // You can join with User table later
                verified: false
            },
            createdAt: ad.createdAt
        }));

        return new Response(JSON.stringify(ads), {
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, Authorization'
            }
        });

    } catch (error) {
        console.error('Error fetching ads:', error);
        return new Response(JSON.stringify({
            error: 'Failed to fetch ads',
            message: error.message
        }), {
            status: 500,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            }
        });
    }
}

export async function onRequestPost({ request, env }) {
    try {
        const body = await request.json();

        // Insert new ad
        const result = await env.DB.prepare(`
            INSERT INTO Ad (
                id, title, titleAr, titleEn, description, descriptionAr, descriptionEn,
                price, currencyId, category, cityId, latitude, longitude, images,
                video, isBoosted, isActive, views, authorId, createdAt, updatedAt
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).bind(
            crypto.randomUUID(),
            body.title,
            body.titleAr,
            body.titleEn,
            body.description,
            body.descriptionAr,
            body.descriptionEn,
            body.price,
            body.currencyId || 'SAR',
            body.category,
            body.cityId,
            body.latitude,
            body.longitude,
            JSON.stringify(body.images || []),
            body.video,
            body.isBoosted ? 1 : 0,
            1, // isActive
            0, // views
            body.authorId || 'anonymous',
            new Date().toISOString(),
            new Date().toISOString()
        ).run();

        return new Response(JSON.stringify({
            success: true,
            message: 'Ad created successfully',
            id: result.meta.last_row_id
        }), {
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            }
        });

    } catch (error) {
        console.error('Error creating ad:', error);
        return new Response(JSON.stringify({
            error: 'Failed to create ad',
            message: error.message
        }), {
            status: 500,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            }
        });
    }
}