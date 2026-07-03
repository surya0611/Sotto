const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
const accountId = '0640169a-acef-4f34-a043-040efd042097';

async function checkImpressions() {
  const { count, error } = await supabase.from('events').select('*', { count: 'exact', head: true }).eq('account_id', accountId).eq('event_type', 'impression');
  console.log("Impressions count:", count);
}

checkImpressions();
