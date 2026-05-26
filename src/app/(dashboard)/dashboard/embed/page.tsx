import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

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

  const widgetScript = `<script src="${appUrl}/widget.js" data-account-id="${accountId}" defer></script>`;
  const pixelScript = `<script src="${appUrl}/pixel.js" data-account-id="${accountId}" defer></script>`;

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
      <div>
        <h1 style={{ marginBottom: 'var(--space-2)' }}>Installation</h1>
        <p style={{ color: 'var(--text-secondary)' }}>Add these scripts to your website to display the social proof widget and track conversions.</p>
      </div>

      <div className="card">
        <div className="card-header">
          <h2 className="card-title">1. Widget Script</h2>
          <p className="card-description">Place this script right before the closing <code>&lt;/body&gt;</code> tag on all pages where you want the widget to appear.</p>
        </div>
        <div className="card-content">
          <div style={{ position: 'relative' }}>
            <pre style={{ 
              background: 'var(--bg-deep)', 
              padding: 'var(--space-4)', 
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border)',
              overflowX: 'auto',
              fontSize: '0.875rem',
              color: 'var(--text-primary)'
            }}>
              <code>{widgetScript}</code>
            </pre>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h2 className="card-title">2. Conversion Pixel</h2>
          <p className="card-description">Place this script on your conversion pages (e.g., "Thank You" or order confirmation page) to track new events.</p>
        </div>
        <div className="card-content">
          <div style={{ position: 'relative' }}>
            <pre style={{ 
              background: 'var(--bg-deep)', 
              padding: 'var(--space-4)', 
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border)',
              overflowX: 'auto',
              fontSize: '0.875rem',
              color: 'var(--text-primary)'
            }}>
              <code>{pixelScript}</code>
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}
