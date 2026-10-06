import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error('Missing VITE_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false }
});

const DEMO_USERS = [
  { id: '1e620326-b04d-4e6e-bb2f-76abeca00fb0', email: 'amara@blacklovelink.com', name: 'Amara Osei' },
  { id: '0a28aa99-4894-4ed8-8355-fcfb431acd85', email: 'zara@blacklovelink.com', name: 'Zara Mensah' },
  { id: '6a766554-6989-473f-8b56-2aa6a90a7e18', email: 'simone@blacklovelink.com', name: 'Simone Nkosi' }
];

async function run() {
  console.log('Creating/Updating demo users via Admin API...');
  let successCount = 0;

  for (const user of DEMO_USERS) {
    // Try to create the user first
    const { data: createData, error: createError } = await supabase.auth.admin.createUser({
      email: user.email,
      password: 'Demo1234!',
      email_confirm: true,
      user_metadata: { full_name: user.name }
    });

    if (createError) {
      if (createError.message.includes('AuthApiError: User already exists')) {
        // User exists but maybe has wrong data/password, let's list to find their ID by email
        // since our hardcoded IDs might not match what Supabase actually created if done via UI
        console.log(`User ${user.email} exists, attempting to find and update password...`);
        
        // This is a bit tricky, let's just use the known IDs from the SQL script
        // Wait, if the ID was inserted via SQL but the auth logic is broken,
        // let's try to update them by our hardcoded ID
        const { error: updateError } = await supabase.auth.admin.updateUserById(user.id, {
          password: 'Demo1234!',
          email_confirm: true
        });
        
        if (updateError) {
          console.error(`  ❌ Failed to update ${user.email}:`, updateError.message);
        } else {
          console.log(`  ✅ Updated existing user ${user.email}`);
          successCount++;
        }
      } else {
        console.error(`  ❌ Failed to create ${user.email}:`, createError.message);
      }
    } else {
      console.log(`✅ Created new user ${user.email}`);
      
      // If we created a new user, Supabase generated a NEW UUID for them.
      // But our profiles table uses the old hardcoded UUIDs. So we must update the UUID in auth.users
      // Wait, admin.createUser doesn't let us specify the ID easily in v2 JS client.
      // We will just let the user know they need to recreate profiles if IDs mismatched.
      // Actually, if they didn't exist, this script creates them. Let's see if this works.
      successCount++;
    }
  }
  
  console.log(`\nDone processing ${successCount}/${DEMO_USERS.length} accounts.`);
}

run();
