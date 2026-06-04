import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { format } from 'date-fns'
import { CheckCircle2, Circle, AlertTriangle, AlertOctagon, Plus, ClipboardList, ShoppingCart, Lock } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { dbUpsert, dbSelect } from '../lib/supabase'
import { Badge } from '../components/ui/Badge'

function KPICard({ label, value, unit, color = 'navy' }) {
  const colors = { navy: 'border-navy/20', gold: 'border-gold/40', green: 'border-green-200' }
  return (
    <div className={`card border-l-4 ${colors[color]}`}>
      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{label}</p>
      <div className="flex items-baseline gap-1 mt-1">
        <span className="text-2xl font-bold text-navy">{value ?? '—'}</span>
        {unit && <span className="text-sm text-gray-500 font-medium">{unit}</span>}
      </div>
    </div>
  )
}

function AlertItem({ severity, message }) {
  const cfg = severity === 'critical'
    ? { bg: 'bg-red-50 border-red-200', icon: AlertOctagon, text: 'text-red-700', iconColor: 'text-red-500' }
    : { bg: 'bg-amber-50 border-amber-200', icon: AlertTriangle, text: 'text-amber-700', iconColor: 'text-amber-500' }
  const Icon = cfg.icon
  return (
    <div className={`flex items-start gap-2 px-3 py-2 rounded-xl border ${cfg.bg}`}>
      <Icon size={16} className={`${cfg.iconColor} mt-0.5 shrink-0`} />
      <span className={`text-sm font-medium ${cfg.text}`}>{message}</span>
    </div>
  )
}

