-- Complete profile table setup with all required columns

-- Add missing columns if they don't exist
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS phone VARCHAR(20);
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS birth_date DATE;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS phone_verified BOOLEAN DEFAULT FALSE;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT FALSE;

-- Ensure all existing columns have proper defaults
ALTER TABLE profiles ALTER COLUMN is_premium SET DEFAULT FALSE;
ALTER TABLE profiles ALTER COLUMN is_admin SET DEFAULT FALSE;
ALTER TABLE profiles ALTER COLUMN daily_offers_count SET DEFAULT 0;
ALTER TABLE profiles ALTER COLUMN free_offers_used SET DEFAULT 0;
ALTER TABLE profiles ALTER COLUMN total_offers_sent SET DEFAULT 0;
ALTER TABLE profiles ALTER COLUMN last_offer_reset SET DEFAULT NOW();

-- Make city optional (can be null)
ALTER TABLE profiles ALTER COLUMN city DROP NOT NULL;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_profiles_phone ON profiles(phone);
CREATE INDEX IF NOT EXISTS idx_profiles_city ON profiles(city);
CREATE INDEX IF NOT EXISTS idx_profiles_age ON profiles(age);

-- Add comments
COMMENT ON COLUMN profiles.phone IS 'User phone number for authentication';
COMMENT ON COLUMN profiles.birth_date IS 'User birth date for age calculation';
COMMENT ON COLUMN profiles.phone_verified IS 'Whether the phone number has been verified via OTP';
COMMENT ON COLUMN profiles.email_verified IS 'Whether the email address has been verified via OTP';