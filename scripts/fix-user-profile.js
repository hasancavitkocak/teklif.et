import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function fixUserProfile() {
  const userId = '35e00854-3c60-480f-8efd-77eb74184654'; // Console'dan aldığımız ID
  
  console.log('🔧 Fixing profile for user:', userId);

  try {
    // Check if profile exists
    const { data: existingProfile, error: checkError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (checkError) {
      console.error('Error checking profile:', checkError.message);
      return;
    }

    if (existingProfile) {
      console.log('✅ Profile already exists:', existingProfile.name);
      return;
    }

    console.log('❌ No profile found, creating one...');

    // Create profile for this user
    const profileData = {
      id: userId,
      name: 'Test Kullanıcı',
      age: 25,
      gender: 'erkek',
      city: 'İstanbul',
      bio: 'Test kullanıcısı',
      photo_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face',
      is_premium: false,
      daily_offers_count: 0,
      last_offer_reset: new Date().toISOString()
    };

    const { error: insertError } = await supabase
      .from('profiles')
      .insert(profileData);

    if (insertError) {
      console.error('❌ Error creating profile:', insertError.message);
      return;
    }

    console.log('✅ Profile created successfully!');
    console.log('Profile data:', profileData);

    // Verify the profile was created
    const { data: newProfile, error: verifyError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (verifyError) {
      console.error('❌ Error verifying profile:', verifyError.message);
    } else {
      console.log('✅ Profile verified:', newProfile.name);
    }

  } catch (error) {
    console.error('❌ Fix failed:', error.message);
  }
}

fixUserProfile();