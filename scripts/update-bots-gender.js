import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Gender mapping based on names
const femaleNames = [
  'Ayşe', 'Fatma', 'Emine', 'Hatice', 'Zeynep', 'Elif', 'Merve', 'Özlem',
  'Seda', 'Büşra', 'Cansu', 'Deniz', 'Esra', 'Gizem', 'Hande', 'İrem',
  'Kübra', 'Leyla', 'Melis', 'Nihan', 'Aylin', 'Berna', 'Ceren', 'Dilan'
];

async function updateBotsGender() {
  console.log('🔄 Updating bot genders...\n');

  try {
    // Get all profiles
    const { data: profiles, error } = await supabase
      .from('profiles')
      .select('id, name');

    if (error) {
      console.error('Error fetching profiles:', error.message);
      return;
    }

    if (!profiles || profiles.length === 0) {
      console.log('No profiles found');
      return;
    }

    for (const profile of profiles) {
      // Determine gender based on name
      const isFemale = femaleNames.some(femaleName => 
        profile.name.toLowerCase().includes(femaleName.toLowerCase())
      );
      
      const gender = isFemale ? 'kadın' : 'erkek';

      // Update profile with gender
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ gender })
        .eq('id', profile.id);

      if (updateError) {
        console.error(`Error updating ${profile.name}:`, updateError.message);
      } else {
        console.log(`✅ Updated ${profile.name} -> ${gender}`);
      }
    }

    console.log('\n🎉 Gender update completed!');

  } catch (error) {
    console.error('Update failed:', error.message);
  }
}

updateBotsGender();