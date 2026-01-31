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

async function checkBrokenConversations() {
    try {
        await client.connect();
        console.log('Checking for broken conversations (participants < 2)...');

        const res = await client.query(`
            SELECT c.id, c.ad_id, count(cp.user_id) as participant_count
            FROM conversations c
            LEFT JOIN conversation_participants cp ON c.id = cp.conversation_id
            GROUP BY c.id, c.ad_id
            HAVING count(cp.user_id) < 2;
        `);

        console.log(`Found ${res.rowCount} broken conversations.`);
        if (res.rowCount > 0) {
            console.log(res.rows);
        }

    } catch (err) {
        console.error('Check failed:', err);
    } finally {
        await client.end();
    }
}

checkBrokenConversations();
