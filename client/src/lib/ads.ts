import { supabase } from './supabase';

// أنواع البيانات للإعلانات
import { Database } from '@/types/database.types'

export type Ad = {
    id: string;
    title: string;
    description: string;
    price: number | null;
    currencyId: string;
    category: string;
    subCategory?: string | null;
    location: string | null;
    address?: string | null;
    paymentMethod?: string | null;
    cityId?: string | null;
    latitude?: number | null;
    longitude?: number | null;
    images: string;
    video?: string | null;
    isBoosted: boolean;
    isActive: boolean;
    views: number;
    userId: string;
    createdAt: string;
    updatedAt: string;
    phone?: string;
    email?: string;
    // Relations
    author?: {
        id: string;
        name?: string;
        email: string;
        phone?: string;
    };
    city?: {
        id: string;
        name: string;
        nameAr?: string;
        nameEn?: string;
    };
    currency?: {
        id: string;
        code: string;
        symbol: string;
        name: string;
    };
}

// Service to manage ads using Supabase directly
export const adsService = {
    // Get all ads with filters
    async getAds(filters: {
        category?: string;
        subCategory?: string;
        search?: string;
        limit?: number;
        minPrice?: number;
        maxPrice?: number;
        cityId?: string;
        sortBy?: string;
        sortOrder?: 'asc' | 'desc';
        tags?: string[];
        minArea?: number;
        maxArea?: number;
        isBoosted?: boolean;
    } = {}) {
        try {
            let query = (supabase as any)
                .from('Ad')
                .select(`
                    *,
                    author:User!author_id(id, name, email),
                    city:City!city_id(id, name, nameAr, nameEn),
                    currency:Currency!currency_id(id, code, symbol, name)
                `)
                .eq('is_active', true);

            // Filter by isBoosted
            if (filters.isBoosted !== undefined) {
                query = query.eq('is_boosted', filters.isBoosted);
            }

            // Filter by category
            if (filters.category) {
                query = query.eq('category', filters.category);
            }

            // Filter by subcategory
            if (filters.subCategory) {
                // Since subCategory column might not exist, we search in description/title
                query = query.or(`title.ilike.%${filters.subCategory}%,description.ilike.%${filters.subCategory}%`);
            }

            // Simple search by title and description
            if (filters.search) {
                query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
            }

            // Price Filter
            if (filters.minPrice) {
                query = query.gte('price', filters.minPrice);
            }
            if (filters.maxPrice) {
                query = query.lte('price', filters.maxPrice);
            }

            // Area Filter - disabled as column doesn't exist in schema
            /*
            if (filters.minArea) {
                query = query.gte('area', filters.minArea);
            }
            if (filters.maxArea) {
                query = query.lte('area', filters.maxArea);
            }
            */

            // Tags Filter (Rent/Sale etc)
            if (filters.tags && filters.tags.length > 0) {
                filters.tags.forEach(tag => {
                    // If tag is rent or sale, we might check a specific column if it exists, 
                    // or just search in text if that's how it's implemented. 
                    // Assuming text search based on previous implementation:
                    let tagConditions = `subCategory.ilike.%${tag}%,title.ilike.%${tag}%,description.ilike.%${tag}%`;
                    if (tag === 'rent') tagConditions += `,title.ilike.%إيجار%,description.ilike.%إيجار%`;
                    if (tag === 'sale') tagConditions += `,title.ilike.%بيع%,description.ilike.%بيع%`;
                    query = query.or(tagConditions);
                });
            }

            // City/Location Filter
            if (filters.cityId) {
                query = query.eq('city_id', filters.cityId);
            }

            // Sort
            if (filters.sortBy) {
                // Map camelCase sortBy to snake_case column
                const sortColumn = filters.sortBy === 'createdAt' ? 'created_at' : 
                                   filters.sortBy === 'price' ? 'price' : 'created_at';
                query = query.order(sortColumn, { ascending: filters.sortOrder === 'asc' });
            } else {
                query = query.order('created_at', { ascending: false });
            }

            const limit = filters.limit || 50;
            query = query.limit(limit);

            const { data, error } = await query;

            if (error) {
                console.error('Error fetching ads:', error);
                return [];
            }

            // Map snake_case to camelCase
            return (data || []).map((ad: any) => ({
                ...ad,
                userId: ad.author_id,
                cityId: ad.city_id,
                currencyId: ad.currency_id,
                isActive: ad.is_active,
                isBoosted: ad.is_boosted,
                createdAt: ad.created_at,
                updatedAt: ad.updated_at,
                paymentMethod: ad.payment_method,
                subCategory: ad.sub_category // Map sub_category to subCategory
            }));
        } catch (error) {
            console.error('Unexpected error fetching ads:', error);
            return [];
        }
    },

    // Get single ad
    async getAd(id: string, searchAll: boolean = false): Promise<Ad | null> {
        try {
            let query = (supabase as any)
                .from('Ad')
                .select(`
                    *,
                    author:User!author_id(id, name, email),
                    city:City!city_id(id, name, nameAr, nameEn),
                    currency:Currency!currency_id(id, code, symbol, name)
                `)
                .eq('id', id);

            if (!searchAll) {
                query = query.eq('is_active', true);
            }

            const { data, error } = await query.single();

            if (error) {
                console.error('Error fetching ad:', error);
                return null;
            }

            // Map snake_case to camelCase
            const ad = data as any;
            return {
                ...ad,
                userId: ad.author_id,
                cityId: ad.city_id,
                currencyId: ad.currency_id,
                isActive: ad.is_active,
                isBoosted: ad.is_boosted,
                createdAt: ad.created_at,
                updatedAt: ad.updated_at,
                paymentMethod: ad.payment_method,
                subCategory: ad.sub_category
            };
        } catch (error) {
            console.error('Unexpected error fetching ad:', error);
            return null;
        }
    },

    // Get user's ads
    async getMyAds(): Promise<Ad[]> {
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            throw new Error('User not authenticated');
        }

        const { data, error } = await (supabase as any)
            .from('Ad')
            .select(`
                *,
                author:User!author_id(id, name, email, phone),
                city:City!city_id(id, name, nameAr, nameEn),
                currency:Currency!currency_id(id, code, symbol, name)
            `)
            .eq('author_id', user.id)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching my ads:', error);
            throw new Error('Failed to fetch your ads');
        }

        // Map snake_case to camelCase
        return (data || []).map((ad: any) => ({
            ...ad,
            userId: ad.author_id,
            cityId: ad.city_id,
            currencyId: ad.currency_id,
            isActive: ad.is_active,
            isBoosted: ad.is_boosted,
            createdAt: ad.created_at,
            updatedAt: ad.updated_at,
            paymentMethod: ad.payment_method,
            subCategory: ad.sub_category
        }));
    },

    // Create new ad
    async createAd(adData: any): Promise<Ad> {
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            throw new Error('User not authenticated');
        }

        // Convert camelCase to snake_case for DB
        const dbData = {
            title: adData.title,
            description: adData.description,
            price: adData.price,
            category: adData.category,
            sub_category: adData.subCategory, // Assuming sub_category exists, if not, it might be ignored or fail
            location: adData.location,
            images: adData.images,
            video: adData.video,
            author_id: user.id,
            city_id: adData.cityId,
            currency_id: adData.currencyId || 'sar', // Default to SAR if not provided
            is_boosted: adData.isBoosted || false,
            is_active: true, // Default active
            payment_method: adData.paymentMethod,
            phone: adData.phone,
            email: adData.email,
            latitude: adData.latitude,
            longitude: adData.longitude
        };

        const { data, error } = await (supabase as any)
            .from('Ad')
            .insert(dbData)
            .select(`
                *,
                author:User!author_id(id, name, email, phone),
                city:City!city_id(id, name, nameAr, nameEn),
                currency:Currency!currency_id(id, code, symbol, name)
            `)
            .single();

        if (error) {
            console.error('Error creating ad:', error);
            throw new Error('Failed to create ad');
        }

        // Map back to camelCase
        const ad = data as any;
        return {
            ...ad,
            userId: ad.author_id,
            cityId: ad.city_id,
            currencyId: ad.currency_id,
            isActive: ad.is_active,
            isBoosted: ad.is_boosted,
            createdAt: ad.created_at,
            updatedAt: ad.updated_at,
            paymentMethod: ad.payment_method
        } as Ad;
    },

    // Update ad
    async updateAd(id: string, updates: any): Promise<Ad> {
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            throw new Error('User not authenticated');
        }

        // Map camelCase updates to snake_case
        const dbUpdates: any = {};
        if (updates.title) dbUpdates.title = updates.title;
        if (updates.description) dbUpdates.description = updates.description;
        if (updates.price) dbUpdates.price = updates.price;
        if (updates.category) dbUpdates.category = updates.category;
        if (updates.subCategory) dbUpdates.sub_category = updates.subCategory;
        if (updates.location) dbUpdates.location = updates.location;
        if (updates.images) dbUpdates.images = updates.images;
        if (updates.video) dbUpdates.video = updates.video;
        if (updates.cityId) dbUpdates.city_id = updates.cityId;
        if (updates.currencyId) dbUpdates.currency_id = updates.currencyId;
        if (updates.isBoosted !== undefined) dbUpdates.is_boosted = updates.isBoosted;
        if (updates.isActive !== undefined) dbUpdates.is_active = updates.isActive;
        if (updates.paymentMethod) dbUpdates.payment_method = updates.paymentMethod;
        if (updates.phone) dbUpdates.phone = updates.phone;
        if (updates.email) dbUpdates.email = updates.email;
        if (updates.latitude) dbUpdates.latitude = updates.latitude;
        if (updates.longitude) dbUpdates.longitude = updates.longitude;


        const { data, error } = await (supabase as any)
            .from('Ad')
            .update(dbUpdates)
            .eq('id', id)
            .eq('author_id', user.id) // Security check
            .select(`
                *,
                author:User!author_id(id, name, email, phone),
                city:City!city_id(id, name, nameAr, nameEn),
                currency:Currency!currency_id(id, code, symbol, name)
            `)
            .single();

        if (error) {
            console.error('Error updating ad:', error);
            throw new Error('Failed to update ad');
        }

        // Map back to camelCase
        const ad = data as any;
        return {
            ...ad,
            userId: ad.author_id,
            cityId: ad.city_id,
            currencyId: ad.currency_id,
            isActive: ad.is_active,
            isBoosted: ad.is_boosted,
            createdAt: ad.created_at,
            updatedAt: ad.updated_at,
            paymentMethod: ad.payment_method
        } as Ad;
    },

    // Delete ad
    async deleteAd(id: string): Promise<void> {
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            throw new Error('User not authenticated');
        }

        const { error } = await (supabase as any)
            .from('Ad')
            .delete()
            .eq('id', id)
            .eq('author_id', user.id); // Security check

        if (error) {
            console.error('Error deleting ad:', error);
            throw new Error('Failed to delete ad');
        }
    },

    // Increment views
    async incrementViews(id: string): Promise<void> {
        const { error } = await supabase.rpc('increment_ad_views', { adId: id });
        if (error) {
            console.warn('Failed to increment views:', error);
        }
    }
};
