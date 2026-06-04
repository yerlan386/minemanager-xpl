import { useState, useEffect } from 'react'
import { Link, Routes, Route } from 'react-router-dom'
import { format, parseISO } from 'date-fns'
import { Plus, Download, ChevronRight } from 'lucide-react'
import { dbSelect } from '../../lib/supabase'
import { StatusBadge } from '../../components/ui/Badge'
import { EmptyState } from '../../components/ui/EmptyState'
import ShiftHandover from './ShiftHandover'
import ProductionLog from './ProductionLog'
import { Pickaxe } from 'lucide-react'

function HandoverCard({ h }) {
  const outEmp = h.outgoing_supervisor_name || h.outgoing_supervisor_id
  const inEmp  = h.incoming_supervisor_name || h.incoming_supervisor_id
  return (
    <Link to={`/shift/handover/${h.id}`}
      className="card flex items-center justify-between gap-4 hover:shadow-md transition-shadow border border-gray-100">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs font-bold text-white bg-navy px-2 py-0.5 rounded-full">{h.shift}</span>
          <span className="text-sm font-semibold text-navy">{h.date ? format(parseISO(h.date), 'd MMM') : '—'}</span>
          <StatusBadge status={h.overall_status || 'Normal'} />
        </div>
        <p className="text-xs text-gray-500 truncate">{outEmp} → {inEmp}</p>
        <div className="flex gap-3 mt-1.5 text-xs text-gray-600">
          <span><strong>{h.ore_processed || 0}t</strong> ore</span>
          <span><strong>{h.gold_recovered_g || 0}g</strong> gold</span>
          <span><strong>{h.workers_on_site || 0}</strong> workers</span>
        </div>
      </div>
      <ChevronRight size={18} className="text-gray-400 shrink-0" />
    </Link>
  )
}

function ShiftIndex() {
  const [tab, setTab] = useState('handovers')
  const [handovers, setHandovers] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    dbSelect('shift_handovers').then(({ data }) => {
      setHandovers((data || []).sort((a, b) => new Date(b.date) - new Date(a.date)))
      setLoading(false)
    })
  }, [])

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-navy">Shift</h1>
        <Link to="/shift/handover/new" className="btn-primary text-sm px-4 py-2.5 gap-1.5">
          <Plus size={16} /> New Handover
        </Link>
      </div>

      <div className="flex gap-1 bg-gray-100 rounded-xl p-1">
        {['handovers', 'production'].map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`flex-1 py-2 text-sm font-semibold rounded-xl capitalize transition-colors ${
              tab === t ? 'bg-white text-navy shadow-sm' : 'text-gray-500'
            }`}>{t === 'handovers' ? 'Handovers' : 'Production Log'}</button>
        ))}
      </div>

      {tab === 'handovers' ? (
        loading ? <div className="text-center py-8 text-gray-400">Loading…</div> :
        handovers.length === 0 ? (
          <EmptyState icon={Pickaxe} title="No handovers yet" description="Submit the first shift handover to start tracking."
            action={<Link to="/shift/handover/new" className="btn-primary">New Handover</Link>} />
        ) : (
          <div className="space-y-3">{handovers.map(h => <HandoverCard key={h.id} h={h} />)}</div>
        )
      ) : (
        <ProductionLog inline />
      )}
    </div>
  )
}

export default function ShiftPage() {
  return (
    <Routes>
      <Route index element={<ShiftIndex />} />
      <Route path="handover/:id" element={<ShiftHandover />} />
    </Routes>
  )
}
