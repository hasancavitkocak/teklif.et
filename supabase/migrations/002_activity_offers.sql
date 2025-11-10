-- Create activity_offers table (etkinlik teklifleri)
CREATE TABLE activity_offers (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  creator_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  city TEXT NOT NULL,
  district TEXT,
  event_date TIMESTAMP WITH TIME ZONE NOT NULL,
  participant_count INTEGER DEFAULT 2 CHECK (participant_count >= 2 AND participant_count <= 50),
  offer_type TEXT DEFAULT 'birebir' CHECK (offer_type IN ('birebir', 'grup')),
  category TEXT CHECK (category IN ('kahve', 'yemek', 'spor', 'sinema', 'gezi', 'konser', 'diger')),
  image_url TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create offer_requests table (tekliflere katılım talepleri)
CREATE TABLE offer_requests (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  offer_id UUID REFERENCES activity_offers(id) ON DELETE CASCADE NOT NULL,
  requester_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  message TEXT,
  suggested_date TIMESTAMP WITH TIME ZONE,
  suggested_location TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(offer_id, requester_id)
);

-- Create packages table (paket satın alımları)
CREATE TABLE packages (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  package_type TEXT NOT NULL CHECK (package_type IN ('gunluk', 'aylik', 'premium')),
  offer_limit INTEGER,
  expires_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add columns to profiles for offer tracking
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS free_offers_used INTEGER DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS total_offers_sent INTEGER DEFAULT 0;

-- Enable RLS
ALTER TABLE activity_offers ENABLE ROW LEVEL SECURITY;
ALTER TABLE offer_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE packages ENABLE ROW LEVEL SECURITY;

-- Activity offers policies
CREATE POLICY "Anyone can view active offers" ON activity_offers
  FOR SELECT USING (status = 'active');

CREATE POLICY "Users can create offers" ON activity_offers
  FOR INSERT WITH CHECK (auth.uid() = creator_id);

CREATE POLICY "Users can update own offers" ON activity_offers
  FOR UPDATE USING (auth.uid() = creator_id);

CREATE POLICY "Users can delete own offers" ON activity_offers
  FOR DELETE USING (auth.uid() = creator_id);

-- Offer requests policies
CREATE POLICY "Users can view requests for their offers" ON offer_requests
  FOR SELECT USING (
    auth.uid() IN (
      SELECT creator_id FROM activity_offers WHERE id = offer_id
    ) OR auth.uid() = requester_id
  );

CREATE POLICY "Users can create requests" ON offer_requests
  FOR INSERT WITH CHECK (auth.uid() = requester_id);

CREATE POLICY "Offer creators can update requests" ON offer_requests
  FOR UPDATE USING (
    auth.uid() IN (
      SELECT creator_id FROM activity_offers WHERE id = offer_id
    )
  );

-- Packages policies
CREATE POLICY "Users can view own packages" ON packages
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own packages" ON packages
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create indexes
CREATE INDEX idx_activity_offers_creator ON activity_offers(creator_id);
CREATE INDEX idx_activity_offers_city ON activity_offers(city);
CREATE INDEX idx_activity_offers_category ON activity_offers(category);
CREATE INDEX idx_activity_offers_event_date ON activity_offers(event_date);
CREATE INDEX idx_activity_offers_status ON activity_offers(status);
CREATE INDEX idx_offer_requests_offer ON offer_requests(offer_id);
CREATE INDEX idx_offer_requests_requester ON offer_requests(requester_id);
CREATE INDEX idx_offer_requests_status ON offer_requests(status);
CREATE INDEX idx_packages_user ON packages(user_id);

-- Function to check if user can send offer request
CREATE OR REPLACE FUNCTION can_send_offer_request(user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  profile_record RECORD;
  active_package RECORD;
BEGIN
  -- Get user profile
  SELECT * INTO profile_record FROM profiles WHERE id = user_id;
  
  -- Premium users have unlimited
  IF profile_record.is_premium THEN
    RETURN TRUE;
  END IF;
  
  -- Check for active package
  SELECT * INTO active_package 
  FROM packages 
  WHERE packages.user_id = user_id 
    AND is_active = TRUE 
    AND (expires_at IS NULL OR expires_at > NOW())
  ORDER BY created_at DESC
  LIMIT 1;
  
  IF active_package.id IS NOT NULL THEN
    -- Check if package has remaining offers
    IF active_package.offer_limit IS NULL THEN
      RETURN TRUE; -- Unlimited package
    END IF;
    
    -- Count offers used with this package
    DECLARE
      offers_used INTEGER;
    BEGIN
      SELECT COUNT(*) INTO offers_used
      FROM offer_requests
      WHERE requester_id = user_id
        AND created_at >= active_package.created_at;
      
      RETURN offers_used < active_package.offer_limit;
    END;
  END IF;
  
  -- Check free offers (3 free)
  RETURN profile_record.free_offers_used < 3;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
