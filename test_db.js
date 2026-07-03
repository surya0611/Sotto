const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
const accountId = '0640169a-acef-4f34-a043-040efd042097';

async function checkAccount() {
  const { data, error } = await supabase.from('accounts').select('*').eq('id', accountId).single();
  console.log("Account Keys:", Object.keys(data));
  console.log("integration_secrets:", data.integration_secrets);
}

checkAccount();
