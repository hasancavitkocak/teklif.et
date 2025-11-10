import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function botAutoOffers() {
  console.log('🤖 Starting bot auto offers...\n');

  try {
    // Get all bot profiles (assuming they have bot emails)
    const { data: botProfiles, error: botError } = await supabase
      .from('profiles')
      .select('*')
      .limit(20);

    if (botError) {
      console.error('Error fetching bot profiles:', botError.message);
      return;
    }

    if (!botProfiles || botProfiles.length === 0) {
      console.log('No bot profiles found');
      return;
    }

    console.log(`Found ${botProfiles.length} profiles`);

    // Get all existing offers to avoid duplicates
    const { data: existingOffers, error: offersError } = await supabase
      .from('offers')
      .select('sender_id, receiver_id');

    if (offersError) {
      console.error('Error fetching existing offers:', offersError.message);
      return;
    }

    const existingPairs = new Set(
      existingOffers?.map(o => `${o.sender_id}-${o.receiver_id}`) || []
    );

    let offersCreated = 0;

    // Each bot sends offers to 2-3 random other profiles
    for (const bot of botProfiles) {
      const availableTargets = botProfiles.filter(p => 
        p.id !== bot.id && 
        !existingPairs.has(`${bot.id}-${p.id}`)
      );

      // Randomly select 2-3 targets
      const numOffers = Math.floor(Math.random() * 2) + 2; // 2-3 offers
      const shuffled = availableTargets.sort(() => 0.5 - Math.random());
      const targets = shuffled.slice(0, Math.min(numOffers, availableTargets.length));

      for (const target of targets) {
        try {
          const { error: insertError } = await supabase
            .from('offers')
            .insert({
              sender_id: bot.id,
              receiver_id: target.id,
              status: 'pending',
            });

          if (insertError) {
            console.error(`Error creating offer from ${bot.name} to ${target.name}:`, insertError.message);
          } else {
            console.log(`✅ ${bot.name} sent offer to ${target.name}`);
            offersCreated++;
            existingPairs.add(`${bot.id}-${target.id}`);
          }

          // Small delay to avoid overwhelming the database
          await new Promise(resolve => setTimeout(resolve, 100));

        } catch (error) {
          console.error(`Offer creation error:`, error.message);
        }
      }
    }

    console.log(`\n🎉 Created ${offersCreated} new offers!`);

    // Show some statistics
    const { data: allOffers, error: statsError } = await supabase
      .from('offers')
      .select('status', { count: 'exact' });

    if (!statsError && allOffers) {
      const pending = allOffers.filter(o => o.status === 'pending').length;
      const matched = allOffers.filter(o => o.status === 'matched').length;
      const rejected = allOffers.filter(o => o.status === 'rejected').length;

      console.log('\n📊 Offer Statistics:');
      console.log(`Pending: ${pending}`);
      console.log(`Matched: ${matched}`);
      console.log(`Rejected: ${rejected}`);
      console.log(`Total: ${allOffers.length}`);
    }

  } catch (error) {
    console.error('❌ Bot auto offers failed:', error.message);
  }
}

botAutoOffers();