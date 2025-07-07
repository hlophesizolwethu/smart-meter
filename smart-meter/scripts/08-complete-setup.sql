-- COMPLETE DATABASE SETUP FOR ESWATINI ELECTRICITY
-- Run this ONCE in Supabase SQL Editor to create all tables and policies

BEGIN;

-- ===== CREATE TABLES =====

-- User profiles table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.user_profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  full_name TEXT NOT NULL,
  phone TEXT,
  address TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Smart meters table
CREATE TABLE IF NOT EXISTS public.smart_meters (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  meter_id TEXT UNIQUE NOT NULL,
  user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'connected' CHECK (status IN ('connected', 'disconnected', 'maintenance')),
  current_units NUMERIC(10,2) DEFAULT 0.00,
  last_update TIMESTAMPTZ DEFAULT NOW(),
  update_frequency INTEGER DEFAULT 30,
  data_retention_days INTEGER DEFAULT 365,
  location TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Payment methods table
CREATE TABLE IF NOT EXISTS public.payment_methods (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('card', 'mobile', 'bank')),
  name TEXT NOT NULL,
  details TEXT NOT NULL,
  is_default BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Transactions table
CREATE TABLE IF NOT EXISTS public.transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  meter_id UUID REFERENCES public.smart_meters(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('purchase', 'auto-load', 'alert', 'meter-update')),
  amount NUMERIC(10,2),
  units NUMERIC(10,2),
  status TEXT DEFAULT 'pending' CHECK (status IN ('completed', 'pending', 'failed')),
  description TEXT NOT NULL,
  payment_method_id UUID REFERENCES public.payment_methods(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Auto-load settings table
CREATE TABLE IF NOT EXISTS public.auto_load_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  enabled BOOLEAN DEFAULT TRUE,
  threshold NUMERIC(10,2) DEFAULT 10.00,
  amount NUMERIC(10,2) DEFAULT 100.00,
  max_daily NUMERIC(10,2) DEFAULT 500.00,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Notification preferences table
CREATE TABLE IF NOT EXISTS public.notification_preferences (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  low_balance BOOLEAN DEFAULT TRUE,
  auto_load BOOLEAN DEFAULT TRUE,
  purchases BOOLEAN DEFAULT TRUE,
  system_updates BOOLEAN DEFAULT FALSE,
  marketing BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ===== CREATE INDEXES =====

CREATE INDEX IF NOT EXISTS idx_smart_meters_user_id ON public.smart_meters(user_id);
CREATE INDEX IF NOT EXISTS idx_smart_meters_meter_id ON public.smart_meters(meter_id);
CREATE INDEX IF NOT EXISTS idx_payment_methods_user_id ON public.payment_methods(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON public.transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_created_at ON public.transactions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_auto_load_settings_user_id ON public.auto_load_settings(user_id);
CREATE INDEX IF NOT EXISTS idx_notification_preferences_user_id ON public.notification_preferences(user_id);

-- ===== ENABLE ROW LEVEL SECURITY =====

ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.smart_meters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_methods ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.auto_load_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_preferences ENABLE ROW LEVEL SECURITY;

-- ===== CREATE RLS POLICIES =====

-- User profiles policies
DROP POLICY IF EXISTS "Users can view own profile" ON public.user_profiles;
CREATE POLICY "Users can view own profile" ON public.user_profiles
  FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON public.user_profiles;
CREATE POLICY "Users can update own profile" ON public.user_profiles
  FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert own profile" ON public.user_profiles;
CREATE POLICY "Users can insert own profile" ON public.user_profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Smart meters policies
DROP POLICY IF EXISTS "Users can view own meters" ON public.smart_meters;
CREATE POLICY "Users can view own meters" ON public.smart_meters
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own meters" ON public.smart_meters;
CREATE POLICY "Users can update own meters" ON public.smart_meters
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own meters" ON public.smart_meters;
CREATE POLICY "Users can insert own meters" ON public.smart_meters
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Payment methods policies
DROP POLICY IF EXISTS "Users can manage own payment methods" ON public.payment_methods;
CREATE POLICY "Users can manage own payment methods" ON public.payment_methods
  FOR ALL USING (auth.uid() = user_id);

-- Transactions policies
DROP POLICY IF EXISTS "Users can view own transactions" ON public.transactions;
CREATE POLICY "Users can view own transactions" ON public.transactions
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own transactions" ON public.transactions;
CREATE POLICY "Users can insert own transactions" ON public.transactions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Auto-load settings policies
DROP POLICY IF EXISTS "Users can manage own auto-load settings" ON public.auto_load_settings;
CREATE POLICY "Users can manage own auto-load settings" ON public.auto_load_settings
  FOR ALL USING (auth.uid() = user_id);

-- Notification preferences policies
DROP POLICY IF EXISTS "Users can manage own notification preferences" ON public.notification_preferences;
CREATE POLICY "Users can manage own notification preferences" ON public.notification_preferences
  FOR ALL USING (auth.uid() = user_id);

-- ===== CREATE FUNCTIONS =====

-- Function to handle new user creation
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

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ===== CREATE TRIGGERS =====

-- Trigger for new user creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Triggers for updated_at timestamps
DROP TRIGGER IF EXISTS handle_updated_at ON public.user_profiles;
CREATE TRIGGER handle_updated_at BEFORE UPDATE ON public.user_profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS handle_updated_at ON public.payment_methods;
CREATE TRIGGER handle_updated_at BEFORE UPDATE ON public.payment_methods
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS handle_updated_at ON public.transactions;
CREATE TRIGGER handle_updated_at BEFORE UPDATE ON public.transactions
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS handle_updated_at ON public.auto_load_settings;
CREATE TRIGGER handle_updated_at BEFORE UPDATE ON public.auto_load_settings
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS handle_updated_at ON public.notification_preferences;
CREATE TRIGGER handle_updated_at BEFORE UPDATE ON public.notification_preferences
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ===== GRANT PERMISSIONS =====

GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON public.user_profiles TO authenticated;
GRANT ALL ON public.smart_meters TO authenticated;
GRANT ALL ON public.payment_methods TO authenticated;
GRANT ALL ON public.transactions TO authenticated;
GRANT ALL ON public.auto_load_settings TO authenticated;
GRANT ALL ON public.notification_preferences TO authenticated;

COMMIT;

-- Success message
SELECT 'Database setup completed successfully! All tables, policies, and triggers have been created.' as status;
