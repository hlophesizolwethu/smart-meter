-- Disable email confirmation for immediate sign-up
-- This should be run in your Supabase SQL editor or via the dashboard

-- Update auth settings to disable email confirmation
-- Note: This needs to be done via Supabase Dashboard -> Authentication -> Settings
-- Set "Enable email confirmations" to OFF

-- Alternatively, you can update the auth.config if you have access:
-- UPDATE auth.config SET enable_signup = true, enable_email_confirmations = false;

-- For development purposes, you can also set this via environment variables:
-- SUPABASE_AUTH_ENABLE_SIGNUP=true
-- SUPABASE_AUTH_EMAIL_CONFIRM=false
