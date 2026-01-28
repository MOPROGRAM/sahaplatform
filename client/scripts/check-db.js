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

async function checkTable(table) {
    // Check if table exists by selecting 1 row (with head: true)
    const { data, error } = await supabase
        .from(table)
        .select('*', { count: 'exact', head: true });
    
    if (error) {
        // If table doesn't exist, it usually returns 404 or specific error code
        return { table, exists: false, error: error.message };
    }
    
    // If it exists, try to get column names by selecting one row (without head) to see keys
    // But since we can't inspect schema directly via REST easily without fetching data,
    // we'll just report existence.
    // To get columns, we can fetch 1 row.
    const { data: rows } = await supabase.from(table).select('*').limit(1);
    const columns = rows && rows.length > 0 ? Object.keys(rows[0]) : 'Unknown (Empty table)';
    
    return { table, exists: true, columns };
}

async function main() {
    console.log('Checking database tables (Target State: snake_case)...');
    
    const tablesToCheck = [
        'ads',
        'users',
        'conversations',
        'messages',
        'cities',
        'currencies',
        'conversation_participants'
    ];
    
    for (const table of tablesToCheck) {
        const result = await checkTable(table);
        if (result.exists) {
            console.log(`Table '${result.table}': EXISTS`);
            if (result.columns !== 'Unknown (Empty table)') {
                console.log(`Columns: ${JSON.stringify(result.columns)}`);
            } else {
                console.log(`Columns: ${result.columns}`);
            }
        } else {
            console.log(`Table '${result.table}': NOT FOUND (${result.error})`);
        }
    }
}

main();
