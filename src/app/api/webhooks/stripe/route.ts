import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import crypto from 'node:crypto';

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

    const stripeSecret = secretData?.secrets?.stripe_secret;
    if (!stripeSecret) {
      return NextResponse.json({ error: 'Stripe integration not configured' }, { status: 401 });
    }

    const rawBody = await request.text();
    
    // Check Stripe signature if present
    const signature = request.headers.get('stripe-signature');
    if (signature) {
      // Basic manual verification of Stripe signature (ideally use stripe SDK, but this avoids adding dependencies)
      // stripe-signature format: t=1492774577,v1=5257a869e7ecebe...,v0=6ffbb59b2300aae...
      try {
        const sigParts = signature.split(',').reduce((acc, part) => {
          const [key, value] = part.split('=');
          acc[key] = value;
          return acc;
        }, {} as Record<string, string>);

        if (sigParts.t && sigParts.v1) {
          const signedPayload = `${sigParts.t}.${rawBody}`;
          const expectedSignature = crypto
            .createHmac('sha256', stripeSecret)
            .update(signedPayload)
            .digest('hex');

          if (expectedSignature !== sigParts.v1) {
             console.warn('Stripe signature mismatch. Proceeding with caution or fail.');
             return NextResponse.json({ error: 'Invalid Stripe signature' }, { status: 401 });
          }
        }
      } catch (err) {
        console.error('Error verifying Stripe signature:', err);
      }
    } else {
       // If no signature but secret matches a query param for testing
       const secretProvided = searchParams.get('secret');
       if (secretProvided && secretProvided !== stripeSecret) {
         return NextResponse.json({ error: 'Invalid secret' }, { status: 401 });
       }
    }

    const data = JSON.parse(rawBody);

    // Only process successful payment events
    const validEvents = ['checkout.session.completed', 'payment_intent.succeeded', 'charge.succeeded'];
    if (!validEvents.includes(data.type)) {
      return new NextResponse('OK', { status: 200 }); // Ignore other events safely
    }

    const obj = data.data?.object || {};

    // Extract fields based on the event object type (Checkout session, charge, etc.)
    const customerName = obj.customer_details?.name || obj.billing_details?.name || obj.shipping?.name || 'Someone';
    const customerCity = obj.customer_details?.address?.city || obj.billing_details?.address?.city || obj.shipping?.address?.city || null;
    
    let productName = 'a product';
    // Checkout sessions might have line items embedded if expanded, but usually we fallback
    if (obj.metadata?.product_name) {
      productName = obj.metadata.product_name;
    } else if (obj.description) {
      productName = obj.description;
    }

    const webhookId = data.id || request.headers.get('stripe-signature');

    // Deduplication check
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

    const { error: insertError } = await supabase.from('events').insert({
      account_id: accountId,
      source: 'stripe',
      event_type: 'purchase',
      customer_name: customerName,
      customer_city: customerCity,
      product_name: productName,
      session_id: webhookId,
      raw_payload: data,
    });

    if (insertError) {
      console.error('Error inserting Stripe event:', insertError);
      return NextResponse.json({ error: 'Failed to insert event' }, { status: 500 });
    }

    return new NextResponse('OK', { status: 200 });
  } catch (error) {
    console.error('Stripe webhook error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
