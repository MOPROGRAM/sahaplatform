import { supabase } from './supabase';

// أنواع البيانات للدول والمدن
export interface Country {
    id: string;
    name: string;
    name_ar: string;
    name_en: string;
    code: string;
    phone_code: string;
    currency_id: string;
    flag?: string;
    is_active: boolean;
    currency?: {
        id: string;
        code: string;
        symbol: string;
        name: string;
    };
}

export interface City {
    id: string;
    name: string;
    name_ar: string;
    name_en: string;
    country_id: string;
    latitude?: number;
    longitude?: number;
    is_active: boolean;
    country?: Country;
}

// خدمة إدارة الدول والمدن باستخدام Supabase مباشرة
export const countriesService = {
    // الحصول على جميع الدول
    async getCountries(): Promise<Country[]> {
        const { data, error } = await supabase
            .from('countries')
            .select(`
                *,
                currency:currencies(id, code, symbol, name)
            `)
            .eq('is_active', true)
            .order('name');

        if (error) {
            console.error('Error fetching countries:', error);
            throw new Error('Failed to fetch countries');
        }

        return (data || []) as Country[];
    },

    // الحصول على دولة واحدة
    async getCountry(id: string): Promise<Country | null> {
        const { data, error } = await supabase
            .from('countries')
            .select(`
                *,
                currency:currencies(id, code, symbol, name)
            `)
            .eq('id', id)
            .eq('is_active', true)
            .single();

        if (error) {
            console.error('Error fetching country:', error);
            return null;
        }

        return data as Country | null;
    },

    // الحصول على مدن دولة معينة
    async getCitiesByCountry(countryId: string): Promise<City[]> {
        const { data, error } = await supabase
            .from('cities')
            .select(`
                *,
                country:countries(id, name, name_ar, name_en, code)
            `)
            .eq('country_id', countryId)
            .eq('is_active', true)
            .order('name');

        if (error) {
            console.error('Error fetching cities:', error);
            throw new Error('Failed to fetch cities');
        }

        return (data || []) as City[];
    },

    // الحصول على جميع المدن
    async getCities(): Promise<City[]> {
        const { data, error } = await supabase
            .from('cities')
            .select(`
                *,
                country:countries(id, name, name_ar, name_en, code)
            `)
            .eq('is_active', true)
            .order('name');

        if (error) {
            console.error('Error fetching cities:', error);
            throw new Error('Failed to fetch cities');
        }

        return (data || []) as City[];
    },

    // الحصول على مدينة واحدة
    async getCity(id: string): Promise<City | null> {
        const { data, error } = await supabase
            .from('cities')
            .select(`
                *,
                country:countries(id, name, name_ar, name_en, code)
            `)
            .eq('id', id)
            .eq('is_active', true)
            .single();

        if (error) {
            console.error('Error fetching city:', error);
            return null;
        }

        return data as City | null;
    }
};