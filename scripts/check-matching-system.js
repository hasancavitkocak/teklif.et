import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

async function checkMatchingSystem() {
  try {
    console.log('Eşleşme sistemi kontrol ediliyor...\n');

    // Get total offers
    const { count: totalOffers } = await supabase
      .from('offers')
      .select('*', { count: 'exact', head: true });

    console.log(`Toplam teklif sayısı: ${totalOffers}`);

    // Get matched offers
    const { count: matchedOffers } = await supabase
      .from('offers')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'matched');

    console.log(`Eşleşen teklif sayısı: ${matchedOffers}`);

    // Get pending offers
    const { count: pendingOffers } = await supabase
      .from('offers')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'pending');

    console.log(`Bekleyen teklif sayısı: ${pendingOffers}`);

    // Get rejected offers
    const { count: rejectedOffers } = await supabase
      .from('offers')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'rejected');

    console.log(`Reddedilen teklif sayısı: ${rejectedOffers}\n`);

    // Check for users with no matches
    const { data: allUsers } = await supabase
      .from('profiles')
      .select('id, name')
      .limit(10);

    console.log('İlk 10 kullanıcının eşleşme durumu:\n');

    for (const user of allUsers || []) {
      const { count: userMatches } = await supabase
        .from('offers')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'matched')
        .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`);

      const { count: sentOffers } = await supabase
        .from('offers')
        .select('*', { count: 'exact', head: true })
        .eq('sender_id', user.id);

      const { count: receivedOffers } = await supabase
        .from('offers')
        .select('*', { count: 'exact', head: true })
        .eq('receiver_id', user.id);

      console.log(`${user.name}:`);
      console.log(`  - Gönderilen: ${sentOffers}`);
      console.log(`  - Alınan: ${receivedOffers}`);
      console.log(`  - Eşleşme: ${userMatches}`);
      console.log('');
    }

    // Check for duplicate matches
    console.log('\nÇift yönlü eşleşme kontrolü...');
    const { data: matches } = await supabase
      .from('offers')
      .select('sender_id, receiver_id')
      .eq('status', 'matched');

    const matchPairs = new Set();
    let duplicates = 0;

    matches?.forEach(match => {
      const pair1 = `${match.sender_id}-${match.receiver_id}`;
      const pair2 = `${match.receiver_id}-${match.sender_id}`;
      
      if (matchPairs.has(pair2)) {
        duplicates++;
      }
      matchPairs.add(pair1);
    });

    console.log(`Çift yönlü eşleşme sayısı: ${duplicates / 2}`);
    console.log(`Tek yönlü eşleşme sayısı: ${(matchedOffers || 0) - duplicates}`);

  } catch (error) {
    console.error('Hata:', error);
  }
}

checkMatchingSystem();
