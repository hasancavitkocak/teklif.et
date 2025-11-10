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

// Turkish cities
const cities = [
  'İstanbul', 'Ankara', 'İzmir', 'Bursa', 'Antalya', 'Adana', 'Konya', 'Gaziantep',
  'Mersin', 'Diyarbakır', 'Kayseri', 'Eskişehir', 'Urfa', 'Malatya', 'Erzurum',
  'Van', 'Batman', 'Elazığ', 'Trabzon', 'Kocaeli'
];

// Sample names and bios
const femaleNames = [
  'Ayşe', 'Fatma', 'Emine', 'Hatice', 'Zeynep', 'Elif', 'Merve', 'Özlem',
  'Seda', 'Büşra', 'Cansu', 'Deniz', 'Esra', 'Gizem', 'Hande', 'İrem',
  'Kübra', 'Leyla', 'Melis', 'Nihan'
];

const maleNames = [
  'Mehmet', 'Mustafa', 'Ahmet', 'Ali', 'Hüseyin', 'Hasan', 'İbrahim', 'İsmail',
  'Ömer', 'Osman', 'Murat', 'Emre', 'Burak', 'Cem', 'Deniz', 'Eren',
  'Furkan', 'Gökhan', 'Kemal', 'Onur'
];

const bios = [
  'Hayatı dolu dolu yaşamayı seven biriyim 🌟',
  'Müzik ve sanat tutkunu 🎵',
  'Doğa yürüyüşleri ve fotoğrafçılık hobim 📸',
  'Kitap okumayı ve kahve içmeyi seviyorum ☕',
  'Spor yapmayı ve sağlıklı yaşamayı seviyorum 💪',
  'Seyahat etmeyi ve yeni yerler keşfetmeyi seviyorum ✈️',
  'Yemek yapmayı ve yeni tarifler denemeyi seviyorum 👨‍🍳',
  'Film izlemeyi ve dizi maratonları yapmayı seviyorum 🎬',
  'Arkadaşlarımla vakit geçirmeyi seviyorum 👥',
  'Yoga ve meditasyon yapıyorum 🧘‍♀️',
  'Dans etmeyi ve müzik dinlemeyi seviyorum 💃',
  'Teknoloji ve oyun meraklısıyım 🎮',
  'Hayvan sevgisi olan biriyim 🐱',
  'Sanat galerileri ve müzeleri gezmeyi seviyorum 🎨',
  'Bisiklet sürmek ve açık havada olmak hoşuma gidiyor 🚴‍♂️',
  'Kahve dükkanlarında kitap okumayı seviyorum 📚',
  'Yeni insanlarla tanışmayı ve sohbet etmeyi seviyorum 💬',
  'Minimalist yaşam tarzını benimsiyorum ✨',
  'Gönüllü çalışmalara katılıyorum 🤝',
  'Pozitif enerji ve gülümseme 😊'
];

// Photo URLs (using placeholder images)
const photoUrls = [
  'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=400&h=400&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&h=400&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=400&h=400&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?w=400&h=400&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=400&h=400&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=400&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1519345182560-3f2917c472ef?w=400&h=400&fit=crop&crop=face'
];

function getRandomElement(array) {
  return array[Math.floor(Math.random() * array.length)];
}

function getRandomAge() {
  return Math.floor(Math.random() * 25) + 18; // 18-42 yaş arası
}

async function createBotAccount(index) {
  const isWoman = Math.random() > 0.5;
  const name = isWoman ? getRandomElement(femaleNames) : getRandomElement(maleNames);
  const email = `bot${index + 1}@example.com`;
  const password = 'BotPassword123!';
  
  try {
    // Create auth user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (authError) {
      console.error(`Bot ${index + 1} auth error:`, authError.message);
      return;
    }

    if (!authData.user) {
      console.error(`Bot ${index + 1}: User creation failed`);
      return;
    }

    // Create profile
    const profileData = {
      id: authData.user.id,
      name: name,
      age: getRandomAge(),
      gender: isWoman ? 'kadın' : 'erkek',
      city: getRandomElement(cities),
      bio: getRandomElement(bios),
      photo_url: getRandomElement(photoUrls),
      is_premium: Math.random() > 0.7, // %30 premium
      daily_offers_count: Math.floor(Math.random() * 3),
      last_offer_reset: new Date().toISOString()
    };

    const { error: profileError } = await supabase
      .from('profiles')
      .insert(profileData);

    if (profileError) {
      console.error(`Bot ${index + 1} profile error:`, profileError.message);
      return;
    }

    console.log(`✅ Bot ${index + 1} created: ${name} (${email})`);
    
  } catch (error) {
    console.error(`Bot ${index + 1} error:`, error.message);
  }
}

async function createAllBots() {
  console.log('🤖 Creating 20 bot accounts...\n');
  
  for (let i = 0; i < 20; i++) {
    await createBotAccount(i);
    // Small delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  console.log('\n🎉 Bot account creation completed!');
}

createAllBots().catch(console.error);