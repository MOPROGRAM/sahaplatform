
const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

// Read .env.local manually
const envPath = path.resolve(__dirname, '../.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const dbUrlMatch = envContent.match(/DATABASE_URL=(.+)/);

if (!dbUrlMatch) {
  console.error('DATABASE_URL not found in .env.local');
  process.exit(1);
}

const connectionString = dbUrlMatch[1].trim();

const client = new Client({
  connectionString: connectionString,
});

async function run() {
    try {
        await client.connect();
        console.log('Connected to database');

        const query = `
            SELECT proname, prosrc 
            FROM pg_proc 
            WHERE prosrc ILIKE '%Invalid conversation%';
        `;

        const res = await client.query(query);
        console.log('Found matches:', res.rows.length);
        res.rows.forEach(row => {
            console.log(`Function: ${row.proname}`);
            console.log('--- Source ---');
            console.log(row.prosrc);
            console.log('--------------');
        });
        
        // Also check triggers specifically if needed, but prosrc covers function bodies.

    } catch (err) {
        console.error('Query failed:', err);
    } finally {
        await client.end();
    }
}

run();
