import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  console.log('Fetching account ID...');
  const { data: accounts } = await supabase.from('accounts').select('id, integration_secrets').limit(1);
  const accountId = accounts[0].id;
  const secret = 'my_super_secret_string';
  
  await supabase.from('accounts').update({
    integration_secrets: { ...accounts[0].integration_secrets, google_forms_secret: secret }
  }).eq('id', accountId);

  const payload = {
    name: "James from Google Forms",
    city: "London"
  };

  console.log('Sending Google Forms webhook...');
  const url = `${appUrl}/api/webhooks/google_forms?account_id=${accountId}`;
  
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-sotto-secret': secret
    },
    body: JSON.stringify(payload)
  });

  console.log(`Status: ${response.status}`);
  if (response.ok) console.log('✅ Google Forms Webhook succeeded!');
}

run();
