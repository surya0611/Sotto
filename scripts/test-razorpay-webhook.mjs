import { createClient } from '@supabase/supabase-js';
import crypto from 'node:crypto';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  console.log('Fetching account ID...');
  const { data: accounts } = await supabase
    .from('accounts')
    .select('id, integration_secrets')
    .limit(1);

  const accountId = accounts[0].id;
  const secret = 'rzp_test_secret_456';
  
  await supabase
    .from('accounts')
    .update({
      integration_secrets: {
        ...accounts[0].integration_secrets,
        razorpay_secret: secret
      }
    })
    .eq('id', accountId);

  const payload = {
    event: "payment.captured",
    payload: {
      payment: {
        entity: {
          id: "pay_12345",
          amount: 2500000,
          currency: "INR",
          notes: {
            name: "Rajesh",
            city: "Mumbai"
          }
        }
      }
    }
  };

  const rawBody = JSON.stringify(payload);
  const hmac = crypto.createHmac('sha256', secret).update(rawBody).digest('hex');

  console.log('Sending Razorpay webhook simulation...');
  const url = `${appUrl}/api/webhooks/razorpay?account_id=${accountId}`;
  
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-razorpay-signature': hmac
    },
    body: rawBody
  });

  const responseText = await response.text();
  console.log(`Status: ${response.status}`);
  console.log(`Response: ${responseText}`);

  if (response.ok) {
    console.log('✅ Razorpay Webhook succeeded!');
  } else {
    console.log('❌ Webhook failed.');
  }
}

run();
