import { Routes, Route, Link, useLocation } from 'react-router-dom'
import EmployeeRegister from './EmployeeRegister'
import PayrollRegister from './PayrollRegister'
import LeaveTracker from './LeaveTracker'
import CrewRoster from './CrewRoster'
import AttendanceLog from './AttendanceLog'
import DisciplinaryLog from './DisciplinaryLog'
import { useAuth } from '../../context/AuthContext'

const ALL_TABS = [
  { to: '/hr',              label: 'Employees', exact: true,  roles: ['Owner','Mine Manager','HR/Admin'] },
  { to: '/hr/payroll',      label: 'Payroll',                 roles: ['Owner','Mine Manager','HR/Admin'] },
  { to: '/hr/leave',        label: 'Leave',                   roles: ['Owner','Mine Manager','HR/Admin'] },
  { to: '/hr/roster',       label: 'Roster',                  roles: ['Owner','Mine Manager','HR/Admin','Shift Supervisor','Metallurgist','HSE Officer'] },
  { to: '/hr/attendance',   label: 'Attendance',              roles: ['Owner','Mine Manager','HR/Admin','Shift Supervisor','Metallurgist','HSE Officer'] },
  { to: '/hr/disciplinary', label: 'HR Notes',                roles: ['Owner','Mine Manager','HR/Admin'] }
]

function HRNav({ userRole }) {
  const loc = useLocation()
  const tabs = ALL_TABS.filter(t => t.roles.includes(userRole))
  return (
    <div className="flex gap-1 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-hide">
      {tabs.map(t => {
        const active = t.exact ? loc.pathname === t.to : loc.pathname.startsWith(t.to)
        return (
          <Link key={t.to} to={t.to}
            className={`shrink-0 px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${
              active ? 'bg-navy text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}>
            {t.label}
          </Link>
        )
      })}
    </div>
  )
}

export default function HRPage() {
  const { user } = useAuth()
  const LIMITED_ROLES = ['Shift Supervisor', 'Metallurgist', 'HSE Officer']
  const hasAnyAccess = ['Owner', 'Mine Manager', 'HR/Admin', ...LIMITED_ROLES].includes(user?.role)

  if (!hasAnyAccess) {
    return <div className="text-center py-16 text-gray-500">Access restricted.</div>
  }

  // Limited roles land on Attendance by default (their only permitted tab)
  const defaultPath = LIMITED_ROLES.includes(user?.role) ? '/hr/attendance' : '/hr'

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold text-navy">HR</h1>
      <HRNav userRole={user?.role} />
      <Routes>
        <Route index element={<EmployeeRegister />} />
        <Route path="payroll" element={<PayrollRegister />} />
        <Route path="leave" element={<LeaveTracker />} />
        <Route path="roster" element={<CrewRoster />} />
        <Route path="attendance" element={<AttendanceLog />} />
        <Route path="disciplinary" element={<DisciplinaryLog />} />
      </Routes>
    </div>
  )
}
