import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Note: Edge runtime removed — @supabase/supabase-js requires Node.js APIs.
// Vercel will still cache responses via Cache-Control headers set below.
export const dynamic = 'force-dynamic';

function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };
}

export async function OPTIONS() {
  return new NextResponse(null, { headers: corsHeaders() });
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const accountId = searchParams.get('account_id');
    const sessionId = searchParams.get('session_id');

    if (!accountId) {
      return NextResponse.json({ error: 'Missing account_id' }, { status: 400, headers: corsHeaders() });
    }

    // 1. Fetch the account's widget config and domain
    const { data: account } = await supabase
      .from('accounts')
      .select('widget_config, domain')
      .eq('id', accountId)
      .single();

    if (!account) {
      return NextResponse.json({ error: 'Account not found' }, { status: 404, headers: corsHeaders() });
    }

    // CORS Origin Validation
    const origin = request.headers.get('origin') || request.headers.get('referer');
    
    if (origin && origin.includes('localhost')) {
      // Allow localhost for local development testing
    } else {
      if (!account.domain) {
        return NextResponse.json({ error: 'Domain not configured for this account' }, { status: 403, headers: corsHeaders() });
      }
      if (!origin) {
        return NextResponse.json({ error: 'Missing origin' }, { status: 403, headers: corsHeaders() });
      }

      try {
        const originUrl = new URL(origin);
        const originHost = originUrl.hostname.toLowerCase();
        const accountHost = account.domain.toLowerCase();

        if (originHost !== accountHost && !originHost.endsWith('.' + accountHost)) {
          return NextResponse.json({ error: 'Unauthorized domain' }, { status: 403, headers: corsHeaders() });
        }
      } catch {
        return NextResponse.json({ error: 'Invalid origin' }, { status: 403, headers: corsHeaders() });
      }
    }

    const config = account.widget_config;

    // Implement frequency capping check using session_id
    if (sessionId) {
      const { count: impressionCount } = await supabase
        .from('events')
        .select('*', { count: 'exact', head: true })
        .eq('account_id', accountId)
        .eq('session_id', sessionId)
        .eq('event_type', 'impression');

      if (impressionCount && impressionCount >= config.frequency_cap) {
        return NextResponse.json({ skip: true }, { headers: corsHeaders() });
      }
    }

    let eventPayload = null;

    if (config.display_mode === 'aggregate') {
      // Get count of purchases in the specified window (e.g. week)
      const windowStart = new Date();
      if (config.aggregate_window === 'day') {
        windowStart.setDate(windowStart.getDate() - 1);
      } else {
        windowStart.setDate(windowStart.getDate() - 7);
      }

      const { count } = await supabase
        .from('events')
        .select('*', { count: 'exact', head: true })
        .eq('account_id', accountId)
        .eq('event_type', 'purchase')
        .gte('created_at', windowStart.toISOString());

      if (count && count > 2) {
        eventPayload = {
          type: 'aggregate',
          title: 'High Demand',
          message: `${count} people recently purchased this`,
          timestamp: new Date().toISOString()
        };
      }
    } else {
      // Individual mode - get the most recent purchase
      const { data: events } = await supabase
        .from('events')
        .select('customer_name, customer_city, product_name, created_at')
        .eq('account_id', accountId)
        .eq('event_type', 'purchase')
        .order('created_at', { ascending: false })
        .limit(1);

      if (events && events.length > 0) {
        const ev = events[0];
        
        // XSS Sanitization: Strip HTML-sensitive characters from user-supplied data
        const sanitize = (str: string | null): string => {
          if (!str) return '';
          return str.replace(/[<>"'&]/g, '').trim();
        };
        
        const safeCity = sanitize(ev.customer_city);
        const locationStr = safeCity.length > 0 ? ` from ${safeCity}` : '';
        const nameStr = sanitize(ev.customer_name) || 'Someone';
        const productName = sanitize(ev.product_name) || 'an item';
        
        eventPayload = {
          type: 'individual',
          title: 'Recent Purchase',
          message: `${nameStr}${locationStr} just purchased ${productName}`,
          timestamp: ev.created_at
        };
      }
    }

    if (!eventPayload) {
      // No recent events to show
      return NextResponse.json({ skip: true }, { headers: corsHeaders() });
    }

    const responseHeaders: Record<string, string> = {
      ...corsHeaders(),
      'Cache-Control': 's-maxage=30, stale-while-revalidate=60'
    };

    return NextResponse.json({
      event: eventPayload,
      theme: config.theme,
      rules: {
        page_rules: config.page_rules,
        suppress_rules: config.suppress_rules
      }
    }, { headers: responseHeaders });

  } catch (error) {
    console.error('Events API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500, headers: corsHeaders() });
  }
}
