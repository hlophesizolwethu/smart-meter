-- Enable Row Level Security
ALTER DATABASE postgres SET "app.jwt_secret" TO 'your-jwt-secret';

-- Create users table (extends Supabase auth.users)
CREATE TABLE public.user_profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  full_name TEXT NOT NULL,
  phone TEXT,
  address TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create smart meters table
CREATE TABLE public.smart_meters (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  meter_id TEXT UNIQUE NOT NULL,
  user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'connected' CHECK (status IN ('connected', 'disconnected', 'maintenance')),
  current_units DECIMAL(10,2) DEFAULT 0.00,
  last_update TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  update_frequency INTEGER DEFAULT 30, -- seconds
  data_retention_days INTEGER DEFAULT 365,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create payment methods table
CREATE TABLE public.payment_methods (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('card', 'mobile', 'bank')),
  name TEXT NOT NULL,
  details TEXT NOT NULL,
  is_default BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create transactions table
CREATE TABLE public.transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  meter_id UUID REFERENCES public.smart_meters(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('purchase', 'auto-load', 'alert', 'meter-update')),
  amount DECIMAL(10,2),
  units DECIMAL(10,2),
  status TEXT DEFAULT 'pending' CHECK (status IN ('completed', 'pending', 'failed')),
  description TEXT NOT NULL,
  payment_method_id UUID REFERENCES public.payment_methods(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create auto-load settings table
CREATE TABLE public.auto_load_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  enabled BOOLEAN DEFAULT TRUE,
  threshold DECIMAL(10,2) DEFAULT 10.00,
  amount DECIMAL(10,2) DEFAULT 100.00,
  max_daily DECIMAL(10,2) DEFAULT 500.00,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create notification preferences table
CREATE TABLE public.notification_preferences (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  low_balance BOOLEAN DEFAULT TRUE,
  auto_load BOOLEAN DEFAULT TRUE,
  purchases BOOLEAN DEFAULT TRUE,
  system_updates BOOLEAN DEFAULT FALSE,
  marketing BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_smart_meters_user_id ON public.smart_meters(user_id);
CREATE INDEX idx_smart_meters_meter_id ON public.smart_meters(meter_id);
CREATE INDEX idx_payment_methods_user_id ON public.payment_methods(user_id);
CREATE INDEX idx_transactions_user_id ON public.transactions(user_id);
CREATE INDEX idx_transactions_created_at ON public.transactions(created_at DESC);
CREATE INDEX idx_auto_load_settings_user_id ON public.auto_load_settings(user_id);
CREATE INDEX idx_notification_preferences_user_id ON public.notification_preferences(user_id);

-- Enable Row Level Security
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.smart_meters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_methods ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.auto_load_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_preferences ENABLE ROW LEVEL SECURITY;
