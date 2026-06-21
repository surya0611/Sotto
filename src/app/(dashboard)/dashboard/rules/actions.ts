'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { AdvancedRule } from '@/types';

export async function saveRules(rules: AdvancedRule[]) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) throw new Error('Not authenticated');

  const { data: accountMember } = await supabase
    .from('account_members')
    .select('account_id')
    .eq('user_id', user.id)
    .single();

  if (!accountMember) throw new Error('No account found');

  const { data: account } = await supabase
    .from('accounts')
    .select('widget_config')
    .eq('id', accountMember.account_id)
    .single();

  if (!account) throw new Error('Account not found');

  const newConfig = {
    ...account.widget_config,
    advanced_rules: rules,
  };

  const { error } = await supabase
    .from('accounts')
    .update({ widget_config: newConfig })
    .eq('id', accountMember.account_id);

  if (error) throw error;
  
  revalidatePath('/dashboard/rules');
  revalidatePath('/dashboard/widget'); // In case it's still shown there
}
