-- Add new premium package prices (safe to run multiple times)
INSERT INTO app_settings (setting_key, setting_value, description) VALUES
  ('premium_weekly_10_price', '{"amount": 500, "currency": "TRY"}', 'Haftalık 10 teklif paketi'),
  ('premium_weekly_20_price', '{"amount": 800, "currency": "TRY"}', 'Haftalık 20 teklif paketi')
ON CONFLICT (setting_key) DO UPDATE SET
  setting_value = EXCLUDED.setting_value,
  description = EXCLUDED.description;

-- Verify settings
SELECT setting_key, setting_value, description 
FROM app_settings 
WHERE setting_key LIKE 'premium%'
ORDER BY setting_key;
