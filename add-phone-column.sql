-- Add phone column to profiles table
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS phone VARCHAR(20);

-- Add birth_date column
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS birth_date DATE;

-- Add phone verification column
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS phone_verified BOOLEAN DEFAULT FALSE;

-- Add email verification column
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT FALSE;

-- Create index for phone number lookups
CREATE INDEX IF NOT EXISTS idx_profiles_phone ON profiles(phone);

-- Add comments
COMMENT ON COLUMN profiles.phone IS 'User phone number for authentication';
COMMENT ON COLUMN profiles.birth_date IS 'User birth date for age calculation';
COMMENT ON COLUMN profiles.phone_verified IS 'Whether the phone number has been verified via OTP';
COMMENT ON COLUMN profiles.email_verified IS 'Whether the email address has been verified via OTP';