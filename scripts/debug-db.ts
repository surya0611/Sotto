import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function check() {
  const { data: accounts } = await supabase.from('accounts').select('id, name');
  console.log('Accounts:', accounts);

  const { data: events } = await supabase.from('events').select('id, account_id, created_at').order('created_at', { ascending: false }).limit(10);
  console.log('Recent Events:', events);

  const { data: members } = await supabase.from('account_members').select('user_id, account_id');
  console.log('Members:', members);

  const { data: users, error } = await supabase.auth.admin.listUsers();
  if (users) {
    console.log('Users:', users.users.map(u => ({ id: u.id, email: u.email })));
  } else {
    console.log('Users error:', error);
  }
}

check();
