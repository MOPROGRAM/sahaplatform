
const { Client } = require('pg');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

// Load env
const envPath = path.resolve(__dirname, '../.env.local');
const envConfig = dotenv.parse(fs.readFileSync(envPath));

const client = new Client({
  connectionString: envConfig.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function run() {
  await client.connect();
  
  const tables = ['conversations', 'conversation_participants', 'messages'];
  
  for (const table of tables) {
      console.log(`\n--- Constraints for ${table} ---`);
      const res = await client.query(`
        SELECT conname, pg_get_constraintdef(c.oid) as def
        FROM pg_constraint c
        JOIN pg_namespace n ON n.oid = c.connamespace
        WHERE c.conrelid = 'public.${table}'::regclass
        AND c.contype = 'f';
      `);
      res.rows.forEach(r => console.log(`${r.conname}: ${r.def}`));
  }
  
  await client.end();
}

run().catch(console.error);
