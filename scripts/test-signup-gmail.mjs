import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testSignup() {
  const email = `surya.psingh116+test${Date.now()}@gmail.com`;
  console.log(`Trying to sign up with ${email}...`);
  const { data, error } = await supabase.auth.signUp({
    email,
    password: 'password123',
    options: {
      data: {
        brand_name: 'Test Brand',
      },
    },
  });

  if (error) {
    console.error('Signup error:', error);
  } else {
    console.log('Signup success:', data);
  }
}

testSignup();
