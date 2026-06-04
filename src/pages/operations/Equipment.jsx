import { useState } from 'react'
import { format } from 'date-fns'
import { Plus, Fuel, Clock } from 'lucide-react'
import { useLocalData } from '../../hooks/useLocalData'
import { Select, Input, NumberInput, VoiceTextarea } from '../../components/ui/FormField'
import { Badge } from '../../components/ui/Badge'
import { Modal } from '../../components/ui/Modal'
import { EQUIPMENT_REGISTER, EQUIPMENT_TYPES, OWNERSHIP_TYPES } from '../../data/constants'

const HOURS_EMPTY = { equipment_id: '', date: format(new Date(), 'yyyy-MM-dd'), hours_run: '', operator: '' }
const FUEL_EMPTY  = { equipment_id: '', date: format(new Date(), 'yyyy-MM-dd'), litres: '', cost: '' }
const BREAKDOWN_EMPTY = { equipment_id: '', date: format(new Date(), 'yyyy-MM-dd'), description: '', downtime_hrs: '', resolution: '' }
const HIRE_EMPTY  = { equipment_id: '', date: format(new Date(), 'yyyy-MM-dd'), hours: '', rate: '', notes: '' }

export default function Equipment() {
  const { rows: hours, upsert: upsertHours } = useLocalData('equipment_hours')
  const { rows: fuel, upsert: upsertFuel } = useLocalData('fuel_log')
  const { rows: breakdowns, upsert: upsertBreakdown } = useLocalData('breakdowns')
  const { rows: hire, upsert: upsertHire } = useLocalData('hire_billing')
  const [tab, setTab] = useState('hours')
  const [modal, setModal] = useState(false)
  const [form, setForm] = useState({})
  const [saving, setSaving] = useState(false)

  const tabs = ['hours', 'fuel', 'hire', 'breakdowns']
  const eqName = id => EQUIPMENT_REGISTER.find(e => e.id === id)?.name || id

  const hiredEq = EQUIPMENT_REGISTER.filter(e => e.ownership === 'Hired')

  function openModal(empty, current) {
    setForm({ ...empty, ...(current || {}) })
    setModal(true)
  }

  async function handleSave() {
    setSaving(true)
    const save = tab === 'hours' ? upsertHours : tab === 'fuel' ? upsertFuel : tab === 'hire' ? upsertHire : upsertBreakdown
    await save({ ...form, id: form.id || crypto.randomUUID() })
    setSaving(false)
    setModal(false)
  }

  function set(f) { return e => setForm(p => ({ ...p, [f]: e.target.value })) }

  const emptyMap = { hours: HOURS_EMPTY, fuel: FUEL_EMPTY, hire: HIRE_EMPTY, breakdowns: BREAKDOWN_EMPTY }
  const rowsMap  = { hours, fuel, hire, breakdowns }
  const rows = rowsMap[tab] || []

  // Hire billing totals
  const hireTotal = hire.reduce((s, r) => {
    const eq = EQUIPMENT_REGISTER.find(e => e.id === r.equipment_id)
    const rate = parseFloat(r.rate) || eq?.hourlyRate || 0
    return s + (parseFloat(r.hours) || 0) * rate
  }, 0)

  return (
    <div className="space-y-4">
      <div className="flex gap-1 overflow-x-auto pb-1 -mx-1 px-1">
        {tabs.map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`shrink-0 px-4 py-2 rounded-xl text-sm font-semibold capitalize transition-colors ${
              tab === t ? 'bg-navy text-white' : 'bg-gray-100 text-gray-600'
            }`}>{t}</button>
        ))}
      </div>

      {tab === 'hire' && hire.length > 0 && (
        <div className="card flex items-center justify-between">
          <p className="text-sm font-semibold text-gray-600">Total Hire Billing</p>
          <p className="text-xl font-bold text-navy">${hireTotal.toFixed(2)}</p>
        </div>
      )}

      <button onClick={() => openModal(emptyMap[tab])} className="btn-primary w-full gap-2">
        <Plus size={18} /> Add {tab === 'hours' ? 'Hours Log' : tab === 'fuel' ? 'Fuel Entry' : tab === 'hire' ? 'Hire Billing' : 'Breakdown'}
      </button>

      <div className="space-y-2">
        {rows.slice().reverse().slice(0, 20).map(r => {
          const eq = EQUIPMENT_REGISTER.find(e => e.id === r.equipment_id)
          const hireCost = tab === 'hire' ? (parseFloat(r.hours) || 0) * (parseFloat(r.rate) || eq?.hourlyRate || 0) : null
          return (
            <button key={r.id} onClick={() => openModal(emptyMap[tab], r)}
              className="card w-full text-left hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-sm text-navy">{eqName(r.equipment_id)}</p>
                  <p className="text-xs text-gray-500">{r.date}</p>
                  {r.description && <p className="text-xs text-gray-600 mt-0.5">{r.description}</p>}
                </div>
                <div className="text-right">
                  {tab === 'hours' && <p className="font-bold text-navy">{r.hours_run}<span className="text-xs text-gray-400 font-normal"> hrs</span></p>}
                  {tab === 'fuel' && <p className="font-bold text-navy">{r.litres}<span className="text-xs text-gray-400 font-normal"> L</span></p>}
                  {tab === 'hire' && <p className="font-bold text-navy">${hireCost?.toFixed(2)}</p>}
                  {tab === 'breakdowns' && <p className="font-bold text-red-600">{r.downtime_hrs}<span className="text-xs font-normal"> hrs down</span></p>}
                </div>
              </div>
            </button>
          )
        })}
      </div>

      <Modal open={modal} onClose={() => setModal(false)}
        title={tab === 'hours' ? 'Equipment Hours' : tab === 'fuel' ? 'Fuel Log' : tab === 'hire' ? 'Hire Billing' : 'Breakdown'}>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Input label="Date" type="date" value={form.date || ''} onChange={set('date')} />
            <Select label="Equipment" value={form.equipment_id || ''} onChange={set('equipment_id')}
              options={EQUIPMENT_REGISTER.map(e => ({ value: e.id, label: e.name }))} placeholder="Select…" required />
          </div>
          {tab === 'hours' && <>
            <NumberInput label="Hours Run" suffix="hrs" value={form.hours_run || ''} onChange={set('hours_run')} step="0.5" />
            <Input label="Operator" value={form.operator || ''} onChange={set('operator')} placeholder="Operator name" />
          </>}
          {tab === 'fuel' && <>
            <NumberInput label="Litres" suffix="L" value={form.litres || ''} onChange={set('litres')} step="0.1" />
            <NumberInput label="Cost (USD)" prefix="$" value={form.cost || ''} onChange={set('cost')} step="0.01" />
          </>}
          {tab === 'hire' && <>
            <NumberInput label="Hours" suffix="hrs" value={form.hours || ''} onChange={set('hours')} step="0.5" />
            <NumberInput label="Rate ($/hr)" prefix="$" value={form.rate || ''} onChange={set('rate')} step="0.50"
              hint={form.equipment_id && EQUIPMENT_REGISTER.find(e=>e.id===form.equipment_id)?.hourlyRate
                ? `Pre-set: $${EQUIPMENT_REGISTER.find(e=>e.id===form.equipment_id).hourlyRate}/hr` : ''} />
            {form.hours && form.rate && (
              <div className="bg-navy/5 rounded-xl px-4 py-3 text-sm flex justify-between">
                <span className="text-gray-600">Amount</span>
                <strong>${(parseFloat(form.hours) * parseFloat(form.rate)).toFixed(2)}</strong>
              </div>
            )}
          </>}
          {tab === 'breakdowns' && <>
            <VoiceTextarea label="Description" name="breakdown_desc" value={form.description || ''} onChange={set('description')} rows={3} />
            <div className="grid grid-cols-2 gap-3">
              <NumberInput label="Downtime (hrs)" suffix="hrs" value={form.downtime_hrs || ''} onChange={set('downtime_hrs')} step="0.5" />
              <Input label="Resolution" value={form.resolution || ''} onChange={set('resolution')} placeholder="How was it fixed?" />
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