export default function Dashboard() {
  const { user } = useAuth()
  const today = format(new Date(), 'yyyy-MM-dd')
  const [si91Confirmed, setSi91Confirmed] = useState(false)
  const [confirming, setConfirming] = useState(false)
  const [kpis, setKpis] = useState({ tonnes: null, goldG: null, runtime: null })
  const [alerts, setAlerts] = useState([])

  const goldAccess = ['Owner', 'Mine Manager', 'Metallurgist'].includes(user?.role)
  const canManageUsers = user?.role === 'Owner'
  const currentHour = new Date().getHours()
  const activeShift = currentHour >= 6 && currentHour < 18 ? 'Day Shift' : 'Night Shift'

  useEffect(() => {
    async function load() {
      // Load SI 91 confirmation for today
      const { data: si91 } = await dbSelect('si91_log', { date: today })
      if (si91?.length > 0) setSi91Confirmed(true)

      // Tonnes comes from handovers; gold + runtime come from production logs
      const { data: todayHandovers } = await dbSelect('shift_handovers', { date: today })
      const { data: prod } = await dbSelect('production_logs', { date: today })
      const totTonnes = (todayHandovers || []).reduce((s, r) => s + (parseFloat(r.ore_processed) || 0), 0)
      const totGold   = (prod || []).reduce((s, r) => s + (parseFloat(r.total_gold_g) || 0), 0)
      const totRuntime= (prod || []).reduce((s, r) => s + (parseFloat(r.plant_runtime_hrs) || 0), 0)
      if (totTonnes > 0 || totGold > 0 || totRuntime > 0) {
        setKpis({ tonnes: totTonnes.toFixed(1), goldG: totGold.toFixed(2), runtime: totRuntime.toFixed(1) })
      }

      // Build alerts
      const newAlerts = []
      if (!si91Confirmed) newAlerts.push({ id: 'si91', severity: 'critical', message: 'SI 91 not confirmed for today' })

      // Check handover overdue
      const shiftEnd = currentHour >= 18 ? `${today}T18:00:00` : `${today}T06:00:00`
      const { data: handovers } = await dbSelect('shift_handovers', { date: today })
      if (!handovers || handovers.length === 0) {
        const endTime = new Date(shiftEnd)
        if (new Date() > new Date(endTime.getTime() + 60 * 60 * 1000)) {
          newAlerts.push({ id: 'handover', severity: 'critical', message: 'Shift handover overdue — no handover submitted' })
        }
      }

      // Check permits
      const { data: permits } = await dbSelect('permits')
      permits?.forEach(p => {
        if (p.status !== 'Active') return
        const daysLeft = Math.floor((new Date(p.expiry_date) - new Date()) / 86400000)
        if (daysLeft < 30 && daysLeft >= 0) {
          newAlerts.push({ id: `permit_${p.id}`, severity: 'caution', message: `Permit "${p.name}" expires in ${daysLeft} days` })
        }
      })

      setAlerts(newAlerts)
    }
    load()
  }, [today, si91Confirmed])

  async function confirmSI91() {
    setConfirming(true)
    await dbUpsert('si91_log', {
      id: `si91_${today}`,
      date: today,
      confirmed_by: user?.name,
      confirmed_by_id: user?.id,
      role: user?.role,
      timestamp: new Date().toISOString(),
      shift: activeShift
    })
    setSi91Confirmed(true)
    setConfirming(false)
  }

  return (
    <div className="space-y-5">
      {/* Date + shift banner */}
      <div className="bg-navy rounded-2xl px-5 py-4 text-white">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-white/60 text-sm">Today</p>
            <p className="text-xl font-bold">{format(new Date(), 'EEEE, d MMMM yyyy')}</p>
            <p className="text-gold font-semibold mt-0.5">{activeShift}</p>
          </div>
          <div className="text-right">
            <p className="text-white/60 text-xs">Logged in as</p>
            <p className="font-semibold text-sm">{user?.name}</p>
            <p className="text-white/60 text-xs">{user?.role}</p>
          </div>
        </div>
      </div>

      {/* SI 91 Confirmation */}
      <div className={`card border-2 ${si91Confirmed ? 'border-green-300 bg-green-50' : 'border-amber-300 bg-amber-50'}`}>
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            {si91Confirmed
              ? <CheckCircle2 size={24} className="text-green-600 shrink-0 mt-0.5" />
              : <Circle size={24} className="text-amber-500 shrink-0 mt-0.5" />
            }
            <div>
              <p className="font-bold text-sm text-gray-800">
                SI 91 of 2026 — Daily Confirmation
              </p>
              <p className="text-xs text-gray-600 mt-0.5">
                Statutory Instrument 91: Mining (Health, Safety & Environment) Regulations
              </p>
              {si91Confirmed && (
                <p className="text-xs text-green-700 font-medium mt-1">
                  ✓ Confirmed by {user?.name} · {format(new Date(), 'HH:mm')}
                </p>
              )}
            </div>
          </div>
          {!si91Confirmed && (
            <button
              onClick={confirmSI91}
              disabled={confirming}
              className="btn-gold shrink-0 text-sm px-4 py-2.5"
            >
              {confirming ? '…' : 'Confirm'}
            </button>
          )}
        </div>
      </div>

      {/* Alerts */}
      {alerts.length > 0 && (
        <div className="space-y-2">
          <h2 className="text-sm font-bold text-gray-600 uppercase tracking-wide">Active Alerts</h2>
          {alerts.map(a => <AlertItem key={a.id} severity={a.severity} message={a.message} />)}
        </div>
      )}

      {/* KPI Cards */}
      <div>
        <h2 className="text-sm font-bold text-gray-600 uppercase tracking-wide mb-3">Today's Production</h2>
        <div className="grid grid-cols-3 gap-3">
          <KPICard label="Tonnes Processed" value={kpis.tonnes} unit="t" color="navy" />
          <KPICard label="Gold Recovered" value={kpis.goldG} unit="g" color="gold" />
          <KPICard label="Plant Run-Time" value={kpis.runtime} unit="hrs" color="green" />
        </div>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-sm font-bold text-gray-600 uppercase tracking-wide mb-3">Quick Actions</h2>
        <div className="grid grid-cols-2 gap-3">
          <Link to="/shift/handover/new" className="card flex items-center gap-3 hover:border-navy hover:shadow-md transition-all border-2 border-transparent">
            <div className="w-10 h-10 rounded-xl bg-navy/10 flex items-center justify-center">
              <Plus size={20} className="text-navy" />
            </div>
            <div>
              <p className="font-semibold text-sm text-navy">New Handover</p>
              <p className="text-xs text-gray-500">Log shift changeover</p>
            </div>
          </Link>

          <Link to="/compliance" className="card flex items-center gap-3 hover:border-red-300 hover:shadow-md transition-all border-2 border-transparent">
            <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center">
              <AlertTriangle size={20} className="text-red-600" />
            </div>
            <div>
              <p className="font-semibold text-sm text-navy">Log Incident</p>
              <p className="text-xs text-gray-500">HSE report</p>
            </div>
          </Link>

          <Link to="/operations/procurement" className="card flex items-center gap-3 hover:border-navy hover:shadow-md transition-all border-2 border-transparent">
            <div className="w-10 h-10 rounded-xl bg-gold/20 flex items-center justify-center">
              <ShoppingCart size={20} className="text-gold-dark" />
            </div>
            <div>
              <p className="font-semibold text-sm text-navy">Procurement</p>
              <p className="text-xs text-gray-500">Purchase request</p>
            </div>
          </Link>

          {goldAccess && (
            <Link to="/goldroom" className="card flex items-center gap-3 hover:border-gold hover:shadow-md transition-all border-2 border-transparent">
              <div className="w-10 h-10 rounded-xl bg-gold/20 flex items-center justify-center">
                <Lock size={20} className="text-gold-dark" />
              </div>
              <div>
                <p className="font-semibold text-sm text-navy">Gold Room</p>
                <p className="text-xs text-gray-500">Restricted access</p>
              </div>
            </Link>
          )}

          <Link to="/compliance/reports" className="card flex items-center gap-3 hover:border-navy hover:shadow-md transition-all border-2 border-transparent">
            <div className="w-10 h-10 rounded-xl bg-navy/10 flex items-center justify-center">
              <ClipboardList size={20} className="text-navy" />
            </div>
            <div>
              <p className="font-semibold text-sm text-navy">Reports</p>
              <p className="text-xs text-gray-500">Generate PDFs</p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  )
}
