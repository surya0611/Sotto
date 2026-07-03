const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function checkAccount() {
  const { data, error } = await supabase.from('accounts').select('*').eq('id', '0640169a-acef-4f34-a043-040efd042097');
  console.log('Error:', error);
  console.log('Account:', data);
}

checkAccount();
