'use server';

import { createClient } from '@/lib/supabase/server';
import { createClient as createAdminClient } from '@supabase/supabase-js';
import { revalidatePath } from 'next/cache';

export async function updateWidgetConfig(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('Not authenticated');
  }

  // Get account id
  const { data: membership } = await supabase
    .from('account_members')
    .select('account_id')
    .eq('user_id', user.id)
    .single();

  if (!membership?.account_id) {
    throw new Error('No account found');
  }

  const display_mode = formData.get('display_mode') as string;
  const aggregate_window = formData.get('aggregate_window') as string;
  const frequency_cap = parseInt(formData.get('frequency_cap') as string, 10);

  // First fetch the existing config so we don't overwrite theme
  const { data: account } = await supabase
    .from('accounts')
    .select('widget_config')
    .eq('id', membership.account_id)
    .single();

  const existingConfig = account?.widget_config || {};

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  const supabaseAdmin = createAdminClient(supabaseUrl, supabaseServiceKey);

  const { error } = await supabaseAdmin
    .from('accounts')
    .update({
      widget_config: {
        ...existingConfig,
        display_mode,
        aggregate_window,
        frequency_cap,
      },
    })
    .eq('id', membership.account_id);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath('/dashboard/widget');
}
