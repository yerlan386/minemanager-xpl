-- ============================================================
-- MineManager XPL — Seed Data
-- Run AFTER schema.sql
-- ============================================================

-- ============================================================
-- EMPLOYEES (all 24 staff from Celestium HR file)
-- ============================================================
insert into employees (id, name, role, department, employment_type, monthly_rate, status, start_date) values
  ('e001', 'Earl',                  'Owner',             'Production Leadership', 'Monthly',    0,    'Active',     '2024-01-01'),
  ('e002', 'Piyo Chiradza',         'Mine Manager',      'Production Leadership', 'Monthly',    1200, 'Active',     '2024-01-01'),
  ('e003', 'Kenneth Matombo',       'Shift Supervisor',  'Production Leadership', 'Monthly',    800,  'Active',     '2024-01-01'),
  ('e004', 'Johnson',               'Shift Supervisor',  'Production Leadership', 'Monthly',    800,  'Active',     '2024-01-01'),
  ('e005', 'Thomas Chikore',        'HSE Officer',       'HSE',                   'Monthly',    700,  'Active',     '2024-01-01'),
  ('e006', 'Tirika Faresi',         'Metallurgist',      'Plant Operations',      'Monthly',    900,  'Active',     '2024-01-01'),
  ('e007', 'Calvin',                'Plant Operator',    'Plant Operations',      'Monthly',    500,  'Active',     '2024-01-01'),
  ('e008', 'Andrew Kavhala',        'Plant Operator',    'Plant Operations',      'Monthly',    500,  'Active',     '2024-01-01'),
  ('e009', 'Morgan Mutenda',        'Artisan',           'Maintenance',           'Monthly',    600,  'Active',     '2024-01-01'),
  ('e010', 'Blessing Mbizi',        'General Worker',    'Plant Operations',      'Monthly',    380,  'Active',     '2024-01-01'),
  ('e011', 'Dyesolodge Kutyauripo', 'General Worker',    'Plant Operations',      'Monthly',    380,  'Active',     '2024-01-01'),
  ('e012', 'Obert Chingondo',       'General Worker',    'Mining & Earthmoving',  'Monthly',    380,  'Active',     '2024-01-01'),
  ('e013', 'Isiah Chidhana',        'General Worker',    'Mining & Earthmoving',  'Monthly',    380,  'Active',     '2024-01-01'),
  ('e014', 'Cloudias Musoni',       'HR/Admin',          'Admin & Support',       'Monthly',    550,  'Active',     '2024-01-01'),
  ('e015', 'Ernest Nyakudya',       'General Worker',    'Plant Operations',      'Monthly',    380,  'Active',     '2024-01-01'),
  ('e016', 'Webbester Kupera',      'General Worker',    'Plant Operations',      'Monthly',    380,  'Active',     '2024-01-01'),
  ('e017', 'Bvunye Chiwayo',        'General Worker',    'Mining & Earthmoving',  'Monthly',    380,  'Active',     '2024-01-01'),
  ('e018', 'Excavator Operator 1',  'Excavator Operator','Mining & Earthmoving',  'Outsourced', 0,    'Outsourced', '2024-01-01'),
  ('e019', 'Excavator Operator 2',  'Excavator Operator','Mining & Earthmoving',  'Outsourced', 0,    'Outsourced', '2024-01-01'),
  ('e020', 'Dump Truck Driver 1',   'Dump Truck Driver', 'Mining & Earthmoving',  'Outsourced', 0,    'Outsourced', '2024-01-01'),
  ('e021', 'Dump Truck Driver 2',   'Dump Truck Driver', 'Mining & Earthmoving',  'Outsourced', 0,    'Outsourced', '2024-01-01'),
  ('e022', 'Dump Truck Driver 3',   'Dump Truck Driver', 'Mining & Earthmoving',  'Outsourced', 0,    'Outsourced', '2024-01-01'),
  ('e023', 'Dozer Operator',        'Dozer Operator',    'Mining & Earthmoving',  'Outsourced', 0,    'Outsourced', '2024-01-01'),
  ('e024', 'Security 1',            'Security',          'Admin & Support',       'Outsourced', 0,    'Outsourced', '2024-01-01')
on conflict (id) do nothing;

-- Set reports_to separately (avoids ordering issues)
update employees set reports_to = 'e001' where id = 'e002';
update employees set reports_to = 'e002' where id in ('e003','e004','e005','e006','e009','e014','e018','e019','e020','e021','e022','e023','e024');
update employees set reports_to = 'e003' where id in ('e007','e008','e010','e011','e015','e016');
update employees set reports_to = 'e004' where id in ('e012','e013','e017');

