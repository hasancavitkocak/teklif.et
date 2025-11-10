import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Turkish cities
const cities = [
  'İstanbul', 'Ankara', 'İzmir', 'Bursa', 'Antalya', 'Adana', 'Konya', 'Gaziantep',
  'Mersin', 'Diyarbakır', 'Kayseri', 'Eskişehir', 'Urfa', 'Malatya', 'Erzurum',
  'Van', 'Batman', 'Elazığ', 'Trabzon', 'Kocaeli', 'Samsun', 'Denizli', 'Sakarya'
];

const femaleNames = [
  'Aylin', 'Berna', 'Ceren', 'Dilan', 'Eda', 'Figen', 'Gamze', 'Hilal',
  'İpek', 'Jale', 'Kezban', 'Lale', 'Meltem', 'Neslihan', 'Oya', 'Pınar',
  'Reyhan', 'Sibel', 'Tülay', 'Ülkü', 'Vildan', 'Yelda', 'Zehra', 'Aslı'
];

const maleNames = [
  'Barış', 'Cem', 'Doğan', 'Erhan', 'Ferhat', 'Gürkan', 'Halil', 'İlhan',
  'Jale', 'Kaan', 'Levent', 'Mert', 'Necati', 'Oğuz', 'Polat', 'Recep',
  'Serkan', 'Tolga', 'Uğur', 'Volkan', 'Yusuf', 'Zafer', 'Alper', 'Berk'
];

const bios = [
  'Hayata pozitif bakıyorum 🌈',
  'Müzik ruhumu besliyor 🎶',
  'Doğa benim huzur kaynağım 🌿',
  'Kitaplar beni başka dünyalara götürüyor 📖',
  'Spor yapmayı çok seviyorum 🏃‍♀️',
  'Seyahat etmek tutkum ✈️',
  'Yemek yapmak sanatım 🍳',
  'Sinema ve dizi tutkunuyum 🎭',
  'Arkadaşlık benim için çok değerli 💫',
  'Meditasyon ve yoga yapıyorum 🕉️',
  'Dans etmeyi seviyorum 💃',
  'Teknoloji meraklısıyım 💻',
  'Hayvanları çok seviyorum 🐾',
  'Sanat ve kültür ilgi alanım 🎨',
  'Bisiklet sürmek hobim 🚴',
  'Kahve ve kitap kombinasyonu 📚☕',
  'İnsanlarla sohbet etmeyi seviyorum 💬',
  'Minimalist yaşam tarzı 🌟',
  'Sosyal sorumluluk projelerinde yer alıyorum 🤝',
  'Her gün gülümsemeye çalışıyorum 😊'
];

const photoUrls = [
  'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1463453091185-61582044d556?w=400&h=400&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&h=400&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&h=400&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1544725176-7c40e5a71c5e?w=400&h=400&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1547425260-76bcadfb4f2c?w=400&h=400&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1552058544-f2b08422138a?w=400&h=400&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1566492031773-4f4e44671d66?w=400&h=400&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=400&h=400&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=400&h=400&fit=crop&crop=face'
];

function getRandomElement(array) {
  return array[Math.floor(Math.random() * array.length)];
}

function getRandomAge() {
  return Math.floor(Math.random() * 25) + 18;
}

async function checkExistingBots() {
  const { count } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true });
  
  return count || 0;
}

async function createBotAccount(index, startFrom = 21) {
  const isWoman = Math.random() > 0.5;
  const name = isWoman ? getRandomElement(femaleNames) : getRandomElement(maleNames);
  const email = `bot${startFrom + index}@example.com`;
  const password = 'BotPassword123!';
  
  try {
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (authError) {
      if (authError.message.includes('already_exists')) {
        console.log(`⚠️  Bot ${startFrom + index} already exists, skipping...`);
        return;
      }
      console.error(`Bot ${startFrom + index} auth error:`, authError.message);
      return;
    }

    if (!authData.user) {
      console.error(`Bot ${startFrom + index}: User creation failed`);
      return;
    }

    const profileData = {
      id: authData.user.id,
      name: name,
      age: getRandomAge(),
      city: getRandomElement(cities),
      bio: getRandomElement(bios),
      photo_url: getRandomElement(photoUrls),
      is_premium: Math.random() > 0.7,
      daily_offers_count: Math.floor(Math.random() * 3),
      last_offer_reset: new Date().toISOString()
    };

    const { error: profileError } = await supabase
      .from('profiles')
      .insert(profileData);

    if (profileError) {
      console.error(`Bot ${startFrom + index} profile error:`, profileError.message);
      return;
    }

    console.log(`✅ Bot ${startFrom + index} created: ${name} (${email})`);
    
  } catch (error) {
    console.error(`Bot ${startFrom + index} error:`, error.message);
  }
}

async function createAdditionalBots(count = 10) {
  const existingCount = await checkExistingBots();
  console.log(`📊 Current bot count: ${existingCount}`);
  console.log(`🤖 Creating ${count} additional bot accounts...\n`);
  
  for (let i = 0; i < count; i++) {
    await createBotAccount(i, existingCount + 1);
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  const newCount = await checkExistingBots();
  console.log(`\n🎉 Bot creation completed! Total bots: ${newCount}`);
}

// Komut satırından parametre al
const additionalCount = process.argv[2] ? parseInt(process.argv[2]) : 10;
createAdditionalBots(additionalCount).catch(console.error);