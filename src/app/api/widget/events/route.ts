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

    // Extract exclusions from query params (JSON arrays)
    let excludedEventIds: string[] = [];
    try {
      const eParam = searchParams.get('excluded_event_ids');
      if (eParam) excludedEventIds = JSON.parse(decodeURIComponent(eParam));
    } catch (e) {}

    let excludedProductIds: string[] = [];
    try {
      const pParam = searchParams.get('excluded_product_ids');
      if (pParam) excludedProductIds = JSON.parse(decodeURIComponent(pParam));
    } catch (e) {}

    if (!accountId) {
      return NextResponse.json({ error: 'Missing account_id' }, { status: 400, headers: corsHeaders() });
    }

    // 1. Fetch the account's widget config, domain, and templates
    const { data: account } = await supabase
      .from('accounts')
      .select('widget_config, domain')
      .eq('id', accountId)
      .single();

    if (!account) {
      return NextResponse.json({ error: 'Account not found' }, { status: 404, headers: corsHeaders() });
    }

    const { data: templates } = await supabase
      .from('notification_templates')
      .select('*')
      .eq('account_id', accountId)
      .eq('is_active', true);

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
      // Get count of purchases in the specified window
      const windowStart = new Date();
      switch (config.aggregate_window) {
        case '1h':
          windowStart.setHours(windowStart.getHours() - 1);
          break;
        case '6h':
          windowStart.setHours(windowStart.getHours() - 6);
          break;
        case '3d':
          windowStart.setDate(windowStart.getDate() - 3);
          break;
        case 'week':
          windowStart.setDate(windowStart.getDate() - 7);
          break;
        case '30d':
          windowStart.setDate(windowStart.getDate() - 30);
          break;
        default: // 'day'
          windowStart.setDate(windowStart.getDate() - 1);
          break;
      }

      // We need to fetch aggregate counts grouped by product
      const { data: aggEvents } = await supabase
        .from('events')
        .select('product_name, customer_city, product_image_url')
        .eq('account_id', accountId)
        .eq('event_type', 'purchase')
        .gte('created_at', windowStart.toISOString());

      let windowLabel = 'today';
      if (config.aggregate_window === '1h') windowLabel = 'hour';
      else if (config.aggregate_window === '3d') windowLabel = 'few days';
      else if (config.aggregate_window === 'week') windowLabel = 'week';
      else if (config.aggregate_window === '30d') windowLabel = 'month';

      if (aggEvents && aggEvents.length > 0) {
        // Group by product name
        const productCounts: Record<string, { count: number, cities: Record<string, number>, imageUrl: string | null }> = {};
        for (const ev of aggEvents) {
          if (!ev.product_name) continue;
          const pName = ev.product_name;
          if (!productCounts[pName]) {
            productCounts[pName] = { count: 0, cities: {}, imageUrl: ev.product_image_url || null };
          }
          productCounts[pName].count++;
          
          if (ev.customer_city) {
            const city = ev.customer_city;
            productCounts[pName].cities[city] = (productCounts[pName].cities[city] || 0) + 1;
          }
        }

        // Filter valid products (count >= 2 and not excluded)
        const candidates = Object.entries(productCounts)
          .filter(([pName, data]) => data.count >= 2 && !excludedProductIds.includes(pName))
          .sort((a, b) => b[1].count - a[1].count); // Rank by popularity

        if (candidates.length > 0) {
          const topProduct = candidates[0];
          const productName = topProduct[0];
          
          // Find most popular city
          let bestCity = null;
          let maxCityCount = 0;
          for (const [city, count] of Object.entries(topProduct[1].cities)) {
            if (count > maxCityCount) {
              maxCityCount = count;
              bestCity = city;
            }
          }

          // XSS sanitization
          const sanitize = (str: string | null): string => {
            if (!str) return '';
            return str.replace(/[<>"'&]/g, '').trim();
          };

          const safeProductName = sanitize(productName);
          const safeCity = sanitize(bestCity);

          let msg = '';
          if (safeCity && maxCityCount > 0) {
            msg = `A popular choice in ${safeCity} this ${windowLabel}: ${safeProductName}`;
          } else {
            msg = `A popular choice this ${windowLabel}: ${safeProductName}`;
          }

          eventPayload = {
            type: 'aggregate',
            product_id: productName, // Sent to client so it can be added to excluded list
            title: 'High Demand',
            message: msg,
            image_url: topProduct[1].imageUrl,
            timestamp: new Date().toISOString()
          };
        } else if (!excludedProductIds.includes('__STORE_FALLBACK__')) {
          // No qualifying products remain, but we have some events, so show fallback
          eventPayload = {
            type: 'aggregate',
            product_id: '__STORE_FALLBACK__',
            title: 'Trending Store',
            message: `Popular this ${windowLabel} · ${account.domain || 'This store'}`,
            timestamp: new Date().toISOString()
          };
        }
      } else if (!excludedProductIds.includes('__STORE_FALLBACK__')) {
        // Zero events in window, but maybe fallback hasn't been shown yet
        eventPayload = {
          type: 'aggregate',
          product_id: '__STORE_FALLBACK__',
          title: 'Trending Store',
          message: `Popular this ${windowLabel} · ${account.domain || 'This store'}`,
          timestamp: new Date().toISOString()
        };
      }

    } else {
      // Individual mode
      const lookbackDate = new Date();
      const maxAgeDays = config.event_time_threshold || 14;
      lookbackDate.setDate(lookbackDate.getDate() - maxAgeDays);

      let query = supabase
        .from('events')
        .select('id, customer_name, customer_city, customer_region, product_name, product_image_url, created_at')
        .eq('account_id', accountId)
        .eq('event_type', 'purchase')
        .gte('created_at', lookbackDate.toISOString())
        .order('created_at', { ascending: false });

      const { data: events } = await query;

      if (events && events.length > 0) {
        // Filter out excluded events manually if needed, though better done in query if Supabase supports not.in, 
        // but PostgREST has URI length limits. Array filtering in memory is safe for 7 days of events.
        const candidateEvent = events.find(ev => !excludedEventIds.includes(ev.id));

        if (candidateEvent) {
          // XSS Sanitization
          const sanitize = (str: string | null): string => {
            if (!str) return '';
            return str.replace(/[<>"'&]/g, '').trim();
          };
          
          const safeCity = sanitize(candidateEvent.customer_city);
          const nameStr = sanitize(candidateEvent.customer_name) || 'Someone';
          const productName = sanitize(candidateEvent.product_name) || 'an item';
          
          let finalMessage = '';
          const purchaseTemplate = templates?.find(t => t.event_type === 'purchase');
          
          if (purchaseTemplate && purchaseTemplate.template_string) {
            finalMessage = purchaseTemplate.template_string
              .replace(/{{first_name}}/g, nameStr)
              .replace(/{{city}}/g, safeCity || 'their city')
              .replace(/{{province}}/g, sanitize(candidateEvent.customer_region) || 'their region')
              .replace(/{{product_name}}/g, productName)
              .replace(/{{time_ago}}/g, 'recently'); // Widget handles real time_ago separately via formatTimeAgo
          } else {
            const locationStr = safeCity.length > 0 ? ` from ${safeCity}` : '';
            finalMessage = `${nameStr}${locationStr} just purchased ${productName}`;
          }
          
          eventPayload = {
            type: 'individual',
            id: candidateEvent.id, // Passed so client can exclude it next time
            title: purchaseTemplate ? purchaseTemplate.name : 'Recent Purchase',
            message: finalMessage,
            image_url: candidateEvent.product_image_url,
            timestamp: candidateEvent.created_at
          };
        }
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
      timing: config.timing,
      visibility: config.visibility,
      conversion_rules: config.conversion_rules,
      rules: {
        page_rules: config.page_rules,
        suppress_rules: config.suppress_rules,
        max_per_page: config.max_per_page || 20
      }
    }, { headers: responseHeaders });

  } catch (error) {
    console.error('Events API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500, headers: corsHeaders() });
  }
}
