import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

async function findUser() {
  try {
    const userId = 'b36f022f-dfdf-4828-b612-474dfe1595fb';
    
    console.log('Searching for user:', userId);
    
    // Try with maybeSingle instead of single
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (error) {
      console.error('Error:', error);
      return;
    }

    if (!data) {
      console.log('\n❌ User not found in database');
      console.log('This user ID does not exist in the profiles table.');
      
      // List all users named "hasan" or "Hasan"
      console.log('\nSearching for users named "hasan"...');
      const { data: hasanUsers, error: hasanError } = await supabase
        .from('profiles')
        .select('id, name, is_admin')
        .ilike('name', '%hasan%');

      if (hasanError) {
        console.error('Error searching:', hasanError);
      } else {
        console.log(`\nFound ${hasanUsers?.length || 0} users with "hasan" in name:`);
        hasanUsers?.forEach(user => {
          console.log(`- ${user.name} (${user.id}): is_admin = ${user.is_admin}`);
        });
      }
    } else {
      console.log('\n✅ User found:');
      console.log('Name:', data.name);
      console.log('is_admin:', data.is_admin);
      console.log('Full profile:', JSON.stringify(data, null, 2));
    }

  } catch (error) {
    console.error('Error:', error);
  }
}

findUser();
