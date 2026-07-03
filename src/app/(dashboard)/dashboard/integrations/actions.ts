'use server'

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

import { createClient as createSupabaseClient } from '@supabase/supabase-js';

export async function saveIntegrationSecret(integrationId: string, secret: string) {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Unauthorized');

  const { data: membership } = await supabase
    .from('account_members')
    .select('account_id')
    .eq('user_id', user.id)
    .single();
    
  if (!membership) throw new Error('No account found');
  
  // Use Service Role to access account_secrets since it has NO RLS policies for authenticated users
  const supabaseAdmin = createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
  
  const { data: accountSecretData } = await supabaseAdmin
    .from('account_secrets')
    .select('secrets')
    .eq('account_id', membership.account_id)
    .single();
    
  const currentSecrets = (accountSecretData?.secrets as Record<string, string>) || {};
  
  if (secret === '') {
    delete currentSecrets[`${integrationId}_secret`];
  } else {
    currentSecrets[`${integrationId}_secret`] = secret;
  }
  
  const { error } = await supabaseAdmin
    .from('account_secrets')
    .upsert({ 
      account_id: membership.account_id,
      secrets: currentSecrets,
      updated_at: new Date().toISOString()
    });
    
  if (error) {
    console.error('Error saving secrets:', error);
    throw new Error('Failed to save integration secret');
  }
    
  revalidatePath('/dashboard/integrations');
}
