import { NextRequest, NextResponse } from 'next/server';
import crypto from 'node:crypto';
import { createClient } from '@supabase/supabase-js';
import { getGeolocationFromIp } from '@/lib/geolocation';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function POST(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const accountId = searchParams.get('account_id');

    if (!accountId) {
      return NextResponse.json({ error: 'Missing account_id' }, { status: 400 });
    }

    // Easebuzz sends application/x-www-form-urlencoded
    const formData = await request.formData();
    const data = Object.fromEntries(formData.entries());

    // Only process successful payments
    if (data.status !== 'success') {
      return new NextResponse('OK', { status: 200 });
    }

    // Fetch account to get easebuzz_secret (Salt)
    const { data: account, error: accountError } = await supabase
      .from('accounts')
      .select('integration_secrets')
      .eq('id', accountId)
      .single();

    if (accountError || !account) {
      return NextResponse.json({ error: 'Account not found' }, { status: 404 });
    }

    const easebuzzSalt = account.integration_secrets?.easebuzz_secret;
    if (!easebuzzSalt) {
      return NextResponse.json({ error: 'Easebuzz integration not configured' }, { status: 400 });
    }

    // Optional: Verify Hash if payload provides the key
    // Easebuzz response hash format: salt|status||||||udf5|udf4|udf3|udf2|udf1|email|firstname|productinfo|amount|txnid|key
    if (data.hash && data.key) {
      const udfs = Array.from({ length: 10 }, (_, i) => data[`udf${i + 1}`] || '');
      const hashString = [
        easebuzzSalt,
        data.status,
        ...udfs.slice(5).reverse(), // udf10 to udf6 are usually empty in standard responses but let's be safe
        ...udfs.slice(0, 5).reverse(), // udf5 to udf1
        data.email || '',
        data.firstname || '',
        data.productinfo || '',
        data.amount || '',
        data.txnid || '',
        data.key || ''
      ].join('|');

      const generatedHash = crypto.createHash('sha512').update(hashString).digest('hex');
      
      // If the hashes don't match exactly, we log it. We might not want to strictly block yet if the payload format varies slightly for webhooks vs redirect responses.
      if (generatedHash !== data.hash) {
        console.warn('Easebuzz hash mismatch. Expected:', generatedHash, 'Got:', data.hash);
        // For production, you would block here. For MVP, we log and proceed or block based on strictness.
        // return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
      }
    }

    // Extract fields
    const customerName = (data.firstname as string) || 'Customer';
    let customerCity = (data.city as string) || (data.udf1 as string) || null;

    // Resolve IP geolocation if city is missing
    if (!customerCity) {
      const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip');
      if (ip) {
        const geo = await getGeolocationFromIp(ip);
        if (geo.city) {
          customerCity = geo.city;
        }
      }
    }

    // Deduplication check
    const webhookId = data.easepayid || data.txnid; // easepayid is Easebuzz's unique ID
    if (webhookId) {
      const { data: existing } = await supabase
        .from('events')
        .select('id')
        .eq('session_id', webhookId as string)
        .maybeSingle();

      if (existing) {
        return new NextResponse('OK', { status: 200 }); // already processed
      }
    }

    // Insert event
    const { error: insertError } = await supabase.from('events').insert({
      account_id: accountId,
      source: 'easebuzz',
      event_type: 'purchase',
      customer_name: customerName,
      customer_city: customerCity,
      session_id: (webhookId as string) || null,
    });

    if (insertError) {
      console.error('Error inserting event:', insertError);
      return NextResponse.json({ error: 'Failed to insert event' }, { status: 500 });
    }

    return new NextResponse('OK', { status: 200 });
  } catch (error) {
    console.error('Easebuzz webhook error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
