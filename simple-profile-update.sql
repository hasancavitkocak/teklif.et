-- Simple profile table update - add columns one by one

-- Basic columns
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS phone VARCHAR(20);
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS birth_date DATE;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS phone_verified BOOLEAN DEFAULT FALSE;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT FALSE;

-- Lifestyle columns
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS education_level VARCHAR(20) DEFAULT 'universite';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS has_pets BOOLEAN DEFAULT FALSE;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS pet_type VARCHAR(50);
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS drinks_alcohol VARCHAR(10) DEFAULT 'hayir';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS smokes VARCHAR(10) DEFAULT 'hayir';

-- Profile settings
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS show_profile BOOLEAN DEFAULT TRUE;

-- Arrays for interests and photos
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS looking_for TEXT[] DEFAULT '{}';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS photos TEXT[] DEFAULT '{}';

-- Make city optional
ALTER TABLE profiles ALTER COLUMN city DROP NOT NULL;

-- Set defaults for existing columns
ALTER TABLE profiles ALTER COLUMN is_premium SET DEFAULT FALSE;
ALTER TABLE profiles ALTER COLUMN is_admin SET DEFAULT FALSE;
ALTER TABLE profiles ALTER COLUMN daily_offers_count SET DEFAULT 0;
ALTER TABLE profiles ALTER COLUMN free_offers_used SET DEFAULT 0;
ALTER TABLE profiles ALTER COLUMN total_offers_sent SET DEFAULT 0;

-- Create basic indexes
CREATE INDEX IF NOT EXISTS idx_profiles_phone ON profiles(phone);
CREATE INDEX IF NOT EXISTS idx_profiles_show_profile ON profiles(show_profile);

-- Update existing records with default values
UPDATE profiles SET 
  phone_verified = COALESCE(phone_verified, FALSE),
  email_verified = COALESCE(email_verified, FALSE),
  education_level = COALESCE(education_level, 'universite'),
  has_pets = COALESCE(has_pets, FALSE),
  drinks_alcohol = COALESCE(drinks_alcohol, 'hayir'),
  smokes = COALESCE(smokes, 'hayir'),
  show_profile = COALESCE(show_profile, TRUE),
  looking_for = COALESCE(looking_for, '{}'),
  photos = COALESCE(photos, '{}')
WHERE id IS NOT NULL;