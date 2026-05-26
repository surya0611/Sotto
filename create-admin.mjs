import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function main() {
  const email = 'founder@sotto.com';
  const password = 'password123';
  const brandName = 'Sotto Brand';

  console.log('Creating user (bypassing rate limits)...');
  
  // Create user using the admin API which bypasses rate limits
  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { brand_name: brandName }
  });

  if (authError) {
    console.error('Error creating user:', authError.message);
    // If user already exists, let's try to get them
    if (authError.message.includes('already exists')) {
        console.log('User already exists. You can just log in with it.');
    }
    return;
  }

  const userId = authData.user.id;
  console.log('User created successfully:', userId);

  console.log('Creating brand account...');
  const { data: account, error: accountError } = await supabase
    .from('accounts')
    .insert({ name: brandName })
    .select()
    .single();

  if (accountError) {
    console.error('Error creating account:', accountError);
    return;
  }

  console.log('Linking user to account...');
  const { error: memberError } = await supabase
    .from('account_members')
    .insert({
      user_id: userId,
      account_id: account.id,
      role: 'admin'
    });

  if (memberError) {
    console.error('Error creating membership:', memberError);
    return;
  }

  console.log('\n✅ SUCCESS! Account created and linked properly.');
}

main();
