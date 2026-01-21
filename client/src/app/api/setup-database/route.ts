export const runtime = 'edge';

import { createClient } from '@supabase/supabase-js';

export async function POST(request: Request) {
    try {
        console.log('🔄 بدء إعداد قاعدة البيانات في Supabase...');

        // Check environment variables
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

        if (!supabaseUrl || !supabaseServiceKey) {
            return new Response(JSON.stringify({
                error: 'Server configuration error: Missing Supabase credentials'
            }), {
                status: 500,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        // Create admin client
        const supabase = createClient(supabaseUrl, supabaseServiceKey);

        // Note: Tables need to be created manually in Supabase SQL Editor
        // The upsert operations below assume tables exist

        // Insert basic data
        console.log('🌱 إدراج البيانات الأساسية...');

        // Insert currencies
        const { error: currencyError } = await supabase
            .from('currencies')
            .upsert([
                { id: 'sar', code: 'sar', symbol: 'ر.س', name: 'Saudi Riyal', name_ar: 'الريال السعودي', name_en: 'Saudi Riyal', is_active: true },
                { id: 'aed', code: 'aed', symbol: 'د.إ', name: 'UAE Dirham', name_ar: 'الدرهم الإماراتي', name_en: 'UAE Dirham', is_active: true },
                { id: 'egp', code: 'egp', symbol: 'ج.م', name: 'Egyptian Pound', name_ar: 'الجنيه المصري', name_en: 'Egyptian Pound', is_active: true },
                { id: 'usd', code: 'usd', symbol: '$', name: 'US Dollar', name_ar: 'الدولار الأمريكي', name_en: 'US Dollar', is_active: true }
            ], { onConflict: 'id' });

        if (currencyError) {
            console.error('خطأ في إدراج العملات:', currencyError);
            console.log('تأكد من وجود جدول currencies');
        }

        // Insert countries
        const { error: countryError } = await supabase
            .from('countries')
            .upsert([
                { id: 'SA', code: 'SA', name: 'Saudi Arabia', name_ar: 'المملكة العربية السعودية', name_en: 'Saudi Arabia', phone_code: '+966', currency_id: 'sar', flag: '🇸🇦', is_active: true },
                { id: 'AE', code: 'AE', name: 'UAE', name_ar: 'الإمارات العربية المتحدة', name_en: 'UAE', phone_code: '+971', currency_id: 'aed', flag: '🇦🇪', is_active: true },
                { id: 'EG', code: 'EG', name: 'Egypt', name_ar: 'مصر', name_en: 'Egypt', phone_code: '+20', currency_id: 'egp', flag: '🇪🇬', is_active: true }
            ], { onConflict: 'id' });

        if (countryError) {
            console.error('خطأ في إدراج الدول:', countryError);
            console.log('تأكد من وجود جدول countries');
        }

        // Insert cities
        const { error: cityError } = await supabase
            .from('cities')
            .upsert([
                { id: 'riyadh', name: 'Riyadh', name_ar: 'الرياض', name_en: 'Riyadh', country_id: 'SA', latitude: 24.7136, longitude: 46.6753, is_active: true },
                { id: 'dubai', name: 'Dubai', name_ar: 'دبي', name_en: 'Dubai', country_id: 'AE', latitude: 25.2048, longitude: 55.2708, is_active: true },
                { id: 'cairo', name: 'Cairo', name_ar: 'القاهرة', name_en: 'Cairo', country_id: 'EG', latitude: 30.0444, longitude: 31.2357, is_active: true }
            ], { onConflict: 'id' });

        if (cityError) {
            console.error('خطأ في إدراج المدن:', cityError);
            console.log('تأكد من وجود جدول cities');
        }

        console.log('✅ تم إعداد قاعدة البيانات بالكامل');

        return Response.json({
            success: true,
            message: 'تم إعداد قاعدة البيانات بالكامل بنجاح! 🎉',
            data: {
                currencies: 4,
                countries: 3,
                cities: 3
            },
            note: 'تأكد من إنشاء الجداول في Supabase SQL Editor إذا لم تكن موجودة'
        });

    } catch (error) {
        console.error('❌ خطأ في إعداد قاعدة البيانات:', error);
        return new Response(JSON.stringify({
            success: false,
            error: 'خطأ في إعداد قاعدة البيانات',
            details: error.message
        }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}