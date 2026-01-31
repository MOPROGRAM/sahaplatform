const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

// Read .env.local manually
const envPath = path.resolve(__dirname, '../.env.local');
let connectionString = '';

try {
    const envContent = fs.readFileSync(envPath, 'utf8');
    const dbUrlMatch = envContent.match(/DATABASE_URL=(.+)/);
    
    if (dbUrlMatch) {
        connectionString = dbUrlMatch[1].trim();
        if (connectionString.startsWith('"') && connectionString.endsWith('"')) {
            connectionString = connectionString.slice(1, -1);
        }
    }
} catch (e) {
    console.error('Could not read .env.local', e);
    process.exit(1);
}

const client = new Client({ connectionString });

async function runInspect() {
    try {
        await client.connect();
        console.log('Connected to database');

        const res = await client.query(`
            SELECT 
                tgname as trigger_name,
                tgrelid::regclass as table_name,
                p.proname as function_name,
                p.prosrc as function_source
            FROM pg_trigger t
            JOIN pg_proc p ON t.tgfoid = p.oid
            WHERE tgrelid = 'messages'::regclass;
        `);

        console.log('Triggers on messages table:');
        res.rows.forEach(row => {
            console.log(`\n--- Trigger: ${row.trigger_name} (${row.function_name}) ---`);
            console.log(row.function_source);
        });

    } catch (err) {
        console.error('Inspect failed:', err);
    } finally {
        await client.end();
    }
}

runInspect();
