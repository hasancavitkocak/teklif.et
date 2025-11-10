import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

async function fixAdminStatus() {
  try {
    const userId = 'b36f022f-dfd7-4828-b612-474afe1595fb'; // Correct ID from database
    
    console.log('Checking user:', userId);
    
    // First, check current status
    const { data: before, error: beforeError } = await supabase
      .from('profiles')
      .select('id, name, is_admin')
      .eq('id', userId)
      .single();

    if (beforeError) {
      console.error('Error fetching profile:', beforeError);
      return;
    }

    console.log('\nBefore:');
    console.log('Name:', before.name);
    console.log('is_admin:', before.is_admin);

    // Update to true
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ is_admin: true })
      .eq('id', userId);

    if (updateError) {
      console.error('\nError updating:', updateError);
      return;
    }

    console.log('\n✅ Updated is_admin to true');

    // Verify
    const { data: after, error: afterError } = await supabase
      .from('profiles')
      .select('id, name, is_admin')
      .eq('id', userId)
      .single();

    if (afterError) {
      console.error('Error verifying:', afterError);
      return;
    }

    console.log('\nAfter:');
    console.log('Name:', after.name);
    console.log('is_admin:', after.is_admin);

  } catch (error) {
    console.error('Error:', error);
  }
}

fixAdminStatus();
