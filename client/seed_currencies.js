
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://cgobqadkscwutogktjcn.supabase.co';
// Taking the key from line 14 of .env file shown previously
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNnb2JxYWRrc2N3dXRvZ2t0amNuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2ODk2MTI5OSwiZXhwIjoyMDg0NTM3Mjk5fQ.1whTt652OpG3eKVPm4QW4tc1oskV1JdEE0lda3huUe4';

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

async function seedData() {
    console.log('Starting seed process...');

    try {
        // 1. Check and Insert Currencies
        const currencies = [
            { code: 'SAR', symbol: 'ر.س', name: 'Saudi Riyal', name_ar: 'ريال سعودي', name_en: 'Saudi Riyal', is_active: true },
            { code: 'USD', symbol: '$', name: 'US Dollar', name_ar: 'دولار أمريكي', name_en: 'US Dollar', is_active: true }
        ];

        for (const currency of currencies) {
            const { data: existing } = await supabase
                .from('currencies')
                .select('id')
                .eq('code', currency.code)
                .maybeSingle();

            if (!existing) {
                console.log(`Inserting currency: ${currency.code}`);
                const { error } = await supabase.from('currencies').insert(currency);
                if (error) console.error(`Error inserting ${currency.code}:`, error);
            } else {
                console.log(`Currency ${currency.code} already exists.`);
            }
        }

        // 2. Get SAR ID for Countries
        const { data: sarCurrency } = await supabase
            .from('currencies')
            .select('id')
            .eq('code', 'SAR')
            .single();

        if (sarCurrency) {
            // 3. Check and Insert Countries
            const countries = [
                { code: 'SA', phone_code: '+966', name: 'Saudi Arabia', name_ar: 'المملكة العربية السعودية', name_en: 'Saudi Arabia', currency_id: sarCurrency.id, is_active: true }
            ];

            for (const country of countries) {
                const { data: existing } = await supabase
                    .from('countries')
                    .select('id')
                    .eq('code', country.code)
                    .maybeSingle();

                if (!existing) {
                    console.log(`Inserting country: ${country.code}`);
                    const { error } = await supabase.from('countries').insert(country);
                    if (error) console.error(`Error inserting ${country.code}:`, error);
                } else {
                    console.log(`Country ${country.code} already exists.`);
                }
            }
        } else {
            console.error('Could not find SAR currency to link with countries.');
        }

        // 4. Create increment_ad_views function (Simulated via SQL if possible, otherwise we rely on user running SQL)
        // Note: JS Client cannot create functions directly via RPC unless there's a specific endpoint. 
        // We will stick to data seeding which solves the 400 Local Error.

        console.log('Seeding completed.');

    } catch (err) {
        console.error('Unexpected error:', err);
    }
}

seedData();
