-- Create app_settings table for dynamic configuration
CREATE TABLE IF NOT EXISTS app_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  setting_key TEXT UNIQUE NOT NULL,
  setting_value JSONB NOT NULL,
  description TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  updated_by UUID REFERENCES profiles(id)
);

-- Enable RLS
ALTER TABLE app_settings ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Admins can manage settings" ON app_settings;
DROP POLICY IF EXISTS "Anyone can read settings" ON app_settings;

-- Admins can do everything
CREATE POLICY "Admins can manage settings" ON app_settings
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.is_admin = true
    )
  );

-- Everyone can read settings
CREATE POLICY "Anyone can read settings" ON app_settings
  FOR SELECT USING (true);

-- Insert default settings
INSERT INTO app_settings (setting_key, setting_value, description) VALUES
  ('daily_free_offers', '{"limit": 3}', 'Günlük ücretsiz teklif limiti'),
  ('premium_monthly_price', '{"amount": 3000, "currency": "TRY"}', 'Premium aylık ücret'),
  ('premium_yearly_price', '{"amount": 30000, "currency": "TRY"}', 'Premium yıllık ücret'),
  ('premium_weekly_10_price', '{"amount": 500, "currency": "TRY"}', 'Haftalık 10 teklif paketi'),
  ('premium_weekly_20_price', '{"amount": 800, "currency": "TRY"}', 'Haftalık 20 teklif paketi'),
  ('premium_features', '{"unlimited_offers": true, "super_likes": 5, "boost_per_month": 1, "see_who_liked": true, "advanced_filters": true}', 'Premium özellikler'),
  ('boost_duration', '{"hours": 1}', 'Boost süresi (saat)'),
  ('boost_price', '{"amount": 500, "currency": "TRY"}', 'Boost ücreti'),
  ('super_like_daily_limit', '{"limit": 3}', 'Günlük süper beğeni limiti')
ON CONFLICT (setting_key) DO NOTHING;

-- Create function to update setting
CREATE OR REPLACE FUNCTION update_app_setting(
  p_key TEXT,
  p_value JSONB,
  p_user_id UUID
)
RETURNS void AS $$
BEGIN
  UPDATE app_settings
  SET 
    setting_value = p_value,
    updated_at = NOW(),
    updated_by = p_user_id
  WHERE setting_key = p_key;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_app_settings_key ON app_settings(setting_key);
