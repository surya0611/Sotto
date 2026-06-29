import { NextRequest, NextResponse } from 'next/server';
import crypto from 'node:crypto';
import { createClient } from '@supabase/supabase-js';
import { getGeolocationFromIp } from '@/lib/geolocation';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function POST(request: NextRequest) {
  try {
    const signatureHeader = request.headers.get('x-razorpay-signature');
    if (!signatureHeader) {
      return NextResponse.json({ error: 'Missing signature header' }, { status: 401 });
    }

    const rawBody = await request.text();
    const searchParams = request.nextUrl.searchParams;
    const accountId = searchParams.get('account_id');

    if (!accountId) {
      return NextResponse.json({ error: 'Missing account_id' }, { status: 400 });
    }

    // Fetch account to get razorpay_secret
    const { data: account, error: accountError } = await supabase
      .from('accounts')
      .select('integration_secrets')
      .eq('id', accountId)
      .single();

    if (accountError || !account) {
      return NextResponse.json({ error: 'Account not found' }, { status: 404 });
    }

    const razorpaySecret = account.integration_secrets?.razorpay_secret;
    if (!razorpaySecret) {
      return NextResponse.json({ error: 'Razorpay integration not configured' }, { status: 400 });
    }

    // Verify HMAC
    const generatedSignature = crypto
      .createHmac('sha256', razorpaySecret)
      .update(rawBody)
      .digest('hex');

    if (generatedSignature !== signatureHeader) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }

    const data = JSON.parse(rawBody);

    if (data.event !== 'payment.captured') {
      return new NextResponse('OK', { status: 200 });
    }

    // Extract fields
    let customerName = data.payload?.payment?.entity?.notes?.name || 'Someone';
    let customerCity = data.payload?.payment?.entity?.notes?.city;
    let productName = data.payload?.payment?.entity?.notes?.product_name || data.payload?.payment?.entity?.description || 'a product';

    // Resolve IP geolocation if city is missing
    if (!customerCity) {
      const ip = request.headers.get('x-forwarded-for');
      const geo = await getGeolocationFromIp(ip);
      if (geo.city) {
        customerCity = geo.city;
      }
    }

    // Deduplication check
    const webhookId = request.headers.get('x-razorpay-event-id');
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
      source: 'razorpay',
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
    console.error('Razorpay webhook error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
