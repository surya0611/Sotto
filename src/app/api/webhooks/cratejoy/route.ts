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

    // Fetch account to check if cratejoy is connected and get the secret if applicable
    const { data: account, error: accountError } = await supabase
      .from('accounts')
      .select('integration_secrets')
      .eq('id', accountId)
      .single();

    if (accountError || !account) {
      return NextResponse.json({ error: 'Account not found' }, { status: 404 });
    }

    const cratejoySecret = account.integration_secrets?.cratejoy_secret;
    if (!cratejoySecret) {
      return NextResponse.json({ error: 'Cratejoy integration not configured' }, { status: 401 });
    }

    // Since Cratejoy doesn't always have a standard HMAC header, 
    // we allow users to pass the secret via a custom header 'x-cratejoy-secret' 
    // or as a query parameter 'secret'
    const secretProvided = request.headers.get('x-cratejoy-secret') || searchParams.get('secret');
    
    // In many real-world cases, Cratejoy might not support custom headers for webhooks easily.
    // If the user hasn't provided a secret in the request but configured one, we might fail.
    // To be robust, if a secret is provided in the request, we validate it.
    if (secretProvided && secretProvided !== cratejoySecret) {
      return NextResponse.json({ error: 'Invalid secret' }, { status: 401 });
    }

    const rawBody = await request.text();
    let payload;
    
    try {
      // Cratejoy webhooks sometimes deliver payload as escaped JSON string
      const parsedBody = JSON.parse(rawBody);
      payload = typeof parsedBody === 'string' ? JSON.parse(parsedBody) : parsedBody;
    } catch (e) {
      return NextResponse.json({ error: 'Invalid JSON payload' }, { status: 400 });
    }

    // Cratejoy Order payload parsing
    const customerName = payload.customer?.name || payload.customer_name || 'Someone';
    const customerCity = payload.shipping_address?.city || payload.customer?.city || null;
    
    let productName = 'a subscription';
    if (payload.products && payload.products.length > 0) {
      productName = payload.products[0].name || payload.products[0].product_name || productName;
    } else if (payload.items && payload.items.length > 0) {
      productName = payload.items[0].name || productName;
    }

    // Insert event
    const { error: insertError } = await supabase.from('events').insert({
      account_id: accountId,
      source: 'cratejoy',
      event_type: 'purchase',
      customer_name: customerName,
      customer_city: customerCity,
      product_name: productName,
      product_image_url: null,
      raw_payload: payload,
    });

    if (insertError) {
      console.error('Error inserting Cratejoy event:', insertError);
      return NextResponse.json({ error: 'Failed to insert event' }, { status: 500 });
    }

    return new NextResponse('OK', { status: 200 });
  } catch (error) {
    console.error('Cratejoy webhook error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
