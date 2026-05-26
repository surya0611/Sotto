import { NextRequest, NextResponse } from 'next/server';
import crypto from 'node:crypto';
import { createClient } from '@supabase/supabase-js';
import { getGeolocationFromIp } from '@/lib/geolocation';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function POST(request: NextRequest) {
  try {
    const hmacHeader = request.headers.get('x-shopify-hmac-sha256');
    if (!hmacHeader) {
      return NextResponse.json({ error: 'Missing HMAC header' }, { status: 401 });
    }

    const rawBody = await request.text();
    const searchParams = request.nextUrl.searchParams;
    const accountId = searchParams.get('account_id');

    if (!accountId) {
      return NextResponse.json({ error: 'Missing account_id' }, { status: 400 });
    }

    // Fetch account to get shopify_secret
    const { data: account, error: accountError } = await supabase
      .from('accounts')
      .select('integration_secrets')
      .eq('id', accountId)
      .single();

    if (accountError || !account) {
      return NextResponse.json({ error: 'Account not found' }, { status: 404 });
    }

    const shopifySecret = account.integration_secrets?.shopify_secret;
    if (!shopifySecret) {
      return NextResponse.json({ error: 'Shopify integration not configured' }, { status: 400 });
    }

    // Verify HMAC
    const generatedHash = crypto
      .createHmac('sha256', shopifySecret)
      .update(rawBody, 'utf8')
      .digest('base64');

    if (generatedHash !== hmacHeader) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }

    const payload = JSON.parse(rawBody);

    // Extract fields
    const customerName = payload.shipping_address?.first_name || payload.customer?.first_name || 'Customer';
    let customerCity = payload.shipping_address?.city;
    const productName = payload.line_items?.[0]?.title || 'A product';

    // Resolve IP geolocation if city is missing
    if (!customerCity) {
      const ip = request.headers.get('x-forwarded-for');
      const geo = await getGeolocationFromIp(ip);
      if (geo.city) {
        customerCity = geo.city;
      }
    }

    // Deduplication check
    const webhookId = request.headers.get('x-shopify-webhook-id');
    if (webhookId) {
      const { data: existing } = await supabase
        .from('events')
        .select('id')
        .eq('session_id', webhookId)
        .maybeSingle();

      if (existing) {
        return new NextResponse('OK', { status: 200 }); // already processed
      }
    }

    // Insert event
    const { error: insertError } = await supabase.from('events').insert({
      account_id: accountId,
      source: 'shopify',
      event_type: 'purchase',
      customer_name: customerName,
      customer_city: customerCity || null,
      product_name: productName,
      session_id: webhookId || null,
    });

    if (insertError) {
      console.error('Error inserting event:', insertError);
      return NextResponse.json({ error: 'Failed to insert event' }, { status: 500 });
    }

    return new NextResponse('OK', { status: 200 });
  } catch (error) {
    console.error('Shopify webhook error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
