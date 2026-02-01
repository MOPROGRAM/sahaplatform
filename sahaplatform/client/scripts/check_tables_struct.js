
const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

const envPath = path.resolve(__dirname, '../.env.local');
let connectionString = process.env.DATABASE_URL;

if (!connectionString && fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    const match = envContent.match(/DATABASE_URL=(.*)/);
    if (match) {
        connectionString = match[1].trim().replace(/^['"](.*)['"]$/, '$1');
    }
}

const client = new Client({ connectionString });

async function checkTables() {
  try {
    await client.connect();
    const res = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('users', 'profiles', 'ads', 'messages');
    `);
    console.log('Found tables:', res.rows.map(r => r.table_name));
    
    // Check columns in messages
    const cols = await client.query(`
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'messages';
    `);
    console.log('Messages columns:', cols.rows.map(r => r.column_name));
    
  } catch (err) {
    console.error(err);
  } finally {
    await client.end();
  }
}

checkTables();
