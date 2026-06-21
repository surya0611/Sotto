import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { RulesClient } from './rules-client';
import { AdvancedRule } from '@/types';

export const metadata = {
  title: 'Advanced Rules | Sotto',
};

export default async function RulesPage() {
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

  const { data: account } = await supabase
    .from('accounts')
    .select('widget_config')
    .eq('id', accountMember.account_id)
    .single();

  if (!account) {
    return <div>Account not found</div>;
  }

  const advancedRules = account.widget_config?.advanced_rules || [];

  return (
    <div className="layout-content-inner">
      <div style={{ marginBottom: 'var(--space-6)' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 600, margin: '0 0 var(--space-2) 0' }}>Advanced Rules Engine</h1>
        <p style={{ color: 'var(--text-muted)', margin: 0 }}>
          Customize exactly where and when the Sotto widget appears on your site.
        </p>
      </div>

      <div style={{ maxWidth: '800px' }}>
        <RulesClient initialRules={advancedRules as AdvancedRule[]} />
      </div>
    </div>
  );
}
