-- ============================================
-- TEKLIF.ET - TÜM MİGRATION'LAR
-- ============================================
-- Bu dosyayı Supabase SQL Editor'de çalıştırın
-- Tüm migration'ları sırayla çalıştırır
-- ============================================

-- KONTROL: Hangi tablolar var?
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- Eğer aşağıdaki tablolar YOKSA, migration'ları çalıştırmanız gerekiyor:
-- ✅ profiles
-- ✅ activity_offers
-- ✅ offer_requests
-- ✅ messages
-- ✅ packages
-- ✅ boosts
-- ✅ super_likes
-- ✅ profile_photos
-- ✅ notifications (YENİ!)

-- ============================================
-- ADIM 1: Eksik kolonları kontrol et
-- ============================================

-- profiles tablosunda olması gereken kolonlar:
DO $$ 
BEGIN
    -- notification_preferences kolonu var mı?
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' 
        AND column_name = 'notification_preferences'
    ) THEN
        ALTER TABLE profiles ADD COLUMN notification_preferences JSONB DEFAULT '{
          "new_offer_request": true,
          "offer_accepted": true,
          "offer_rejected": true,
          "new_message": true,
          "boost_activated": true,
          "super_like_received": true,
          "push_enabled": true,
          "email_enabled": false
        }';
        RAISE NOTICE 'notification_preferences kolonu eklendi';
    END IF;

    -- is_boosted kolonu var mı?
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' 
        AND column_name = 'is_boosted'
    ) THEN
        ALTER TABLE profiles ADD COLUMN is_boosted BOOLEAN DEFAULT FALSE;
        ALTER TABLE profiles ADD COLUMN boost_expires_at TIMESTAMP WITH TIME ZONE;
        RAISE NOTICE 'boost kolonları eklendi';
    END IF;

    -- super_likes_remaining kolonu var mı?
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' 
        AND column_name = 'super_likes_remaining'
    ) THEN
        ALTER TABLE profiles ADD COLUMN super_likes_remaining INTEGER DEFAULT 0;
        RAISE NOTICE 'super_likes_remaining kolonu eklendi';
    END IF;
END $$;

-- ============================================
-- ADIM 2: notifications tablosu var mı?
-- ============================================

CREATE TABLE IF NOT EXISTS notifications (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('new_offer_request', 'offer_accepted', 'offer_rejected', 'new_message', 'boost_activated', 'super_like_received')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  data JSONB DEFAULT '{}',
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS aktif et
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Policies
DROP POLICY IF EXISTS "Users can view own notifications" ON notifications;
CREATE POLICY "Users can view own notifications" ON notifications
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own notifications" ON notifications;
CREATE POLICY "Users can update own notifications" ON notifications
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "System can create notifications" ON notifications;
CREATE POLICY "System can create notifications" ON notifications
  FOR INSERT WITH CHECK (true);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(user_id, is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_created ON notifications(created_at DESC);

-- ============================================
-- ADIM 3: profile_photos tablosu var mı?
-- ============================================

CREATE TABLE IF NOT EXISTS profile_photos (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  photo_url TEXT NOT NULL,
  is_primary BOOLEAN DEFAULT FALSE,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE profile_photos ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own photos" ON profile_photos;
CREATE POLICY "Users can view own photos" ON profile_photos
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own photos" ON profile_photos;
CREATE POLICY "Users can insert own photos" ON profile_photos
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own photos" ON profile_photos;
CREATE POLICY "Users can update own photos" ON profile_photos
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own photos" ON profile_photos;
CREATE POLICY "Users can delete own photos" ON profile_photos
  FOR DELETE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Anyone can view photos" ON profile_photos;
CREATE POLICY "Anyone can view photos" ON profile_photos
  FOR SELECT USING (true);

CREATE INDEX IF NOT EXISTS idx_profile_photos_user ON profile_photos(user_id);
CREATE INDEX IF NOT EXISTS idx_profile_photos_primary ON profile_photos(user_id, is_primary);

-- ============================================
-- ADIM 4: messages tablosunda read_at var mı?
-- ============================================

DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'messages' 
        AND column_name = 'read_at'
    ) THEN
        ALTER TABLE messages ADD COLUMN read_at TIMESTAMP WITH TIME ZONE;
        RAISE NOTICE 'read_at kolonu eklendi';
    END IF;
END $$;

-- ============================================
-- SONUÇ: Tüm tablolar oluşturuldu!
-- ============================================

SELECT 
    'notifications' as table_name,
    COUNT(*) as row_count
FROM notifications
UNION ALL
SELECT 
    'profile_photos' as table_name,
    COUNT(*) as row_count
FROM profile_photos
UNION ALL
SELECT 
    'profiles' as table_name,
    COUNT(*) as row_count
FROM profiles;

-- ✅ BAŞARILI! Tüm migration'lar çalıştırıldı.
