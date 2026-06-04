-- ============================================================
-- MineManager XPL — Complete Supabase Schema v1.1
-- Celestium Corporate Ltd | Dande, Zimbabwe
-- Run this entire file in Supabase SQL Editor (Dashboard → SQL Editor → New query)
-- ============================================================

-- ============================================================
-- EXTENSIONS
-- ============================================================
create extension if not exists "pgcrypto";
create extension if not exists "uuid-ossp";

-- ============================================================
-- CLEANUP (safe to re-run)
-- ============================================================
drop table if exists goldroom_custody   cascade;
drop table if exists goldroom_pours     cascade;
drop table if exists goldroom_cleanups  cascade;
drop table if exists si91_log           cascade;
drop table if exists visitor_log        cascade;
drop table if exists permits            cascade;
drop table if exists ppe_issuance       cascade;
drop table if exists first_aid_log      cascade;
drop table if exists toolbox_talks      cascade;
drop table if exists incidents          cascade;
drop table if exists spend_log          cascade;
drop table if exists purchase_requests  cascade;
drop table if exists hire_billing       cascade;
drop table if exists breakdowns         cascade;
drop table if exists fuel_log           cascade;
drop table if exists equipment_hours    cascade;
drop table if exists consumables        cascade;
drop table if exists fault_log          cascade;
drop table if exists disciplinary       cascade;
drop table if exists attendance         cascade;
drop table if exists leave_records      cascade;
drop table if exists payroll            cascade;
drop table if exists production_logs    cascade;
drop table if exists shift_handovers    cascade;
drop table if exists employees          cascade;
drop table if exists user_profiles      cascade;

-- ============================================================
-- USER PROFILES (links Supabase auth to role)
-- ============================================================
create table user_profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  name        text not null,
  role        text not null check (role in (
                'Owner','Mine Manager','Shift Supervisor',
                'Metallurgist','HSE Officer','HR/Admin')),
  employee_id text,
  created_at  timestamptz default now()
);

-- ============================================================
-- EMPLOYEES
-- ============================================================
create table employees (
  id              text primary key,
  name            text not null,
  role            text not null,
  department      text,
  reports_to      text,
  employment_type text default 'Monthly'
                    check (employment_type in ('Monthly','Hourly','Outsourced')),
  start_date      date,
  end_date        date,
  monthly_rate    numeric(10,2) default 0,
  status          text default 'Active'
                    check (status in ('Active','Inactive','Outsourced')),
  created_at      timestamptz default now()
);

-- ============================================================
-- SHIFT MODULE
-- ============================================================
create table shift_handovers (
  id                      uuid primary key default gen_random_uuid(),
  date                    date not null,
  shift                   text not null check (shift in ('Day','Night')),
  outgoing_supervisor_id  text references employees(id),
  incoming_supervisor_id  text references employees(id),
  ore_processed           numeric(10,2),
  gold_recovered_g        numeric(10,4),
  workers_on_site         integer,
  incidents_summary       text,
  equipment_status        text,
  outstanding_tasks       text,
  safety_notes            text,
  overall_status          text default 'Normal'
                            check (overall_status in ('Normal','Caution','Critical')),
  submitted               boolean default false,
  submitted_by            text,
  submitted_at            timestamptz,
  created_by              text,
  created_at              timestamptz default now()
);

create table production_logs (
  id                    uuid primary key default gen_random_uuid(),
  date                  date not null,
  shift                 text not null check (shift in ('Day','Night')),
  ore_processed         numeric(10,2),
  plant_runtime_hrs     numeric(5,2),
  sluice_yield_g        numeric(10,4),
  concentrator_yield_g  numeric(10,4),
  table_yield_g         numeric(10,4),
  total_gold_g          numeric(10,4)
                          generated always as
                          (coalesce(sluice_yield_g,0) +
                           coalesce(concentrator_yield_g,0) +
                           coalesce(table_yield_g,0)) stored,
  downtime_entries      jsonb default '[]',
  submitted             boolean default false,
  created_by            text,
  created_at            timestamptz default now()
);

