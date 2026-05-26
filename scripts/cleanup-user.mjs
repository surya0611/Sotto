import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  const email = 'surya.psingh116@gmail.com';
  console.log(`Looking for user: ${email}`);
  
  const { data, error } = await supabase.auth.admin.listUsers();
  if (error) {
    console.error('Error fetching users:', error);
    return;
  }
  
  const user = data.users.find(u => u.email === email);
  if (user) {
    console.log(`Found user ${user.id}. Deleting...`);
    const { error: deleteError } = await supabase.auth.admin.deleteUser(user.id);
    if (deleteError) {
      console.error('Failed to delete user:', deleteError);
    } else {
      console.log('✅ User successfully deleted.');
    }
  } else {
    console.log('User not found. They might not exist yet.');
  }
}

run();
