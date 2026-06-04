import { useState } from 'react'
import { format } from 'date-fns'
import { Lock, Plus, ShieldAlert, CheckCircle2 } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useLocalData } from '../../hooks/useLocalData'
import { Select, Input, NumberInput } from '../../components/ui/FormField'
import { Modal } from '../../components/ui/Modal'
import { Badge } from '../../components/ui/Badge'
import { EMPLOYEES } from '../../data/employees'
import { SHIFT_TYPES } from '../../data/constants'

// Hard-coded access — no exceptions per spec
const ALLOWED_ROLES = ['Owner', 'Mine Manager', 'Metallurgist']

const CLEANUP_EMPTY = {
  date: format(new Date(), 'yyyy-MM-dd'),
  shift: 'Day',
  sluice_cleaned_by: '', witness_1: '', witness_2: '',
  concentrate_weight_kg: '', notes: ''
}

const POUR_EMPTY = {
  date: format(new Date(), 'yyyy-MM-dd'),
  gross_weight_g: '', fine_gold_estimate_g: '',
  pour_date: '', supervisor_present: '', witness_present: '', notes: ''
}

const CUSTODY_EMPTY = {
  date: format(new Date(), 'yyyy-MM-dd'),
  transfer_type: 'To Fidelity Printers',
  weight_g: '', recipient_name: '', receipt_reference: '',
  handed_over_by: '', received_by: ''
}

const TRANSFER_TYPES = ['To Fidelity Printers', 'To Buyer', 'Internal Transfer']

