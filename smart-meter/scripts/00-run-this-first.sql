-- RUN THIS SCRIPT ONCE IN SUPABASE IF YOU DO NOT HAVE THE TABLES YET
-- It wraps the full schema creation (from 01-… 02-… 03-… 06-…) in a single transaction
-- so you don’t have to execute each file manually.

BEGIN;

-- ===== users + profiles
CREATE TABLE IF NOT EXISTS public.user_profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  full_name TEXT NOT NULL,
  phone TEXT,
  address TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ===== smart meters
CREATE TABLE IF NOT EXISTS public.smart_meters (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  meter_id TEXT UNIQUE NOT NULL,
  user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'connected' CHECK (status IN ('connected','disconnected','maintenance')),
  current_units NUMERIC(10,2) DEFAULT 0.00,
  last_update TIMESTAMPTZ DEFAULT NOW(),
  update_frequency INT DEFAULT 30,
  data_retention_days INT DEFAULT 365,
  location TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_smart_meters_user_id ON public.smart_meters(user_id);
CREATE INDEX IF NOT EXISTS idx_smart_meters_meter_id ON public.smart_meters(meter_id);

-- ===== payment methods
CREATE TABLE IF NOT EXISTS public.payment_methods (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('card','mobile','bank')),
  name TEXT NOT NULL,
  details TEXT NOT NULL,
  is_default BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ===== transactions
CREATE TABLE IF NOT EXISTS public.transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  meter_id UUID REFERENCES public.smart_meters(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('purchase','auto-load','alert','meter-update')),
  amount NUMERIC(10,2),
  units NUMERIC(10,2),
  status TEXT DEFAULT 'pending' CHECK (status IN ('completed','pending','failed')),
  description TEXT NOT NULL,
  payment_method_id UUID REFERENCES public.payment_methods(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ===== auto-load settings
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

-- ===== notification prefs
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

-- ===== basic RLS
ALTER TABLE public.smart_meters ENABLE ROW LEVEL SECURITY;
CREATE POLICY IF NOT EXISTS "own_meter_read" ON public.smart_meters
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY IF NOT EXISTS "own_meter_write" ON public.smart_meters
  FOR INSERT WITH CHECK (auth.uid() = user_id);

COMMIT;
