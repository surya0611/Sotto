import { createClient } from '@supabase/supabase-js';
import crypto from 'node:crypto';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  console.log('Fetching account ID...');
  const { data: accounts } = await supabase.from('accounts').select('id, integration_secrets').limit(1);
  const accountId = accounts[0].id;
  const secret = 'tf_test_secret_789';
  
  await supabase.from('accounts').update({
    integration_secrets: { ...accounts[0].integration_secrets, typeform_secret: secret }
  }).eq('id', accountId);

  const payload = {
    form_response: {
      answers: [
        { type: 'text', text: 'Sarah from Typeform' }
      ]
    }
  };

  const rawBody = JSON.stringify(payload);
  const hmac = crypto.createHmac('sha256', secret).update(rawBody).digest('base64');

  console.log('Sending Typeform webhook...');
  const url = `${appUrl}/api/webhooks/typeform?account_id=${accountId}`;
  
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Typeform-Signature': `sha256=${hmac}`,
      'x-forwarded-for': '12.34.56.78'
    },
    body: rawBody
  });

  console.log(`Status: ${response.status}`);
  if (response.ok) console.log('✅ Typeform Webhook succeeded!');
}

run();
