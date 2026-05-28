import { createClient } from '@/lib/supabase/server';
import type { Metadata } from 'next';
import { Zap } from '@/components/icons';
import { formatRelativeTime } from '@/lib/utils';
import { SottoEvent } from '@/types';
import { ExportButton } from './export-button';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Events',
};

export default async function EventsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  let events: SottoEvent[] = [];

  if (user) {
    const { data: membership } = await supabase
      .from('account_members')
      .select('account_id')
      .eq('user_id', user.id)
      .single();
      
    if (membership) {
      const { data } = await supabase
        .from('events')
        .select('*')
        .eq('account_id', membership.account_id)
        .order('created_at', { ascending: false })
        .limit(100);
        
      events = (data as unknown as SottoEvent[]) || [];
    }
  }

  return (
    <div className="animate-fade-in">
      <div style={{ marginBottom: 'var(--space-6)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.5rem', fontWeight: 600, marginBottom: 'var(--space-2)' }}>
            Events Log
          </h2>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
            Live stream of events ingested from your integrations.
          </p>
        </div>
        <ExportButton events={events} />
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {events.length === 0 ? (
          <div className="empty-state" style={{ padding: 'var(--space-12) var(--space-6)' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--bg-accent-light)', color: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
              <Zap width="20" height="20" />
            </div>
            <h4 className="empty-state-title">No events yet</h4>
            <p className="empty-state-description">
              Connect an integration and receive your first webhook to see events here.
            </p>
          </div>
        ) : (
          <div className="table-container" style={{ border: 'none', borderRadius: 0 }}>
            <table className="table">
              <thead>
                <tr>
                  <th>Event Type</th>
                  <th>Source</th>
                  <th>Customer</th>
                  <th>Location</th>
                  <th>Product Details</th>
                  <th>Time</th>
                </tr>
              </thead>
              <tbody>
                {events.map((event) => (
                  <tr key={event.id}>
                    <td>
                      <span className="badge badge-accent">
                        {event.event_type}
                      </span>
                    </td>
                    <td>
                      <span style={{ textTransform: 'capitalize', fontSize: '0.8125rem' }}>
                        {event.source.replace('_', ' ')}
                      </span>
                    </td>
                    <td style={{ fontWeight: 500 }}>
                      {event.customer_name || 'Anonymous'}
                    </td>
                    <td>
                      {event.customer_city ? (
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <span style={{ fontSize: '0.75rem' }}>📍</span>
                          {event.customer_city}
                          {event.customer_region ? `, ${event.customer_region}` : ''}
                        </span>
                      ) : (
                        <span style={{ color: 'var(--text-muted)' }}>Unknown</span>
                      )}
                    </td>
                    <td>
                      {event.product_name || <span style={{ color: 'var(--text-muted)' }}>-</span>}
                    </td>
                    <td style={{ color: 'var(--text-muted)', fontSize: '0.8125rem', whiteSpace: 'nowrap' }}>
                      {formatRelativeTime(event.created_at)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
