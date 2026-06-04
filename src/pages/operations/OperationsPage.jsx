import { Routes, Route, Link, useLocation } from 'react-router-dom'
import Maintenance from './Maintenance'
import Equipment from './Equipment'
import Procurement from './Procurement'
import { useAuth } from '../../context/AuthContext'

const TABS = [
  { to: '/operations',            label: 'Maintenance', exact: true },
  { to: '/operations/equipment',  label: 'Equipment' },
  { to: '/operations/procurement',label: 'Procurement' }
]

function OpsNav() {
  const loc = useLocation()
  return (
    <div className="flex gap-1 bg-gray-100 rounded-xl p-1">
      {TABS.map(t => {
        const active = t.exact ? loc.pathname === t.to : loc.pathname.startsWith(t.to)
        return (
          <Link key={t.to} to={t.to}
            className={`flex-1 py-2 text-sm font-semibold rounded-xl text-center transition-colors ${
              active ? 'bg-white text-navy shadow-sm' : 'text-gray-500'
            }`}>{t.label}</Link>
        )
      })}
    </div>
  )
}

export default function OperationsPage() {
  const { user } = useAuth()
  if (!['Owner', 'Mine Manager', 'Shift Supervisor'].includes(user?.role)) {
    return <div className="text-center py-16 text-gray-500">Access restricted.</div>
  }
  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold text-navy">Operations</h1>
      <OpsNav />
      <Routes>
        <Route index element={<Maintenance />} />
        <Route path="equipment" element={<Equipment />} />
        <Route path="procurement/*" element={<Procurement />} />
      </Routes>
    </div>
  )
}
