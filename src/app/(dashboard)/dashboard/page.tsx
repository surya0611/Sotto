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

      {/* Quick Start Checklist */}
      <div className="card" style={{ marginBottom: 'var(--space-6)' }}>
        <div className="card-header">
          <div>
            <h3 className="card-title">Quick Start Guide</h3>
            <p className="card-description">Complete these steps to get Sotto running on your store</p>
          </div>
          <span className="badge badge-accent">0 / 4</span>
        </div>
        <div className="card-content">
          <div className="checklist" style={{ display: 'flex', flexDirection: 'column' }}>
            <Link href="/dashboard/integrations" className="checklist-item" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 'var(--space-4)', padding: 'var(--space-3) 0', borderBottom: '1px solid var(--border)' }}>
              <span className="checklist-number" style={{ background: 'var(--bg-elevated)', width: '24px', height: '24px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-primary)' }}>1</span>
              <span className="checklist-text" style={{ flex: 1, color: 'var(--text-primary)', fontWeight: 500 }}>Connect your first integration</span>
              <span className="badge badge-default" style={{ transition: 'all 0.2s', cursor: 'pointer' }}>→ Go</span>
            </Link>
            <Link href="/dashboard/appearance" className="checklist-item" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 'var(--space-4)', padding: 'var(--space-3) 0', borderBottom: '1px solid var(--border)' }}>
              <span className="checklist-number" style={{ background: 'var(--bg-elevated)', width: '24px', height: '24px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-primary)' }}>2</span>
              <span className="checklist-text" style={{ flex: 1, color: 'var(--text-primary)', fontWeight: 500 }}>Configure your widget appearance</span>
              <span className="badge badge-default" style={{ transition: 'all 0.2s', cursor: 'pointer' }}>→ Go</span>
            </Link>
            <Link href="/dashboard/embed" className="checklist-item" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 'var(--space-4)', padding: 'var(--space-3) 0', borderBottom: '1px solid var(--border)' }}>
              <span className="checklist-number" style={{ background: 'var(--bg-elevated)', width: '24px', height: '24px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-primary)' }}>3</span>
              <span className="checklist-text" style={{ flex: 1, color: 'var(--text-primary)', fontWeight: 500 }}>Install the embed snippet</span>
              <span className="badge badge-default" style={{ transition: 'all 0.2s', cursor: 'pointer' }}>→ Go</span>
            </Link>
            <Link href="/demo" target="_blank" className="checklist-item" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 'var(--space-4)', padding: 'var(--space-3) 0' }}>
              <span className="checklist-number" style={{ background: 'var(--bg-elevated)', width: '24px', height: '24px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-primary)' }}>4</span>
              <span className="checklist-text" style={{ flex: 1, color: 'var(--text-primary)', fontWeight: 500 }}>View live demo</span>
              <span className="badge badge-default" style={{ transition: 'all 0.2s', cursor: 'pointer' }}>→ Go</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Recent Events (Empty State) */}
      <div className="card">
        <div className="card-header">
          <div>
            <h3 className="card-title">Recent Events</h3>
            <p className="card-description">Latest activity from your integrations</p>
          </div>
        </div>
        <div className="card-content">
          <div className="empty-state" style={{ padding: 'var(--space-10) var(--space-6)' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--bg-accent-light)', color: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Zap width="20" height="20" />
            </div>
            <h4 className="empty-state-title">No events yet</h4>
            <p className="empty-state-description">
              Events will appear here once you connect an integration and receive your first webhook.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
