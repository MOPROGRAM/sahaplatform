
const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

// Manually parse .env.local to find DATABASE_URL
const envPath = path.resolve(__dirname, '../.env.local');
let connectionString = process.env.DATABASE_URL;

if (!connectionString && fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    const match = envContent.match(/DATABASE_URL=(.*)/);
    if (match) {
        connectionString = match[1].trim().replace(/^['"](.*)['"]$/, '$1');
    } else {
        // Try POSTGRES_URL
        const match2 = envContent.match(/POSTGRES_URL=(.*)/);
        if (match2) {
            connectionString = match2[1].trim().replace(/^['"](.*)['"]$/, '$1');
        }
    }
}

if (!connectionString) {
    console.error('DATABASE_URL not found in environment or .env.local');
    // Fallback to default for local dev if absolutely necessary, but likely to fail if not configured
    connectionString = 'postgresql://postgres:postgres@localhost:54322/postgres';
}

const client = new Client({
  connectionString: connectionString,
});

async function runSchemaFix() {
  try {
    await client.connect();
    console.log('Connected to database');
    
    const sqlPath = path.resolve(__dirname, 'fix_messaging_strict.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');
    
    console.log('Running STRICT messaging schema fix (referencing auth.users)...');
    console.log(sql);
    
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
