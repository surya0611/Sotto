import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { createClient } from '@supabase/supabase-js';
import { getGeolocationFromIp } from '@/lib/geolocation';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  try {
    const rawBody = await req.text();
    const signatureHeader = req.headers.get('Typeform-Signature');
    
    if (!signatureHeader) {
      return NextResponse.json({ error: 'Missing signature' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const accountId = searchParams.get('account_id');

    if (!accountId) {
      return NextResponse.json({ error: 'Missing account_id' }, { status: 400 });
    }

    const { data: account, error: accountError } = await supabaseAdmin
      .from('accounts')
      .select('integration_secrets')
      .eq('id', accountId)
      .single();

    if (accountError || !account) {
      return NextResponse.json({ error: 'Account not found' }, { status: 404 });
    }

    const secret = account.integration_secrets?.typeform_secret;
    if (!secret) {
      return NextResponse.json({ error: 'Typeform secret not configured' }, { status: 403 });
    }

    const hmac = crypto.createHmac('sha256', secret).update(rawBody).digest('base64');
    const expectedSignature = `sha256=${hmac}`;

    if (signatureHeader !== expectedSignature) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }

    const payload = JSON.parse(rawBody);
    
    let customerName = 'Someone';
    if (payload.form_response && payload.form_response.answers) {
      const textAnswer = payload.form_response.answers.find((a: any) => a.type === 'text');
      if (textAnswer && textAnswer.text) {
        customerName = textAnswer.text;
      }
    }

    const ip = req.headers.get('x-forwarded-for') || null;
    const { city } = await getGeolocationFromIp(ip);

    // Deduplication check
    const webhookId = payload.event_id;
    if (webhookId) {
      const { data: existing } = await supabaseAdmin
        .from('events')
        .select('id')
        .eq('session_id', webhookId)
        .maybeSingle();

      if (existing) {
        return NextResponse.json({ success: true }, { status: 200 }); // already processed
      }
    }

    const { error: insertError } = await supabaseAdmin.from('events').insert({
      account_id: accountId,
      source: 'typeform',
      event_type: 'form_submission',
      customer_name: customerName,
      customer_city: city || undefined,
      session_id: webhookId || null,
    });

    if (insertError) {
      console.error('Error inserting event:', insertError);
      return NextResponse.json({ error: 'Failed to record event' }, { status: 500 });
    }

    return NextResponse.json({ success: true }, { status: 200 });

  } catch (error) {
    console.error('Typeform webhook error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
