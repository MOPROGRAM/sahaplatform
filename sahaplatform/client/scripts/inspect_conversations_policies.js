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

async function inspectConversationsPolicies() {
    try {
        await client.connect();
        console.log('Connected to database');

        const res = await client.query(`
            SELECT schemaname, tablename, policyname, cmd, qual, with_check
            FROM pg_policies
            WHERE tablename = 'conversations';
        `);

        console.log('Policies on conversations:');
        res.rows.forEach(row => {
            console.log(`\nPolicy: ${row.policyname}`);
            console.log(`  Command: ${row.cmd}`);
            console.log(`  USING: ${row.qual}`);
        });

    } catch (err) {
        console.error('Inspect failed:', err);
    } finally {
        await client.end();
    }
}

inspectConversationsPolicies();
