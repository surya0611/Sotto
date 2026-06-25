import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const adminClient = createClient(supabaseUrl, serviceRoleKey);

async function runTests() {
  const { data, error } = await adminClient.rpc('get_user_account_ids');
  console.log("RPC Error:", error);
  
  // Try inserting an upper case 'OWNER' just in case
  const { data: acc1 } = await adminClient.from('accounts').insert({ name: 'Account Debug 3', domain: `debug${Date.now()}.com` }).select().single();
  const { data: userAData } = await adminClient.auth.admin.createUser({ email: `debug_insert_${Date.now()}@test.com`, password: "TestPassword123!", email_confirm: true });
  const userA = userAData.user;
  
  console.log("Trying 'OWNER'");
  const r1 = await adminClient.from('account_members').insert([{ account_id: acc1.id, user_id: userA.id, role: 'OWNER' }]);
  console.log("Result:", r1.error);
}

runTests().catch(console.error);
