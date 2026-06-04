-- ============================================================
-- MineManager XPL — Create User Accounts
-- Run AFTER schema.sql and seed.sql
--
-- IMPORTANT: Direct inserts into auth.users are blocked in Supabase.
-- Use the Dashboard method below instead.
-- ============================================================

-- ============================================================
-- Step 1: Create users via Dashboard
-- Go to: Authentication → Users → Add User → Create new user
-- Create one for each person below:
--
--  Email                      | Temp Password       | Name
--  ---------------------------|---------------------|----------------
--  yerlan@celestium.zw        | MineManager2026!    | Yerlan
--  moyo@celestium.zw          | MineManager2026!    | Moyo
--  taras@celestium.zw         | MineManager2026!    | Taras
--  piyo@celestium.zw          | MineManager2026!    | Piyo Chiradza
--  kenneth@celestium.zw       | MineManager2026!    | Kenneth Matombo
--  sergey@celestium.zw        | MineManager2026!    | Sergey
-- ============================================================

-- ============================================================
-- Step 2: After creating all 6 users in Dashboard, run this
-- SQL to link them to their roles. It auto-detects the UUIDs
-- so you don't need to copy anything manually.
-- ============================================================

insert into user_profiles (id, name, role, employee_id)
select
  id,
  case email
    when 'yerlan@celestium.zw'   then 'Yerlan'
    when 'moyo@celestium.zw'     then 'Moyo'
    when 'taras@celestium.zw'    then 'Taras'
    when 'piyo@celestium.zw'     then 'Piyo Chiradza'
    when 'kenneth@celestium.zw'  then 'Kenneth Matombo'
    when 'sergey@celestium.zw'   then 'Sergey'
  end as name,
  case email
    when 'yerlan@celestium.zw'   then 'Owner'
    when 'moyo@celestium.zw'     then 'Owner'
    when 'taras@celestium.zw'    then 'Owner'
    when 'piyo@celestium.zw'     then 'Mine Manager'
    when 'kenneth@celestium.zw'  then 'Camp Manager'
    when 'sergey@celestium.zw'   then 'Metallurgist'
  end as role,
  case email
    when 'yerlan@celestium.zw'   then 'e001'
    when 'moyo@celestium.zw'     then 'e025'
    when 'taras@celestium.zw'    then 'e026'
    when 'piyo@celestium.zw'     then 'e002'
    when 'kenneth@celestium.zw'  then 'e003'
    when 'sergey@celestium.zw'   then 'e006'
  end as employee_id
from auth.users
where email in (
  'yerlan@celestium.zw', 'moyo@celestium.zw', 'taras@celestium.zw',
  'piyo@celestium.zw',   'kenneth@celestium.zw', 'sergey@celestium.zw'
)
on conflict (id) do update set
  name        = excluded.name,
  role        = excluded.role,
  employee_id = excluded.employee_id;

-- ============================================================
-- Step 3: Also update the employees table with the new names
-- ============================================================
update employees set name = 'Yerlan'  where id = 'e001';
update employees set name = 'Sergey', role = 'Metallurgist' where id = 'e006';
update employees set role = 'Camp Manager' where id = 'e003';

-- Add new employees not in original seed
insert into employees (id, name, role, department, employment_type, monthly_rate, status, start_date)
values
  ('e025', 'Moyo',  'Owner', 'Production Leadership', 'Monthly', 0, 'Active', '2024-01-01'),
  ('e026', 'Taras', 'Owner', 'Production Leadership', 'Monthly', 0, 'Active', '2024-01-01')
on conflict (id) do nothing;
