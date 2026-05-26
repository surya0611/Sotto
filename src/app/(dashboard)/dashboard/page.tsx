import { createClient } from '@/lib/supabase/server';
import type { Metadata } from 'next';

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
              <span style={{ fontSize: '1rem' }}>⚡</span>
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
              <span style={{ fontSize: '1rem' }}>👁</span>
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
              <span style={{ fontSize: '1rem' }}>👆</span>
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
              <span style={{ fontSize: '1rem' }}>📊</span>
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
          <div className="checklist">
            <div className="checklist-item">
              <span className="checklist-number">1</span>
              <div className="checklist-check">✓</div>
              <span className="checklist-text">Connect your first integration</span>
              <span className="badge badge-default">Pending</span>
            </div>
            <div className="checklist-item">
              <span className="checklist-number">2</span>
              <div className="checklist-check">✓</div>
              <span className="checklist-text">Configure your widget appearance</span>
              <span className="badge badge-default">Pending</span>
            </div>
            <div className="checklist-item">
              <span className="checklist-number">3</span>
              <div className="checklist-check">✓</div>
              <span className="checklist-text">Install the embed snippet on your store</span>
              <span className="badge badge-default">Pending</span>
            </div>
            <div className="checklist-item">
              <span className="checklist-number">4</span>
              <div className="checklist-check">✓</div>
              <span className="checklist-text">Verify events are flowing</span>
              <span className="badge badge-default">Pending</span>
            </div>
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
            <div className="empty-state-icon">
              <span style={{ fontSize: '1.5rem' }}>⚡</span>
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
