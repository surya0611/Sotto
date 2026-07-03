const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
const accountId = '0640169a-acef-4f34-a043-040efd042097';

async function checkConfig() {
  const { data } = await supabase.from('accounts').select('widget_config').eq('id', accountId).single();
  console.log(JSON.stringify(data.widget_config.inline, null, 2));
}

checkConfig();
