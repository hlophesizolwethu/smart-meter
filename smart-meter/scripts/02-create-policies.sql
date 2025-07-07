-- Row Level Security Policies

-- User profiles policies
CREATE POLICY "Users can view own profile" ON public.user_profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.user_profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.user_profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Smart meters policies
CREATE POLICY "Users can view own meters" ON public.smart_meters
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own meters" ON public.smart_meters
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own meters" ON public.smart_meters
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Payment methods policies
CREATE POLICY "Users can view own payment methods" ON public.payment_methods
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own payment methods" ON public.payment_methods
  FOR ALL USING (auth.uid() = user_id);

-- Transactions policies
CREATE POLICY "Users can view own transactions" ON public.transactions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own transactions" ON public.transactions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Auto-load settings policies
CREATE POLICY "Users can manage own auto-load settings" ON public.auto_load_settings
  FOR ALL USING (auth.uid() = user_id);

-- Notification preferences policies
CREATE POLICY "Users can manage own notification preferences" ON public.notification_preferences
  FOR ALL USING (auth.uid() = user_id);
