import { Routes, Route, Link, useLocation } from 'react-router-dom'
import EmployeeRegister from './EmployeeRegister'
import PayrollRegister from './PayrollRegister'
import LeaveTracker from './LeaveTracker'
import CrewRoster from './CrewRoster'
import AttendanceLog from './AttendanceLog'
import DisciplinaryLog from './DisciplinaryLog'
import { useAuth } from '../../context/AuthContext'

const TABS = [
  { to: '/hr',              label: 'Employees', exact: true },
  { to: '/hr/payroll',      label: 'Payroll' },
  { to: '/hr/leave',        label: 'Leave' },
  { to: '/hr/roster',       label: 'Roster' },
  { to: '/hr/attendance',   label: 'Attendance' },
  { to: '/hr/disciplinary', label: 'HR Notes' }
]

function HRNav() {
  const loc = useLocation()
  return (
    <div className="flex gap-1 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-hide">
      {TABS.map(t => {
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
  const hrAccess = ['Owner', 'Mine Manager', 'HR/Admin'].includes(user?.role)

  if (!hrAccess && user?.role !== 'Shift Supervisor') {
    return <div className="text-center py-16 text-gray-500">Access restricted.</div>
  }

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold text-navy">HR</h1>
      <HRNav />
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
