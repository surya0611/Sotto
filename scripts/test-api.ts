import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function test() {
  const accountId = 'd024517a-2ccb-4dc4-9457-9b688f5e5d3d';
  console.log('Testing for account:', accountId);

  const res = await fetch(`http://localhost:3000/api/widget/events?account_id=${accountId}&session_id=123`, {
    headers: {
      'Origin': 'http://localhost:3000'
    }
  });

  const data = await res.json();
  console.log(JSON.stringify(data, null, 2));
}

test();
