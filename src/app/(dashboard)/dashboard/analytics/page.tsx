import { createClient } from '@/lib/supabase/server';
import type { Metadata } from 'next';
import { Zap, Eye, PointerClick, ShoppingBagIcon, BarChart } from '@/components/icons';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Analytics | Sotto',
};

export default async function AnalyticsPage() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();

  const { data: membership } = await supabase
    .from('account_members')
    .select('account_id')
    .eq('user_id', user?.id || '')
    .single();

  const accountId = membership?.account_id;

  let totalEvents = 0;
  let impressions = 0;
  let clicks = 0;
  let conversions = 0;
  let ctr = 0;

  if (accountId) {
    const { data: events } = await supabase
      .from('events')
      .select('event_type, source')
      .eq('account_id', accountId);

    if (events) {
      totalEvents = events.filter(e => e.source !== 'sotto_pixel').length;
      impressions = events.filter(e => e.event_type === 'impression').length;
      clicks = events.filter(e => e.event_type === 'click').length;
      conversions = events.filter(e => e.event_type === 'conversion').length;
      
      if (impressions > 0) {
        ctr = Number(((clicks / impressions) * 100).toFixed(1));
      }
    }
  }

  return (
    <div className="animate-fade-in">
      <div style={{ marginBottom: 'var(--s-8)' }}>
        <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.5rem', fontWeight: 600, marginBottom: 'var(--s-2)' }}>
          Analytics
        </h2>
        <p style={{ fontSize: '0.9375rem', color: 'var(--text-muted)' }}>
          Performance metrics for your Sotto widgets and integrations.
        </p>
      </div>

      <div className="stats-grid">
        <div className="stats-card">
          <div className="stats-card-header">
            <span className="stats-card-label">Total Events</span>
            <div className="stats-card-icon">
              <Zap width="16" height="16" />
            </div>
          </div>
          <div className="stats-card-value">{totalEvents}</div>
        </div>

        <div className="stats-card">
          <div className="stats-card-header">
            <span className="stats-card-label">Impressions</span>
            <div className="stats-card-icon">
              <Eye width="16" height="16" />
            </div>
          </div>
          <div className="stats-card-value">{impressions}</div>
        </div>

        <div className="stats-card">
          <div className="stats-card-header">
            <span className="stats-card-label">Clicks</span>
            <div className="stats-card-icon">
              <PointerClick width="16" height="16" />
            </div>
          </div>
          <div className="stats-card-value">{clicks}</div>
        </div>

        <div className="stats-card">
          <div className="stats-card-header">
            <span className="stats-card-label">Conversions</span>
            <div className="stats-card-icon">
              <ShoppingBagIcon width="16" height="16" />
            </div>
          </div>
          <div className="stats-card-value">{conversions}</div>
        </div>

        <div className="stats-card">
          <div className="stats-card-header">
            <span className="stats-card-label">Click-through Rate</span>
            <div className="stats-card-icon">
              <BarChart width="16" height="16" />
            </div>
          </div>
          <div className="stats-card-value">{ctr}%</div>
        </div>
      </div>
    </div>
  );
}
