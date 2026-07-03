import { createClient } from '@/lib/supabase/server';
import type { Metadata } from 'next';
import { IntegrationCards } from './integration-cards';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Integrations',
};

export default async function IntegrationsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  let accountId = '';
  let secrets: Record<string, string> = {};

  if (user) {
    const { data: membership } = await supabase
      .from('account_members')
      .select('account_id')
      .eq('user_id', user.id)
      .single();
      
    if (membership?.account_id) {
      accountId = membership.account_id;
      
      const supabaseAdmin = createSupabaseClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
      );
      
      const { data: accountSecretData } = await supabaseAdmin
        .from('account_secrets')
        .select('secrets')
        .eq('account_id', accountId)
        .single();
        
      secrets = accountSecretData?.secrets || {};
    }
  }

  return (
    <div className="animate-fade-in">
      <div style={{ marginBottom: 'var(--s-6)' }}>
        <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.5rem', fontWeight: 600, marginBottom: 'var(--s-2)' }}>
          Integrations
        </h2>
        <p style={{ fontSize: '0.9375rem', color: 'var(--text-muted)' }}>
          Connect your tools to start capturing events automatically.
        </p>
      </div>

      <IntegrationCards accountId={accountId} secrets={secrets} />
    </div>
  );
}
