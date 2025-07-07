-- Fix public registration for deployed app
-- This ensures new users can sign up and use the app when deployed

-- 1. Make sure the trigger function is properly set up for new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert user profile with better error handling
  INSERT INTO public.user_profiles (id, full_name, phone)
  VALUES (
    NEW.id, 
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email, 'User'),
    COALESCE(NEW.raw_user_meta_data->>'phone', NULL)
  )
  ON CONFLICT (id) DO UPDATE SET
    full_name = COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email, 'User'),
    phone = COALESCE(NEW.raw_user_meta_data->>'phone', public.user_profiles.phone),
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
EXCEPTION
  WHEN OTHERS THEN
    -- Log the error but don't fail the user creation
    RAISE WARNING 'Error in handle_new_user: %', SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Ensure the trigger exists and is active
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 3. Add unique constraints to prevent conflicts
ALTER TABLE public.auto_load_settings 
ADD CONSTRAINT unique_user_auto_load UNIQUE (user_id);

ALTER TABLE public.notification_preferences 
ADD CONSTRAINT unique_user_notifications UNIQUE (user_id);

-- 4. Grant necessary permissions for public registration
GRANT USAGE ON SCHEMA public TO anon;
GRANT USAGE ON SCHEMA public TO authenticated;

-- Allow authenticated users to read/write their own data
GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_profiles TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.smart_meters TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.payment_methods TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.transactions TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.auto_load_settings TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.notification_preferences TO authenticated;

-- 5. Ensure RLS policies allow proper access
-- Update user profiles policy to allow inserts during registration
DROP POLICY IF EXISTS "Users can insert own profile" ON public.user_profiles;
CREATE POLICY "Users can insert own profile" ON public.user_profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Allow users to insert their own records
DROP POLICY IF EXISTS "Users can insert own auto-load settings" ON public.auto_load_settings;
CREATE POLICY "Users can insert own auto-load settings" ON public.auto_load_settings
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own notification preferences" ON public.notification_preferences;
CREATE POLICY "Users can insert own notification preferences" ON public.notification_preferences
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 6. Back-fill any existing users who might not have profiles
INSERT INTO public.user_profiles (id, full_name)
SELECT u.id, COALESCE(u.raw_user_meta_data->>'full_name', u.email, 'User')
FROM auth.users u
LEFT JOIN public.user_profiles p ON p.id = u.id
WHERE p.id IS NULL
ON CONFLICT (id) DO NOTHING;

-- 7. Create default settings for existing users
INSERT INTO public.notification_preferences (user_id)
SELECT u.id
FROM auth.users u
LEFT JOIN public.notification_preferences n ON n.user_id = u.id
WHERE n.user_id IS NULL
ON CONFLICT (user_id) DO NOTHING;

INSERT INTO public.auto_load_settings (user_id)
SELECT u.id
FROM auth.users u
LEFT JOIN public.auto_load_settings a ON a.user_id = u.id
WHERE a.user_id IS NULL
ON CONFLICT (user_id) DO NOTHING;

SELECT 'Public registration setup completed successfully!' as status;
