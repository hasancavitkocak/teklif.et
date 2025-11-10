import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

async function checkAdminStatus() {
  try {
    console.log('Checking admin status...\n');

    // Get all profiles with is_admin = true
    const { data: admins, error } = await supabase
      .from('profiles')
      .select('id, name, is_admin')
      .eq('is_admin', true);

    if (error) {
      console.error('Error fetching admins:', error);
      return;
    }

    console.log('Admin users found:', admins?.length || 0);
    console.log('\nAdmin users:');
    admins?.forEach(admin => {
      console.log(`- ${admin.name}: is_admin = ${admin.is_admin}`);
    });

    // Get the admin user's full profile
    if (admins && admins.length > 0) {
      const userId = admins[0].id;
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (profileError) {
        console.error('\nError fetching specific profile:', profileError);
        return;
      }

      console.log('\nAdmin user full profile:');
      console.log('ID:', profile.id);
      console.log('Name:', profile.name);
      console.log('is_admin:', profile.is_admin);
      console.log('Full profile:', JSON.stringify(profile, null, 2));
    }

  } catch (error) {
    console.error('Error:', error);
  }
}

checkAdminStatus();
