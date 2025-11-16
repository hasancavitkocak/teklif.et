-- Complete profile table update with all new fields

-- Add missing columns one by one (safer approach)
DO $$ 
BEGIN
    -- Add phone column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'phone') THEN
        ALTER TABLE profiles ADD COLUMN phone VARCHAR(20);
    END IF;
    
    -- Add birth_date column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'birth_date') THEN
        ALTER TABLE profiles ADD COLUMN birth_date DATE;
    END IF;
    
    -- Add phone_verified column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'phone_verified') THEN
        ALTER TABLE profiles ADD COLUMN phone_verified BOOLEAN DEFAULT FALSE;
    END IF;
    
    -- Add email_verified column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'email_verified') THEN
        ALTER TABLE profiles ADD COLUMN email_verified BOOLEAN DEFAULT FALSE;
    END IF;
    
    -- Add education_level column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'education_level') THEN
        ALTER TABLE profiles ADD COLUMN education_level VARCHAR(20) DEFAULT 'universite';
    END IF;
    
    -- Add has_pets column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'has_pets') THEN
        ALTER TABLE profiles ADD COLUMN has_pets BOOLEAN DEFAULT FALSE;
    END IF;
    
    -- Add pet_type column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'pet_type') THEN
        ALTER TABLE profiles ADD COLUMN pet_type VARCHAR(50);
    END IF;
    
    -- Add drinks_alcohol column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'drinks_alcohol') THEN
        ALTER TABLE profiles ADD COLUMN drinks_alcohol VARCHAR(10) DEFAULT 'hayir';
    END IF;
    
    -- Add smokes column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'smokes') THEN
        ALTER TABLE profiles ADD COLUMN smokes VARCHAR(10) DEFAULT 'hayir';
    END IF;
    
    -- Add looking_for column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'looking_for') THEN
        ALTER TABLE profiles ADD COLUMN looking_for TEXT[] DEFAULT '{}';
    END IF;
    
    -- Add show_profile column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'show_profile') THEN
        ALTER TABLE profiles ADD COLUMN show_profile BOOLEAN DEFAULT TRUE;
    END IF;
    
    -- Add photos column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'photos') THEN
        ALTER TABLE profiles ADD COLUMN photos TEXT[] DEFAULT '{}';
    END IF;
END $$;

-- Ensure all existing columns have proper defaults
ALTER TABLE profiles ALTER COLUMN is_premium SET DEFAULT FALSE;
ALTER TABLE profiles ALTER COLUMN is_admin SET DEFAULT FALSE;
ALTER TABLE profiles ALTER COLUMN daily_offers_count SET DEFAULT 0;
ALTER TABLE profiles ALTER COLUMN free_offers_used SET DEFAULT 0;
ALTER TABLE profiles ALTER COLUMN total_offers_sent SET DEFAULT 0;
ALTER TABLE profiles ALTER COLUMN last_offer_reset SET DEFAULT NOW();

-- Make city optional (can be null)
ALTER TABLE profiles ALTER COLUMN city DROP NOT NULL;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_profiles_phone ON profiles(phone);
CREATE INDEX IF NOT EXISTS idx_profiles_city ON profiles(city);
CREATE INDEX IF NOT EXISTS idx_profiles_age ON profiles(age);
CREATE INDEX IF NOT EXISTS idx_profiles_education ON profiles(education_level);
CREATE INDEX IF NOT EXISTS idx_profiles_show_profile ON profiles(show_profile);

-- Add check constraints for enum-like fields (after columns are created)
DO $$ 
BEGIN
    -- Add education_level constraint
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'chk_education_level') THEN
        ALTER TABLE profiles ADD CONSTRAINT chk_education_level 
          CHECK (education_level IN ('lise', 'universite', 'yuksek_lisans', 'doktora', 'diger'));
    END IF;
    
    -- Add drinks_alcohol constraint
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'chk_drinks_alcohol') THEN
        ALTER TABLE profiles ADD CONSTRAINT chk_drinks_alcohol 
          CHECK (drinks_alcohol IN ('evet', 'hayir', 'bazen'));
    END IF;
    
    -- Add smokes constraint
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'chk_smokes') THEN
        ALTER TABLE profiles ADD CONSTRAINT chk_smokes 
          CHECK (smokes IN ('evet', 'hayir', 'bazen'));
    END IF;
END $$;

-- Add comments for documentation
COMMENT ON COLUMN profiles.phone IS 'User phone number for authentication';
COMMENT ON COLUMN profiles.birth_date IS 'User birth date for age calculation';
COMMENT ON COLUMN profiles.phone_verified IS 'Whether the phone number has been verified via OTP';
COMMENT ON COLUMN profiles.email_verified IS 'Whether the email address has been verified via OTP';
COMMENT ON COLUMN profiles.education_level IS 'User education level (lise, universite, yuksek_lisans, doktora, diger)';
COMMENT ON COLUMN profiles.has_pets IS 'Whether user has pets';
COMMENT ON COLUMN profiles.pet_type IS 'Type of pet if has_pets is true';
COMMENT ON COLUMN profiles.drinks_alcohol IS 'Alcohol consumption (evet, hayir, bazen)';
COMMENT ON COLUMN profiles.smokes IS 'Smoking habit (evet, hayir, bazen)';
COMMENT ON COLUMN profiles.looking_for IS 'Array of interests/activities user is looking for';
COMMENT ON COLUMN profiles.show_profile IS 'Whether to show profile to other users';
COMMENT ON COLUMN profiles.photos IS 'Array of photo URLs for user profile';

-- Update existing profiles to have default values
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
WHERE phone_verified IS NULL 
   OR email_verified IS NULL 
   OR education_level IS NULL 
   OR has_pets IS NULL 
   OR drinks_alcohol IS NULL 
   OR smokes IS NULL 
   OR show_profile IS NULL 
   OR looking_for IS NULL 
   OR photos IS NULL;