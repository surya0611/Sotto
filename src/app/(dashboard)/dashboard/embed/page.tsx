import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { CopyButton } from '@/components/copy-button';
import { VerificationClient } from './verification-client';

export const dynamic = 'force-dynamic';

export default async function EmbedPage() {
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

  const accountId = membership.account_id;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

  const { data: account } = await supabase
    .from('accounts')
    .select('widget_config')
    .eq('id', accountId)
    .single();

  const isInstalled = account?.widget_config?.is_installed === true;


  const widgetScript = `<script src="${appUrl}/widget.min.js" data-account-id="${accountId}" async defer></script>`;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--s-6)' }}>
      <div>
        <h1 style={{ marginBottom: 'var(--s-2)' }}>Installation</h1>
        <p style={{ color: 'var(--fg-muted)' }}>Add this script to your website to display the social proof widget and track conversions automatically.</p>
      </div>

      <VerificationClient initialIsInstalled={isInstalled} />

      <div className="card">
        <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h2 className="card-title">Widget Snippet</h2>
            <p className="card-description">Place this script right before the closing <code>&lt;/body&gt;</code> tag on all pages. It will handle both popups and conversion tracking.</p>
          </div>
          <CopyButton textToCopy={widgetScript} />
        </div>
        <div className="card-content">
          <div style={{ position: 'relative' }}>
            <pre style={{ 
              background: 'var(--bg-surface-hover)', 
              padding: 'var(--s-4)', 
              borderRadius: 'var(--r-md)',
              border: '1px solid var(--border)',
              overflowX: 'auto',
              fontSize: '0.875rem',
              color: 'var(--fg)',
              fontFamily: 'var(--font-mono)'
            }}>
              <code>{widgetScript}</code>
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}
