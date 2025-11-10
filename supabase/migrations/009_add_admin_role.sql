-- Add is_admin column to profiles table
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT false;

-- Create index for faster admin queries
CREATE INDEX IF NOT EXISTS idx_profiles_is_admin ON profiles(is_admin);

-- Function to make user admin
CREATE OR REPLACE FUNCTION make_user_admin(user_email TEXT)
RETURNS void AS $$
BEGIN
  UPDATE profiles
  SET is_admin = true
  WHERE id IN (
    SELECT id FROM auth.users WHERE email = user_email
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to remove admin role
CREATE OR REPLACE FUNCTION remove_admin_role(user_email TEXT)
RETURNS void AS $$
BEGIN
  UPDATE profiles
  SET is_admin = false
  WHERE id IN (
    SELECT id FROM auth.users WHERE email = user_email
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Example: Make first user admin (update with your email)
-- SELECT make_user_admin('your-email@example.com');
