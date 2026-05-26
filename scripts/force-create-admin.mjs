import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  const email = 'surya.psingh116@gmail.com';
  const password = 'Password123!';
  const brandName = 'Sotto Admin';

  console.log(`Creating user ${email} bypassing rate limits...`);
  
  // 1. Create the user using the Admin API (bypasses rate limits and auto-confirms)
  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { brand_name: brandName }
  });

  if (authError) {
    console.error('Failed to create user:', authError.message);
    return;
  }

  const userId = authData.user.id;
  console.log(`✅ User created! ID: ${userId}`);

  // 2. Create the account
  const { data: account, error: accountError } = await supabase
    .from('accounts')
    .insert({ name: brandName })
    .select()
    .single();

  if (accountError) {
    console.error('Failed to create account:', accountError.message);
    return;
  }
  
  console.log(`✅ Brand account created! ID: ${account.id}`);

  // 3. Link user to account
  const { error: linkError } = await supabase
    .from('account_members')
    .insert({
      user_id: userId,
      account_id: account.id,
      role: 'admin'
    });

  if (linkError) {
    console.error('Failed to link member:', linkError.message);
    return;
  }

  console.log(`✅ All done! You can now log in.`);
}

run();
