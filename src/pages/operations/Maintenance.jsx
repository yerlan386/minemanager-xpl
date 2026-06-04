import { useState } from 'react'
import { format } from 'date-fns'
import { Plus, Wrench, Package, AlertTriangle } from 'lucide-react'
import { useLocalData } from '../../hooks/useLocalData'
import { Select, Input, VoiceTextarea, NumberInput } from '../../components/ui/FormField'
import { StatusBadge, Badge } from '../../components/ui/Badge'
import { Modal } from '../../components/ui/Modal'
import { EQUIPMENT_REGISTER } from '../../data/constants'
import { FAULT_SEVERITY, FAULT_STATUSES } from '../../data/constants'
import { EMPLOYEES } from '../../data/employees'

const FAULT_EMPTY = {
  date: format(new Date(), 'yyyy-MM-dd'),
  equipment_id: '', description: '', severity: 'Medium',
  assigned_to: '', status: 'Open', notes: ''
}

const CONSUMABLE_EMPTY = {
  name: '', unit: 'each', current_qty: '', reorder_threshold: '', last_replenished: format(new Date(), 'yyyy-MM-dd')
}

export default function Maintenance() {
  const { rows: faults, upsert: upsertFault } = useLocalData('fault_log')
  const { rows: consumables, upsert: upsertConsumable } = useLocalData('consumables')
  const [tab, setTab] = useState('faults')
  const [faultModal, setFaultModal] = useState(false)
  const [consumableModal, setConsumableModal] = useState(false)
  const [faultForm, setFaultForm] = useState(FAULT_EMPTY)
  const [consForm, setConsForm] = useState(CONSUMABLE_EMPTY)
  const [saving, setSaving] = useState(false)

  const engineers = EMPLOYEES.filter(e => ['Artisan', 'Mine Manager', 'Shift Supervisor'].includes(e.role))
  const eqName = id => EQUIPMENT_REGISTER.find(e => e.id === id)?.name || id

  const lowStock = consumables.filter(c =>
    parseFloat(c.current_qty) <= parseFloat(c.reorder_threshold)
  )

  function setF(f) { return e => setFaultForm(p => ({ ...p, [f]: e.target.value })) }
  function setC(f) { return e => setConsForm(p => ({ ...p, [f]: e.target.value })) }

  async function saveFault() {
    setSaving(true)
    await upsertFault({ ...faultForm, id: faultForm.id || crypto.randomUUID() })
    setSaving(false)
    setFaultModal(false)
    setFaultForm(FAULT_EMPTY)
  }

  async function saveConsumable() {
    setSaving(true)
    await upsertConsumable({ ...consForm, id: consForm.id || crypto.randomUUID() })
    setSaving(false)
    setConsumableModal(false)
    setConsForm(CONSUMABLE_EMPTY)
  }

  const openFaults = faults.filter(f => f.status !== 'Closed')
  const closedFaults = faults.filter(f => f.status === 'Closed')

  return (
    <div className="space-y-4">
      {lowStock.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl px-4 py-3 flex items-start gap-2">
          <AlertTriangle size={18} className="text-amber-600 mt-0.5 shrink-0" />
          <div>
            <p className="text-sm font-bold text-amber-700">Low Stock Alert</p>
            <p className="text-xs text-amber-600">{lowStock.map(c => c.name).join(', ')}</p>
          </div>
        </div>
      )}

      <div className="flex gap-1 bg-gray-100 rounded-xl p-1">
        {['faults', 'consumables'].map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`flex-1 py-2 text-sm font-semibold rounded-xl capitalize transition-colors ${
              tab === t ? 'bg-white text-navy shadow-sm' : 'text-gray-500'
            }`}>
            {t === 'faults' ? `Faults (${openFaults.length})` : `Consumables (${lowStock.length} low)`}
          </button>
        ))}
      </div>

      {tab === 'faults' ? (
        <>
          <button onClick={() => { setFaultForm(FAULT_EMPTY); setFaultModal(true) }} className="btn-primary w-full gap-2">
            <Plus size={18} /> Log Fault
          </button>
          <div className="space-y-2">
            {openFaults.map(f => (
              <button key={f.id} onClick={() => { setFaultForm(f); setFaultModal(true) }}
                className="card w-full text-left hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <p className="font-semibold text-sm text-navy">{eqName(f.equipment_id)}</p>
                  <div className="flex gap-2">
                    <Badge color={f.severity === 'High' ? 'red' : f.severity === 'Medium' ? 'amber' : 'gray'}>{f.severity}</Badge>
                    <StatusBadge status={f.status} />
                  </div>
                </div>
                <p className="text-sm text-gray-600 mb-1">{f.description}</p>
                <p className="text-xs text-gray-400">{f.date}{f.assigned_to ? ` · Assigned: ${f.assigned_to}` : ''}</p>
              </button>
            ))}
          </div>
        </>
      ) : (
        <>
          <button onClick={() => { setConsForm(CONSUMABLE_EMPTY); setConsumableModal(true) }} className="btn-primary w-full gap-2">
            <Plus size={18} /> Add Consumable
          </button>
          <div className="space-y-2">
            {consumables.map(c => {
              const low = parseFloat(c.current_qty) <= parseFloat(c.reorder_threshold)
              const critical = parseFloat(c.current_qty) < parseFloat(c.reorder_threshold)
              return (
                <button key={c.id} onClick={() => { setConsForm(c); setConsumableModal(true) }}
                  className={`card w-full text-left hover:shadow-md transition-shadow ${critical ? 'border-l-4 border-red-400' : low ? 'border-l-4 border-amber-400' : ''}`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-sm text-navy">{c.name}</p>
                      <p className="text-xs text-gray-500">Reorder at: {c.reorder_threshold} {c.unit}</p>
                    </div>
                    <div className="text-right">
                      <p className={`text-xl font-bold ${critical ? 'text-red-600' : low ? 'text-amber-600' : 'text-navy'}`}>
                        {c.current_qty}
                      </p>
                      <p className="text-xs text-gray-400">{c.unit}</p>
                    </div>
                  </div>
                </button>
              )
            })}
          </div>
        </>
      )}

      <Modal open={faultModal} onClose={() => setFaultModal(false)} title="Fault Log">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Input label="Date" type="date" value={faultForm.date} onChange={setF('date')} />
            <Select label="Equipment" value={faultForm.equipment_id} onChange={setF('equipment_id')}
              options={EQUIPMENT_REGISTER.map(e => ({ value: e.id, label: e.name }))} placeholder="Select…" required />
          </div>
          <VoiceTextarea label="Description" name="description" value={faultForm.description}
            onChange={setF('description')} placeholder="Describe the fault…" rows={3} required />
          <div className="grid grid-cols-2 gap-3">
            <Select label="Severity" value={faultForm.severity} onChange={setF('severity')} options={FAULT_SEVERITY} />
            <Select label="Status" value={faultForm.status} onChange={setF('status')} options={FAULT_STATUSES} />
          </div>
          <Select label="Assigned To" value={faultForm.assigned_to} onChange={setF('assigned_to')}
            options={engineers.map(e => ({ value: e.name, label: e.name }))} placeholder="Select…" />
          <div className="flex gap-3 pt-2">
            <button onClick={() => setFaultModal(false)} className="btn-outline flex-1">Cancel</button>
            <button onClick={saveFault} disabled={saving} className="btn-primary flex-1">{saving ? '…' : 'Save'}</button>
          </div>
        </div>
      </Modal>

      <Modal open={consumableModal} onClose={() => setConsumableModal(false)} title="Consumable">
        <div className="space-y-4">
          <Input label="Item Name" value={consForm.name} onChange={setC('name')} required placeholder="e.g. Donaldson Filter P550169" />
          <div className="grid grid-cols-3 gap-3">
            <NumberInput label="Current Qty" value={consForm.current_qty} onChange={setC('current_qty')} min="0" />
            <NumberInput label="Reorder Level" value={consForm.reorder_threshold} onChange={setC('reorder_threshold')} min="0" />
            <Input label="Unit" value={consForm.unit} onChange={setC('unit')} placeholder="each" />
          </div>
          <Input label="Last Replenished" type="date" value={consForm.last_replenished} onChange={setC('last_replenished')} />
          <div className="flex gap-3 pt-2">
            <button onClick={() => setConsumableModal(false)} className="btn-outline flex-1">Cancel</button>
            <button onClick={saveConsumable} disabled={saving} className="btn-primary flex-1">{saving ? '…' : 'Save'}</button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
