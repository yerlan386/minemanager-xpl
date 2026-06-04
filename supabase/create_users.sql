-- ============================================================
-- MineManager XPL — Create User Accounts
-- ============================================================
-- Run this AFTER schema.sql and seed.sql
-- IMPORTANT: Replace the passwords below with real secure passwords
--            before running in production.
--
-- These insert directly into auth.users (Supabase internal table).
-- Alternatively, create users via Dashboard → Authentication → Users
-- then run only the user_profiles inserts below.
-- ============================================================

-- Option A: Create via SQL (all at once)
-- NOTE: Supabase may restrict direct auth.users inserts.
-- If this fails, use Option B (Dashboard) below.

do $$
declare
  uid_earl      uuid := gen_random_uuid();
  uid_piyo      uuid := gen_random_uuid();
  uid_kenneth   uuid := gen_random_uuid();
  uid_johnson   uuid := gen_random_uuid();
  uid_thomas    uuid := gen_random_uuid();
  uid_tirika    uuid := gen_random_uuid();
  uid_cloudias  uuid := gen_random_uuid();
begin

  -- Insert into auth.users
  insert into auth.users (id, email, encrypted_password, email_confirmed_at, role, aud, created_at, updated_at)
  values
    (uid_earl,     'earl@celestium.zw',     crypt('ChangeMe123!', gen_salt('bf')), now(), 'authenticated', 'authenticated', now(), now()),
    (uid_piyo,     'piyo@celestium.zw',     crypt('ChangeMe123!', gen_salt('bf')), now(), 'authenticated', 'authenticated', now(), now()),
    (uid_kenneth,  'kenneth@celestium.zw',  crypt('ChangeMe123!', gen_salt('bf')), now(), 'authenticated', 'authenticated', now(), now()),
    (uid_johnson,  'johnson@celestium.zw',  crypt('ChangeMe123!', gen_salt('bf')), now(), 'authenticated', 'authenticated', now(), now()),
    (uid_thomas,   'thomas@celestium.zw',   crypt('ChangeMe123!', gen_salt('bf')), now(), 'authenticated', 'authenticated', now(), now()),
    (uid_tirika,   'tirika@celestium.zw',   crypt('ChangeMe123!', gen_salt('bf')), now(), 'authenticated', 'authenticated', now(), now()),
    (uid_cloudias, 'cloudias@celestium.zw', crypt('ChangeMe123!', gen_salt('bf')), now(), 'authenticated', 'authenticated', now(), now())
  on conflict (email) do nothing;

  -- Create matching user profiles
  insert into user_profiles (id, name, role, employee_id)
  values
    (uid_earl,     'Earl',           'Owner',            'e001'),
    (uid_piyo,     'Piyo Chiradza',  'Mine Manager',     'e002'),
    (uid_kenneth,  'Kenneth Matombo','Shift Supervisor',  'e003'),
    (uid_johnson,  'Johnson',        'Shift Supervisor',  'e004'),
    (uid_thomas,   'Thomas Chikore', 'HSE Officer',       'e005'),
    (uid_tirika,   'Tirika Faresi',  'Metallurgist',      'e006'),
    (uid_cloudias, 'Cloudias Musoni','HR/Admin',          'e014')
  on conflict (id) do nothing;

end $$;


-- ============================================================
-- Option B: If Option A fails, create users via Dashboard then
-- run only this part (replace UUIDs with actual ones from auth.users table)
-- ============================================================
/*
insert into user_profiles (id, name, role, employee_id) values
  ('PASTE-UUID-HERE', 'Earl',           'Owner',            'e001'),
  ('PASTE-UUID-HERE', 'Piyo Chiradza',  'Mine Manager',     'e002'),
  ('PASTE-UUID-HERE', 'Kenneth Matombo','Shift Supervisor',  'e003'),
  ('PASTE-UUID-HERE', 'Johnson',        'Shift Supervisor',  'e004'),
  ('PASTE-UUID-HERE', 'Thomas Chikore', 'HSE Officer',       'e005'),
  ('PASTE-UUID-HERE', 'Tirika Faresi',  'Metallurgist',      'e006'),
  ('PASTE-UUID-HERE', 'Cloudias Musoni','HR/Admin',          'e014');
*/
