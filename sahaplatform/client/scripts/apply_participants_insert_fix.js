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

async function runMigration() {
    try {
        await client.connect();
        console.log('Connected to database');
        
        const sqlPath = path.resolve(__dirname, 'fix_participants_insert_policy.sql');
        const sql = fs.readFileSync(sqlPath, 'utf8');
        
        console.log('Running migration from fix_participants_insert_policy.sql...');
        await client.query(sql);
        console.log('Migration completed successfully!');

    } catch (err) {
        console.error('Migration failed:', err);
        process.exit(1);
    } finally {
        await client.end();
    }
}

runMigration();
