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

export const EMPLOYEES = [
  { id: 'e001', name: 'Earl',                    role: 'Owner',             department: 'Production Leadership', employmentType: 'Monthly', status: 'Active',     monthlyRate: 0,   reportsTo: null },
  { id: 'e002', name: 'Piyo Chiradza',           role: 'Mine Manager',      department: 'Production Leadership', employmentType: 'Monthly', status: 'Active',     monthlyRate: 1200, reportsTo: 'e001' },
  { id: 'e003', name: 'Kenneth Matombo',         role: 'Shift Supervisor',  department: 'Production Leadership', employmentType: 'Monthly', status: 'Active',     monthlyRate: 800,  reportsTo: 'e002' },
  { id: 'e004', name: 'Johnson',                 role: 'Shift Supervisor',  department: 'Production Leadership', employmentType: 'Monthly', status: 'Active',     monthlyRate: 800,  reportsTo: 'e002' },
  { id: 'e005', name: 'Thomas Chikore',          role: 'HSE Officer',       department: 'HSE',                   employmentType: 'Monthly', status: 'Active',     monthlyRate: 700,  reportsTo: 'e002' },
  { id: 'e006', name: 'Tirika Faresi',           role: 'Metallurgist',      department: 'Plant Operations',      employmentType: 'Monthly', status: 'Active',     monthlyRate: 900,  reportsTo: 'e002' },
  { id: 'e007', name: 'Calvin',                  role: 'Plant Operator',    department: 'Plant Operations',      employmentType: 'Monthly', status: 'Active',     monthlyRate: 500,  reportsTo: 'e003' },
  { id: 'e008', name: 'Andrew Kavhala',          role: 'Plant Operator',    department: 'Plant Operations',      employmentType: 'Monthly', status: 'Active',     monthlyRate: 500,  reportsTo: 'e003' },
  { id: 'e009', name: 'Morgan Mutenda',          role: 'Artisan',           department: 'Maintenance',           employmentType: 'Monthly', status: 'Active',     monthlyRate: 600,  reportsTo: 'e002' },
  { id: 'e010', name: 'Blessing Mbizi',          role: 'General Worker',    department: 'Plant Operations',      employmentType: 'Monthly', status: 'Active',     monthlyRate: 380,  reportsTo: 'e003' },
  { id: 'e011', name: 'Dyesolodge Kutyauripo',   role: 'General Worker',    department: 'Plant Operations',      employmentType: 'Monthly', status: 'Active',     monthlyRate: 380,  reportsTo: 'e003' },
  { id: 'e012', name: 'Obert Chingondo',         role: 'General Worker',    department: 'Mining & Earthmoving',  employmentType: 'Monthly', status: 'Active',     monthlyRate: 380,  reportsTo: 'e003' },
  { id: 'e013', name: 'Isiah Chidhana',          role: 'General Worker',    department: 'Mining & Earthmoving',  employmentType: 'Monthly', status: 'Active',     monthlyRate: 380,  reportsTo: 'e003' },
  { id: 'e014', name: 'Cloudias Musoni',         role: 'HR/Admin',          department: 'Admin & Support',       employmentType: 'Monthly', status: 'Active',     monthlyRate: 550,  reportsTo: 'e002' },
  { id: 'e015', name: 'Ernest Nyakudya',         role: 'General Worker',    department: 'Plant Operations',      employmentType: 'Monthly', status: 'Active',     monthlyRate: 380,  reportsTo: 'e003' },
  { id: 'e016', name: 'Webbester Kupera',        role: 'General Worker',    department: 'Plant Operations',      employmentType: 'Monthly', status: 'Active',     monthlyRate: 380,  reportsTo: 'e003' },
  { id: 'e017', name: 'Bvunye Chiwayo',          role: 'General Worker',    department: 'Mining & Earthmoving',  employmentType: 'Monthly', status: 'Active',     monthlyRate: 380,  reportsTo: 'e003' },
  { id: 'e018', name: 'Excavator Operator 1',   role: 'Excavator Operator', department: 'Mining & Earthmoving', employmentType: 'Outsourced', status: 'Outsourced', monthlyRate: 0, reportsTo: 'e002' },
  { id: 'e019', name: 'Excavator Operator 2',   role: 'Excavator Operator', department: 'Mining & Earthmoving', employmentType: 'Outsourced', status: 'Outsourced', monthlyRate: 0, reportsTo: 'e002' },
  { id: 'e020', name: 'Dump Truck Driver 1',    role: 'Dump Truck Driver',  department: 'Mining & Earthmoving', employmentType: 'Outsourced', status: 'Outsourced', monthlyRate: 0, reportsTo: 'e002' },
  { id: 'e021', name: 'Dump Truck Driver 2',    role: 'Dump Truck Driver',  department: 'Mining & Earthmoving', employmentType: 'Outsourced', status: 'Outsourced', monthlyRate: 0, reportsTo: 'e002' },
  { id: 'e022', name: 'Dump Truck Driver 3',    role: 'Dump Truck Driver',  department: 'Mining & Earthmoving', employmentType: 'Outsourced', status: 'Outsourced', monthlyRate: 0, reportsTo: 'e002' },
  { id: 'e023', name: 'Dozer Operator',         role: 'Dozer Operator',     department: 'Mining & Earthmoving', employmentType: 'Outsourced', status: 'Outsourced', monthlyRate: 0, reportsTo: 'e002' },
  { id: 'e024', name: 'Security 1',             role: 'Security',           department: 'Admin & Support',      employmentType: 'Outsourced', status: 'Outsourced', monthlyRate: 0, reportsTo: 'e002' }
]

export const DEMO_USERS = [
  { id: 'u001', name: 'Earl',           email: 'earl@celestium.zw',    password: 'demo1234', role: 'Owner',            employeeId: 'e001' },
  { id: 'u002', name: 'Piyo Chiradza', email: 'piyo@celestium.zw',    password: 'demo1234', role: 'Mine Manager',     employeeId: 'e002' },
  { id: 'u003', name: 'Kenneth',       email: 'kenneth@celestium.zw', password: 'demo1234', role: 'Shift Supervisor', employeeId: 'e003' },
  { id: 'u004', name: 'Thomas',        email: 'thomas@celestium.zw',  password: 'demo1234', role: 'HSE Officer',      employeeId: 'e005' },
  { id: 'u005', name: 'Tirika',        email: 'tirika@celestium.zw',  password: 'demo1234', role: 'Metallurgist',     employeeId: 'e006' },
  { id: 'u006', name: 'Cloudias',      email: 'cloudias@celestium.zw',password: 'demo1234', role: 'HR/Admin',         employeeId: 'e014' }
]
