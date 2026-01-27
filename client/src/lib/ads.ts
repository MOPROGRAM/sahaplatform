import { supabase } from './supabase';

// أنواع البيانات للإعلانات
import { Database } from '@/types/database.types'

export type Ad = {
    id: string;
    title: string;
    description: string;
    price: number | null;
    currency_id: string;
    category: string;
    sub_category?: string | null;
    location: string | null;
    address?: string | null;
    payment_method?: string | null;
    city_id?: string | null;
    latitude?: number | null;
    longitude?: number | null;
    images: string;
    video?: string | null;
    is_boosted: boolean;
    is_active: boolean;
    views: number;
    author_id: string;
    created_at: string;
    updated_at: string;
    phone?: string;
    email?: string;
    // علاقات
    author?: {
        id: string;
        name?: string;
        email: string;
        phone?: string;
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
        subCategory?: string;
        search?: string;
        limit?: number;
        tags?: string[];
    } = {}) {
        let query = (supabase as any)
            .from('ads')
            .select(`
                *,
                author:users(id, name, email, phone),
                city:cities(id, name, name_ar, name_en),
                currency:currencies(id, code, symbol, name)
            `)
            .eq('is_active', true);

        // فلترة بالقسم
        if (filters.category) {
            query = query.ilike('category', filters.category);
        }

        // فلترة بالتصنيف الفرعي
        if (filters.subCategory) {
            query = query.ilike('sub_category', filters.subCategory);
        }

        // بحث بسيط بالاسم والوصف
        if (filters.search) {
            query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
        }

        // ترتيب ثابت ومضمون
        query = query.order('created_at', { ascending: false });

        const limit = filters.limit || 50;
        query = query.limit(limit);

        const { data, error } = await query;

        if (error) {
            console.error('Error fetching ads:', error);
            return [];
        }

        return data || [];
    },

    // الحصول على إعلان واحد
    async getAd(id: string, searchAll: boolean = false): Promise<Ad | null> {
        let query = (supabase as any)
            .from('ads')
            .select(`
                *,
                author:users(id, name, email, phone),
                city:cities(id, name, name_ar, name_en),
                currency:currencies(id, code, symbol, name)
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

        return data as Ad;
    },

    // الحصول على إعلانات المستخدم
    async getMyAds(): Promise<Ad[]> {
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            throw new Error('User not authenticated');
        }

        const { data, error } = await (supabase as any)
            .from('ads')
            .select(`
                *,
                author:users(id, name, email, phone),
                city:cities(id, name, name_ar, name_en),
                currency:currencies(id, code, symbol, name)
            `)
            .eq('author_id', user.id)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching my ads:', error);
            throw new Error('Failed to fetch your ads');
        }

        return (data as Ad[]) || [];
    },

    // إنشاء إعلان جديد
    async createAd(adData: any): Promise<Ad> {
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            throw new Error('User not authenticated');
        }

        const { data, error } = await (supabase as any)
            .from('ads')
            .insert({
                ...adData,
                author_id: user.id,
                currency_id: adData.currency_id || 'sar',
            })
            .select(`
                *,
                author:users(id, name, email, phone),
                city:cities(id, name, name_ar, name_en),
                currency:currencies(id, code, symbol, name)
            `)
            .single();

        if (error) {
            console.error('Error creating ad:', error);
            throw new Error('Failed to create ad');
        }

        return data as Ad;
    },

    // تحديث إعلان
    async updateAd(id: string, updates: any): Promise<Ad> {
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            throw new Error('User not authenticated');
        }

        const { data, error } = await (supabase as any)
            .from('ads')
            .update(updates)
            .eq('id', id)
            .eq('author_id', user.id)
            .select(`
                *,
                author:users(id, name, email, phone),
                city:cities(id, name, name_ar, name_en),
                currency:currencies(id, code, symbol, name)
            `)
            .single();

        if (error) {
            console.error('Error updating ad:', error);
            throw new Error('Failed to update ad');
        }

        return data as Ad;
    },

    // حذف إعلان
    async deleteAd(id: string): Promise<void> {
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            throw new Error('User not authenticated');
        }

        const { error } = await (supabase as any)
            .from('ads')
            .delete()
            .eq('id', id)
            .eq('author_id', user.id);

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
