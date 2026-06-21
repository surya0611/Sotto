'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function saveInlineConfig(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) throw new Error('Unauthorized');

  const { data: membership } = await supabase
    .from('account_members')
    .select('account_id')
    .eq('user_id', user.id)
    .single();

  if (!membership?.account_id) throw new Error('No account found');

  const { data: account } = await supabase
    .from('accounts')
    .select('widget_config')
    .eq('id', membership.account_id)
    .single();

  const currentConfig = account?.widget_config || {};

  const inlineConfig = {
    active_visitors_enabled: formData.get('active_visitors_enabled') === 'on',
    active_visitors_text: formData.get('active_visitors_text')?.toString() || '',
    page_stream_enabled: formData.get('page_stream_enabled') === 'on',
    page_stream_text: formData.get('page_stream_text')?.toString() || '',
    custom_roundups_enabled: formData.get('custom_roundups_enabled') === 'on',
    custom_roundups_text: formData.get('custom_roundups_text')?.toString() || '',
  };

  const newConfig = {
    ...currentConfig,
    inline: inlineConfig,
  };

  const { error } = await supabase
    .from('accounts')
    .update({ widget_config: newConfig })
    .eq('id', membership.account_id);

  if (error) throw new Error(error.message);

  revalidatePath('/dashboard/inline');
  return { success: true };
}
