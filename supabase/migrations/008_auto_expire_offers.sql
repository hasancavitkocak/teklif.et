-- Function to automatically expire past offers
CREATE OR REPLACE FUNCTION expire_past_offers()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE activity_offers
  SET status = 'expired'
  WHERE status = 'active'
    AND event_date < NOW();
END;
$$;

-- Create a trigger to run this function periodically
-- Note: In production, you'd use pg_cron or a scheduled job
-- For now, we'll call this manually or via a cron job

-- Add expired status to check constraint if not exists
DO $$ 
BEGIN
  -- Drop existing constraint if it exists
  ALTER TABLE activity_offers DROP CONSTRAINT IF EXISTS activity_offers_status_check;
  
  -- Add new constraint with expired status
  ALTER TABLE activity_offers ADD CONSTRAINT activity_offers_status_check 
    CHECK (status IN ('active', 'completed', 'cancelled', 'expired'));
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- Create an index for faster queries on active offers
CREATE INDEX IF NOT EXISTS idx_activity_offers_active_date 
  ON activity_offers(status, event_date) 
  WHERE status = 'active';

COMMENT ON FUNCTION expire_past_offers() IS 'Automatically marks offers as expired when their event date has passed';
