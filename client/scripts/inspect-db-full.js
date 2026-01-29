const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

// Read .env.local manually
const envPath = path.join(__dirname, '../.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');

const env = {};
envContent.split('\n').forEach(line => {
    const [key, value] = line.split('=');
    if (key && value) {
        env[key.trim()] = value.trim();
    }
});

const connectionString = env.DATABASE_URL;

if (!connectionString) {
    console.error('Missing DATABASE_URL');
    process.exit(1);
}

const client = new Client({
    connectionString: connectionString,
});

async function main() {
    try {
        await client.connect();
        console.log('Connected to database');

        const res = await client.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public';
        `);

        console.log('Current tables:', res.rows.map(r => r.table_name));

        // Check columns for 'City' table if it exists (or 'cities')
        const cityTable = res.rows.find(r => r.table_name === 'City' || r.table_name === 'cities');
        if (cityTable) {
            const cols = await client.query(`
                SELECT column_name 
                FROM information_schema.columns 
                WHERE table_name = '${cityTable.table_name}';
            `);
            console.log(`Columns for ${cityTable.table_name}:`, cols.rows.map(r => r.column_name));
        }

    } catch (err) {
        console.error('Error:', err);
    } finally {
        await client.end();
    }
}

main();