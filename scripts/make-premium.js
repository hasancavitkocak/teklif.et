import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

async function makePremium(email) {
  try {
    // Get user by email
    const { data: users, error: userError } = await supabase
      .from('profiles')
      .select('id, name, email, is_premium')
      .ilike('email', email)
      .single();

    if (userError) {
      console.error('Kullanıcı bulunamadı:', userError);
      return;
    }

    console.log('Kullanıcı bulundu:', users);

    // Make premium
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ 
        is_premium: true,
        daily_offers_count: 0 // Reset daily count
      })
      .eq('id', users.id);

    if (updateError) {
      console.error('Premium yapılamadı:', updateError);
      return;
    }

    console.log('✅ Kullanıcı premium yapıldı!');
    console.log('Email:', email);
    console.log('Ad:', users.name);
  } catch (error) {
    console.error('Hata:', error);
  }
}

// Komut satırından email al
const email = process.argv[2];

if (!email) {
  console.log('Kullanım: node scripts/make-premium.js kullanici@email.com');
  process.exit(1);
}

makePremium(email);
