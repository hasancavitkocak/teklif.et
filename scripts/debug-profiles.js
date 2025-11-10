import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function debugProfiles() {
  console.log('🔍 Debugging profiles...\n');

  try {
    // Check total profiles
    const { data: allProfiles, error: allError, count } = await supabase
      .from('profiles')
      .select('*', { count: 'exact' });

    if (allError) {
      console.error('❌ Error fetching profiles:', allError.message);
      return;
    }

    console.log(`📊 Total profiles: ${count}`);
    
    if (allProfiles && allProfiles.length > 0) {
      console.log('\n📋 Profile details:');
      allProfiles.forEach((profile, index) => {
        console.log(`${index + 1}. ${profile.name} (${profile.age}, ${profile.gender}) - ${profile.city}`);
        console.log(`   Premium: ${profile.is_premium ? 'Yes' : 'No'}`);
        console.log(`   Photo: ${profile.photo_url ? 'Yes' : 'No'}`);
        console.log(`   Bio: ${profile.bio ? profile.bio.substring(0, 50) + '...' : 'No bio'}`);
        console.log('');
      });
    }

    // Check auth users
    console.log('🔐 Checking auth users...');
    
    // Try to sign in with a bot account
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: 'bot1@example.com',
      password: 'BotPassword123!'
    });

    if (authError) {
      console.error('❌ Auth error:', authError.message);
      return;
    }

    console.log('✅ Bot login successful');
    console.log('User ID:', authData.user.id);

    // Get profile for this user
    const { data: userProfile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', authData.user.id)
      .single();

    if (profileError) {
      console.error('❌ Profile fetch error:', profileError.message);
    } else {
      console.log('✅ Profile found:', userProfile.name);
    }

    // Test discover query
    console.log('\n🔍 Testing discover query...');
    const { data: discoverProfiles, error: discoverError } = await supabase
      .from('profiles')
      .select('*')
      .neq('id', authData.user.id)
      .limit(5);

    if (discoverError) {
      console.error('❌ Discover query error:', discoverError.message);
    } else {
      console.log(`✅ Discover query returned ${discoverProfiles?.length || 0} profiles`);
      if (discoverProfiles && discoverProfiles.length > 0) {
        discoverProfiles.forEach(p => {
          console.log(`   - ${p.name} (${p.city})`);
        });
      }
    }

    await supabase.auth.signOut();

  } catch (error) {
    console.error('❌ Debug failed:', error.message);
  }
}

debugProfiles();