function GoldRecordCard({ title, items, fields }) {
  return (
    <div className="card">
      <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-3">{title}</p>
      {items.length === 0 ? (
        <p className="text-sm text-gray-400 text-center py-4">No records yet</p>
      ) : (
        <div className="space-y-3">
          {[...items].reverse().slice(0, 5).map(item => (
            <div key={item.id} className="border-b border-gray-100 pb-3 last:border-0 last:pb-0">
              {fields.map(f => (
                <div key={f.key} className="flex justify-between text-sm mb-0.5">
                  <span className="text-gray-500">{f.label}</span>
                  <span className={`font-semibold text-navy ${f.highlight ? 'text-gold text-base' : ''}`}>
                    {item[f.key] ?? '—'}{f.suffix ? ` ${f.suffix}` : ''}
                  </span>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default function GoldRoom() {
  const { user } = useAuth()
  const { rows: cleanups, upsert: upsertCleanup } = useLocalData('goldroom_cleanups')
  const { rows: pours, upsert: upsertPour } = useLocalData('goldroom_pours')
  const { rows: custody, upsert: upsertCustody } = useLocalData('goldroom_custody')
  const [tab, setTab] = useState('cleanup')
  const [modal, setModal] = useState(false)
  const [form, setForm] = useState({})
  const [saving, setSaving] = useState(false)
  const [confirmed, setConfirmed] = useState(false)

  if (!ALLOWED_ROLES.includes(user?.role)) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
        <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center">
          <ShieldAlert size={36} className="text-red-600" />
        </div>
        <h2 className="text-xl font-bold text-navy">Access Restricted</h2>
        <p className="text-gray-500 text-sm max-w-xs">
          Gold Room access is restricted to Owner, Mine Manager, and Metallurgist roles only.
        </p>
      </div>
    )
  }

  const supervisors = EMPLOYEES.filter(e => ['Owner', 'Mine Manager', 'Shift Supervisor', 'Metallurgist'].includes(e.role))
    .map(e => ({ value: e.name, label: e.name }))

  function set(f) { return e => setForm(p => ({ ...p, [f]: e.target.value })) }

  function openNew() {
    const empty = tab === 'cleanup' ? CLEANUP_EMPTY : tab === 'pour' ? POUR_EMPTY : CUSTODY_EMPTY
    setForm(empty)
    setConfirmed(false)
    setModal(true)
  }

  async function handleSubmit() {
    // Validate witnesses for cleanup
    if (tab === 'cleanup' && (!form.witness_1 || !form.witness_2)) {
      alert('Both witnesses are required for sluice clean-up records.')
      return
    }
    setSaving(true)
    const record = {
      ...form,
      id: crypto.randomUUID(),
      submitted_by: user?.name,
      submitted_at: new Date().toISOString(),
      locked: true
    }
    const upsert = tab === 'cleanup' ? upsertCleanup : tab === 'pour' ? upsertPour : upsertCustody
    await upsert(record)
    setSaving(false)
    setModal(false)
    setConfirmed(true)
    setTimeout(() => setConfirmed(false), 3000)
  }

  const tabs = [
    { key: 'cleanup', label: 'Clean-Up' },
    { key: 'pour', label: 'Pour Record' },
    { key: 'custody', label: 'Chain of Custody' }
  ]

  const totalFineGold = pours.reduce((s, p) => s + (parseFloat(p.fine_gold_estimate_g) || 0), 0)

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-navy rounded-2xl px-5 py-4 flex items-center gap-4">
        <div className="w-12 h-12 bg-gold rounded-xl flex items-center justify-center shrink-0">
          <Lock size={24} className="text-navy" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-white">Gold Room</h1>
          <p className="text-gold text-xs font-semibold">RESTRICTED — {user?.role}</p>
        </div>
      </div>

      {confirmed && (
        <div className="flex items-center gap-3 bg-green-50 border border-green-200 rounded-2xl px-4 py-3">
          <CheckCircle2 size={20} className="text-green-600" />
          <p className="text-sm font-semibold text-green-700">Record submitted and locked.</p>
        </div>
      )}

      {/* KPI */}
      <div className="grid grid-cols-3 gap-3">
        <div className="card text-center">
          <p className="text-xs text-gray-500">Clean-Ups</p>
          <p className="text-2xl font-bold text-navy">{cleanups.length}</p>
        </div>
        <div className="card text-center">
          <p className="text-xs text-gray-500">Pours</p>
          <p className="text-2xl font-bold text-navy">{pours.length}</p>
        </div>
        <div className="card text-center">
          <p className="text-xs text-gray-500">Total Fine Gold</p>
          <p className="text-xl font-bold text-gold">{totalFineGold.toFixed(1)}g</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 rounded-xl p-1">
        {tabs.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`flex-1 py-2 text-sm font-semibold rounded-xl transition-colors ${
              tab === t.key ? 'bg-navy text-white' : 'text-gray-500'
            }`}>{t.label}</button>
        ))}
      </div>

      <button onClick={openNew} className="btn-gold w-full gap-2">
        <Plus size={18} /> New {tab === 'cleanup' ? 'Clean-Up Log' : tab === 'pour' ? 'Pour Record' : 'Chain of Custody'}
      </button>

      {/* Records */}
      {tab === 'cleanup' && (
        <GoldRecordCard title="Sluice Clean-Up Log" items={cleanups} fields={[
          { key: 'date', label: 'Date' },
          { key: 'shift', label: 'Shift' },
          { key: 'sluice_cleaned_by', label: 'Cleaned By' },
          { key: 'concentrate_weight_kg', label: 'Concentrate', suffix: 'kg', highlight: true },
          { key: 'witness_1', label: 'Witness 1' },
          { key: 'witness_2', label: 'Witness 2' }
        ]} />
      )}

      {tab === 'pour' && (
        <GoldRecordCard title="Pour Records" items={pours} fields={[
          { key: 'date', label: 'Date' },
          { key: 'gross_weight_g', label: 'Gross Weight', suffix: 'g' },
          { key: 'fine_gold_estimate_g', label: 'Fine Gold Est.', suffix: 'g', highlight: true },
          { key: 'supervisor_present', label: 'Supervisor' },
          { key: 'witness_present', label: 'Witness' }
        ]} />
      )}

      {tab === 'custody' && (
        <GoldRecordCard title="Chain of Custody" items={custody} fields={[
          { key: 'date', label: 'Date' },
          { key: 'transfer_type', label: 'Transfer Type' },
          { key: 'weight_g', label: 'Weight', suffix: 'g', highlight: true },
          { key: 'recipient_name', label: 'Recipient' },
          { key: 'receipt_reference', label: 'Receipt Ref.' },
          { key: 'handed_over_by', label: 'Handed Over By' }
        ]} />
      )}

      {/* Submit Modal — Gold Room: No draft saves, all fields mandatory */}
      <Modal open={modal} onClose={() => setModal(false)} size="md"
        title={tab === 'cleanup' ? '🔒 Sluice Clean-Up Log' : tab === 'pour' ? '🔒 Pour Record' : '🔒 Chain of Custody'}>
        <div className="bg-amber-50 border border-amber-200 rounded-xl px-3 py-2 mb-4">
          <p className="text-xs font-semibold text-amber-700">
            All fields mandatory. Record is locked on submission — no drafts.
          </p>
        </div>
        <div className="space-y-4">
          {tab === 'cleanup' && <>
            <div className="grid grid-cols-2 gap-3">
              <Input label="Date" type="date" value={form.date || ''} onChange={set('date')} required />
              <Select label="Shift" value={form.shift || 'Day'} onChange={set('shift')} options={SHIFT_TYPES} required />
            </div>
            <Select label="Sluice Cleaned By" value={form.sluice_cleaned_by || ''} onChange={set('sluice_cleaned_by')}
              options={supervisors} placeholder="Select…" required />
            <Select label="Witness 1 *Required*" value={form.witness_1 || ''} onChange={set('witness_1')}
              options={supervisors} placeholder="Select…" required />
            <Select label="Witness 2 *Required*" value={form.witness_2 || ''} onChange={set('witness_2')}
              options={supervisors} placeholder="Select…" required />
            <NumberInput label="Concentrate Weight" suffix="kg" value={form.concentrate_weight_kg || ''}
              onChange={set('concentrate_weight_kg')} step="0.01" required />
            <Input label="Notes" value={form.notes || ''} onChange={set('notes')} placeholder="Any observations" />
          </>}

          {tab === 'pour' && <>
            <Input label="Date" type="date" value={form.date || ''} onChange={set('date')} required />
            <div className="grid grid-cols-2 gap-3">
              <NumberInput label="Gross Weight" suffix="g" value={form.gross_weight_g || ''} onChange={set('gross_weight_g')} step="0.01" required />
              <NumberInput label="Fine Gold Est." suffix="g" value={form.fine_gold_estimate_g || ''} onChange={set('fine_gold_estimate_g')} step="0.01" required />
            </div>
            <Input label="Date of Pour" type="date" value={form.pour_date || ''} onChange={set('pour_date')} required />
            <Select label="Supervisor Present" value={form.supervisor_present || ''} onChange={set('supervisor_present')}
              options={supervisors} placeholder="Select…" required />
            <Select label="Witness Present" value={form.witness_present || ''} onChange={set('witness_present')}
              options={supervisors} placeholder="Select…" required />
            <Input label="Notes" value={form.notes || ''} onChange={set('notes')} placeholder="Any observations" />
          </>}

          {tab === 'custody' && <>
            <Input label="Date" type="date" value={form.date || ''} onChange={set('date')} required />
            <Select label="Transfer Type" value={form.transfer_type || ''} onChange={set('transfer_type')}
              options={TRANSFER_TYPES} required />
            <NumberInput label="Weight" suffix="g" value={form.weight_g || ''} onChange={set('weight_g')} step="0.01" required />
            <Input label="Recipient Name" value={form.recipient_name || ''} onChange={set('recipient_name')} required />
            <Input label="Receipt Reference" value={form.receipt_reference || ''} onChange={set('receipt_reference')} required />
            <div className="grid grid-cols-2 gap-3">
              <Select label="Handed Over By" value={form.handed_over_by || ''} onChange={set('handed_over_by')}
                options={supervisors} placeholder="Select…" required />
              <Input label="Received By (signature)" value={form.received_by || ''} onChange={set('received_by')} required />
            </div>
          </>}

          <div className="bg-red-50 border border-red-200 rounded-xl px-3 py-2">
            <p className="text-xs text-red-700 font-medium">
              ⚠ This record will be permanently locked upon submission and cannot be edited.
            </p>
          </div>
          <div className="flex gap-3 pt-1">
            <button onClick={() => setModal(false)} className="btn-outline flex-1">Cancel</button>
            <button onClick={handleSubmit} disabled={saving} className="btn-gold flex-1 font-bold">
              {saving ? 'Submitting…' : '🔒 Submit & Lock'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
