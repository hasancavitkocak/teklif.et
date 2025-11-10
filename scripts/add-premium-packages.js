import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

async function addPremiumPackages() {
  try {
    console.log('Premium paket ayarları ekleniyor...\n');

    const settings = [
      {
        key: 'premium_weekly_10_price',
        value: { amount: 500, currency: 'TRY' },
        description: 'Haftalık 10 teklif paketi',
      },
      {
        key: 'premium_weekly_20_price',
        value: { amount: 800, currency: 'TRY' },
        description: 'Haftalık 20 teklif paketi',
      },
    ];

    for (const setting of settings) {
      // Check if exists
      const { data: existing } = await supabase
        .from('app_settings')
        .select('setting_key')
        .eq('setting_key', setting.key)
        .single();

      if (existing) {
        console.log(`✓ ${setting.key} zaten mevcut, güncelleniyor...`);
        
        const { error } = await supabase
          .from('app_settings')
          .update({
            setting_value: setting.value,
            description: setting.description,
          })
          .eq('setting_key', setting.key);

        if (error) throw error;
      } else {
        console.log(`+ ${setting.key} ekleniyor...`);
        
        const { error } = await supabase
          .from('app_settings')
          .insert({
            setting_key: setting.key,
            setting_value: setting.value,
            description: setting.description,
          });

        if (error) throw error;
      }
    }

    console.log('\n✅ Tüm ayarlar başarıyla eklendi/güncellendi!');

    // Show all premium settings
    const { data: allSettings } = await supabase
      .from('app_settings')
      .select('setting_key, setting_value, description')
      .like('setting_key', 'premium%')
      .order('setting_key');

    console.log('\nMevcut Premium Ayarları:');
    allSettings?.forEach((s) => {
      console.log(`- ${s.setting_key}: ${JSON.stringify(s.setting_value)}`);
    });

  } catch (error) {
    console.error('Hata:', error);
  }
}

addPremiumPackages();
