const fs = require('fs');

const content = `
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

  const hover_animation = formData.get('hover_animation') as string;
  const position = formData.get('position') as string || 'bottom-left';
  const size = formData.get('size') as string || 'medium';
  const slide_animation = formData.get('slide_animation') as string || 'slide-up';
  
  // Parse the new structured appearance object
  const appearanceRaw = formData.get('appearance') as string;
  let appearance = {};
  if (appearanceRaw) {
    try {
      appearance = JSON.parse(appearanceRaw);
    } catch(e) {}
  }

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
          hover_animation,
          position,
          size,
          slide_animation,
          appearance // Inject the new structured engine config
        }
      },
    })
    .eq('id', membership.account_id);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath('/dashboard/appearance');
}
`;

fs.writeFileSync('src/app/(dashboard)/dashboard/appearance/actions.ts', content);
console.log('Rewrote actions.ts');
