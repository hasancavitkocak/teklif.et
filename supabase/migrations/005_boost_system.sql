-- Create boosts table
CREATE TABLE IF NOT EXISTS boosts (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  boost_type TEXT NOT NULL CHECK (boost_type IN ('profile_boost', 'super_like')),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add boost columns to profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_boosted BOOLEAN DEFAULT FALSE;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS boost_expires_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS super_likes_remaining INTEGER DEFAULT 1;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS last_super_like_reset TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Create super_likes table to track usage
CREATE TABLE IF NOT EXISTS super_likes (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  sender_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  receiver_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  offer_id UUID REFERENCES activity_offers(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(sender_id, receiver_id, offer_id)
);

-- Enable RLS
ALTER TABLE boosts ENABLE ROW LEVEL SECURITY;
ALTER TABLE super_likes ENABLE ROW LEVEL SECURITY;

-- Boosts policies
CREATE POLICY "Users can view own boosts" ON boosts
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own boosts" ON boosts
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Super likes policies
CREATE POLICY "Users can view own super likes" ON super_likes
  FOR SELECT USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

CREATE POLICY "Users can create super likes" ON super_likes
  FOR INSERT WITH CHECK (auth.uid() = sender_id);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_boosts_user ON boosts(user_id);
CREATE INDEX IF NOT EXISTS idx_boosts_active ON boosts(is_active, expires_at);
CREATE INDEX IF NOT EXISTS idx_profiles_boosted ON profiles(is_boosted, boost_expires_at);
CREATE INDEX IF NOT EXISTS idx_super_likes_sender ON super_likes(sender_id);
CREATE INDEX IF NOT EXISTS idx_super_likes_receiver ON super_likes(receiver_id);

-- Function to reset daily super likes
CREATE OR REPLACE FUNCTION reset_daily_super_likes()
RETURNS void AS $$
BEGIN
  UPDATE profiles
  SET super_likes_remaining = 1,
      last_super_like_reset = NOW()
  WHERE last_super_like_reset < NOW() - INTERVAL '24 hours';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check and update boost status
CREATE OR REPLACE FUNCTION update_boost_status()
RETURNS void AS $$
BEGIN
  UPDATE profiles
  SET is_boosted = FALSE,
      boost_expires_at = NULL
  WHERE is_boosted = TRUE 
    AND boost_expires_at < NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
