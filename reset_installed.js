const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
const accountId = '0640169a-acef-4f34-a043-040efd042097';

async function resetInstalled() {
  const { data, error } = await supabase.from('accounts').select('widget_config, domain').eq('id', accountId).single();
  if (error) {
    console.error('Error fetching:', error);
    return;
  }
  
  const config = data.widget_config || {};
  config.is_installed = false;
  
  const { error: updateError } = await supabase.from('accounts').update({ widget_config: config, domain: null }).eq('id', accountId);
  if (updateError) {
    console.error('Error updating:', updateError);
  } else {
    console.log('Successfully reset is_installed to false and domain to null!');
  }
}

resetInstalled();
