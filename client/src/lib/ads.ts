import { supabase } from './supabase';

// أنواع البيانات للإعلانات
import { Database } from '@/types/database.types'

export type Ad = Database['public']['Tables']['Ad']['Row'] & {
    // علاقات
    author?: {
        id: string;
        name?: string;
        email: string;
    };
    city?: {
        id: string;
        name: string;
        name_ar?: string;
        name_en?: string;
    };
    currency?: {
        id: string;
        code: string;
        symbol: string;
        name: string;
    };
}

// خدمة إدارة الإعلانات باستخدام Supabase مباشرة
export const adsService = {
    // الحصول على جميع الإعلانات مع الفلاتر
    async getAds(filters: {
        category?: string;
        type?: string;
        location?: string;
        search?: string;
        minPrice?: number;
        maxPrice?: number;
        hasMedia?: boolean;
        limit?: number;
        sortBy?: string;
        sortOrder?: 'asc' | 'desc';
    } = {}) {
        let query = (supabase as any)
            .from('Ad')
            .select(`
                *,
                author:User(id, name, email),
                city:cities(id, name, name_ar, name_en),
                currency:currencies(id, code, symbol, name)
            `)
            .eq('isActive', true);

        // تطبيق الفلاتر
        if (filters.category) {
            query = query.eq('category', filters.category.toLowerCase());
        }

        if (filters.location) {
            const locations = filters.location.split(',').map(l => l.trim()).filter(l => l);
            if (locations.length > 0) {
                const orConditions = locations.map(loc => `location.ilike.%${loc}%`).join(',');
                query = query.or(orConditions);
            }
        }

        if (filters.minPrice !== undefined) {
            query = query.gte('price', filters.minPrice);
        }

        if (filters.maxPrice !== undefined) {
            query = query.lte('price', filters.maxPrice);
        }

        if (filters.hasMedia) {
            query = query.neq('images', '[]');
        }

        if (filters.search) {
            query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
        }

        // الترتيب
        const sortBy = filters.sortBy || 'created_at';
        const sortOrder = filters.sortOrder || 'desc';

        if (sortBy === 'created_at') {
            query = query.order('createdAt', { ascending: sortOrder === 'asc' });
        } else {
            query = query.order('is_boosted', { ascending: false }).order('createdAt', { ascending: false });
        }

        // الحد
        const limit = filters.limit || 50;
        query = query.limit(limit);

        const { data, error } = await query;

        if (error) {
            console.error('Error fetching ads:', error);
            throw new Error('Failed to fetch ads');
        }

        return data || [];
    },

    // الحصول على إعلان واحد
    async getAd(id: string): Promise<Ad | null> {
        const { data, error } = await (supabase as any)
            .from('Ad')
            .select(`
                *,
                author:User(id, name, email),
                city:cities(id, name, name_ar, name_en),
                currency:currencies(id, code, symbol, name)
            `)
            .eq('id', id)
            .eq('isActive', true)
            .single();

        if (error) {
            console.error('Error fetching ad:', error);
            return null;
        }

        return data;
    },

    // الحصول على إعلانات المستخدم
    async getMyAds(): Promise<Ad[]> {
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            throw new Error('User not authenticated');
        }

        const { data, error } = await (supabase as any)
            .from('Ad')
            .select(`
                *,
                author:User(id, name, email),
                city:cities(id, name, name_ar, name_en),
                currency:currencies(id, code, symbol, name)
            `)
            .eq('authorId', user.id)
            .order('createdAt', { ascending: false });

        if (error) {
            console.error('Error fetching my ads:', error);
            throw new Error('Failed to fetch your ads');
        }

        return data || [];
    },

    // إنشاء إعلان جديد
    async createAd(adData: {
        title: string;
        description: string;
        price?: number;
        category: string;
        location?: string;
        images: string;
        city_id?: string;
        latitude?: number;
        longitude?: number;
        payment_method?: string;
    }): Promise<Ad> {
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            throw new Error('User not authenticated');
        }

        const { data, error } = await (supabase as any)
            .from('Ad')
            .insert({
                ...adData,
                authorId: user.id,
                currencyId: 'sar', // العملة الافتراضية
            })
            .select(`
                *,
                author:User(id, name, email),
                city:cities(id, name, name_ar, name_en),
                currency:currencies(id, code, symbol, name)
            `)
            .single();

        if (error) {
            console.error('Error creating ad:', error);
            throw new Error('Failed to create ad');
        }

        return data;
    },

    // تحديث إعلان
    async updateAd(id: string, updates: Partial<Ad>): Promise<Ad> {
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            throw new Error('User not authenticated');
        }

        const { data, error } = await (supabase as any)
            .from('Ad')
            .update(updates)
            .eq('id', id)
            .eq('authorId', user.id)
            .select(`
                *,
                author:User(id, name, email),
                city:cities(id, name, name_ar, name_en),
                currency:currencies(id, code, symbol, name)
            `)
            .single();

        if (error) {
            console.error('Error updating ad:', error);
            throw new Error('Failed to update ad');
        }

        return data;
    },

    // حذف إعلان
    async deleteAd(id: string): Promise<void> {
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            throw new Error('User not authenticated');
        }

        const { error } = await (supabase as any)
            .from('Ad')
            .delete()
            .eq('id', id)
            .eq('authorId', user.id);

        if (error) {
            console.error('Error deleting ad:', error);
            throw new Error('Failed to delete ad');
        }
    },

    // زيادة عدد المشاهدات
    async incrementViews(id: string): Promise<void> {
        const { error } = await supabase.rpc('increment_ad_views', { adId: id });

        if (error) {
            console.warn('Failed to increment views:', error);
        }
    }
};