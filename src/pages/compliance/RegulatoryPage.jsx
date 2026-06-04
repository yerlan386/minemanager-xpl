import { useState } from 'react'
import { format, differenceInDays, parseISO } from 'date-fns'
import { Plus, FileText, Users, Phone } from 'lucide-react'
import { useLocalData } from '../../hooks/useLocalData'
import { Select, Input } from '../../components/ui/FormField'
import { Badge, StatusBadge } from '../../components/ui/Badge'
import { Modal } from '../../components/ui/Modal'
import { EMERGENCY_CONTACTS, PERMIT_TYPES } from '../../data/constants'

const PERMIT_EMPTY = {
  name: '', authority: '', permit_number: '',
  issue_date: '', expiry_date: '', status: 'Active', notes: ''
}

const VISITOR_EMPTY = {
  name: '', organization: '', purpose: '',
  date_in: format(new Date(), 'yyyy-MM-dd'),
  time_in: format(new Date(), 'HH:mm'),
  time_out: '', escorted_by: ''
}

export default function RegulatoryPage() {
  const { rows: permits, upsert: upsertPermit } = useLocalData('permits')
  const { rows: visitors, upsert: upsertVisitor } = useLocalData('visitor_log')
  const [tab, setTab] = useState('permits')
  const [modal, setModal] = useState(false)
  const [form, setForm] = useState(PERMIT_EMPTY)
  const [saving, setSaving] = useState(false)

  function set(f) { return e => setForm(p => ({ ...p, [f]: e.target.value })) }

  function openNew(empty) {
    setForm(empty)
    setModal(true)
  }

  async function handleSave() {
    setSaving(true)
    const upsert = tab === 'permits' ? upsertPermit : upsertVisitor
    await upsert({ ...form, id: form.id || crypto.randomUUID() })
    setSaving(false)
    setModal(false)
  }

  function permitStatus(p) {
    if (!p.expiry_date) return { color: 'gray', label: 'Unknown' }
    const days = differenceInDays(parseISO(p.expiry_date), new Date())
    if (days < 0)  return { color: 'red',   label: 'Expired' }
    if (days < 30) return { color: 'amber', label: `Expires in ${days}d` }
    return { color: 'green', label: `Valid (${days}d)` }
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-1 bg-gray-100 rounded-xl p-1">
        {['permits', 'visitors', 'emergency'].map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`flex-1 py-2 text-xs font-semibold rounded-xl capitalize transition-colors ${
              tab === t ? 'bg-white text-navy shadow-sm' : 'text-gray-500'
            }`}>{t === 'emergency' ? 'Emergency' : t.charAt(0).toUpperCase() + t.slice(1)}</button>
        ))}
      </div>

      {tab === 'permits' && (
        <>
          <button onClick={() => openNew(PERMIT_EMPTY)} className="btn-primary w-full gap-2">
            <Plus size={18} /> Add Permit
          </button>
          <div className="space-y-2">
            {/* Pre-load standard permit types if empty */}
            {permits.length === 0 && PERMIT_TYPES.map(pt => (
              <div key={pt.name} className="card opacity-60">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-sm text-navy">{pt.name}</p>
                    <p className="text-xs text-gray-500">Authority: {pt.authority}</p>
                  </div>
                  <Badge color="gray">Not Added</Badge>
                </div>
              </div>
            ))}
            {permits.map(p => {
              const ps = permitStatus(p)
              return (
                <button key={p.id} onClick={() => { setForm(p); setModal(true) }}
                  className="card w-full text-left hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <div>
                      <p className="font-semibold text-sm text-navy">{p.name}</p>
                      <p className="text-xs text-gray-500">{p.authority} · #{p.permit_number}</p>
                    </div>
                    <Badge color={ps.color}>{ps.label}</Badge>
                  </div>
                  <div className="flex gap-3 text-xs text-gray-400">
                    {p.issue_date && <span>Issued: {p.issue_date}</span>}
                    {p.expiry_date && <span>Expires: {p.expiry_date}</span>}
                  </div>
                </button>
              )
            })}
          </div>
        </>
      )}

      {tab === 'visitors' && (
        <>
          <button onClick={() => openNew(VISITOR_EMPTY)} className="btn-primary w-full gap-2">
            <Plus size={18} /> Log Visitor
          </button>
          <div className="space-y-2">
            {[...visitors].reverse().map(v => (
              <div key={v.id} className="card">
                <div className="flex items-center justify-between mb-1">
                  <div>
                    <p className="font-semibold text-sm text-navy">{v.name}</p>
                    <p className="text-xs text-gray-500">{v.organization}</p>
                  </div>
                  <Badge color={v.time_out ? 'gray' : 'green'}>{v.time_out ? 'Left' : 'On Site'}</Badge>
                </div>
                <p className="text-xs text-gray-500">{v.purpose}</p>
                <p className="text-xs text-gray-400 mt-1">
                  {v.date_in} · In: {v.time_in}{v.time_out ? ` · Out: ${v.time_out}` : ''} · Escort: {v.escorted_by}
                </p>
              </div>
            ))}
          </div>
        </>
      )}

      {tab === 'emergency' && (
        <div className="space-y-3">
          <div className="bg-red-50 border border-red-200 rounded-2xl px-4 py-3">
            <p className="text-xs font-bold text-red-600 uppercase tracking-wide mb-3">Emergency Contacts</p>
            {EMERGENCY_CONTACTS.map(c => (
              <div key={c.label} className="flex items-center justify-between py-2.5 border-b border-red-100 last:border-0">
                <div>
                  <p className="font-semibold text-sm text-navy">{c.label}</p>
                  <p className="text-base font-bold text-red-700">{c.number}</p>
                </div>
                <a href={`tel:${c.number.replace(/\s/g, '')}`}
                  className="flex items-center justify-center w-10 h-10 bg-red-600 text-white rounded-xl">
                  <Phone size={18} />
                </a>
              </div>
            ))}
          </div>
        </div>
      )}

      <Modal open={modal} onClose={() => setModal(false)}
        title={tab === 'permits' ? 'Permit' : 'Visitor Log'}>
        <div className="space-y-4">
          {tab === 'permits' && <>
            <Select label="Permit Type" value={form.name || ''} onChange={set('name')}
              options={PERMIT_TYPES.map(p => p.name)} placeholder="Select type or enter below" />
            <Input label="Permit Name" value={form.name || ''} onChange={set('name')} required placeholder="Full permit name" />
            <div className="grid grid-cols-2 gap-3">
              <Input label="Issuing Authority" value={form.authority || ''} onChange={set('authority')} placeholder="MMSD / EMA / ZINWA" />
              <Input label="Permit Number" value={form.permit_number || ''} onChange={set('permit_number')} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Input label="Issue Date" type="date" value={form.issue_date || ''} onChange={set('issue_date')} />
              <Input label="Expiry Date" type="date" value={form.expiry_date || ''} onChange={set('expiry_date')} />
            </div>
            <Select label="Status" value={form.status || 'Active'} onChange={set('status')} options={['Active', 'Expired', 'Pending Renewal', 'Suspended']} />
          </>}
          {tab === 'visitors' && <>
            <Input label="Full Name" value={form.name || ''} onChange={set('name')} required />
            <Input label="Organization" value={form.organization || ''} onChange={set('organization')} placeholder="Company / Institution" />
            <Input label="Purpose of Visit" value={form.purpose || ''} onChange={set('purpose')} required />
            <div className="grid grid-cols-2 gap-3">
              <Input label="Date In" type="date" value={form.date_in || ''} onChange={set('date_in')} required />
              <Input label="Time In" type="time" value={form.time_in || ''} onChange={set('time_in')} required />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Input label="Time Out" type="time" value={form.time_out || ''} onChange={set('time_out')} />
              <Input label="Escorted By" value={form.escorted_by || ''} onChange={set('escorted_by')} required />
            </div>
          </>}
          <div className="flex gap-3 pt-2">
            <button onClick={() => setModal(false)} className="btn-outline flex-1">Cancel</button>
            <button onClick={handleSave} disabled={saving} className="btn-primary flex-1">{saving ? '…' : 'Save'}</button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
