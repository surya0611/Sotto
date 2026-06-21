import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function seed() {
  const { data: accounts } = await supabase.from('accounts').select('id');
  
  if (!accounts) {
    console.log('No accounts found');
    return;
  }

  for (const acc of accounts) {
    const events = [
      {
        account_id: acc.id,
        source: 'sotto_pixel',
        event_type: 'purchase',
        customer_name: 'Sarah M.',
        customer_city: 'New York',
        customer_region: 'NY',
        product_name: 'Aura Pro Headphones',
        created_at: new Date(Date.now() - 1000 * 60 * 5).toISOString() // 5 mins ago
      },
      {
        account_id: acc.id,
        source: 'sotto_pixel',
        event_type: 'purchase',
        customer_name: 'James L.',
        customer_city: 'San Francisco',
        customer_region: 'CA',
        product_name: 'Aura Pro Headphones',
        created_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString() // 2 hours ago
      }
    ];

    const { error } = await supabase.from('events').insert(events);
    if (error) {
      console.log('Error for account', acc.id, error.message);
    } else {
      console.log(`Seeded events for account ${acc.id}`);
    }
  }
}

seed();
