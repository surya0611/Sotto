import { createClient } from '@/lib/supabase/server';
import { WidgetForm } from './widget-form';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function WidgetPage() {
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

  if (!membership?.account_id) {
    return <div>No account found</div>;
  }

  const { data: account } = await supabase
    .from('accounts')
    .select('widget_config')
    .eq('id', membership.account_id)
    .single();

  const widgetConfig = account?.widget_config || {};

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
      <div>
        <h1 style={{ marginBottom: 'var(--space-2)' }}>Widget Configuration</h1>
        <p style={{ color: 'var(--text-secondary)' }}>Manage how the Sotto widget behaves on your website.</p>
      </div>

      <WidgetForm initialConfig={widgetConfig} accountId={membership.account_id} />
    </div>
  );
}
