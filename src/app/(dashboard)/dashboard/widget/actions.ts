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
  const max_per_page = parseInt(formData.get('max_per_page') as string, 10);
  const event_time_threshold = parseInt(formData.get('event_time_threshold') as string, 10);
  
  const delay_ms = parseInt(formData.get('delay_ms') as string, 10);
  const display_ms = parseInt(formData.get('display_ms') as string, 10);
  const time_between_ms = parseInt(formData.get('time_between_ms') as string, 10);
  const loop = formData.get('loop') === 'on';

  const hide_mobile = formData.get('hide_mobile') === 'on';
  const hide_desktop = formData.get('hide_desktop') === 'on';

  // UTM Tracking
  const utm_enabled = formData.get('utm_enabled') === 'on';
  const utm_source = formData.get('utm_source') as string || 'sotto_widget';
  const utm_medium = formData.get('utm_medium') as string || 'social_proof';
  const utm_campaign = formData.get('utm_campaign') as string || '';

  // Note: page_rules are now handled in the Advanced Rules tab
  
  // Extract conversion rules
  const conversion_rules = [];
  const conversionTypes = formData.getAll('conversion_rule_type');
  const conversionValues = formData.getAll('conversion_rule_value');
  
  for (let i = 0; i < conversionTypes.length; i++) {
    if (conversionValues[i]) {
      conversion_rules.push({
        type: conversionTypes[i] as 'url_contains' | 'url_equals',
        value: conversionValues[i] as string
      });
    }
  }

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
        max_per_page,
        event_time_threshold,
        timing: {
          delay_ms,
          display_ms,
          time_between_ms,
          loop
        },
        visibility: {
          hide_mobile,
          hide_desktop
        },
        utm: {
          enabled: utm_enabled,
          source: utm_source,
          medium: utm_medium,
          campaign: utm_campaign
        },
        conversion_rules
      },
    })
    .eq('id', membership.account_id);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath('/dashboard/widget');
}
