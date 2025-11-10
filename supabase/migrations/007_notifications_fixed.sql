-- ============================================
-- NOTIFICATIONS SYSTEM - FIXED VERSION
-- ============================================

-- Create notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('new_offer_request', 'offer_accepted', 'offer_rejected', 'new_message', 'boost_activated', 'super_like_received')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  data JSONB DEFAULT '{}',
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add notification preferences to profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS notification_preferences JSONB DEFAULT '{
  "new_offer_request": true,
  "offer_accepted": true,
  "offer_rejected": true,
  "new_message": true,
  "boost_activated": true,
  "super_like_received": true,
  "push_enabled": true,
  "email_enabled": false
}';

-- Enable RLS
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own notifications" ON notifications;
DROP POLICY IF EXISTS "Users can update own notifications" ON notifications;
DROP POLICY IF EXISTS "System can create notifications" ON notifications;

-- Create policies
CREATE POLICY "Users can view own notifications" ON notifications
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications" ON notifications
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "System can create notifications" ON notifications
  FOR INSERT WITH CHECK (true);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(user_id, is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_created ON notifications(created_at DESC);

-- ============================================
-- FUNCTIONS
-- ============================================

-- Function to create notification
CREATE OR REPLACE FUNCTION create_notification(
  p_user_id UUID,
  p_type TEXT,
  p_title TEXT,
  p_message TEXT,
  p_data JSONB DEFAULT '{}'
)
RETURNS UUID AS $$
DECLARE
  notification_id UUID;
  user_prefs JSONB;
BEGIN
  -- Get user notification preferences
  SELECT notification_preferences INTO user_prefs
  FROM profiles
  WHERE id = p_user_id;
  
  -- Check if user wants this type of notification
  IF user_prefs->p_type = 'true' OR user_prefs->p_type IS NULL THEN
    INSERT INTO notifications (user_id, type, title, message, data)
    VALUES (p_user_id, p_type, p_title, p_message, p_data)
    RETURNING id INTO notification_id;
    
    RETURN notification_id;
  END IF;
  
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to mark notifications as read
CREATE OR REPLACE FUNCTION mark_notifications_read(
  p_user_id UUID,
  p_notification_ids UUID[] DEFAULT NULL
)
RETURNS INTEGER AS $$
DECLARE
  updated_count INTEGER;
BEGIN
  IF p_notification_ids IS NULL THEN
    -- Mark all as read
    UPDATE notifications
    SET is_read = TRUE
    WHERE user_id = p_user_id AND is_read = FALSE;
  ELSE
    -- Mark specific notifications as read
    UPDATE notifications
    SET is_read = TRUE
    WHERE user_id = p_user_id AND id = ANY(p_notification_ids);
  END IF;
  
  GET DIAGNOSTICS updated_count = ROW_COUNT;
  RETURN updated_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- TRIGGERS
-- ============================================

-- Drop existing triggers if they exist
DROP TRIGGER IF EXISTS trigger_new_offer_request ON offer_requests;
DROP TRIGGER IF EXISTS trigger_offer_response ON offer_requests;
DROP TRIGGER IF EXISTS trigger_new_message ON messages;

-- Trigger function for new offer requests
CREATE OR REPLACE FUNCTION trigger_offer_request_notification()
RETURNS TRIGGER AS $$
DECLARE
  offer_creator_id UUID;
  offer_title TEXT;
  requester_name TEXT;
BEGIN
  -- Get offer creator and title
  SELECT creator_id, title INTO offer_creator_id, offer_title
  FROM activity_offers
  WHERE id = NEW.offer_id;
  
  -- Get requester name
  SELECT name INTO requester_name
  FROM profiles
  WHERE id = NEW.requester_id;
  
  -- Create notification for offer creator
  PERFORM create_notification(
    offer_creator_id,
    'new_offer_request',
    'Yeni Teklif Geldi! 💌',
    requester_name || ' "' || offer_title || '" talebine teklif gönderdi',
    jsonb_build_object(
      'offer_request_id', NEW.id,
      'offer_id', NEW.offer_id,
      'requester_id', NEW.requester_id
    )
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trigger_new_offer_request
  AFTER INSERT ON offer_requests
  FOR EACH ROW
  EXECUTE FUNCTION trigger_offer_request_notification();

-- Trigger function for offer responses
CREATE OR REPLACE FUNCTION trigger_offer_response_notification()
RETURNS TRIGGER AS $$
DECLARE
  offer_title TEXT;
  creator_name TEXT;
BEGIN
  -- Only trigger on status change to accepted or rejected
  IF OLD.status = 'pending' AND NEW.status IN ('accepted', 'rejected') THEN
    -- Get offer title
    SELECT title INTO offer_title
    FROM activity_offers
    WHERE id = NEW.offer_id;
    
    -- Get creator name (who accepted/rejected)
    SELECT name INTO creator_name
    FROM profiles p
    JOIN activity_offers ao ON p.id = ao.creator_id
    WHERE ao.id = NEW.offer_id;
    
    -- Create notification for requester
    IF NEW.status = 'accepted' THEN
      PERFORM create_notification(
        NEW.requester_id,
        'offer_accepted',
        'Teklif Kabul Edildi! 🎉',
        creator_name || ' "' || offer_title || '" teklifinizi kabul etti',
        jsonb_build_object(
          'offer_request_id', NEW.id,
          'offer_id', NEW.offer_id,
          'creator_id', (SELECT creator_id FROM activity_offers WHERE id = NEW.offer_id)
        )
      );
    ELSE
      PERFORM create_notification(
        NEW.requester_id,
        'offer_rejected',
        'Teklif Reddedildi 😔',
        creator_name || ' "' || offer_title || '" teklifinizi reddetti',
        jsonb_build_object(
          'offer_request_id', NEW.id,
          'offer_id', NEW.offer_id
        )
      );
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trigger_offer_response
  AFTER UPDATE ON offer_requests
  FOR EACH ROW
  EXECUTE FUNCTION trigger_offer_response_notification();

-- Trigger function for new messages
CREATE OR REPLACE FUNCTION trigger_message_notification()
RETURNS TRIGGER AS $$
DECLARE
  sender_name TEXT;
BEGIN
  -- Get sender name
  SELECT name INTO sender_name
  FROM profiles
  WHERE id = NEW.sender_id;
  
  -- Create notification for receiver
  PERFORM create_notification(
    NEW.receiver_id,
    'new_message',
    'Yeni Mesaj 💬',
    sender_name || ' size mesaj gönderdi',
    jsonb_build_object(
      'message_id', NEW.id,
      'sender_id', NEW.sender_id,
      'conversation_id', NEW.sender_id || '_' || NEW.receiver_id
    )
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trigger_new_message
  AFTER INSERT ON messages
  FOR EACH ROW
  EXECUTE FUNCTION trigger_message_notification();

-- ============================================
-- SUCCESS MESSAGE
-- ============================================
DO $$
BEGIN
  RAISE NOTICE '✅ Notifications system installed successfully!';
END $$;
