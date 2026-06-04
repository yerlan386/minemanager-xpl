import { Routes, Route, Link, useLocation } from 'react-router-dom'
import HSEPage from './HSEPage'
import RegulatoryPage from './RegulatoryPage'
import ReportsPage from './ReportsPage'
import { useAuth } from '../../context/AuthContext'

const TABS = [
  { to: '/compliance',              label: 'HSE',        exact: true },
  { to: '/compliance/regulatory',   label: 'Regulatory' },
  { to: '/compliance/reports',      label: 'Reports' }
]

function ComplianceNav() {
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

export default function CompliancePage() {
  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold text-navy">Compliance</h1>
      <ComplianceNav />
      <Routes>
        <Route index element={<HSEPage />} />
        <Route path="regulatory/*" element={<RegulatoryPage />} />
        <Route path="reports" element={<ReportsPage />} />
        <Route path="hse/*" element={<HSEPage />} />
      </Routes>
    </div>
  )
}
