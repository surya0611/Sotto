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

    if (!['impression', 'click', 'conversion'].includes(event_type)) {
      return NextResponse.json({ error: 'Invalid event type' }, { status: 400, headers: corsHeaders() });
    }

    // CORS Origin Validation
    const { data: account } = await supabase
      .from('accounts')
      .select('domain')
      .eq('id', account_id)
      .single();

    const origin = request.headers.get('origin') || request.headers.get('referer');
    if (account && origin && account.domain && !origin.includes(account.domain)) {
      if (!origin.includes('localhost')) {
        return NextResponse.json({ error: 'Unauthorized domain' }, { status: 403, headers: corsHeaders() });
      }
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