-- ============================================================
-- HR MODULE
-- ============================================================
create table payroll (
  id              uuid primary key default gen_random_uuid(),
  employee_id     text references employees(id) on delete cascade,
  month           text not null,
  year            integer not null,
  start_day       integer default 1,
  end_day         integer default 30,
  monthly_rate    numeric(10,2),
  gross_pay       numeric(10,2),
  nssa            numeric(10,2) default 0,
  paye            numeric(10,2) default 0,
  other_payments  numeric(10,2) default 0,
  other_memo      text,
  net_pay         numeric(10,2),
  paid_amount     numeric(10,2),
  payment_date    date,
  payment_method  text check (payment_method in ('Cash','Transfer','Mobile Money')),
  paid_from       text,
  status          text default 'Unpaid'
                    check (status in ('Unpaid','Partial','Paid')),
  created_at      timestamptz default now(),
  unique(employee_id, month, year)
);

create table leave_records (
  id          uuid primary key default gen_random_uuid(),
  employee_id text references employees(id) on delete cascade,
  leave_type  text,
  start_date  date not null,
  end_date    date not null,
  days_taken  integer generated always as
                (end_date - start_date + 1) stored,
  notes       text,
  created_at  timestamptz default now()
);

create table attendance (
  id           uuid primary key default gen_random_uuid(),
  date         date not null,
  shift        text check (shift in ('Day','Night')),
  employee_id  text references employees(id) on delete cascade,
  status       text default 'Present'
                 check (status in ('Present','Absent','Late','Half Day')),
  hours_worked numeric(5,2),
  notes        text,
  created_at   timestamptz default now()
);

create table disciplinary (
  id           uuid primary key default gen_random_uuid(),
  employee_id  text references employees(id) on delete cascade,
  date         date not null,
  type         text check (type in ('Verbal Warning','Written Warning','Incident','Commendation','Other')),
  description  text,
  manager_name text,
  manager_date date,
  created_at   timestamptz default now()
);

-- ============================================================
-- OPERATIONS MODULE
-- ============================================================
create table fault_log (
  id           uuid primary key default gen_random_uuid(),
  date         date,
  equipment_id text,
  description  text,
  severity     text default 'Medium' check (severity in ('Low','Medium','High')),
  photo_url    text,
  assigned_to  text,
  status       text default 'Open'
                 check (status in ('Open','In Progress','Closed')),
  notes        text,
  created_by   text,
  created_at   timestamptz default now()
);

create table consumables (
  id                 uuid primary key default gen_random_uuid(),
  name               text not null,
  unit               text default 'each',
  current_qty        numeric(10,2),
  reorder_threshold  numeric(10,2),
  last_replenished   date,
  notes              text,
  created_at         timestamptz default now()
);

create table equipment_hours (
  id           uuid primary key default gen_random_uuid(),
  equipment_id text not null,
  date         date not null,
  hours_run    numeric(5,2),
  operator     text,
  created_at   timestamptz default now()
);

create table fuel_log (
  id           uuid primary key default gen_random_uuid(),
  equipment_id text not null,
  date         date not null,
  litres       numeric(10,2),
  cost         numeric(10,2),
  notes        text,
  created_at   timestamptz default now()
);

create table breakdowns (
  id           uuid primary key default gen_random_uuid(),
  equipment_id text not null,
  date         date not null,
  description  text,
  downtime_hrs numeric(5,2),
  resolution   text,
  created_at   timestamptz default now()
);

create table hire_billing (
  id           uuid primary key default gen_random_uuid(),
  equipment_id text not null,
  date         date not null,
  hours        numeric(5,2),
  rate         numeric(10,2),
  amount       numeric(10,2) generated always as (hours * rate) stored,
  notes        text,
  created_at   timestamptz default now()
);

create table purchase_requests (
  id            uuid primary key default gen_random_uuid(),
  item          text not null,
  qty           numeric(10,2),
  unit          text,
  urgency       text default 'Routine'
                  check (urgency in ('Routine','Urgent','Critical')),
  requested_by  text,
  date_needed   date,
  supplier_id   text,
  status        text default 'Draft'
                  check (status in ('Draft','Approved','Ordered','In Transit','Received','Invoiced')),
  po_number     text unique,
  notes         text,
  created_by    text,
  created_at    timestamptz default now()
);

