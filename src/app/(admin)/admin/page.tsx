import { createClient } from '@supabase/supabase-js';
import type { Metadata } from 'next';
import { PLANS } from '@/lib/constants';
import { formatDate } from '@/lib/utils';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Super Admin',
};

// Use the service role key since we need to bypass RLS to see ALL accounts
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

export default async function AdminPage() {
  // 1. Fetch all accounts
  const { data: accounts, error: accountsError } = await supabaseAdmin
    .from('accounts')
    .select('id, name, domain, plan, created_at')
    .order('created_at', { ascending: false });

  if (accountsError) {
    return <div className="auth-error">Failed to load accounts: {accountsError.message}</div>;
  }

  // 2. Fetch event counts for each account
  // Note: For MVP, we do individual queries. In scale, we'd do a GROUP BY query via RPC.
  const accountsWithStats = await Promise.all(
    (accounts || []).map(async (account) => {
      // Get total events (ingested events count against quota)
      const { count } = await supabaseAdmin
        .from('events')
        .select('*', { count: 'exact', head: true })
        .eq('account_id', account.id)
        .neq('source', 'sotto_pixel'); // Don't charge quota for our own tracking events

      const planLimit = PLANS[account.plan as keyof typeof PLANS]?.events || 0;
      const usagePercent = count ? Math.min(100, Math.round((count / planLimit) * 100)) : 0;

      return {
        ...account,
        eventCount: count || 0,
        planLimit,
        usagePercent,
      };
    })
  );

  return (
    <div className="animate-fade-in">
      <div style={{ marginBottom: 'var(--space-6)' }}>
        <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '2rem', fontWeight: 600, marginBottom: 'var(--space-2)' }}>
          Platform Overview
        </h1>
        <p style={{ color: 'var(--text-muted)' }}>
          Manage your onboarded brands, monitor their quotas, and identify upsell opportunities.
        </p>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div className="table-container" style={{ border: 'none', borderRadius: 0 }}>
          <table className="table">
            <thead>
              <tr>
                <th>Brand Name</th>
                <th>Domain</th>
                <th>Pricing Plan</th>
                <th>Event Quota Usage</th>
                <th>Onboarded</th>
              </tr>
            </thead>
            <tbody>
              {accountsWithStats.map((account) => (
                <tr key={account.id}>
                  <td style={{ fontWeight: 500 }}>
                    {account.name}
                  </td>
                  <td>
                    {account.domain ? (
                      <a href={`https://${account.domain}`} target="_blank" rel="noreferrer" style={{ color: 'var(--text-muted)' }}>
                        {account.domain}
                      </a>
                    ) : (
                      <span style={{ color: 'var(--text-muted)' }}>Not set</span>
                    )}
                  </td>
                  <td>
                    <span className="badge badge-accent" style={{ textTransform: 'capitalize' }}>
                      {account.plan}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <div style={{ fontSize: '0.8125rem', display: 'flex', justifyContent: 'space-between' }}>
                        <span>{account.eventCount.toLocaleString()} / {account.planLimit.toLocaleString()}</span>
                        <span style={{ color: account.usagePercent > 80 ? 'var(--error)' : 'var(--text-muted)' }}>
                          {account.usagePercent}%
                        </span>
                      </div>
                      {/* Mini Progress Bar */}
                      <div style={{ width: '100%', height: '4px', background: 'var(--border)', borderRadius: '2px', overflow: 'hidden' }}>
                        <div style={{ 
                          height: '100%', 
                          width: `${account.usagePercent}%`,
                          background: account.usagePercent > 80 ? 'var(--error)' : 'var(--accent)',
                          borderRadius: '2px'
                        }} />
                      </div>
                    </div>
                  </td>
                  <td style={{ color: 'var(--text-muted)', fontSize: '0.8125rem' }}>
                    {formatDate(account.created_at)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
