
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

async function checkRpc() {
  try {
    await client.connect();
    const res = await client.query(`
      SELECT routine_name 
      FROM information_schema.routines 
      WHERE routine_type = 'FUNCTION' 
      AND routine_schema = 'public'
      AND routine_name = 'get_or_create_conversation';
    `);
    console.log('Found functions:', res.rows.map(r => r.routine_name));
  } catch (err) {
    console.error(err);
  } finally {
    await client.end();
  }
}

checkRpc();
