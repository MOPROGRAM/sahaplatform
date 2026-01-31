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

    // 1. Check existing columns
    const res = await client.query(`
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = 'messages'
    `);
    
    const existingColumns = res.rows.map(r => r.column_name);
    console.log('Existing columns:', existingColumns);

    const requiredColumns = [
        { name: 'file_url', type: 'TEXT' },
        { name: 'file_name', type: 'TEXT' },
        { name: 'file_size', type: 'BIGINT' },
        { name: 'file_type', type: 'TEXT' }, // MIME type
        { name: 'duration', type: 'INTEGER' } // Duration in seconds (for audio/video)
    ];

    for (const col of requiredColumns) {
        if (!existingColumns.includes(col.name)) {
            console.log(`Adding column: ${col.name}`);
            await client.query(`ALTER TABLE messages ADD COLUMN ${col.name} ${col.type}`);
        } else {
            console.log(`Column ${col.name} exists.`);
        }
    }

    // 2. Setup Storage Bucket (SQL approach not fully possible for creating buckets in Supabase via standard SQL, 
    // usually requires Supabase API or dashboard, but we can try inserting into storage.buckets if we have permissions)
    
    // Note: Creating buckets via SQL in Supabase is done by inserting into storage.buckets
    console.log('Checking storage bucket...');
    try {
        const bucketCheck = await client.query("SELECT id FROM storage.buckets WHERE id = 'chat-attachments'");
        if (bucketCheck.rows.length === 0) {
            console.log('Creating "chat-attachments" bucket...');
            await client.query(`
                INSERT INTO storage.buckets (id, name, public) 
                VALUES ('chat-attachments', 'chat-attachments', true);
            `);
            console.log('Bucket created.');
        } else {
            console.log('Bucket "chat-attachments" already exists.');
        }

        // 3. Setup RLS for Storage
        // Allow public access for now or authenticated users
        // Better to be restrictive, but for this task "authenticated" is key.
        
        console.log('Setting up Storage RLS policies...');
        
        // Policy: Authenticated users can upload
        await client.query(`
            DROP POLICY IF EXISTS "Authenticated users can upload chat attachments" ON storage.objects;
            CREATE POLICY "Authenticated users can upload chat attachments"
            ON storage.objects FOR INSERT
            TO authenticated
            WITH CHECK (bucket_id = 'chat-attachments');
        `);

        // Policy: Anyone (or authenticated) can view/download
        // Since we want "download", public read is easiest, or authenticated read.
        await client.query(`
            DROP POLICY IF EXISTS "Anyone can view chat attachments" ON storage.objects;
            CREATE POLICY "Anyone can view chat attachments"
            ON storage.objects FOR SELECT
            TO authenticated
            USING (bucket_id = 'chat-attachments');
        `);

        console.log('Storage policies applied.');

    } catch (err) {
        console.warn('Storage setup failed (might need Supabase Admin API or Dashboard):', err.message);
    }

    console.log('Database schema update complete.');

  } catch (err) {
    console.error('Error executing script:', err);
  } finally {
    await client.end();
  }
}

run();
