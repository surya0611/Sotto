import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function check() {
  const accountId = 'cd243fc0-747e-43d2-8d9b-e7050dc26e79';
  const { error } = await supabase.from('events').insert({
    account_id: accountId,
    source: 'custom',
    event_type: 'purchase',
    customer_name: 'Test',
    created_at: new Date().toISOString()
  });
  console.log('Insert error:', error);
}

check();
