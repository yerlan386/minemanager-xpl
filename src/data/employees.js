export const DEPARTMENTS = [
  'Production Leadership',
  'HSE',
  'Geology',
  'Admin & Support',
  'Plant Operations',
  'Mining & Earthmoving',
  'Maintenance'
]

export const ROLES = [
  'Owner',
  'Mine Manager',
  'Camp Manager',
  'Shift Supervisor',
  'Metallurgist',
  'HSE Officer',
  'HR/Admin',
  'Plant Operator',
  'Artisan',
  'Driver',
  'Security',
  'Excavator Operator',
  'Dump Truck Driver',
  'Dozer Operator',
  'General Worker'
]

export const SYSTEM_ROLES = [
  'Owner',
  'Mine Manager',
  'Camp Manager',
  'Shift Supervisor',
  'Metallurgist',
  'HSE Officer',
  'HR/Admin'
]

export const EMPLOYEES = [
  // ── Owners ──────────────────────────────────────────────────────────────
  { id: 'e001', name: 'Yerlan',        role: 'Owner',        department: 'Production Leadership', employmentType: 'Monthly', status: 'Active', monthlyRate: 0,    reportsTo: null,   email: 'yerlan@celestium.zw' },
  { id: 'e025', name: 'Moyo',          role: 'Owner',        department: 'Production Leadership', employmentType: 'Monthly', status: 'Active', monthlyRate: 0,    reportsTo: null,   email: 'moyo@celestium.zw' },
  { id: 'e026', name: 'Taras',         role: 'Owner',        department: 'Production Leadership', employmentType: 'Monthly', status: 'Active', monthlyRate: 0,    reportsTo: null,   email: 'taras@celestium.zw' },
  // ── Management ───────────────────────────────────────────────────────────
  { id: 'e002', name: 'Piyo Chiradza', role: 'Mine Manager', department: 'Production Leadership', employmentType: 'Monthly', status: 'Active', monthlyRate: 1200, reportsTo: 'e001', email: 'piyo@celestium.zw' },
  { id: 'e003', name: 'Kenneth Matombo',role:'Camp Manager',  department: 'Production Leadership', employmentType: 'Monthly', status: 'Active', monthlyRate: 1000, reportsTo: 'e001', email: 'kenneth@celestium.zw' },
  { id: 'e004', name: 'Johnson',        role: 'Shift Supervisor', department: 'Production Leadership', employmentType: 'Monthly', status: 'Active', monthlyRate: 800, reportsTo: 'e002', email: 'johnson@celestium.zw' },
  { id: 'e005', name: 'Thomas Chikore', role: 'HSE Officer',  department: 'HSE',                   employmentType: 'Monthly', status: 'Active', monthlyRate: 700,  reportsTo: 'e002', email: 'thomas@celestium.zw' },
  { id: 'e006', name: 'Sergey',         role: 'Metallurgist', department: 'Plant Operations',      employmentType: 'Monthly', status: 'Active', monthlyRate: 900,  reportsTo: 'e002', email: 'sergey@celestium.zw' },
  { id: 'e027', name: 'Tirika Faresi',  role: 'Metallurgist', department: 'Plant Operations',      employmentType: 'Monthly', status: 'Active', monthlyRate: 900,  reportsTo: 'e002', email: 'tirika@celestium.zw' },
  // ── Operations ───────────────────────────────────────────────────────────
  { id: 'e007', name: 'Calvin',                  role: 'Plant Operator',   department: 'Plant Operations',     employmentType: 'Monthly',    status: 'Active',     monthlyRate: 500, reportsTo: 'e004' },
  { id: 'e008', name: 'Andrew Kavhala',           role: 'Plant Operator',   department: 'Plant Operations',     employmentType: 'Monthly',    status: 'Active',     monthlyRate: 500, reportsTo: 'e004' },
  { id: 'e009', name: 'Morgan Mutenda',           role: 'Artisan',          department: 'Maintenance',          employmentType: 'Monthly',    status: 'Active',     monthlyRate: 600, reportsTo: 'e002' },
  { id: 'e010', name: 'Blessing Mbizi',           role: 'General Worker',   department: 'Plant Operations',     employmentType: 'Monthly',    status: 'Active',     monthlyRate: 380, reportsTo: 'e004' },
  { id: 'e011', name: 'Dyesolodge Kutyauripo',    role: 'General Worker',   department: 'Plant Operations',     employmentType: 'Monthly',    status: 'Active',     monthlyRate: 380, reportsTo: 'e004' },
  { id: 'e012', name: 'Obert Chingondo',          role: 'General Worker',   department: 'Mining & Earthmoving', employmentType: 'Monthly',    status: 'Active',     monthlyRate: 380, reportsTo: 'e004' },
  { id: 'e013', name: 'Isiah Chidhana',           role: 'General Worker',   department: 'Mining & Earthmoving', employmentType: 'Monthly',    status: 'Active',     monthlyRate: 380, reportsTo: 'e004' },
  { id: 'e014', name: 'Cloudias Musoni',          role: 'HR/Admin',         department: 'Admin & Support',      employmentType: 'Monthly',    status: 'Active',     monthlyRate: 550, reportsTo: 'e002' },
  { id: 'e015', name: 'Ernest Nyakudya',          role: 'General Worker',   department: 'Plant Operations',     employmentType: 'Monthly',    status: 'Active',     monthlyRate: 380, reportsTo: 'e004' },
  { id: 'e016', name: 'Webbester Kupera',         role: 'General Worker',   department: 'Plant Operations',     employmentType: 'Monthly',    status: 'Active',     monthlyRate: 380, reportsTo: 'e004' },
  { id: 'e017', name: 'Bvunye Chiwayo',           role: 'General Worker',   department: 'Mining & Earthmoving', employmentType: 'Monthly',    status: 'Active',     monthlyRate: 380, reportsTo: 'e004' },
  // ── Outsourced ───────────────────────────────────────────────────────────
  { id: 'e018', name: 'Excavator Operator 1',  role: 'Excavator Operator', department: 'Mining & Earthmoving', employmentType: 'Outsourced', status: 'Outsourced', monthlyRate: 0, reportsTo: 'e002' },
  { id: 'e019', name: 'Excavator Operator 2',  role: 'Excavator Operator', department: 'Mining & Earthmoving', employmentType: 'Outsourced', status: 'Outsourced', monthlyRate: 0, reportsTo: 'e002' },
  { id: 'e020', name: 'Dump Truck Driver 1',   role: 'Dump Truck Driver',  department: 'Mining & Earthmoving', employmentType: 'Outsourced', status: 'Outsourced', monthlyRate: 0, reportsTo: 'e002' },
  { id: 'e021', name: 'Dump Truck Driver 2',   role: 'Dump Truck Driver',  department: 'Mining & Earthmoving', employmentType: 'Outsourced', status: 'Outsourced', monthlyRate: 0, reportsTo: 'e002' },
  { id: 'e022', name: 'Dump Truck Driver 3',   role: 'Dump Truck Driver',  department: 'Mining & Earthmoving', employmentType: 'Outsourced', status: 'Outsourced', monthlyRate: 0, reportsTo: 'e002' },
  { id: 'e023', name: 'Dozer Operator',        role: 'Dozer Operator',     department: 'Mining & Earthmoving', employmentType: 'Outsourced', status: 'Outsourced', monthlyRate: 0, reportsTo: 'e002' },
  { id: 'e024', name: 'Security 1',            role: 'Security',           department: 'Admin & Support',      employmentType: 'Outsourced', status: 'Outsourced', monthlyRate: 0, reportsTo: 'e002' }
]

export const DEMO_USERS = [
  { id: 'u001', name: 'Yerlan',        email: 'yerlan@celestium.zw',  password: 'demo1234', role: 'Owner',        employeeId: 'e001' },
  { id: 'u002', name: 'Moyo',          email: 'moyo@celestium.zw',    password: 'demo1234', role: 'Owner',        employeeId: 'e025' },
  { id: 'u003', name: 'Taras',         email: 'taras@celestium.zw',   password: 'demo1234', role: 'Owner',        employeeId: 'e026' },
  { id: 'u004', name: 'Piyo Chiradza', email: 'piyo@celestium.zw',    password: 'demo1234', role: 'Mine Manager', employeeId: 'e002' },
  { id: 'u005', name: 'Kenneth',       email: 'kenneth@celestium.zw', password: 'demo1234', role: 'Camp Manager', employeeId: 'e003' },
  { id: 'u006', name: 'Sergey',        email: 'sergey@celestium.zw',  password: 'demo1234', role: 'Metallurgist', employeeId: 'e006' }
]
