import { createClient } from '@/lib/supabase/server';
import type { Metadata } from 'next';
import Link from 'next/link';
import { Zap, Eye, PointerClick, BarChart } from '@/components/icons';
import { OverviewCharts } from './overview-charts';
import { VerificationClient } from './embed/verification-client';

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
    .select('account_id, accounts(name, widget_config)')
    .eq('user_id', user?.id || '')
    .single();

  const brandName = (membership?.accounts as any)?.name || 'there';
  const accountId = membership?.account_id;
  const isInstalled = (membership?.accounts as any)?.widget_config?.is_installed === true;

  // Fetch real stats
  let totalEvents = 0;
  let impressions = 0;
  let clickThroughs = 0;
  let clickThroughRate = 0;
  let chartData: { date: string; impressions: number; clicks: number; }[] = [];

  if (accountId) {
    const { data: events } = await supabase
      .from('events')
      .select('event_type, source, created_at')
      .eq('account_id', accountId)
      .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()); // Last 7 days

    if (events) {
      totalEvents = events.filter(e => e.source !== 'sotto_pixel').length;
      impressions = events.filter(e => e.event_type === 'impression').length;
      clickThroughs = events.filter(e => e.event_type === 'click').length;
      
      if (impressions > 0) {
        clickThroughRate = Number(((clickThroughs / impressions) * 100).toFixed(1));
      }

      // Build chart data
      const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      const aggregated: Record<string, { impressions: number; clicks: number }> = {};
      
      // Initialize last 7 days
      for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const dayName = days[d.getDay()];
        aggregated[dayName] = { impressions: 0, clicks: 0 };
      }

      events.forEach(e => {
        const d = new Date(e.created_at);
        const dayName = days[d.getDay()];
        if (aggregated[dayName]) {
          if (e.event_type === 'impression') aggregated[dayName].impressions++;
          if (e.event_type === 'click') aggregated[dayName].clicks++;
        }
      });

      chartData = Object.entries(aggregated).map(([date, counts]) => ({
        date,
        ...counts
      }));
    }
  }

  return (
    <div className="animate-fade-in">
      {/* Welcome */}
      <div style={{ marginBottom: 'var(--s-8)' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 600, margin: '0 0 var(--s-2) 0', letterSpacing: '-0.02em' }}>
          Welcome back, {brandName}
        </h1>
        <p style={{ color: 'var(--text-muted)', margin: 0 }}>
          Here's your social proof activity this week.
        </p>
      </div>
      
      {!isInstalled && (
        <div className="stagger-in" style={{ marginBottom: '32px' }}>
          <VerificationClient initialIsInstalled={isInstalled} />
        </div>
      )}

      {/* Stats Grid */}
      <div className="stats-grid stagger-in" style={{ marginBottom: '32px' }}>
        <div className="stats-card">
          <div className="stats-card-header">
            <span className="stats-card-label">Events</span>
            <div className="stats-card-icon">
              <Zap width="14" height="14" />
            </div>
          </div>
          <div className="stats-card-value">{totalEvents}</div>
          <div className="stats-card-trend">This week</div>
        </div>

        <div className="stats-card">
          <div className="stats-card-header">
            <span className="stats-card-label">Impressions</span>
            <div className="stats-card-icon">
              <Eye width="14" height="14" />
            </div>
          </div>
          <div className="stats-card-value">{impressions}</div>
          <div className="stats-card-trend">This week</div>
        </div>

        <div className="stats-card">
          <div className="stats-card-header">
            <span className="stats-card-label">Clicks</span>
            <div className="stats-card-icon">
              <PointerClick width="14" height="14" />
            </div>
          </div>
          <div className="stats-card-value">{clickThroughs}</div>
          <div className="stats-card-trend">This week</div>
        </div>

        <div className="stats-card">
          <div className="stats-card-header">
            <span className="stats-card-label">Click-through-ratio</span>
            <div className="stats-card-icon">
              <BarChart width="14" height="14" />
            </div>
          </div>
          <div className="stats-card-value">{clickThroughRate}%</div>
          <div className="stats-card-trend">This week</div>
        </div>
      </div>

      {/* Historical Data Charts */}
      <div className="stagger-in" style={{ marginBottom: '40px' }}>
        <OverviewCharts data={chartData} />
      </div>



      {/* Quick Start */}
      <div style={{ marginBottom: '40px' }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '4px' }}>
          Get started
        </h3>
        <p style={{ color: 'var(--fg-subtle)', marginBottom: '20px', fontSize: '0.875rem' }}>3 steps to launch your first campaign.</p>
        
        <div className="stagger-in" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          
          <div className="card card-hover" style={{ display: 'flex', gap: '16px', alignItems: 'center', padding: '16px 20px' }}>
            <div style={{ 
              background: 'var(--bg-muted)', width: '32px', height: '32px', borderRadius: '8px', 
              display: 'flex', alignItems: 'center', justifyContent: 'center', 
              fontSize: '0.8125rem', fontWeight: 800, color: 'var(--fg)', flexShrink: 0,
            }}>1</div>
            <div style={{ flex: 1 }}>
              <h4 style={{ fontSize: '0.9375rem', fontWeight: 700, marginBottom: '1px' }}>Install the Embed Code</h4>
              <p style={{ color: 'var(--fg-subtle)', fontSize: '0.8125rem' }}>Paste our snippet into your website&apos;s code.</p>
            </div>
            <Link href="/dashboard/embed" className="btn btn-primary btn-sm">Get Code →</Link>
          </div>

          <div className="card card-hover" style={{ display: 'flex', gap: '16px', alignItems: 'center', padding: '16px 20px' }}>
            <div style={{ 
              background: 'var(--bg-muted)', width: '32px', height: '32px', borderRadius: '8px', 
              display: 'flex', alignItems: 'center', justifyContent: 'center', 
              fontSize: '0.8125rem', fontWeight: 800, color: 'var(--fg)', flexShrink: 0,
            }}>2</div>
            <div style={{ flex: 1 }}>
              <h4 style={{ fontSize: '0.9375rem', fontWeight: 700, marginBottom: '1px' }}>Connect your Data</h4>
              <p style={{ color: 'var(--fg-subtle)', fontSize: '0.8125rem' }}>Link Shopify, Razorpay, or custom webhooks.</p>
            </div>
            <Link href="/dashboard/integrations" className="btn btn-secondary btn-sm">Connect</Link>
          </div>

          <div className="card card-hover" style={{ display: 'flex', gap: '16px', alignItems: 'center', padding: '16px 20px' }}>
            <div style={{ 
              background: 'var(--bg-muted)', width: '32px', height: '32px', borderRadius: '8px', 
              display: 'flex', alignItems: 'center', justifyContent: 'center', 
              fontSize: '0.8125rem', fontWeight: 800, color: 'var(--fg)', flexShrink: 0,
            }}>3</div>
            <div style={{ flex: 1 }}>
              <h4 style={{ fontSize: '0.9375rem', fontWeight: 700, marginBottom: '1px' }}>Design your Widget</h4>
              <p style={{ color: 'var(--fg-subtle)', fontSize: '0.8125rem' }}>Customize the popup to match your brand.</p>
            </div>
            <Link href="/dashboard/widget" className="btn btn-secondary btn-sm">Customize</Link>
          </div>

        </div>
      </div>
    </div>
  );
}
