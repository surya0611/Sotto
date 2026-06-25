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

async function runTests() {
  console.log("=== Starting RLS Verification Tests ===");
  
  // 1. Create Test Users
  const userAEmail = `user_a_${Date.now()}@test.com`;
  const userBEmail = `user_b_${Date.now()}@test.com`;
  const userCEmail = `user_c_${Date.now()}@test.com`;
  const password = "TestPassword123!";

  console.log("Creating Test Users...");
  const { data: userAData } = await adminClient.auth.admin.createUser({ email: userAEmail, password, email_confirm: true });
  const { data: userBData } = await adminClient.auth.admin.createUser({ email: userBEmail, password, email_confirm: true });
  const { data: userCData } = await adminClient.auth.admin.createUser({ email: userCEmail, password, email_confirm: true });

  const userA = userAData.user;
  const userB = userBData.user;
  const userC = userCData.user;

  // 2. Create Test Accounts
  console.log("Creating Test Accounts...");
  const { data: acc1 } = await adminClient.from('accounts').insert({ name: 'Account 1', domain: `acc1_${Date.now()}.com` }).select().single();
  const { data: acc2 } = await adminClient.from('accounts').insert({ name: 'Account 2', domain: `acc2_${Date.now()}.com` }).select().single();

  // 3. Assign Memberships (Using 'admin' to respect pre-existing constraints)
  await adminClient.from('account_members').insert([
    { account_id: acc1.id, user_id: userA.id, role: 'admin' },
    { account_id: acc1.id, user_id: userC.id, role: 'admin' },
    { account_id: acc2.id, user_id: userB.id, role: 'admin' }
  ]);

  // 4. Test RLS as User A
  console.log("\nLogging in as User A...");
  const userAClient = createClient(supabaseUrl, anonKey);
  await userAClient.auth.signInWithPassword({ email: userAEmail, password });

  console.log("\n--- TEST 1: Teammate Visibility (Success Case) ---");
  const { data: members, error: err1 } = await userAClient.from('account_members').select('*');
  if (err1) console.error("Error:", err1.message);
  
  const canSeeSelf = members?.some(m => m.user_id === userA.id);
  const canSeeTeammate = members?.some(m => m.user_id === userC.id);
  const canSeeUserB = members?.some(m => m.user_id === userB.id);

  if (canSeeSelf && canSeeTeammate && !canSeeUserB) {
    console.log("✅ PASS: User A can see themselves and their teammate (User C), but not User B.");
  } else {
    console.log("❌ FAIL: Visibility rules violated.");
    console.log({ canSeeSelf, canSeeTeammate, canSeeUserB });
  }

  console.log("\n--- TEST 2: Cross-Account Isolation (Failure Case) ---");
  const { data: events, error: err2 } = await userAClient.from('events').select('*').eq('account_id', acc2.id);
  if (err2) console.error("Error:", err2.message);
  
  if (events && events.length === 0) {
    console.log("✅ PASS: User A is blocked from querying Account 2's events.");
  } else {
    console.log("❌ FAIL: User A accessed data from Account 2.");
  }

  console.log("\n--- TEST 3: Secrets Isolation ---");
  const { data: secrets, error: err3 } = await userAClient.from('account_secrets').select('*');
  if (secrets && secrets.length === 0) {
    console.log("✅ PASS: RLS prevents User A from querying account_secrets entirely (Returned 0 rows).");
  } else {
    console.log("❌ FAIL: User A was able to query account_secrets!");
    console.log(secrets);
  }

  // Cleanup
  console.log("\nCleaning up test data...");
  await adminClient.from('accounts').delete().in('id', [acc1.id, acc2.id]);
  await adminClient.auth.admin.deleteUser(userA.id);
  await adminClient.auth.admin.deleteUser(userB.id);
  await adminClient.auth.admin.deleteUser(userC.id);
  console.log("Cleanup complete.");
}

runTests().catch(console.error);
