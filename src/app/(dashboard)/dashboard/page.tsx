import { createClient } from '@/lib/supabase/server';
import type { Metadata } from 'next';
import Link from 'next/link';
import { Zap, Eye, PointerClick, BarChart } from '@/components/icons';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Dashboard',
};

export default async function DashboardPage() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();

  // Fetch the user's account
  const { data: membership } = await supabase
    .from('account_members')
    .select('account_id, accounts(name)')
    .eq('user_id', user?.id || '')
    .single();

  const brandName = (membership?.accounts as any)?.name || 'there';
  const accountId = membership?.account_id;

  // Fetch real stats
  let totalEvents = 0;
  let impressions = 0;
  let clickThroughs = 0;
  let clickThroughRate = 0;

  if (accountId) {
    const { data: events } = await supabase
      .from('events')
      .select('event_type, source')
      .eq('account_id', accountId)
      .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()); // Last 7 days

    if (events) {
      totalEvents = events.filter(e => e.source !== 'sotto_pixel').length;
      impressions = events.filter(e => e.event_type === 'impression').length;
      clickThroughs = events.filter(e => e.event_type === 'click').length;
      
      if (impressions > 0) {
        clickThroughRate = Number(((clickThroughs / impressions) * 100).toFixed(1));
      }
    }
  }

  return (
    <div className="animate-fade-in">
      {/* Welcome Section */}
      <div style={{ marginBottom: 'var(--space-8)' }}>
        <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.5rem', fontWeight: 600, marginBottom: 'var(--space-2)' }}>
          Welcome, {brandName}
        </h2>
        <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
          Here&apos;s an overview of your social proof activity.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="stats-grid" style={{ marginBottom: 'var(--space-8)' }}>
        <div className="stats-card">
          <div className="stats-card-header">
            <span className="stats-card-label">Total Events</span>
            <div className="stats-card-icon">
              <Zap width="16" height="16" />
            </div>
          </div>
          <div className="stats-card-value">{totalEvents}</div>
          <div className="stats-card-trend" style={{ color: 'var(--text-muted)' }}>
            This week
          </div>
        </div>

        <div className="stats-card">
          <div className="stats-card-header">
            <span className="stats-card-label">Impressions</span>
            <div className="stats-card-icon">
              <Eye width="16" height="16" />
            </div>
          </div>
          <div className="stats-card-value">{impressions}</div>
          <div className="stats-card-trend" style={{ color: 'var(--text-muted)' }}>
            This week
          </div>
        </div>

        <div className="stats-card">
          <div className="stats-card-header">
            <span className="stats-card-label">Click-throughs</span>
            <div className="stats-card-icon">
              <PointerClick width="16" height="16" />
            </div>
          </div>
          <div className="stats-card-value">{clickThroughs}</div>
          <div className="stats-card-trend" style={{ color: 'var(--text-muted)' }}>
            This week
          </div>
        </div>

        <div className="stats-card">
          <div className="stats-card-header">
            <span className="stats-card-label">Click-through Rate</span>
            <div className="stats-card-icon">
              <BarChart width="16" height="16" />
            </div>
          </div>
          <div className="stats-card-value">{clickThroughRate}%</div>
          <div className="stats-card-trend" style={{ color: 'var(--text-muted)' }}>
            This week
          </div>
        </div>
      </div>

      {/* Quick Start Wizard (Redesigned) */}
      <div style={{ marginBottom: 'var(--space-10)' }}>
        <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.25rem', fontWeight: 600, marginBottom: 'var(--space-4)' }}>
          Let's get Sotto running on your store
        </h3>
        <p style={{ color: 'var(--text-secondary)', marginBottom: 'var(--space-6)' }}>Follow these 3 simple steps to launch your first social proof campaign.</p>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          
          {/* Step 1 */}
          <div className="card card-hover" style={{ display: 'flex', gap: 'var(--space-6)', alignItems: 'center', padding: 'var(--space-6)' }}>
            <div style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', width: '48px', height: '48px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.25rem', fontWeight: 600, color: 'var(--text-primary)', flexShrink: 0 }}>
              1
            </div>
            <div style={{ flex: 1 }}>
              <h4 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: 'var(--space-1)' }}>Install the Embed Code</h4>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Paste our tiny snippet into your website's code to enable Sotto.</p>
            </div>
            <Link href="/dashboard/embed" className="btn btn-primary">
              Get Code →
            </Link>
          </div>

          {/* Step 2 */}
          <div className="card card-hover" style={{ display: 'flex', gap: 'var(--space-6)', alignItems: 'center', padding: 'var(--space-6)' }}>
            <div style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', width: '48px', height: '48px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.25rem', fontWeight: 600, color: 'var(--text-primary)', flexShrink: 0 }}>
              2
            </div>
            <div style={{ flex: 1 }}>
              <h4 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: 'var(--space-1)' }}>Connect your Data</h4>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Link your Shopify store, Stripe account, or custom webhooks to pull in sales data.</p>
            </div>
            <Link href="/dashboard/integrations" className="btn btn-secondary">
              Connect Apps
            </Link>
          </div>

          {/* Step 3 */}
          <div className="card card-hover" style={{ display: 'flex', gap: 'var(--space-6)', alignItems: 'center', padding: 'var(--space-6)' }}>
            <div style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', width: '48px', height: '48px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.25rem', fontWeight: 600, color: 'var(--text-primary)', flexShrink: 0 }}>
              3
            </div>
            <div style={{ flex: 1 }}>
              <h4 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: 'var(--space-1)' }}>Design your Widget</h4>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Customize how the popups look and feel to match your brand perfectly.</p>
            </div>
            <Link href="/dashboard/widget" className="btn btn-secondary">
              Customize
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
}
