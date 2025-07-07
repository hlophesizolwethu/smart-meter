-- Insert sample data for testing (optional)
-- This will be replaced with real user data when users sign up

-- Sample smart meter (you can remove this after testing)
INSERT INTO public.smart_meters (meter_id, current_units, status) 
VALUES ('SSH-766488', 0.0, 'connected');

-- Sample rate configuration (you might want to create a rates table)
-- For now, we'll use E5.00 per kWh as defined in the application
