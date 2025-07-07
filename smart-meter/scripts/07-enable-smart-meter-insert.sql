-- RUN THIS ONCE IN Supabase → SQL editor
-- Allows an authenticated user to insert a row where user_id = their auth.uid()

alter table public.smart_meters enable row level security;

drop policy if exists "own_meter_write" on public.smart_meters;

create policy "own_meter_write"
  on public.smart_meters
  for insert
  with check ( auth.uid() = user_id );
