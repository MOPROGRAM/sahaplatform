import { supabase } from './supabase';

// أنواع البيانات للإعلانات
import { Database } from '@/types/database.types'

export type Ad = Database['public']['Tables']['Ad']['Row'] & {
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
        search?: string;
        limit?: number;
    } = {}) {
        let query = (supabase as any)
            .from('Ad')
            .select(`
                *,
                author:User(id, name, email, phone),
                city:cities(id, name, name_ar, name_en),
                currency:currencies(id, code, symbol, name)
            `)
            .eq('is_active', true);

        // فلترة بالقسم (I-LIKE للتوافق مع حالات الأحرف)
        if (filters.category) {
            query = query.ilike('category', filters.category);
        }

        // بحث بسيط بالاسم
        if (filters.search) {
            query = query.ilike('title', `%${filters.search}%`);
        }

        // ترتيب ثابت ومضمون
        query = query.order('created_at', { ascending: false });

        const limit = filters.limit || 50;
        query = query.limit(limit);

        const { data, error } = await query;

        if (error) {
            console.error('Error fetching ads:', error);
            return []; // إرجاع مصفوفة فارغة بدلاً من رمي خطأ لضمان استقرار الموقع
        }

        return data || [];
    },

    // الحصول على إعلان واحد
    async getAd(id: string, searchAll: boolean = false): Promise<Ad | null> {
        let query = (supabase as any)
            .from('Ad')
            .select(`
                *,
                author:User(id, name, email, phone),
                city:cities(id, name, name_ar, name_en),
                currency:currencies(id, code, symbol, name)
            `)
            .eq('id', id);

        // إذا لم نكن نبحث عن الكل، نكتفي بالنشط فقط
        if (!searchAll) {
            query = query.eq('is_active', true);
        }

        const { data, error } = await query.single();

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
                author:User(id, name, email, phone),
                city:cities(id, name, name_ar, name_en),
                currency:currencies(id, code, symbol, name)
            `)
            .eq('author_id', user.id)
            .order('created_at', { ascending: false });

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
        phone?: string;
        email?: string;
    }): Promise<Ad> {
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            throw new Error('User not authenticated');
        }

        const { data, error } = await (supabase as any)
            .from('Ad')
            .insert({
                ...adData,
                author_id: user.id,
                currency_id: 'sar', // العملة الافتراضية
            })
            .select(`
                *,
                author:User(id, name, email, phone),
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
            .eq('author_id', user.id)
            .select(`
                *,
                author:User(id, name, email, phone),
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