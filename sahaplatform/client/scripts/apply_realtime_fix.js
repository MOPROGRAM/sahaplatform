
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
        // Fix for "transaction blocks not supported in prepared statements" or similar pooling issues if needed
        // Usually safe for simple scripts
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

async function runMigration() {
    try {
        await client.connect();
        console.log('Connected to database');

        const sqlPath = path.resolve(__dirname, 'fix_realtime_messages.sql');
        const sql = fs.readFileSync(sqlPath, 'utf8');

        console.log('Running migration from fix_realtime_messages.sql...');
        await client.query(sql);
        console.log('Migration completed successfully!');

    } catch (err) {
        console.error('Migration failed:', err);
    } finally {
        await client.end();
    }
}

runMigration();
