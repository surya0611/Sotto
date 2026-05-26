import { NextResponse } from 'next/server';
import crypto from 'node:crypto';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  try {
    const secretHeader = req.headers.get('x-sotto-secret');
    if (!secretHeader) {
      return NextResponse.json({ error: 'Missing secret header' }, { status: 401 });
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

    const secret = account.integration_secrets?.google_forms_secret;
    if (!secret || secretHeader !== secret) {
      return NextResponse.json({ error: 'Invalid secret' }, { status: 401 });
    }

    const payload = await req.json();
    const { name, city } = payload;

    // Google Forms doesn't send a unique ID, so we hash the payload and accountId
    const webhookId = crypto.createHash('sha256').update(JSON.stringify(payload) + accountId).digest('hex');
    
    const { data: existing } = await supabaseAdmin
      .from('events')
      .select('id')
      .eq('session_id', webhookId)
      .maybeSingle();

    if (existing) {
      return NextResponse.json({ success: true }, { status: 200 }); // already processed
    }

    const { error: insertError } = await supabaseAdmin.from('events').insert({
      account_id: accountId,
      source: 'google_forms',
      event_type: 'form_submission',
      customer_name: name || 'Someone',
      customer_city: city || undefined,
      session_id: webhookId,
    });

    if (insertError) {
      console.error('Error inserting event:', insertError);
      return NextResponse.json({ error: 'Failed to record event' }, { status: 500 });
    }

    return NextResponse.json({ success: true }, { status: 200 });

  } catch (error) {
    console.error('Google Forms webhook error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
