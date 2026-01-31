
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
    }
} catch (e) {
    console.error('Error reading .env.local:', e.message);
}

if (!connectionString) {
    console.error('DATABASE_URL not found in .env.local');
    process.exit(1);
}

const client = new Client({
    connectionString: connectionString,
});

async function run() {
    try {
        await client.connect();
        console.log('Connected to database.');

        const sql = fs.readFileSync(path.resolve(__dirname, 'fix_messaging_schema_v3.sql'), 'utf8');
        
        console.log('Executing schema fix...');
        await client.query(sql);
        console.log('Schema fix applied successfully.');

    } catch (err) {
        console.error('Database Error:', err);
    } finally {
        await client.end();
    }
}

run();
