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
    active_visitors_mode: formData.get('active_visitors_mode')?.toString() || 'simulated',
    active_visitors_text: formData.get('active_visitors_text')?.toString() || '',
    active_visitors_color: formData.get('active_visitors_color')?.toString() || 'inherit',
    active_visitors_size: formData.get('active_visitors_size')?.toString() || 'inherit',
    active_visitors_icon: formData.get('active_visitors_icon')?.toString() || 'none',
    
    page_stream_enabled: formData.get('page_stream_enabled') === 'on',
    page_stream_text: formData.get('page_stream_text')?.toString() || '',
    page_stream_color: formData.get('page_stream_color')?.toString() || 'inherit',
    page_stream_size: formData.get('page_stream_size')?.toString() || 'inherit',
    page_stream_icon: formData.get('page_stream_icon')?.toString() || 'none',
    
    custom_roundups_enabled: formData.get('custom_roundups_enabled') === 'on',
    custom_roundups_text: formData.get('custom_roundups_text')?.toString() || '',
    custom_roundups_color: formData.get('custom_roundups_color')?.toString() || 'inherit',
    custom_roundups_size: formData.get('custom_roundups_size')?.toString() || 'inherit',
    custom_roundups_icon: formData.get('custom_roundups_icon')?.toString() || 'none',
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
