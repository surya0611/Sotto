import { createClient } from '@supabase/supabase-js';
import crypto from 'node:crypto';

// Use local environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  console.log('Fetching account ID...');
  const { data: accounts, error: accountError } = await supabase
    .from('accounts')
    .select('id, integration_secrets')
    .limit(1);

  if (accountError || !accounts || accounts.length === 0) {
    console.error('Error fetching account:', accountError);
    return;
  }

  const accountId = accounts[0].id;
  console.log(`Found account: ${accountId}`);

  const secret = 'test_secret_123';
  
  console.log('Setting Shopify secret for account...');
  await supabase
    .from('accounts')
    .update({
      integration_secrets: {
        ...accounts[0].integration_secrets,
        shopify_secret: secret
      }
    })
    .eq('id', accountId);

  const payload = {
    id: 123456789,
    customer: {
      first_name: "Isabella"
    },
    shipping_address: {
      city: "Milan",
      country: "Italy"
    },
    line_items: [
      {
        title: "Cashmere Turtleneck Sweater",
        price: "450.00"
      }
    ]
  };

  const rawBody = JSON.stringify(payload);
  const hmac = crypto.createHmac('sha256', secret).update(rawBody, 'utf8').digest('base64');

  console.log('Sending webhook simulation...');
  const url = `${appUrl}/api/webhooks/shopify?account_id=${accountId}`;
  
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-shopify-hmac-sha256': hmac,
      'x-forwarded-for': '2.17.123.45' // Fake Italian IP for geolocation test if city was omitted
    },
    body: rawBody
  });

  const responseText = await response.text();
  console.log(`Status: ${response.status}`);
  console.log(`Response: ${responseText}`);

  if (response.ok) {
    console.log('✅ Webhook succeeded! Check http://localhost:3000/dashboard/events');
  } else {
    console.log('❌ Webhook failed.');
  }
}

run();
