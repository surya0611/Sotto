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
  const userAEmail = `debug_insert_${Date.now()}@test.com`;
  const password = "TestPassword123!";

  const { data: userAData } = await adminClient.auth.admin.createUser({ email: userAEmail, password, email_confirm: true });
  const userA = userAData.user;

  const { data: acc1 } = await adminClient.from('accounts').insert({ name: 'Account Debug 2', domain: `debug${Date.now()}.com` }).select().single();

  const { data, error } = await adminClient.from('account_members').insert([
    { account_id: acc1.id, user_id: userA.id, role: 'owner' }
  ]).select();
  
  console.log("Insert result:", data, error);
}

runTests().catch(console.error);
