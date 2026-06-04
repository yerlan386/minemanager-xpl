export const SHIFT_TYPES = ['Day', 'Night']

export const DOWNTIME_REASONS = [
  'Mechanical',
  'Electrical',
  'Feed Blockage',
  'Weather',
  'Scheduled Maintenance',
  'Other'
]

export const INCIDENT_TYPES = ['Incident', 'Near-Miss', 'Property Damage', 'Environmental']
export const SEVERITY_LEVELS = ['Low', 'Medium', 'High', 'Critical']
export const INCIDENT_STATUSES = ['Open', 'Closed']

export const PPE_ITEMS = [
  'Hard Hat', 'Safety Boots', 'High-Vis Vest', 'Gloves', 'Safety Glasses',
  'Dust Mask', 'Ear Protection', 'Face Shield', 'Harness', 'Overalls'
]

export const PERMIT_TYPES = [
  { name: 'MMSD Mining Block Permit', authority: 'MMSD' },
  { name: 'EMA Environmental Certificate', authority: 'EMA' },
  { name: 'ZINWA Water Rights', authority: 'ZINWA' }
]

export const PROCUREMENT_URGENCY = ['Routine', 'Urgent', 'Critical']

export const PO_STATUSES = ['Draft', 'Approved', 'Ordered', 'In Transit', 'Received', 'Invoiced']

export const SPEND_CATEGORIES = ['Fuel', 'Spares', 'Consumables', 'Services', 'Labour']

export const FAULT_SEVERITY = ['Low', 'Medium', 'High']
export const FAULT_STATUSES = ['Open', 'In Progress', 'Closed']

export const PAYMENT_METHODS = ['Cash', 'Transfer', 'Mobile Money']
export const PAYROLL_STATUSES = ['Unpaid', 'Partial', 'Paid']

export const LEAVE_TYPES = ['Annual Leave', 'Sick Leave', 'Compassionate Leave', 'Unpaid Leave']

export const ATTENDANCE_STATUSES = ['Present', 'Absent', 'Late', 'Half Day']

export const DISCIPLINARY_TYPES = [
  'Verbal Warning', 'Written Warning', 'Incident', 'Commendation', 'Other'
]

export const EMPLOYMENT_TYPES = ['Monthly', 'Hourly', 'Outsourced']
export const EMPLOYEE_STATUSES = ['Active', 'Inactive', 'Outsourced']

export const CREW_COLORS = {
  'Crew A':      { bg: 'bg-blue-100',   text: 'text-blue-800',   label: 'A' },
  'Crew B':      { bg: 'bg-green-100',  text: 'text-green-800',  label: 'B' },
  'Crew C':      { bg: 'bg-purple-100', text: 'text-purple-800', label: 'C' },
  'Relief':      { bg: 'bg-orange-100', text: 'text-orange-800', label: 'R' },
  'Maintenance': { bg: 'bg-gray-100',   text: 'text-gray-600',   label: 'M' },
  'OFF':         { bg: 'bg-white',      text: 'text-gray-400',   label: '—' }
}

export const EQUIPMENT_TYPES = ['Plant', 'Vehicle', 'Earthmoving']
export const OWNERSHIP_TYPES = ['Owned', 'Hired']

export const SUPPLIERS = [
  { id: 's001', name: 'HP Lubes',             category: 'Spares/Consumables', contact: '', phone: '', leadTime: '3 days',  notes: 'Donaldson filters supplier' },
  { id: 's002', name: 'Mandebvu Contracting', category: 'Plant Hire',          contact: '', phone: '', leadTime: 'On call', notes: 'D7 Dozer @ $65/hr' }
]

export const EQUIPMENT_REGISTER = [
  { id: 'eq001', name: '140 TPH Alluvial Scrubber', type: 'Plant',       ownership: 'Owned',  supplier: '',                   hourlyRate: 0 },
  { id: 'eq002', name: 'Centrifugal Concentrator',  type: 'Plant',       ownership: 'Owned',  supplier: '',                   hourlyRate: 0 },
  { id: 'eq003', name: 'Shaking Table',             type: 'Plant',       ownership: 'Owned',  supplier: '',                   hourlyRate: 0 },
  { id: 'eq004', name: 'D7 Dozer',                  type: 'Earthmoving', ownership: 'Hired',  supplier: 'Mandebvu Contracting', hourlyRate: 65 },
  { id: 'eq005', name: 'Excavator 1',               type: 'Earthmoving', ownership: 'Hired',  supplier: '',                   hourlyRate: 0 },
  { id: 'eq006', name: 'Excavator 2',               type: 'Earthmoving', ownership: 'Hired',  supplier: '',                   hourlyRate: 0 },
  { id: 'eq007', name: 'Dump Truck 1',              type: 'Vehicle',     ownership: 'Hired',  supplier: '',                   hourlyRate: 0 },
  { id: 'eq008', name: 'Dump Truck 2',              type: 'Vehicle',     ownership: 'Hired',  supplier: '',                   hourlyRate: 0 },
  { id: 'eq009', name: 'Dump Truck 3',              type: 'Vehicle',     ownership: 'Hired',  supplier: '',                   hourlyRate: 0 }
]

export const EMERGENCY_CONTACTS = [
  { label: 'MEDEVAC',        number: '+263 4 123 456' },
  { label: 'Nearest Hospital (Kanyemba)', number: '+263 58 234 567' },
  { label: 'Mine Manager (Piyo)', number: '+263 77 xxx xxxx' },
  { label: 'HSE Officer (Thomas)', number: '+263 77 xxx xxxx' }
]

export const ROLE_PERMISSIONS = {
  Owner:            ['dashboard', 'shift', 'production', 'hr', 'operations', 'compliance', 'goldroom'],
  'Mine Manager':   ['dashboard', 'shift', 'production', 'hr', 'operations', 'compliance', 'goldroom'],
  'Shift Supervisor': ['dashboard', 'shift', 'production', 'hr_attendance', 'maintenance_faults', 'hse', 'si91'],
  Metallurgist:     ['dashboard', 'shift_view', 'production_view', 'goldroom'],
  'HSE Officer':    ['dashboard', 'shift_view', 'hse', 'regulatory', 'reports_hse'],
  'HR/Admin':       ['dashboard', 'hr']
}
