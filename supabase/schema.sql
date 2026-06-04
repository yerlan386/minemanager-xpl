-- MineManager XPL — Supabase Schema
-- Run this in the Supabase SQL editor after creating your project

-- Enable Row Level Security on all tables
-- Create tables first, then add RLS policies

-- ============================================================
-- AUTH & USERS
-- ============================================================
create table if not exists user_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null,
  role text not null check (role in ('Owner','Mine Manager','Shift Supervisor','Metallurgist','HSE Officer','HR/Admin')),
  employee_id text,
  created_at timestamptz default now()
);

-- ============================================================
-- EMPLOYEES
-- ============================================================
create table if not exists employees (
  id text primary key,
  name text not null,
  role text not null,
  department text,
  reports_to text,
  employment_type text default 'Monthly',
  start_date date,
  end_date date,
  monthly_rate numeric(10,2) default 0,
  status text default 'Active',
  created_at timestamptz default now()
);

-- ============================================================
-- SHIFT MODULE
-- ============================================================
create table if not exists shift_handovers (
  id uuid primary key default gen_random_uuid(),
  date date not null,
  shift text not null,
  outgoing_supervisor_id text,
  incoming_supervisor_id text,
  ore_processed numeric(10,2),
  gold_recovered_g numeric(10,4),
  workers_on_site integer,
  incidents_summary text,
  equipment_status text,
  outstanding_tasks text,
  safety_notes text,
  overall_status text default 'Normal',
  submitted boolean default false,
  submitted_by text,
  submitted_at timestamptz,
  created_by text,
  created_at timestamptz default now()
);

create table if not exists production_logs (
  id uuid primary key default gen_random_uuid(),
  date date not null,
  shift text not null,
  plant_runtime_hrs numeric(5,2),
  sluice_yield_g numeric(10,4),
  concentrator_yield_g numeric(10,4),
  table_yield_g numeric(10,4),
  total_gold_g numeric(10,4),
  downtime_entries jsonb default '[]',
  ore_processed numeric(10,2),
  submitted boolean default false,
  created_by text,
  created_at timestamptz default now()
);

-- ============================================================
-- HR MODULE
-- ============================================================
create table if not exists payroll (
  id uuid primary key default gen_random_uuid(),
  employee_id text references employees(id),
  month text,
  year integer,
  start_day integer,
  end_day integer,
  monthly_rate numeric(10,2),
  gross_pay numeric(10,2),
  nssa numeric(10,2) default 0,
  paye numeric(10,2) default 0,
  other_payments numeric(10,2) default 0,
  other_memo text,
  net_pay numeric(10,2),
  paid_amount numeric(10,2),
  payment_date date,
  payment_method text,
  paid_from text,
  status text default 'Unpaid',
  created_at timestamptz default now()
);

create table if not exists leave_records (
  id uuid primary key default gen_random_uuid(),
  employee_id text references employees(id),
  leave_type text,
  start_date date,
  end_date date,
  days_taken integer,
  notes text,
  created_at timestamptz default now()
);

create table if not exists attendance (
  id uuid primary key default gen_random_uuid(),
  date date not null,
  shift text,
  employee_id text references employees(id),
  status text default 'Present',
  hours_worked numeric(5,2),
  notes text,
  created_at timestamptz default now()
);

create table if not exists disciplinary (
  id uuid primary key default gen_random_uuid(),
  employee_id text references employees(id),
  date date not null,
  type text,
  description text,
  manager_name text,
  manager_date date,
  created_at timestamptz default now()
);

-- ============================================================
-- OPERATIONS MODULE
-- ============================================================
create table if not exists fault_log (
  id uuid primary key default gen_random_uuid(),
  date date,
  equipment_id text,
  description text,
  severity text default 'Medium',
  photo_url text,
  assigned_to text,
  status text default 'Open',
  notes text,
  created_at timestamptz default now()
);

create table if not exists consumables (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  unit text default 'each',
  current_qty numeric(10,2),
  reorder_threshold numeric(10,2),
  last_replenished date,
  created_at timestamptz default now()
);

create table if not exists equipment_hours (
  id uuid primary key default gen_random_uuid(),
  equipment_id text,
  date date,
  hours_run numeric(5,2),
  operator text,
  created_at timestamptz default now()
);

create table if not exists fuel_log (
  id uuid primary key default gen_random_uuid(),
  equipment_id text,
  date date,
  litres numeric(10,2),
  cost numeric(10,2),
  created_at timestamptz default now()
);

create table if not exists breakdowns (
  id uuid primary key default gen_random_uuid(),
  equipment_id text,
  date date,
  description text,
  downtime_hrs numeric(5,2),
  resolution text,
  created_at timestamptz default now()
);

create table if not exists hire_billing (
  id uuid primary key default gen_random_uuid(),
  equipment_id text,
  date date,
  hours numeric(5,2),
  rate numeric(10,2),
  notes text,
  created_at timestamptz default now()
);

create table if not exists purchase_requests (
  id uuid primary key default gen_random_uuid(),
  item text not null,
  qty numeric(10,2),
  unit text,
  urgency text default 'Routine',
  requested_by text,
  date_needed date,
  supplier_id text,
  status text default 'Draft',
  po_number text,
  notes text,
  created_at timestamptz default now()
);