create table spend_log (
  id        uuid primary key default gen_random_uuid(),
  category  text check (category in ('Fuel','Spares','Consumables','Services','Labour')),
  amount    numeric(10,2) not null,
  date      date not null,
  po_ref    text,
  notes     text,
  created_by text,
  created_at timestamptz default now()
);

-- ============================================================
-- COMPLIANCE MODULE
-- ============================================================
create table incidents (
  id                uuid primary key default gen_random_uuid(),
  date              date not null,
  time              time,
  type              text check (type in ('Incident','Near-Miss','Property Damage','Environmental')),
  severity          text default 'Low'
                      check (severity in ('Low','Medium','High','Critical')),
  location          text,
  description       text,
  persons_involved  text,
  witnesses         text,
  immediate_action  text,
  corrective_action text,
  follow_up_date    date,
  status            text default 'Open' check (status in ('Open','Closed')),
  created_by        text,
  created_at        timestamptz default now()
);

create table toolbox_talks (
  id         uuid primary key default gen_random_uuid(),
  date       date not null,
  shift      text check (shift in ('Day','Night')),
  topic      text not null,
  attendees  jsonb default '[]',
  supervisor text,
  notes      text,
  created_by text,
  created_at timestamptz default now()
);

create table first_aid_log (
  id                    uuid primary key default gen_random_uuid(),
  date                  date not null,
  employee_id           text references employees(id),
  nature                text,
  treated_by            text,
  referred_to_hospital  text default 'No' check (referred_to_hospital in ('Yes','No')),
  created_by            text,
  created_at            timestamptz default now()
);

create table ppe_issuance (
  id          uuid primary key default gen_random_uuid(),
  employee_id text references employees(id),
  ppe_item    text,
  date_issued date,
  size_spec   text,
  condition   text default 'New' check (condition in ('New','Used')),
  issued_by   text,
  created_at  timestamptz default now()
);

create table permits (
  id             uuid primary key default gen_random_uuid(),
  name           text not null,
  authority      text,
  permit_number  text,
  issue_date     date,
  expiry_date    date,
  status         text default 'Active'
                   check (status in ('Active','Expired','Pending Renewal','Suspended')),
  notes          text,
  created_at     timestamptz default now()
);

create table visitor_log (
  id           uuid primary key default gen_random_uuid(),
  name         text not null,
  organization text,
  purpose      text,
  date_in      date not null,
  time_in      time,
  time_out     time,
  escorted_by  text,
  created_at   timestamptz default now()
);

create table si91_log (
  id               text primary key,   -- format: si91_YYYY-MM-DD
  date             date not null unique,
  confirmed_by     text,
  confirmed_by_id  text,
  role             text,
  shift            text,
  timestamp        timestamptz,
  created_at       timestamptz default now()
);

-- ============================================================
-- GOLD ROOM (Restricted — immutable after insert)
-- ============================================================
create table goldroom_cleanups (
  id                     uuid primary key default gen_random_uuid(),
  date                   date not null,
  shift                  text check (shift in ('Day','Night')),
  sluice_cleaned_by      text not null,
  witness_1              text not null,
  witness_2              text not null,
  concentrate_weight_kg  numeric(10,4) not null,
  notes                  text,
  submitted_by           text not null,
  submitted_at           timestamptz default now(),
  locked                 boolean default true
);

create table goldroom_pours (
  id                   uuid primary key default gen_random_uuid(),
  date                 date not null,
  gross_weight_g       numeric(10,4) not null,
  fine_gold_estimate_g numeric(10,4) not null,
  pour_date            date not null,
  supervisor_present   text not null,
  witness_present      text not null,
  notes                text,
  submitted_by         text not null,
  submitted_at         timestamptz default now(),
  locked               boolean default true
);

create table goldroom_custody (
  id               uuid primary key default gen_random_uuid(),
  date             date not null,
  transfer_type    text not null
                     check (transfer_type in ('To Fidelity Printers','To Buyer','Internal Transfer')),
  weight_g         numeric(10,4) not null,
  recipient_name   text not null,
  receipt_reference text not null,
  handed_over_by   text not null,
  received_by      text not null,
  submitted_by     text not null,
  submitted_at     timestamptz default now(),
  locked           boolean default true
);