-- ============================================================
-- PERMITS (3 standard regulatory permits)
-- ============================================================
insert into permits (name, authority, permit_number, issue_date, expiry_date, status) values
  ('MMSD Mining Block Permit',       'MMSD',  'MIN/2024/0847',   '2024-01-15', '2026-12-31', 'Active'),
  ('EMA Environmental Certificate',  'EMA',   'EMA/ZW/2024/1122','2024-03-01', '2026-09-15', 'Active'),
  ('ZINWA Water Rights',             'ZINWA', 'ZW/WR/2025/0033', '2025-01-10', '2026-07-01', 'Active')
on conflict do nothing;

-- ============================================================
-- CONSUMABLES (initial stock levels)
-- ============================================================
insert into consumables (name, unit, current_qty, reorder_threshold, last_replenished, notes) values
  ('Donaldson Filter P550169',     'each',  8,    4,    current_date, 'Primary scrubber filter — HP Lubes supplier'),
  ('Donaldson Filter P822686',     'each',  6,    3,    current_date, 'Secondary filter'),
  ('Hydraulic Oil 46 (200L drum)', 'drums', 4,    2,    current_date, 'D7 Dozer + Excavators'),
  ('Grease Cartridges 400g',       'each',  20,   10,   current_date, 'All rotating equipment'),
  ('Diesel (site tank)',           'L',     3500, 1000, current_date, 'Earthmoving + generator'),
  ('Wear Plates (scrubber)',       'each',  4,    2,    current_date, 'Scrubber drum liners'),
  ('V-Belts (assorted)',           'each',  12,   4,    current_date, 'Conveyor + pump drives'),
  ('Fuse Links 16A',               'each',  30,   10,   current_date, 'Electrical panel spares'),
  ('Bearing 6205-2RS',             'each',  8,    4,    current_date, 'Conveyor idlers'),
  ('Cable Ties (bag)',             'bag',   5,    2,    current_date, 'General maintenance')
on conflict do nothing;

-- ============================================================
-- PAYROLL — May 2026 (pre-loaded as per spec)
-- ============================================================
insert into payroll (employee_id, month, year, start_day, end_day, monthly_rate, gross_pay, nssa, paye, net_pay, status) values
  ('e002', 'May', 2026, 1, 31, 1200.00, 1240.00, 50.00,  100.00, 1090.00, 'Paid'),
  ('e003', 'May', 2026, 1, 31,  800.00,  826.67, 33.60,   60.00,  733.07, 'Paid'),
  ('e004', 'May', 2026, 1, 31,  800.00,  826.67, 33.60,   60.00,  733.07, 'Unpaid'),
  ('e005', 'May', 2026, 1, 31,  700.00,  723.33, 29.40,   45.00,  648.93, 'Paid'),
  ('e006', 'May', 2026, 1, 31,  900.00,  930.00, 37.80,   75.00,  817.20, 'Paid'),
  ('e007', 'May', 2026, 1, 31,  500.00,  516.67, 21.00,   20.00,  475.67, 'Paid'),
  ('e008', 'May', 2026, 1, 31,  500.00,  516.67, 21.00,   20.00,  475.67, 'Paid'),
  ('e009', 'May', 2026, 1, 31,  600.00,  620.00, 25.20,   30.00,  564.80, 'Unpaid'),
  ('e010', 'May', 2026, 1, 31,  380.00,  393.00, 15.96,    0.00,  377.04, 'Paid'),
  ('e011', 'May', 2026, 1, 31,  380.00,  393.00, 15.96,    0.00,  377.04, 'Paid'),
  ('e012', 'May', 2026, 1, 31,  380.00,  393.00, 15.96,    0.00,  377.04, 'Paid'),
  ('e013', 'May', 2026, 1, 31,  380.00,  393.00, 15.96,    0.00,  377.04, 'Unpaid'),
  ('e014', 'May', 2026, 1, 31,  550.00,  568.33, 23.10,   25.00,  520.23, 'Paid'),
  ('e015', 'May', 2026, 1, 31,  380.00,  393.00, 15.96,    0.00,  377.04, 'Paid'),
  ('e016', 'May', 2026, 1, 31,  380.00,  393.00, 15.96,    0.00,  377.04, 'Paid'),
  ('e017', 'May', 2026, 1, 31,  380.00,  393.00, 15.96,    0.00,  377.04, 'Unpaid')
on conflict (employee_id, month, year) do nothing;
