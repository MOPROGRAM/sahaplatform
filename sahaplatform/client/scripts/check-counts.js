const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Manually parse .env.local
const envPath = path.resolve(__dirname, '../.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const envVars = {};
envContent.split('\n').forEach(line => {
    const match = line.match(/^([^=]+)=(.*)$/);
    if (match) {
        const key = match[1].trim();
        const value = match[2].trim().replace(/^['"](.*)['"]$/, '$1'); // Remove quotes if present
        envVars[key] = value;
    }
});

const supabaseUrl = envVars.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = envVars.SUPABASE_SERVICE_ROLE_KEY || envVars.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase URL or Key');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkCount(table) {
    const { count, error } = await supabase
        .from(table)
        .select('*', { count: 'exact', head: true });
    
    if (error) {
        // If table doesn't exist, it might return 404 error
        return { table, count: null, error: error.message };
    }
    return { table, count };
}

async function main() {
    const tables = ['City', 'cities', 'Currency', 'currencies'];
    console.log('Checking row counts...');
    
    for (const table of tables) {
        const result = await checkCount(table);
        console.log(`${result.table}: ${result.count !== null ? result.count : 'Error (' + result.error + ')'}`);
    }
}

main();
