const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Read .env.local manually
const envPath = path.join(__dirname, '../.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');

const env = {};
envContent.split('\n').forEach(line => {
    const [key, value] = line.split('=');
    if (key && value) {
        env[key.trim()] = value.trim();
    }
});

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkTable(tableName) {
    const { data, error } = await supabase.from(tableName).select('*').limit(1);
    if (error) {
        return { exists: false, error: error.message };
    }
    const columns = data.length > 0 ? Object.keys(data[0]) : 'No data to infer columns';
    return { exists: true, count: data.length, columns };
}

async function main() {
    console.log('Checking database tables...');
    
    const tablesToCheck = [
        'User', 'Ad', 
        'Conversation', 'Message', 
        'City', 'Currency', 
        '_conversation_participants',
        'ConversationParticipant',
        'ConversationParticipants'
    ];
    
    for (const table of tablesToCheck) {
        const result = await checkTable(table);
        console.log(`Table '${table}': ${result.exists ? 'EXISTS' : 'NOT FOUND'}`);
        if (result.exists) {
            console.log(`Columns: ${JSON.stringify(result.columns)}`);
        }
    }
}

main();
