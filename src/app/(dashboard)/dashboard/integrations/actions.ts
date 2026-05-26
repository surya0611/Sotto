'use server'

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

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
  
  const { data: account } = await supabase
    .from('accounts')
    .select('integration_secrets')
    .eq('id', membership.account_id)
    .single();
    
  const currentSecrets = (account?.integration_secrets as Record<string, string>) || {};
  
  if (secret === '') {
    delete currentSecrets[`${integrationId}_secret`];
  } else {
    currentSecrets[`${integrationId}_secret`] = secret;
  }
  
  await supabase
    .from('accounts')
    .update({ integration_secrets: currentSecrets })
    .eq('id', membership.account_id);
    
  revalidatePath('/dashboard/integrations');
}
