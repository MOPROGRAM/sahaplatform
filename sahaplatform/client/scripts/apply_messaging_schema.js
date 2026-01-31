const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

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

async function runSchemaFix() {
    try {
        await client.connect();
        console.log('Connected to database');
        
        const sqlPath = path.resolve(__dirname, 'fix_messaging_schema_only.sql');
        const sql = fs.readFileSync(sqlPath, 'utf8');
        
        console.log('Running messaging schema fix (FKs, Columns)...');
        await client.query(sql);
        console.log('Schema fix applied successfully!');

    } catch (err) {
        console.error('Fix failed:', err);
        process.exit(1);
    } finally {
        await client.end();
    }
}

runSchemaFix();
