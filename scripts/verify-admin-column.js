import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

async function verifyAdminColumn() {
  try {
    console.log('Verifying is_admin column...\n');

    // Try to select is_admin from profiles
    const { data, error } = await supabase
      .from('profiles')
      .select('id, name, is_admin')
      .limit(5);

    if (error) {
      console.error('Error:', error);
      console.log('\n❌ is_admin column might not exist or RLS is blocking access');
      return;
    }

    console.log('✅ is_admin column exists and is accessible');
    console.log('\nSample profiles:');
    data?.forEach(profile => {
      console.log(`- ${profile.name}: is_admin = ${profile.is_admin} (${typeof profile.is_admin})`);
    });

    // Count admin users
    const { count, error: countError } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .eq('is_admin', true);

    if (countError) {
      console.error('\nError counting admins:', countError);
    } else {
      console.log(`\nTotal admin users: ${count}`);
    }

  } catch (error) {
    console.error('Error:', error);
  }
}

verifyAdminColumn();
