'use server';

import { createClient } from '@/lib/supabase/server';
import { createClient as createAdminClient } from '@supabase/supabase-js';
import { revalidatePath } from 'next/cache';

export async function saveTemplate(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) throw new Error('Not authenticated');

  const { data: accountMember } = await supabase
    .from('account_members')
    .select('account_id')
    .eq('user_id', user.id)
    .single();

  if (!accountMember) throw new Error('No account found');

  const id = formData.get('id') as string;
  const name = formData.get('name') as string;
  const event_type = formData.get('event_type') as string;
  const template_string = formData.get('template_string') as string;
  const is_active = formData.get('is_active') === 'on';

  const payload = {
    account_id: accountMember.account_id,
    name,
    event_type,
    template_string,
    is_active,
    updated_at: new Date().toISOString()
  };

  if (id) {
    const { error } = await supabase
      .from('notification_templates')
      .update(payload)
      .eq('id', id)
      .eq('account_id', accountMember.account_id);
    if (error) throw error;
  } else {
    const { error } = await supabase
      .from('notification_templates')
      .insert([payload]);
    if (error) throw error;
  }

  revalidatePath('/dashboard/templates');
}

export async function deleteTemplate(id: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) throw new Error('Not authenticated');

  const { data: accountMember } = await supabase
    .from('account_members')
    .select('account_id')
    .eq('user_id', user.id)
    .single();

  if (!accountMember) throw new Error('No account found');

  const { error } = await supabase
    .from('notification_templates')
    .delete()
    .eq('id', id)
    .eq('account_id', accountMember.account_id);

  if (error) throw error;
  revalidatePath('/dashboard/templates');
}

export async function saveAiSettings(enabled: boolean, tone: 'professional' | 'urgent' | 'playful') {
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

  const existingConfig = account?.widget_config || {};
  
  // Clear templates cache if tone changed so AI regenerates them
  const currentTone = existingConfig.ai_copy?.tone;
  let templatesCache = existingConfig.ai_copy?.templates || {};
  if (currentTone !== tone) {
    templatesCache = {}; 
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  const supabaseAdmin = createAdminClient(supabaseUrl, supabaseServiceKey);

  const { error } = await supabaseAdmin
    .from('accounts')
    .update({
      widget_config: {
        ...existingConfig,
        ai_copy: {
          enabled,
          tone,
          templates: templatesCache
        }
      }
    })
    .eq('id', accountMember.account_id);

  if (error) throw error;
  revalidatePath('/dashboard/templates');
}
