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

async function inspectFunction() {
    try {
        await client.connect();
        console.log('Connected to database');

        const res = await client.query(`
            SELECT p.proname, p.prosecdef, p.prosrc
            FROM pg_proc p
            WHERE p.proname = 'get_auth_user_conversations';
        `);

        if (res.rows.length === 0) {
            console.log('Function get_auth_user_conversations not found.');
        } else {
            res.rows.forEach(row => {
                console.log(`Function: ${row.proname}`);
                console.log(`Security Definer: ${row.prosecdef}`); // true if SECURITY DEFINER
                console.log(`Source: \n${row.prosrc}`);
            });
        }

    } catch (err) {
        console.error('Inspect failed:', err);
    } finally {
        await client.end();
    }
}

inspectFunction();
