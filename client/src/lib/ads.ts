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
        let query = (supabase as any)
            .from('Ad')
            .select(`
                *,
                author:User!userId(id, name, email, phone),
                city:City(id, name, nameAr, nameEn),
                currency:Currency(id, code, symbol, name)
            `)
            .eq('isActive', true);

        // Filter by isBoosted
        if (filters.isBoosted !== undefined) {
            query = query.eq('isBoosted', filters.isBoosted);
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
            query = query.eq('cityId', filters.cityId);
        }

        // Sort
        if (filters.sortBy) {
            query = query.order(filters.sortBy, { ascending: filters.sortOrder === 'asc' });
        } else {
            query = query.order('createdAt', { ascending: false });
        }

        const limit = filters.limit || 50;
        query = query.limit(limit);

        const { data, error } = await query;

        if (error) {
            console.error('Error fetching ads:', error);
            return [];
        }

        return data || [];
    },

    // Get single ad
    async getAd(id: string, searchAll: boolean = false): Promise<Ad | null> {
        let query = (supabase as any)
            .from('Ad')
            .select(`
                *,
                author:User!userId(id, name, email, phone),
                city:City(id, name, nameAr, nameEn),
                currency:Currency(id, code, symbol, name)
            `)
            .eq('id', id);

        if (!searchAll) {
            query = query.eq('isActive', true);
        }

        const { data, error } = await query.single();

        if (error) {
            console.error('Error fetching ad:', error);
            return null;
        }

        return data as Ad;
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
                author:User!userId(id, name, email, phone),
                city:City(id, name, nameAr, nameEn),
                currency:Currency(id, code, symbol, name)
            `)
            .eq('userId', user.id)
            .order('createdAt', { ascending: false });

        if (error) {
            console.error('Error fetching my ads:', error);
            throw new Error('Failed to fetch your ads');
        }

        return (data as Ad[]) || [];
    },

    // Create new ad
    async createAd(adData: any): Promise<Ad> {
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            throw new Error('User not authenticated');
        }

        const { data, error } = await (supabase as any)
            .from('Ad')
            .insert({
                ...adData,
                userId: user.id,
                currencyId: adData.currencyId || 'sar',
            })
            .select(`
                *,
                author:User!userId(id, name, email, phone),
                city:City(id, name, nameAr, nameEn),
                currency:Currency(id, code, symbol, name)
            `)
            .single();

        if (error) {
            console.error('Error creating ad:', error);
            throw new Error('Failed to create ad');
        }

        return data as Ad;
    },

    // Update ad
    async updateAd(id: string, updates: any): Promise<Ad> {
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            throw new Error('User not authenticated');
        }

        const { data, error } = await (supabase as any)
            .from('Ad')
            .update(updates)
            .eq('id', id)
            .eq('userId', user.id)
            .select(`
                *,
                author:User!userId(id, name, email, phone),
                city:City(id, name, nameAr, nameEn),
                currency:Currency(id, code, symbol, name)
            `)
            .single();

        if (error) {
            console.error('Error updating ad:', error);
            throw new Error('Failed to update ad');
        }

        return data as Ad;
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
            .eq('userId', user.id);

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
