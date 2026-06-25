import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const adminClient = createClient(supabaseUrl, serviceRoleKey);
const userAClient = createClient(supabaseUrl, anonKey);

async function runTests() {
  const userAEmail = `debug_user_a_${Date.now()}@test.com`;
  const password = "TestPassword123!";

  const { data: userAData } = await adminClient.auth.admin.createUser({ email: userAEmail, password, email_confirm: true });
  const userA = userAData.user;

  const { data: acc1 } = await adminClient.from('accounts').insert({ name: 'Account Debug', domain: 'debug.com' }).select().single();

  await adminClient.from('account_members').insert([
    { account_id: acc1.id, user_id: userA.id, role: 'owner' }
  ]);

  await userAClient.auth.signInWithPassword({ email: userAEmail, password });

  // Debug: Direct rpc call if possible, or just raw query
  const { data: directMembers, error: directErr } = await adminClient.from('account_members').select('*').eq('account_id', acc1.id);
  console.log("Admin sees members:", directMembers);

  const { data: userMembers, error: userErr } = await userAClient.from('account_members').select('*').eq('account_id', acc1.id);
  console.log("User sees members:", userMembers, userErr);

  const { data: rpcData, error: rpcErr } = await userAClient.rpc('get_user_account_ids');
  console.log("RPC get_user_account_ids returns:", rpcData, rpcErr);

  // Cleanup
  await adminClient.from('accounts').delete().eq('id', acc1.id);
  await adminClient.auth.admin.deleteUser(userA.id);
}

runTests().catch(console.error);
