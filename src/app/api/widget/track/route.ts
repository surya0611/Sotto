import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Note: Edge runtime removed — @supabase/supabase-js requires Node.js APIs.

function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };
}

export async function OPTIONS() {
  return new NextResponse(null, { headers: corsHeaders() });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { account_id, session_id, event_type, url } = body;

    if (!account_id || !session_id || !event_type) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400, headers: corsHeaders() });
    }

    if (!['impression', 'click', 'conversion', 'init'].includes(event_type)) {
      return NextResponse.json({ error: 'Invalid event type' }, { status: 400, headers: corsHeaders() });
    }

    // CORS Origin Validation and Fetching Config
    const { data: account } = await supabase
      .from('accounts')
      .select('domain, widget_config')
      .eq('id', account_id)
      .single();

    const origin = request.headers.get('origin') || request.headers.get('referer');
    
    if (origin && origin.includes('localhost')) {
      // Allow localhost for local development testing
    } else {
      if (!account || !account.domain) {
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

    let isConversion = false;

    if (event_type === 'init' && url && account?.widget_config?.conversion_rules) {
      const conversionRules = account.widget_config.conversion_rules;
      
      for (const rule of conversionRules) {
        if (!rule.value) continue;
        
        if (rule.type === 'url_contains' && url.includes(rule.value)) {
          isConversion = true;
          break;
        } else if (rule.type === 'url_equals' && url === rule.value) {
          isConversion = true;
          break;
        }
      }

      if (isConversion) {
        // Track the conversion
        const { error: convError } = await supabase.from('events').insert({
          account_id,
          session_id,
          event_type: 'conversion',
          source: 'sotto_pixel', // Legacy identifier for widget-based conversion
          raw_payload: { url }
        });
        if (convError) console.error('Error tracking dynamic conversion:', convError);
      }
      
      // Init events don't get stored as 'init' in the DB. They are just for rule evaluation.
      return NextResponse.json({ success: true, is_conversion: isConversion }, { headers: corsHeaders() });
    }

    const { error } = await supabase.from('events').insert({
      account_id,
      session_id,
      event_type,
      source: 'sotto_pixel',
      raw_payload: { url }
    });

    if (error) {
      console.error('Error tracking widget event:', error);
      return NextResponse.json({ error: 'Database error' }, { status: 500, headers: corsHeaders() });
    }

    return NextResponse.json({ success: true }, { headers: corsHeaders() });

  } catch (error) {
    console.error('Track API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500, headers: corsHeaders() });
  }
}
