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

    // 1. Find conversations with < 2 participants
    console.log('Scanning for broken conversations...');
    const brokenConvsQuery = `
      SELECT c.id, c.ad_id, COUNT(cp.user_id) as participant_count
      FROM conversations c
      LEFT JOIN conversation_participants cp ON c.id = cp.conversation_id
      GROUP BY c.id
      HAVING COUNT(cp.user_id) < 2;
    `;
    
    const { rows: brokenConvs } = await client.query(brokenConvsQuery);
    console.log(`Found ${brokenConvs.length} broken conversations (less than 2 participants).`);

    for (const conv of brokenConvs) {
        console.log(`Processing conversation ${conv.id} (Participants: ${conv.participant_count})...`);
        
        // Check message count
        const msgCountRes = await client.query('SELECT COUNT(*) FROM messages WHERE conversation_id = $1', [conv.id]);
        const msgCount = parseInt(msgCountRes.rows[0].count);
        
        if (msgCount === 0) {
            console.log(`  -> Has 0 messages. DELETING...`);
            await client.query('DELETE FROM conversations WHERE id = $1', [conv.id]);
            console.log(`  -> Deleted.`);
        } else {
            console.log(`  -> Has ${msgCount} messages. Attempting REPAIR...`);
            
            // Try to identify participants from messages
            const sendersRes = await client.query('SELECT DISTINCT sender_id FROM messages WHERE conversation_id = $1', [conv.id]);
            const senders = sendersRes.rows.map(r => r.sender_id).filter(id => id);
            
            // Try to identify from Ad Author
            let adAuthorId = null;
            if (conv.ad_id) {
                const adRes = await client.query('SELECT author_id FROM ads WHERE id = $1', [conv.ad_id]);
                if (adRes.rows.length > 0) {
                    adAuthorId = adRes.rows[0].author_id;
                }
            }

            const potentialParticipants = new Set([...senders]);
            if (adAuthorId) potentialParticipants.add(adAuthorId);
            
            console.log(`  -> Potential participants: ${Array.from(potentialParticipants).join(', ')}`);

            if (potentialParticipants.size >= 2) {
                for (const userId of potentialParticipants) {
                    // Insert ignore
                    await client.query(`
                        INSERT INTO conversation_participants (conversation_id, user_id)
                        VALUES ($1, $2)
                        ON CONFLICT DO NOTHING
                    `, [conv.id, userId]);
                }
                console.log(`  -> Added participants.`);
            } else {
                console.log(`  -> Not enough info to repair (Needs manual check or deletion). Skipping.`);
                // If it's really old and broken, maybe delete? 
                // For now, let's leave it to avoid data loss.
            }
        }
    }
    
    // 2. Double check RLS function existence
    console.log('Verifying get_conversation_participants RPC...');
    const rpcCheck = await client.query("SELECT proname FROM pg_proc WHERE proname = 'get_conversation_participants'");
    if (rpcCheck.rows.length === 0) {
        console.log('  -> RPC missing! Recreating...');
        await client.query(`
            CREATE OR REPLACE FUNCTION get_conversation_participants(p_conversation_id UUID)
            RETURNS TABLE (user_id UUID)
            LANGUAGE plpgsql
            SECURITY DEFINER
            AS $$
            BEGIN
                RETURN QUERY
                SELECT cp.user_id
                FROM conversation_participants cp
                WHERE cp.conversation_id = p_conversation_id;
            END;
            $$;
        `);
        console.log('  -> RPC created.');
    } else {
        console.log('  -> RPC exists.');
    }

    console.log('Done.');

  } catch (err) {
    console.error('Error executing script:', err);
  } finally {
    await client.end();
  }
}

run();
