const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Read .env.local manually
const envPath = path.resolve(__dirname, '../.env.local');
let supabaseUrl = '';
let supabaseServiceKey = '';

try {
    const envContent = fs.readFileSync(envPath, 'utf8');
    const urlMatch = envContent.match(/NEXT_PUBLIC_SUPABASE_URL=(.+)/);
    const keyMatch = envContent.match(/SUPABASE_SERVICE_ROLE_KEY=(.+)/);
    
    if (urlMatch) supabaseUrl = urlMatch[1].trim();
    if (keyMatch) supabaseServiceKey = keyMatch[1].trim();
    
    // Cleanup quotes
    if (supabaseUrl.startsWith('"')) supabaseUrl = supabaseUrl.slice(1, -1);
    if (supabaseServiceKey.startsWith('"')) supabaseServiceKey = supabaseServiceKey.slice(1, -1);
    
} catch (e) {
    console.error('Could not read .env.local', e);
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function setupStorage() {
    try {
        console.log('Checking storage bucket "chat-media"...');
        const { data: buckets, error: listError } = await supabase.storage.listBuckets();
        
        if (listError) throw listError;

        const bucketExists = buckets.find(b => b.name === 'chat-media');

        if (!bucketExists) {
            console.log('Creating bucket "chat-media"...');
            const { data, error } = await supabase.storage.createBucket('chat-media', {
                public: false,
                fileSizeLimit: 52428800, // 50MB
                allowedMimeTypes: ['image/*', 'video/*', 'audio/*', 'application/pdf']
            });
            
            if (error) throw error;
            console.log('Bucket created successfully!');
        } else {
            console.log('Bucket "chat-media" already exists.');
        }

    } catch (err) {
        console.error('Storage setup failed:', err);
        // Don't exit 1, maybe already exists or permission issue, just log it.
    }
}

setupStorage();