-- ============================================================
-- PREVENT EDITS ON GOLD ROOM RECORDS
-- ============================================================
create or replace function prevent_goldroom_update()
returns trigger language plpgsql as $$
begin
  raise exception 'Gold Room records are immutable after submission';
end;
$$;

create trigger no_update_cleanups
  before update on goldroom_cleanups for each row execute function prevent_goldroom_update();
create trigger no_update_pours
  before update on goldroom_pours for each row execute function prevent_goldroom_update();
create trigger no_update_custody
  before update on goldroom_custody for each row execute function prevent_goldroom_update();

-- ============================================================
-- AUTO-GENERATE PO NUMBERS
-- ============================================================
create sequence if not exists po_number_seq start 1001;

create or replace function assign_po_number()
returns trigger language plpgsql as $$
begin
  if new.po_number is null then
    new.po_number := 'PO-' || lpad(nextval('po_number_seq')::text, 6, '0');
  end if;
  return new;
end;
$$;

create trigger trg_po_number
  before insert on purchase_requests
  for each row execute function assign_po_number();

-- ============================================================
-- INDEXES
-- ============================================================
create index idx_handovers_date      on shift_handovers(date desc);
create index idx_handovers_submitted on shift_handovers(submitted, date desc);
create index idx_production_date     on production_logs(date desc);
create index idx_incidents_status    on incidents(status, date desc);
create index idx_incidents_date      on incidents(date desc);
create index idx_si91_date           on si91_log(date desc);
create index idx_payroll_emp_month   on payroll(employee_id, year desc, month);
create index idx_attendance_date     on attendance(date desc, employee_id);
create index idx_fault_status        on fault_log(status, date desc);
create index idx_hire_billing_date   on hire_billing(date desc, equipment_id);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================
alter table user_profiles     enable row level security;
alter table employees         enable row level security;
alter table shift_handovers   enable row level security;
alter table production_logs   enable row level security;
alter table payroll           enable row level security;
alter table leave_records     enable row level security;
alter table attendance        enable row level security;
alter table disciplinary      enable row level security;
alter table fault_log         enable row level security;
alter table consumables       enable row level security;
alter table equipment_hours   enable row level security;
alter table fuel_log          enable row level security;
alter table breakdowns        enable row level security;
alter table hire_billing      enable row level security;
alter table purchase_requests enable row level security;
alter table spend_log         enable row level security;
alter table incidents         enable row level security;
alter table toolbox_talks     enable row level security;
alter table first_aid_log     enable row level security;
alter table ppe_issuance      enable row level security;
alter table permits           enable row level security;
alter table visitor_log       enable row level security;
alter table si91_log          enable row level security;
alter table goldroom_cleanups enable row level security;
alter table goldroom_pours    enable row level security;
alter table goldroom_custody  enable row level security;

-- Helper: get current user's role
create or replace function get_my_role()
returns text language sql security definer stable as $$
  select role from user_profiles where id = auth.uid()
$$;

-- ── Standard tables: all authenticated users can read ──────────────────────
create policy "auth_read"  on employees         for select using (auth.role() = 'authenticated');
create policy "auth_write" on employees         for all    using (auth.role() = 'authenticated');

create policy "auth_read"  on shift_handovers   for select using (auth.role() = 'authenticated');
create policy "auth_write" on shift_handovers   for all    using (auth.role() = 'authenticated');

create policy "auth_read"  on production_logs   for select using (auth.role() = 'authenticated');
create policy "auth_write" on production_logs   for all    using (auth.role() = 'authenticated');

create policy "auth_read"  on si91_log          for select using (auth.role() = 'authenticated');
create policy "auth_write" on si91_log          for all    using (auth.role() = 'authenticated');

create policy "auth_read"  on incidents         for select using (auth.role() = 'authenticated');
create policy "auth_write" on incidents         for all    using (auth.role() = 'authenticated');

create policy "auth_read"  on toolbox_talks     for select using (auth.role() = 'authenticated');
create policy "auth_write" on toolbox_talks     for all    using (auth.role() = 'authenticated');

create policy "auth_read"  on first_aid_log     for select using (auth.role() = 'authenticated');
create policy "auth_write" on first_aid_log     for all    using (auth.role() = 'authenticated');