create table if not exists spend_log (
  id uuid primary key default gen_random_uuid(),
  category text,
  amount numeric(10,2),
  date date,
  po_ref text,
  notes text,
  created_at timestamptz default now()
);

-- ============================================================
-- COMPLIANCE MODULE
-- ============================================================
create table if not exists incidents (
  id uuid primary key default gen_random_uuid(),
  date date not null,
  time time,
  type text,
  severity text default 'Low',
  location text,
  description text,
  persons_involved text,
  witnesses text,
  immediate_action text,
  corrective_action text,
  follow_up_date date,
  status text default 'Open',
  created_by text,
  created_at timestamptz default now()
);

create table if not exists toolbox_talks (
  id uuid primary key default gen_random_uuid(),
  date date not null,
  shift text,
  topic text not null,
  attendees jsonb default '[]',
  supervisor text,
  notes text,
  created_at timestamptz default now()
);

create table if not exists first_aid_log (
  id uuid primary key default gen_random_uuid(),
  date date not null,
  employee_id text,
  nature text,
  treated_by text,
  referred_to_hospital text default 'No',
  created_at timestamptz default now()
);

create table if not exists ppe_issuance (
  id uuid primary key default gen_random_uuid(),
  employee_id text,
  ppe_item text,
  date_issued date,
  size_spec text,
  condition text default 'New',
  issued_by text,
  created_at timestamptz default now()
);

create table if not exists permits (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  authority text,
  permit_number text,
  issue_date date,
  expiry_date date,
  status text default 'Active',
  notes text,
  created_at timestamptz default now()
);

create table if not exists visitor_log (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  organization text,
  purpose text,
  date_in date,
  time_in time,
  time_out time,
  escorted_by text,
  created_at timestamptz default now()
);

create table if not exists si91_log (
  id text primary key,  -- format: si91_YYYY-MM-DD
  date date not null,
  confirmed_by text,
  confirmed_by_id text,
  role text,
  shift text,
  timestamp timestamptz,
  created_at timestamptz default now()
);

-- ============================================================
-- GOLD ROOM (Restricted)
-- ============================================================
create table if not exists goldroom_cleanups (
  id uuid primary key default gen_random_uuid(),
  date date not null,
  shift text,
  sluice_cleaned_by text not null,
  witness_1 text not null,
  witness_2 text not null,
  concentrate_weight_kg numeric(10,4),
  notes text,
  submitted_by text,
  submitted_at timestamptz,
  locked boolean default true,
  created_at timestamptz default now()
);

create table if not exists goldroom_pours (
  id uuid primary key default gen_random_uuid(),
  date date not null,
  gross_weight_g numeric(10,4),
  fine_gold_estimate_g numeric(10,4),
  pour_date date,
  supervisor_present text not null,
  witness_present text not null,
  notes text,
  submitted_by text,
  submitted_at timestamptz,
  locked boolean default true,
  created_at timestamptz default now()
);

create table if not exists goldroom_custody (
  id uuid primary key default gen_random_uuid(),
  date date not null,
  transfer_type text not null,
  weight_g numeric(10,4),
  recipient_name text not null,
  receipt_reference text not null,
  handed_over_by text not null,
  received_by text not null,
  submitted_by text,
  submitted_at timestamptz,
  locked boolean default true,
  created_at timestamptz default now()
);

-- ============================================================
-- INDEXES
-- ============================================================
create index if not exists idx_handovers_date on shift_handovers(date desc);
create index if not exists idx_production_date on production_logs(date desc);
create index if not exists idx_incidents_date on incidents(date desc);
create index if not exists idx_si91_date on si91_log(date desc);
create index if not exists idx_payroll_emp on payroll(employee_id, month, year);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================
-- Enable RLS on all tables
alter table shift_handovers   enable row level security;
alter table production_logs   enable row level security;
alter table employees         enable row level security;
alter table payroll           enable row level security;
alter table incidents         enable row level security;
alter table si91_log          enable row level security;
alter table goldroom_cleanups enable row level security;
alter table goldroom_pours    enable row level security;
alter table goldroom_custody  enable row level security;

-- Basic policy: authenticated users can read/write (refine per role in production)
create policy "Authenticated read" on shift_handovers for select using (auth.role() = 'authenticated');
create policy "Authenticated write" on shift_handovers for insert with check (auth.role() = 'authenticated');
create policy "Authenticated update" on shift_handovers for update using (auth.role() = 'authenticated');

-- Repeat for other tables as needed (abbreviated here — apply same pattern)
create policy "Authenticated read" on production_logs for select using (auth.role() = 'authenticated');
create policy "Authenticated write" on production_logs for insert with check (auth.role() = 'authenticated');

create policy "Authenticated read" on si91_log for select using (auth.role() = 'authenticated');
create policy "Authenticated write" on si91_log for insert with check (auth.role() = 'authenticated');
create policy "Authenticated update" on si91_log for update using (auth.role() = 'authenticated');

-- Gold Room — only allow Owner, Mine Manager, Metallurgist (enforce via app + RLS)
create policy "Gold room read" on goldroom_cleanups for select using (
  exists (select 1 from user_profiles where id = auth.uid() and role in ('Owner','Mine Manager','Metallurgist'))
);
create policy "Gold room insert" on goldroom_cleanups for insert with check (
  exists (select 1 from user_profiles where id = auth.uid() and role in ('Owner','Mine Manager','Metallurgist'))
);
