import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

// Load environment variables
config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Supabase credentials not found in environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function setupDatabase() {
  console.log('🔧 Setting up database tables...\n');

  try {
    // Create profiles table
    console.log('Creating profiles table...');
    const { error: profilesError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS profiles (
          id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
          name TEXT NOT NULL,
          age INTEGER NOT NULL CHECK (age >= 18 AND age <= 100),
          city TEXT NOT NULL,
          bio TEXT,
          photo_url TEXT,
          is_premium BOOLEAN DEFAULT FALSE,
          daily_offers_count INTEGER DEFAULT 0,
          last_offer_reset TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `
    });

    if (profilesError) {
      console.error('Profiles table error:', profilesError);
    } else {
      console.log('✅ Profiles table created');
    }

    // Create offers table
    console.log('Creating offers table...');
    const { error: offersError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS offers (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          sender_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
          receiver_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
          status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'matched', 'rejected')),
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          UNIQUE(sender_id, receiver_id)
        );
      `
    });

    if (offersError) {
      console.error('Offers table error:', offersError);
    } else {
      console.log('✅ Offers table created');
    }

    // Create payments table
    console.log('Creating payments table...');
    const { error: paymentsError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS payments (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
          amount DECIMAL(10,2) NOT NULL,
          plan_type TEXT NOT NULL CHECK (plan_type IN ('monthly', 'yearly')),
          status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed')),
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `
    });

    if (paymentsError) {
      console.error('Payments table error:', paymentsError);
    } else {
      console.log('✅ Payments table created');
    }

    console.log('\n🎉 Database setup completed!');
    
  } catch (error) {
    console.error('Setup error:', error);
  }
}

setupDatabase();