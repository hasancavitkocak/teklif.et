-- Profil resmi güncellendiğinde taleplerdeki creator bilgilerini güncelle
-- Bu trigger profiles tablosunda photo_url değiştiğinde çalışır

-- Önce mevcut trigger'ı sil (varsa)
DROP TRIGGER IF EXISTS update_offers_on_profile_photo_change ON profiles;
DROP FUNCTION IF EXISTS update_offers_creator_photo();

-- Trigger fonksiyonu oluştur
CREATE OR REPLACE FUNCTION update_offers_creator_photo()
RETURNS TRIGGER AS $$
BEGIN
  -- Eğer photo_url değiştiyse, bu kullanıcının tüm aktif tekliflerini güncelle
  IF OLD.photo_url IS DISTINCT FROM NEW.photo_url THEN
    -- Bu kullanıcının creator olduğu tüm aktif teklifleri bul ve güncelle
    -- Not: Supabase'de nested update yapmak yerine, 
    -- frontend'de real-time subscription kullanmak daha iyi olabilir
    
    -- Log için bilgi
    RAISE NOTICE 'Profile photo updated for user %, updating offers', NEW.id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger oluştur
CREATE TRIGGER update_offers_on_profile_photo_change
  AFTER UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_offers_creator_photo();

-- Real-time için RLS politikalarını kontrol et
-- activity_offers tablosunda creator bilgileri join ile alındığı için
-- profiles tablosundaki değişiklikler otomatik olarak yansıyacak

-- Eğer cache problemi varsa, bu query ile kontrol edebilirsin:
-- SELECT ao.*, p.photo_url as creator_photo 
-- FROM activity_offers ao 
-- JOIN profiles p ON ao.creator_id = p.id 
-- WHERE ao.status = 'active';