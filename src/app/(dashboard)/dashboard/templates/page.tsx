import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { TemplatesClient } from './templates-client';
import { NotificationTemplate } from '@/types';

export const metadata = {
  title: 'Notification Templates | Sotto',
};

export default async function TemplatesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Get user's account
  const { data: accountMember } = await supabase
    .from('account_members')
    .select('account_id')
    .eq('user_id', user.id)
    .single();

  if (!accountMember) {
    return <div>No account found</div>;
  }

  const { data: accountData } = await supabase
    .from('accounts')
    .select('widget_config')
    .eq('id', accountMember.account_id)
    .single();

  const { data: templates } = await supabase
    .from('notification_templates')
    .select('*')
    .eq('account_id', accountMember.account_id)
    .order('created_at', { ascending: false });

  return (
    <div className="layout-content-inner">
      <div style={{ marginBottom: 'var(--space-6)' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 600, margin: '0 0 var(--space-2) 0' }}>Dynamic Template Engine</h1>
        <p style={{ color: 'var(--text-muted)', margin: 0 }}>
          Design exactly what your notifications say. Insert dynamic variables that automatically populate with real data from your webhooks.
        </p>
      </div>

      <TemplatesClient 
        templates={(templates as NotificationTemplate[]) || []} 
        initialConfig={accountData?.widget_config || {}}
      />
    </div>
  );
}
