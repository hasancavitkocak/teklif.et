import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function fixLocationIssue() {
  console.log('🔧 Checking and fixing location data...\n');

  try {
    // Check if location columns exist
    const { data: profiles, error } = await supabase
      .from('profiles')
      .select('id, name, city, latitude, longitude')
      .limit(5);

    if (error) {
      console.error('Error checking profiles:', error.message);
      return;
    }

    console.log('Sample profiles:');
    profiles?.forEach(profile => {
      console.log(`${profile.name} (${profile.city}): lat=${profile.latitude}, lng=${profile.longitude}`);
    });

    // Test gender filter
    console.log('\n🔍 Testing gender filter...');
    const { data: femaleProfiles, error: genderError } = await supabase
      .from('profiles')
      .select('name, gender, city')
      .eq('gender', 'kadın')
      .limit(5);

    if (genderError) {
      console.error('Gender filter error:', genderError.message);
    } else {
      console.log(`Found ${femaleProfiles?.length || 0} female profiles:`);
      femaleProfiles?.forEach(profile => {
        console.log(`- ${profile.name} (${profile.gender}) from ${profile.city}`);
      });
    }

  } catch (error) {
    console.error('❌ Fix failed:', error.message);
  }
}

fixLocationIssue();