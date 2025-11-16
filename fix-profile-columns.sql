-- Profile tablosuna eksik kolonları ekle
-- Bu SQL dosyasını Supabase SQL Editor'da çalıştırın

-- Eksik kolonları kontrol et ve ekle
DO $$ 
BEGIN
    -- free_offers_used kolonu var mı kontrol et
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' AND column_name = 'free_offers_used'
    ) THEN
        ALTER TABLE profiles ADD COLUMN free_offers_used INTEGER DEFAULT 0;
        RAISE NOTICE 'Added free_offers_used column';
    END IF;

    -- total_offers_sent kolonu var mı kontrol et
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' AND column_name = 'total_offers_sent'
    ) THEN
        ALTER TABLE profiles ADD COLUMN total_offers_sent INTEGER DEFAULT 0;
        RAISE NOTICE 'Added total_offers_sent column';
    END IF;

    -- is_admin kolonu var mı kontrol et
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' AND column_name = 'is_admin'
    ) THEN
        ALTER TABLE profiles ADD COLUMN is_admin BOOLEAN DEFAULT false;
        RAISE NOTICE 'Added is_admin column';
    END IF;
END $$;

-- Mevcut kayıtları güncelle
UPDATE profiles 
SET 
    free_offers_used = COALESCE(free_offers_used, 0),
    total_offers_sent = COALESCE(total_offers_sent, 0),
    is_admin = COALESCE(is_admin, false)
WHERE 
    free_offers_used IS NULL 
    OR total_offers_sent IS NULL 
    OR is_admin IS NULL;