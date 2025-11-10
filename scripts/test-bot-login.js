import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testBotLogin() {
  console.log('🧪 Testing bot login...\n');
  
  try {
    // Test login with first bot
    const { data, error } = await supabase.auth.signInWithPassword({
      email: 'bot1@example.com',
      password: 'BotPassword123!'
    });

    if (error) {
      console.error('❌ Login failed:', error.message);
      return;
    }

    console.log('✅ Bot login successful!');
    console.log('User ID:', data.user.id);
    
    // Get profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', data.user.id)
      .single();

    if (profileError) {
      console.error('❌ Profile fetch failed:', profileError.message);
      return;
    }

    console.log('✅ Profile found:');
    console.log(`Name: ${profile.name}`);
    console.log(`Age: ${profile.age}`);
    console.log(`City: ${profile.city}`);
    console.log(`Premium: ${profile.is_premium ? 'Yes' : 'No'}`);
    
    // Check total profiles count
    const { count, error: countError } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true });

    if (!countError) {
      console.log(`\n📊 Total profiles in database: ${count}`);
    }

    // Sign out
    await supabase.auth.signOut();
    console.log('✅ Signed out successfully');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testBotLogin();