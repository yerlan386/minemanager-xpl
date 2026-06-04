import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { format } from 'date-fns'
import { CheckCircle2, Download, ArrowLeft } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { dbUpsert, dbSelect } from '../../lib/supabase'
import { useAutoSave } from '../../hooks/useAutoSave'
import { Input, Select, VoiceTextarea, NumberInput } from '../../components/ui/FormField'
import { EMPLOYEES } from '../../data/employees'
import { SHIFT_TYPES } from '../../data/constants'
import { StatusBadge } from '../../components/ui/Badge'
import { generateHandoverPDF } from '../../lib/pdfExport'

const SUPERVISORS = EMPLOYEES.filter(e =>
  ['Owner', 'Mine Manager', 'Shift Supervisor'].includes(e.role)
).map(e => ({ value: e.id, label: e.name }))

const STATUS_OPTIONS = [
  { value: 'Normal',   label: '🟢 Normal' },
  { value: 'Caution',  label: '🟡 Caution' },
  { value: 'Critical', label: '🔴 Critical' }
]

const EMPTY = {
  date: format(new Date(), 'yyyy-MM-dd'),
  shift: 'Day',
  outgoing_supervisor_id: '',
  incoming_supervisor_id: '',
  ore_processed: '',
  gold_recovered_g: '',
  workers_on_site: '',
  incidents_summary: '',
  equipment_status: '',
  outstanding_tasks: '',
  safety_notes: '',
  overall_status: 'Normal'
}

export default function ShiftHandover() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const isNew = !id || id === 'new'
  const [form, setForm] = useState(EMPTY)
  const [submitted, setSubmitted] = useState(false)
  const [saving, setSaving] = useState(false)
  const [locked, setLocked] = useState(false)

  const { saveDraft, loadDraft, clearDraft } = useAutoSave(`handover_${id || 'new'}`, form)

  useEffect(() => {
    if (!isNew) {
      dbSelect('shift_handovers', { id }).then(({ data }) => {
        if (data?.[0]) { setForm(data[0]); setLocked(data[0].submitted) }
      })
    } else {
      const draft = loadDraft()
      if (draft?.data) setForm(draft.data)
    }
  }, [id])

  function set(field) {
    return e => setForm(p => ({ ...p, [field]: e.target.value }))
  }

  async function handleSave(submit = false) {
    setSaving(true)
    const record = {
      id: isNew ? crypto.randomUUID() : id,
      ...form,
      submitted: submit,
      submitted_by: submit ? user?.name : undefined,
      submitted_at: submit ? new Date().toISOString() : undefined,
      created_by: user?.name,
      created_at: new Date().toISOString()
    }
    await dbUpsert('shift_handovers', record)
    if (submit) { clearDraft(); setSubmitted(true); setLocked(true) }
    else saveDraft()
    setSaving(false)
    if (submit) setForm(record)
  }

  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center space-y-4">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
          <CheckCircle2 size={40} className="text-green-600" />
        </div>
        <h2 className="text-xl font-bold text-navy">Handover Submitted</h2>
        <p className="text-gray-500 text-sm">The incoming supervisor has been notified.</p>
        <div className="flex gap-3">
          <button onClick={() => navigate('/shift')} className="btn-outline">Back to Shift</button>
          <button onClick={() => generateHandoverPDF(form)} className="btn-primary gap-2">
            <Download size={18} /> Export PDF
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate('/shift')} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
          <ArrowLeft size={20} className="text-navy" />
        </button>
        <div>
          <h1 className="text-xl font-bold text-navy">{isNew ? 'New Handover' : 'Edit Handover'}</h1>
          {locked && <StatusBadge status="Submitted" />}
        </div>
      </div>

      {/* Page 1: Date & supervisors */}
      <div className="card space-y-4">
        <h3 className="font-bold text-navy text-sm uppercase tracking-wide">Shift Details</h3>
        <div className="grid grid-cols-2 gap-4">
          <Input label="Date" type="date" value={form.date} onChange={set('date')} required disabled={locked} />
          <Select label="Shift" value={form.shift} onChange={set('shift')} options={SHIFT_TYPES} required disabled={locked} />
        </div>
        <Select label="Outgoing Supervisor" value={form.outgoing_supervisor_id} onChange={set('outgoing_supervisor_id')}
          options={SUPERVISORS} placeholder="Select…" required disabled={locked} />
        <Select label="Incoming Supervisor" value={form.incoming_supervisor_id} onChange={set('incoming_supervisor_id')}
          options={SUPERVISORS} placeholder="Select…" required disabled={locked} />
      </div>

      {/* Page 2: Production numbers */}
      <div className="card space-y-4">
        <h3 className="font-bold text-navy text-sm uppercase tracking-wide">Production</h3>
        <div className="grid grid-cols-3 gap-3">
          <NumberInput label="Ore Processed" suffix="t" value={form.ore_processed} onChange={set('ore_processed')} placeholder="0" disabled={locked} min="0" step="0.1" />
          <NumberInput label="Gold Recovered" suffix="g" value={form.gold_recovered_g} onChange={set('gold_recovered_g')} placeholder="0.00" disabled={locked} min="0" step="0.01" />
          <NumberInput label="Workers On Site" value={form.workers_on_site} onChange={set('workers_on_site')} placeholder="0" disabled={locked} min="0" />
        </div>
      </div>

      {/* Page 3: Notes */}
      <div className="card space-y-4">
        <h3 className="font-bold text-navy text-sm uppercase tracking-wide">Shift Notes</h3>
        <VoiceTextarea label="Incidents Summary" name="incidents_summary" value={form.incidents_summary}
          onChange={set('incidents_summary')} placeholder="Any incidents or near-misses this shift…" disabled={locked} />
        <VoiceTextarea label="Equipment Status" name="equipment_status" value={form.equipment_status}
          onChange={set('equipment_status')} placeholder="Equipment condition and any issues…" disabled={locked} />
        <VoiceTextarea label="Outstanding Tasks" name="outstanding_tasks" value={form.outstanding_tasks}
          onChange={set('outstanding_tasks')} placeholder="Tasks to hand over to incoming shift…" disabled={locked} />
        <VoiceTextarea label="Safety Notes" name="safety_notes" value={form.safety_notes}
          onChange={set('safety_notes')} placeholder="Safety observations and instructions…" disabled={locked} />
      </div>

      {/* Page 4: Status */}
      <div className="card space-y-4">
        <h3 className="font-bold text-navy text-sm uppercase tracking-wide">Overall Status</h3>
        <div className="grid grid-cols-3 gap-3">
          {STATUS_OPTIONS.map(o => (
            <button
              key={o.value}
              type="button"
              disabled={locked}
              onClick={() => setForm(p => ({ ...p, overall_status: o.value }))}
              className={`py-3 px-3 rounded-xl border-2 text-sm font-semibold transition-all text-center ${
                form.overall_status === o.value
                  ? o.value === 'Normal' ? 'border-green-500 bg-green-50 text-green-700'
                    : o.value === 'Caution' ? 'border-amber-500 bg-amber-50 text-amber-700'
                    : 'border-red-500 bg-red-50 text-red-700'
                  : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
              }`}
            >
              {o.label}
            </button>
          ))}
        </div>
      </div>

      {!locked && (
        <div className="flex gap-3 pb-2">
          <button onClick={() => handleSave(false)} disabled={saving} className="btn-outline flex-1">
            Save Draft
          </button>
          <button onClick={() => handleSave(true)} disabled={saving} className="btn-primary flex-1">
            {saving ? 'Submitting…' : 'Submit Handover'}
          </button>
        </div>
      )}
    </div>
  )
}
