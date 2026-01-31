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
        // Handle quotes if present
        if (connectionString.startsWith('"') && connectionString.endsWith('"')) {
            connectionString = connectionString.slice(1, -1);
        }
    } else {
        console.error('DATABASE_URL not found in .env.local');
        process.exit(1);
    }
} catch (e) {
    console.error('Could not read .env.local', e);
    process.exit(1);
}

const client = new Client({
  connectionString: connectionString,
});

async function runSearch() {
    try {
        await client.connect();
        console.log('Connected to database');

        const res = await client.query(`
            SELECT proname, prosrc 
            FROM pg_proc 
            WHERE prosrc ILIKE '%Invalid conversation%';
        `);

        console.log('Found functions:', res.rows);

    } catch (err) {
        console.error('Search failed:', err);
    } finally {
        await client.end();
    }
}

runSearch();
