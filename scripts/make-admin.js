import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

async function makeAdmin(email) {
  try {
    console.log(`🔍 Kullanıcı aranıyor: ${email}`);

    // Get user by email from auth.users
    const { data: authData, error: authError } = await supabase.auth.admin.listUsers();
    
    if (authError) {
      console.error('❌ Auth hatası:', authError);
      return;
    }

    const user = authData.users.find(u => u.email === email);
    
    if (!user) {
      console.error('❌ Kullanıcı bulunamadı');
      return;
    }

    console.log('✅ Kullanıcı bulundu:', user.id);

    // Update profile to make admin
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ is_admin: true })
      .eq('id', user.id);

    if (updateError) {
      console.error('❌ Admin yapılamadı:', updateError);
      return;
    }

    console.log('✅ Kullanıcı admin yapıldı!');
    console.log('📧 Email:', email);
    console.log('🆔 ID:', user.id);
    console.log('\n🎉 Artık /admin sayfasına erişebilir!');
  } catch (error) {
    console.error('❌ Hata:', error);
  }
}

async function removeAdmin(email) {
  try {
    console.log(`🔍 Kullanıcı aranıyor: ${email}`);

    const { data: authData } = await supabase.auth.admin.listUsers();
    const user = authData.users.find(u => u.email === email);
    
    if (!user) {
      console.error('❌ Kullanıcı bulunamadı');
      return;
    }

    const { error } = await supabase
      .from('profiles')
      .update({ is_admin: false })
      .eq('id', user.id);

    if (error) throw error;

    console.log('✅ Admin rolü kaldırıldı!');
  } catch (error) {
    console.error('❌ Hata:', error);
  }
}

// Komut satırından kullanım
const command = process.argv[2]; // 'add' veya 'remove'
const email = process.argv[3];

if (!command || !email) {
  console.log('Kullanım:');
  console.log('  node scripts/make-admin.js add kullanici@email.com');
  console.log('  node scripts/make-admin.js remove kullanici@email.com');
  process.exit(1);
}

if (command === 'add') {
  makeAdmin(email);
} else if (command === 'remove') {
  removeAdmin(email);
} else {
  console.log('❌ Geçersiz komut. "add" veya "remove" kullanın.');
}