create policy "auth_read"  on ppe_issuance      for select using (auth.role() = 'authenticated');
create policy "auth_write" on ppe_issuance      for all    using (auth.role() = 'authenticated');

create policy "auth_read"  on permits           for select using (auth.role() = 'authenticated');
create policy "auth_write" on permits           for all    using (auth.role() = 'authenticated');

create policy "auth_read"  on visitor_log       for select using (auth.role() = 'authenticated');
create policy "auth_write" on visitor_log       for all    using (auth.role() = 'authenticated');

create policy "auth_read"  on fault_log         for select using (auth.role() = 'authenticated');
create policy "auth_write" on fault_log         for all    using (auth.role() = 'authenticated');

create policy "auth_read"  on consumables       for select using (auth.role() = 'authenticated');
create policy "auth_write" on consumables       for all    using (auth.role() = 'authenticated');

create policy "auth_read"  on equipment_hours   for select using (auth.role() = 'authenticated');
create policy "auth_write" on equipment_hours   for all    using (auth.role() = 'authenticated');

create policy "auth_read"  on fuel_log          for select using (auth.role() = 'authenticated');
create policy "auth_write" on fuel_log          for all    using (auth.role() = 'authenticated');

create policy "auth_read"  on breakdowns        for select using (auth.role() = 'authenticated');
create policy "auth_write" on breakdowns        for all    using (auth.role() = 'authenticated');

create policy "auth_read"  on hire_billing      for select using (auth.role() = 'authenticated');
create policy "auth_write" on hire_billing      for all    using (auth.role() = 'authenticated');

create policy "auth_read"  on purchase_requests for select using (auth.role() = 'authenticated');
create policy "auth_write" on purchase_requests for all    using (auth.role() = 'authenticated');

create policy "auth_read"  on spend_log         for select using (auth.role() = 'authenticated');
create policy "auth_write" on spend_log         for all    using (auth.role() = 'authenticated');

-- ── Payroll + HR: Owner, Mine Manager, HR/Admin only ──────────────────────
create policy "hr_read"  on payroll      for select using (get_my_role() in ('Owner','Mine Manager','HR/Admin'));
create policy "hr_write" on payroll      for all    using (get_my_role() in ('Owner','Mine Manager','HR/Admin'));
create policy "hr_read"  on leave_records for select using (get_my_role() in ('Owner','Mine Manager','HR/Admin'));
create policy "hr_write" on leave_records for all    using (get_my_role() in ('Owner','Mine Manager','HR/Admin'));
create policy "hr_read"  on disciplinary for select using (get_my_role() in ('Owner','Mine Manager','HR/Admin'));
create policy "hr_write" on disciplinary for all    using (get_my_role() in ('Owner','Mine Manager','HR/Admin'));

-- Attendance: all roles can write their own, managers see all
create policy "attendance_read_all"  on attendance for select using (auth.role() = 'authenticated');
create policy "attendance_write_own" on attendance for insert with check (auth.role() = 'authenticated');
create policy "attendance_update_mgr" on attendance for update using (get_my_role() in ('Owner','Mine Manager','HR/Admin','Shift Supervisor'));

-- User profiles: users can only see/edit their own
create policy "own_profile" on user_profiles for all using (id = auth.uid());

-- ── Gold Room: Owner, Mine Manager, Metallurgist ONLY ──────────────────────
create policy "goldroom_read"   on goldroom_cleanups for select using (get_my_role() in ('Owner','Mine Manager','Metallurgist'));
create policy "goldroom_insert" on goldroom_cleanups for insert with check (get_my_role() in ('Owner','Mine Manager','Metallurgist'));
-- No UPDATE policy = updates blocked at DB level (trigger also prevents it)

create policy "goldroom_read"   on goldroom_pours    for select using (get_my_role() in ('Owner','Mine Manager','Metallurgist'));
create policy "goldroom_insert" on goldroom_pours    for insert with check (get_my_role() in ('Owner','Mine Manager','Metallurgist'));

create policy "goldroom_read"   on goldroom_custody  for select using (get_my_role() in ('Owner','Mine Manager','Metallurgist'));
create policy "goldroom_insert" on goldroom_custody  for insert with check (get_my_role() in ('Owner','Mine Manager','Metallurgist'));
