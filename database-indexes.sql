-- Database Performance Optimization Indexes
-- Bu SQL dosyasını Supabase SQL Editor'da çalıştırın

-- Profiles tablosu için performans index'leri
CREATE INDEX IF NOT EXISTS idx_profiles_age ON profiles(age);
CREATE INDEX IF NOT EXISTS idx_profiles_gender ON profiles(gender);
CREATE INDEX IF NOT EXISTS idx_profiles_city ON profiles(city);
CREATE INDEX IF NOT EXISTS idx_profiles_is_premium ON profiles(is_premium);
CREATE INDEX IF NOT EXISTS idx_profiles_is_boosted ON profiles(is_boosted);
CREATE INDEX IF NOT EXISTS idx_profiles_created_at ON profiles(created_at);

-- Activity offers tablosu için index'ler
CREATE INDEX IF NOT EXISTS idx_activity_offers_status ON activity_offers(status);
CREATE INDEX IF NOT EXISTS idx_activity_offers_creator_id ON activity_offers(creator_id);
CREATE INDEX IF NOT EXISTS idx_activity_offers_event_date ON activity_offers(event_date);
CREATE INDEX IF NOT EXISTS idx_activity_offers_city ON activity_offers(city);
CREATE INDEX IF NOT EXISTS idx_activity_offers_category ON activity_offers(category);
CREATE INDEX IF NOT EXISTS idx_activity_offers_created_at ON activity_offers(created_at);

-- Offer requests tablosu için index'ler
CREATE INDEX IF NOT EXISTS idx_offer_requests_requester_id ON offer_requests(requester_id);
CREATE INDEX IF NOT EXISTS idx_offer_requests_offer_id ON offer_requests(offer_id);
CREATE INDEX IF NOT EXISTS idx_offer_requests_status ON offer_requests(status);
CREATE INDEX IF NOT EXISTS idx_offer_requests_created_at ON offer_requests(created_at);

-- Composite index'ler (çoklu kolon sorguları için)
CREATE INDEX IF NOT EXISTS idx_profiles_age_gender ON profiles(age, gender);
CREATE INDEX IF NOT EXISTS idx_profiles_city_age ON profiles(city, age);
CREATE INDEX IF NOT EXISTS idx_activity_offers_status_event_date ON activity_offers(status, event_date);
CREATE INDEX IF NOT EXISTS idx_offer_requests_requester_status ON offer_requests(requester_id, status);

-- Boost expiry için index
CREATE INDEX IF NOT EXISTS idx_profiles_boost_expires_at ON profiles(boost_expires_at) WHERE is_boosted = true;

-- Active offers için partial index
CREATE INDEX IF NOT EXISTS idx_activity_offers_active ON activity_offers(created_at, event_date) WHERE status = 'active';

-- Performance monitoring view (opsiyonel)
CREATE OR REPLACE VIEW profile_performance_stats AS
SELECT 
  COUNT(*) as total_profiles,
  COUNT(*) FILTER (WHERE is_premium = true) as premium_profiles,
  COUNT(*) FILTER (WHERE is_boosted = true AND boost_expires_at > NOW()) as boosted_profiles,
  AVG(age) as avg_age,
  COUNT(DISTINCT city) as unique_cities
FROM profiles;