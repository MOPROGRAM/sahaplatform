
const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

// Load .env from client folder
dotenv.config({ path: path.join(__dirname, 'client', '.env') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing Supabase environment variables in client/.env');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testConnection() {
    console.log('🔄 Attempting to connect to Supabase...');
    console.log(`📍 URL: ${supabaseUrl}`);

    try {
        // Try to fetch a single row from a known table (ads) or just check health
        const { data, error } = await supabase
            .from('ads')
            .select('id')
            .limit(1);

        if (error) {
            console.error('❌ Connection failed:', error.message);
        } else {
            console.log('✅ Successfully connected to Supabase!');
            console.log('📊 Connection test successful. Retrieved data:', data);
        }
    } catch (err) {
        console.error('💥 Unexpected error during connection:', err.message);
    }
}

testConnection();
