-- Create profile_photos table for multiple photos
CREATE TABLE IF NOT EXISTS profile_photos (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  photo_url TEXT NOT NULL,
  photo_order INTEGER NOT NULL DEFAULT 0,
  is_primary BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE profile_photos ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Anyone can view profile photos" ON profile_photos
  FOR SELECT USING (true);

CREATE POLICY "Users can manage own photos" ON profile_photos
  FOR ALL USING (auth.uid() = user_id);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_profile_photos_user ON profile_photos(user_id);
CREATE INDEX IF NOT EXISTS idx_profile_photos_order ON profile_photos(user_id, photo_order);
CREATE INDEX IF NOT EXISTS idx_profile_photos_primary ON profile_photos(user_id, is_primary);

-- Function to ensure only one primary photo per user
CREATE OR REPLACE FUNCTION ensure_single_primary_photo()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.is_primary = TRUE THEN
    -- Set all other photos of this user to non-primary
    UPDATE profile_photos
    SET is_primary = FALSE
    WHERE user_id = NEW.user_id
      AND id != NEW.id;
    
    -- Update profile table with primary photo
    UPDATE profiles
    SET photo_url = NEW.photo_url
    WHERE id = NEW.user_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to maintain primary photo
CREATE TRIGGER trigger_ensure_single_primary_photo
  AFTER INSERT OR UPDATE ON profile_photos
  FOR EACH ROW
  WHEN (NEW.is_primary = TRUE)
  EXECUTE FUNCTION ensure_single_primary_photo();
