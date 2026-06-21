import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase admin client for the widget API
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const accountId = searchParams.get('account_id');
    const url = searchParams.get('url') || '';

    if (!accountId) {
      return NextResponse.json({ error: 'Missing account_id' }, { status: 400 });
    }

    // 1. Fetch account configuration to get inline text templates
    const { data: account } = await supabaseAdmin
      .from('accounts')
      .select('widget_config')
      .eq('id', accountId)
      .single();

    if (!account) {
      return NextResponse.json({ error: 'Account not found' }, { status: 404 });
    }

    const config = account.widget_config || {};
    const inlineConfig = config.inline || {
      active_visitors_text: '{{count}} people are currently viewing this page',
      page_stream_text: '{{count}} people bought this in the last 24 hours',
      custom_roundups_text: '{{count}} people subscribed recently',
      active_visitors_enabled: true,
      page_stream_enabled: true,
      custom_roundups_enabled: true
    };

    // 2. Calculate "Active Visitors"
    let activeVisitorsCount = 0;
    const mode = inlineConfig.active_visitors_mode || 'simulated';

    if (mode === 'true_live') {
      // Count unique session_ids from the last 15 minutes
      const fifteenMinsAgo = new Date();
      fifteenMinsAgo.setMinutes(fifteenMinsAgo.getMinutes() - 15);
      
      const { data: recentSessions } = await supabaseAdmin
        .from('events')
        .select('session_id')
        .eq('account_id', accountId)
        .gte('created_at', fifteenMinsAgo.toISOString());
        
      if (recentSessions) {
        const uniqueSessions = new Set(recentSessions.map(s => s.session_id));
        activeVisitorsCount = uniqueSessions.size;
      }
    } else {
      // Smart Algorithm (Simulated)
      // We want a realistic fluctuating number. We hash the URL + current time (rounded to 10 mins).
      const timeSlot = Math.floor(Date.now() / (1000 * 60 * 10)); 
      const strToHash = accountId + url + timeSlot.toString();
      let hash = 0;
      for (let i = 0; i < strToHash.length; i++) {
        hash = ((hash << 5) - hash) + strToHash.charCodeAt(i);
        hash |= 0;
      }
      // Generate a number between 12 and 47
      activeVisitorsCount = Math.abs(hash) % 35 + 12;
    }

    // 3. Calculate "Page Stream" (Purchases in last 24h)
    const yesterday = new Date();
    yesterday.setHours(yesterday.getHours() - 24);
    
    const { count: purchaseCount } = await supabaseAdmin
      .from('events')
      .select('*', { count: 'exact', head: true })
      .eq('account_id', accountId)
      .eq('event_type', 'purchase')
      .gte('created_at', yesterday.toISOString());

    // 4. Calculate "Custom Roundups" (Signups/Reviews in last 24h)
    const { count: signupCount } = await supabaseAdmin
      .from('events')
      .select('*', { count: 'exact', head: true })
      .eq('account_id', accountId)
      .in('event_type', ['signup', 'review', 'custom'])
      .gte('created_at', yesterday.toISOString());

    // 5. Format the texts
    const responseData = {
      active_visitors: {
        enabled: inlineConfig.active_visitors_enabled,
        count: activeVisitorsCount,
        text: inlineConfig.active_visitors_text.replace('{{count}}', activeVisitorsCount.toString())
      },
      page_stream: {
        enabled: inlineConfig.page_stream_enabled,
        count: purchaseCount || 0,
        text: inlineConfig.page_stream_text.replace('{{count}}', (purchaseCount || 0).toString())
      },
      custom_roundups: {
        enabled: inlineConfig.custom_roundups_enabled,
        count: signupCount || 0,
        text: inlineConfig.custom_roundups_text.replace('{{count}}', (signupCount || 0).toString())
      }
    };

    return NextResponse.json(responseData, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120'
      }
    });

  } catch (error: any) {
    console.error('[Sotto] Inline API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function OPTIONS(request: Request) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}
