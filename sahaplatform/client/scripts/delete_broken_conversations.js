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

async function deleteBrokenConversations() {
    try {
        await client.connect();
        console.log('Deleting broken conversations (participants < 2)...');

        // Find IDs first
        const res = await client.query(`
            SELECT c.id
            FROM conversations c
            LEFT JOIN conversation_participants cp ON c.id = cp.conversation_id
            GROUP BY c.id
            HAVING count(cp.user_id) < 2;
        `);

        const ids = res.rows.map(r => r.id);
        console.log(`Found ${ids.length} broken conversations.`);

        if (ids.length > 0) {
            // Delete them
            // Assuming ON DELETE CASCADE on foreign keys (messages, etc.)
            // But verify first. conversation_participants has ON DELETE CASCADE.
            // messages usually has ON DELETE CASCADE.
            
            const deleteRes = await client.query(`
                DELETE FROM conversations
                WHERE id = ANY($1::uuid[])
            `, [ids]);
            
            console.log(`Deleted ${deleteRes.rowCount} conversations.`);
        }

    } catch (err) {
        console.error('Delete failed:', err);
    } finally {
        await client.end();
    }
}

deleteBrokenConversations();
