import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkAuthUsers() {
  console.log('🔍 Checking auth users and profiles...\n');

  try {
    // Get current session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      console.error('Session error:', sessionError.message);
      return;
    }

    if (session) {
      console.log('✅ Current session user:', session.user.id);
      console.log('Email:', session.user.email);
    } else {
      console.log('❌ No active session');
    }

    // Check profiles without auth users
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, name, age, city');

    if (profilesError) {
      console.error('Profiles error:', profilesError.message);
      return;
    }

    console.log(`\n📊 Found ${profiles?.length || 0} profiles:`);
    if (profiles) {
      profiles.forEach((profile, index) => {
        console.log(`${index + 1}. ${profile.name} (ID: ${profile.id.substring(0, 8)}...)`);
      });
    }

    // Try to sign in with a bot account to test
    console.log('\n🤖 Testing bot login...');
    const { data: botAuth, error: botError } = await supabase.auth.signInWithPassword({
      email: 'bot1@example.com',
      password: 'BotPassword123!'
    });

    if (botError) {
      console.error('Bot login error:', botError.message);
    } else {
      console.log('✅ Bot login successful');
      console.log('Bot user ID:', botAuth.user.id);
      
      // Check if this bot has a profile
      const { data: botProfile, error: botProfileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', botAuth.user.id)
        .single();

      if (botProfileError) {
        console.error('Bot profile error:', botProfileError.message);
      } else {
        console.log('✅ Bot profile found:', botProfile.name);
      }

      await supabase.auth.signOut();
    }

  } catch (error) {
    console.error('❌ Check failed:', error.message);
  }
}

checkAuthUsers();