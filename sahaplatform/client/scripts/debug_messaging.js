
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

        // 1. Check Messages Table Columns
        console.log('\n--- Checking Messages Table Columns ---');
        const resCols = await client.query(`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'messages';
        `);
        resCols.rows.forEach(row => {
            console.log(`${row.column_name} (${row.data_type})`);
        });

        // 2. Check conversation_participants Policies
        console.log('\n--- Checking conversation_participants Policies ---');
        const resPolicies = await client.query(`
            SELECT policyname, cmd, qual, with_check 
            FROM pg_policies 
            WHERE tablename = 'conversation_participants';
        `);
        resPolicies.rows.forEach(row => {
            console.log(`Policy: ${row.policyname}`);
            console.log(`  Cmd: ${row.cmd}`);
            console.log(`  Qual: ${row.qual}`);
            console.log(`  With Check: ${row.with_check}`);
        });

        // 3. Check RPC function definition
        console.log('\n--- Checking RPC get_conversation_participants ---');
        const resRpc = await client.query(`
            SELECT prosrc 
            FROM pg_proc 
            WHERE proname = 'get_conversation_participants';
        `);
        if (resRpc.rows.length > 0) {
            console.log('Function Source:', resRpc.rows[0].prosrc);
        } else {
            console.log('Function get_conversation_participants NOT FOUND!');
        }

    } catch (err) {
        console.error('Database Error:', err);
    } finally {
        await client.end();
    }
}

run();
