'use server';

import { createClient } from '@/lib/supabase/server';
import { createClient as createAdminClient } from '@supabase/supabase-js';
import { revalidatePath } from 'next/cache';

export async function updateAppearanceConfig(formData: FormData) {
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

  const bg_color = formData.get('bg_color') as string;
  const text_color = formData.get('text_color') as string;
  const font_family = formData.get('font_family') as string;
  const border_radius = formData.get('border_radius') as string;
  const position = formData.get('position') as string || 'bottom-left';
  const size = formData.get('size') as string || 'medium';

  // First fetch the existing config
  const { data: account } = await supabase
    .from('accounts')
    .select('widget_config')
    .eq('id', membership.account_id)
    .single();

  const existingConfig = account?.widget_config || {};
  const existingTheme = existingConfig.theme || {};

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  const supabaseAdmin = createAdminClient(supabaseUrl, supabaseServiceKey);

  const { error } = await supabaseAdmin
    .from('accounts')
    .update({
      widget_config: {
        ...existingConfig,
        theme: {
          ...existingTheme,
          bg_color,
          text_color,
          font_family,
          border_radius,
          position,
          size,
        }
      },
    })
    .eq('id', membership.account_id);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath('/dashboard/appearance');
}
