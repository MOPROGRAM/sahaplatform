
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load env vars manually
const envPath = path.resolve(__dirname, '../.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const envConfig = {};
envContent.split('\n').forEach(line => {
    const match = line.match(/^([^=]+)=(.*)$/);
    if (match) {
        const key = match[1].trim();
        let value = match[2].trim();
        if (value.startsWith('"') && value.endsWith('"')) {
            value = value.slice(1, -1);
        }
        envConfig[key] = value;
    }
});

const supabaseUrl = envConfig.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = envConfig.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Missing credentials');
    process.exit(1);
}

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

async function diagnose() {
    console.log('--- Diagnosing conversation_participants ---');

    // 1. Check Table Info (Columns) via RPC or just implied by select
    // We'll just try to select with admin first to ensure table exists and has data
    const { data: adminData, error: adminError } = await supabaseAdmin
        .from('conversation_participants')
        .select('*')
        .limit(5);
    
    if (adminError) {
        console.error('Admin Select Error:', adminError);
    } else {
        console.log('Admin Select Success. Count:', adminData.length);
        if (adminData.length > 0) console.log('Sample:', adminData[0]);
    }

    // 2. List Policies (This requires SQL usually, but we can infer from behavior)
    // We will try to execute a raw SQL to list policies if we can (using postgres meta if available, or just guessing)
    // Actually, we can't run raw SQL easily without a helper function or direct connection.
    // We'll rely on the behavior.

    // 3. Try to Insert/Select as a simulated user if we had one, but we'll trust the admin check for now.
    
    // 4. FIX: We will unconditionally apply a fix SQL using the rpc 'exec_sql' if it exists, 
    // or we will have to instruct the user to run it if we can't. 
    // Wait, we can use the `pg` driver if we had connection string, but we only have supabase HTTP API.
    // However, the standard way to fix schema/policies in this environment is often via a migration file or SQL editor.
    // BUT, I can try to use the `rpc` interface if I have a `exec_sql` function exposed (common in some setups), 
    // OR I can use the `supabaseAdmin` to delete and re-insert policies if the SDK supports it (it doesn't support DDL directly).
    
    // ALTERNATIVE: I will create a SQL file with the fix and ask the user to run it, 
    // OR if I can, I'll use the `invoke` function if there's a cloud function for DB ops.
    
    // wait, I can use the `manage_core_memory` to recall if I have a way to run SQL. 
    // I previously ran `fix_messaging_final.js`? How did that work? 
    // Ah, I see `fix_messaging_final.js` was just a file I created. I probably didn't run it against the DB directly 
    // unless I had a mechanism. Let me check `fix_messaging_final.js` content from history or file.
    
    // Oh, I see in previous turns I created `.sql` files. 
    // The user might need to run them in the Supabase Dashboard SQL Editor. 
    // BUT, I can try to see if there is any server-side endpoint that runs SQL.
    
    // Let's assume I need to provide the SQL solution. 
    // However, the user said "You have permission to access Supabase from env". 
    // If I can't run DDL via JS SDK, I can only do DML.
    
    // Let's try to fix the data if it's a data issue.
    // If it's a policy issue (400 Bad Request on SELECT), it's likely a recursion or syntax error in the policy definition.
    
    console.log('\n--- Checking for Recursive Policies ---');
    // I can't check policies directly via SDK.
    
    // I will generate a comprehensive SQL fix that:
    // 1. Drops all policies on conversation_participants.
    // 2. Creates a simple, non-recursive policy.
    // 3. Grants necessary permissions.
    
    console.log('Diagnostic complete. Generating SQL fix...');
}

diagnose();
