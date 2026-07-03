import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function POST(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const accountId = searchParams.get('account_id');

    if (!accountId) {
      return NextResponse.json({ error: 'Missing account_id parameter' }, { status: 400 });
    }

    // Authenticate using Bearer token or custom header
    const authHeader = request.headers.get('authorization') || request.headers.get('x-sotto-secret');
    const secretProvided = authHeader?.replace('Bearer ', '').trim();

    if (!secretProvided) {
      return NextResponse.json({ error: 'Missing authentication secret' }, { status: 401 });
    }

    // Fetch account to get custom_secret
    const { data: account, error: accountError } = await supabase
      .from('accounts')
      .select('')
      .eq('id', accountId)
      .single();

    if (accountError || !account) {
      return NextResponse.json({ error: 'Account not found' }, { status: 404 });
    }

    const { data: secretData } = await supabase
      .from('account_secrets')
      .select('secrets')
      .eq('account_id', accountId)
      .single();

    const customSecret = secretData?.secrets?.custom_secret;
    if (!customSecret || secretProvided !== customSecret) {
      return NextResponse.json({ error: 'Invalid authentication secret' }, { status: 401 });
    }

    const payload = await request.json();

    // Validate payload schema
    if (!payload.event_type || !payload.product_name) {
      return NextResponse.json(
        { error: 'Payload must include event_type and product_name' }, 
        { status: 400 }
      );
    }

    // Ensure valid event type
    const validEventTypes = ['purchase', 'signup', 'form_submission', 'impression', 'click', 'conversion'];
    if (!validEventTypes.includes(payload.event_type)) {
      return NextResponse.json(
        { error: `Invalid event_type. Must be one of: ${validEventTypes.join(', ')}` }, 
        { status: 400 }
      );
    }

    // Insert event
    const { error: insertError } = await supabase.from('events').insert({
      account_id: accountId,
      source: 'custom',
      event_type: payload.event_type,
      customer_name: payload.customer_name || 'Someone',
      customer_city: payload.customer_city || null,
      product_name: payload.product_name,
      product_image_url: payload.image_url || null,
      raw_payload: payload,
    });

    if (insertError) {
      console.error('Error inserting custom event:', insertError);
      return NextResponse.json({ error: 'Failed to insert event' }, { status: 500 });
    }

    return new NextResponse('OK', { status: 200 });
  } catch (error) {
    console.error('Custom webhook error:', error);
    return NextResponse.json({ error: 'Internal server error or invalid JSON' }, { status: 500 });
  }
}
