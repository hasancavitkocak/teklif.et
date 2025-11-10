import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkBots() {
  try {
    const { data, error, count } = await supabase
      .from('profiles')
      .select('name, age, city, is_premium', { count: 'exact' });

    if (error) {
      console.error('Error:', error.message);
      return;
    }

    console.log(`📊 Total bot accounts: ${count}\n`);
    
    if (data && data.length > 0) {
      console.log('Bot accounts:');
      data.forEach((bot, index) => {
        const premium = bot.is_premium ? '👑' : '👤';
        console.log(`${index + 1}. ${premium} ${bot.name} (${bot.age}) - ${bot.city}`);
      });
      
      const premiumCount = data.filter(bot => bot.is_premium).length;
      console.log(`\n👑 Premium bots: ${premiumCount}`);
      console.log(`👤 Regular bots: ${count - premiumCount}`);
    }
    
  } catch (error) {
    console.error('Check failed:', error.message);
  }
}

checkBots();