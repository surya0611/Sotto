'use server';

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Use service role to bypass RLS for initial account creation
// and bypass email rate limits using the admin API
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

export async function registerUserAndBrand(email: string, password: string, brandName: string) {
  // 1. Create the user bypassing email confirmation and rate limits
  const { data: userData, error: userError } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: {
      brand_name: brandName,
    },
  });

  if (userError) {
    console.error('User creation error:', userError);
    throw new Error(userError.message || 'Failed to create user');
  }

  if (!userData.user) {
    throw new Error('Failed to create user: No user returned');
  }

  // 2. Create the account
  const { data: account, error: accountError } = await supabaseAdmin
    .from('accounts')
    .insert({ name: brandName })
    .select()
    .single();

  if (accountError) {
    console.error('Account creation error:', accountError);
    // Note: in a real app, we might want to delete the user if this fails, but for MVP it's fine
    throw new Error('User created but failed to create brand account');
  }

  // 3. Create the account member link
  const { error: linkError } = await supabaseAdmin
    .from('account_members')
    .insert({
      user_id: userData.user.id,
      account_id: account.id,
      role: 'admin',
    });

  if (linkError) {
    console.error('Member link error:', linkError);
    throw new Error('Failed to link user to account');
  }

  return { success: true };
}
