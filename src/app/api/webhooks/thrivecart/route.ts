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

    const { data: account, error: accountError } = await supabase
      .from('accounts')
      .select('integration_secrets')
      .eq('id', accountId)
      .single();

    if (accountError || !account) {
      return NextResponse.json({ error: 'Account not found' }, { status: 404 });
    }

    const thrivecart_secret = account.integration_secrets?.thrivecart_secret;
    if (!thrivecart_secret) {
      return NextResponse.json({ error: 'ThriveCart integration not configured' }, { status: 401 });
    }

    const secretProvided = request.headers.get('x-thrivecart-secret') || searchParams.get('secret');
    if (secretProvided && secretProvided !== thrivecart_secret) {
      return NextResponse.json({ error: 'Invalid secret' }, { status: 401 });
    }

    let payload;
    try {
      const rawBody = await request.text();
      const parsedBody = JSON.parse(rawBody);
      payload = typeof parsedBody === 'string' ? JSON.parse(parsedBody) : parsedBody;
    } catch (e) {
      return NextResponse.json({ error: 'Invalid JSON payload' }, { status: 400 });
    }

    // Generic fallback parsing since exact schema might vary
    const customerName = payload.customer?.first_name || payload.customer?.name || payload.customer_name || payload.buyer_name || payload.billing_address?.first_name || 'Someone';
    const customerCity = payload.shipping_address?.city || payload.billing_address?.city || payload.customer?.city || payload.buyer_city || null;
    
    let productName = 'a product';
    if (payload.products && payload.products.length > 0) {
      productName = payload.products[0].name || payload.products[0].product_name || productName;
    } else if (payload.items && payload.items.length > 0) {
      productName = payload.items[0].name || productName;
    } else if (payload.line_items && payload.line_items.length > 0) {
      productName = payload.line_items[0].name || productName;
    }

    const { error: insertError } = await supabase.from('events').insert({
      account_id: accountId,
      source: 'thrivecart',
      event_type: 'purchase',
      customer_name: customerName,
      customer_city: customerCity,
      product_name: productName,
      raw_payload: payload,
    });

    if (insertError) {
      console.error('Error inserting ThriveCart event:', insertError);
      return NextResponse.json({ error: 'Failed to insert event' }, { status: 500 });
    }

    return new NextResponse('OK', { status: 200 });
  } catch (error) {
    console.error('ThriveCart webhook error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
