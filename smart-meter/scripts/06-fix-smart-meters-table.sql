-- Ensure the smart_meters table has the correct structure and constraints
-- Drop and recreate the table if needed

-- First, let's check if we need to update the table structure
DO $$ 
BEGIN
    -- Add any missing columns or constraints
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'smart_meters' AND column_name = 'location'
    ) THEN
        ALTER TABLE public.smart_meters ADD COLUMN location TEXT;
    END IF;
END $$;

-- Ensure proper indexes exist
CREATE INDEX IF NOT EXISTS idx_smart_meters_meter_id_unique ON public.smart_meters(meter_id);
CREATE INDEX IF NOT EXISTS idx_smart_meters_user_meter ON public.smart_meters(user_id, meter_id);

-- Update RLS policies to be more permissive for inserts
DROP POLICY IF EXISTS "Users can insert own meters" ON public.smart_meters;
CREATE POLICY "Users can insert own meters" ON public.smart_meters
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Ensure the trigger function exists and works properly
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert user profile
  INSERT INTO public.user_profiles (id, full_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email, ''))
  ON CONFLICT (id) DO UPDATE SET
    full_name = COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email, ''),
    updated_at = NOW();
  
  -- Create default notification preferences
  INSERT INTO public.notification_preferences (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;
  
  -- Create default auto-load settings
  INSERT INTO public.auto_load_settings (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON public.smart_meters TO authenticated;
GRANT ALL ON public.transactions TO authenticated;
GRANT ALL ON public.user_profiles TO authenticated;
GRANT ALL ON public.payment_methods TO authenticated;
GRANT ALL ON public.auto_load_settings TO authenticated;
GRANT ALL ON public.notification_preferences TO authenticated;
