import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { InlineClient } from './inline-client';

export const metadata = {
  title: 'Inline Notifications | Sotto',
};

export default async function InlinePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const { data: membership } = await supabase
    .from('account_members')
    .select('account_id')
    .eq('user_id', user.id)
    .single();

  if (!membership) {
    return <div>No account found</div>;
  }

  const { data: account } = await supabase
    .from('accounts')
    .select('widget_config')
    .eq('id', membership.account_id)
    .single();

  const config = account?.widget_config || {};
  const inlineConfig = config.inline || {
    active_visitors_text: '{{count}} people are currently viewing this page',
    page_stream_text: '{{count}} people bought this in the last 24 hours',
    custom_roundups_text: '{{count}} people subscribed recently',
    active_visitors_enabled: true,
    page_stream_enabled: true,
    custom_roundups_enabled: true
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--s-6)' }}>
      <div>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 600, margin: '0 0 var(--s-2) 0' }}>Inline Notifications</h1>
        <p style={{ color: 'var(--text-muted)', margin: 0 }}>
          Embed aggregate statistics directly into your webpage content. Perfect for displaying below "Add to Cart" buttons.
        </p>
      </div>

      <InlineClient initialConfig={inlineConfig} />
    </div>
  );
}
