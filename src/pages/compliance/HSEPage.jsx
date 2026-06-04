import { useState, useEffect } from 'react'
import { format } from 'date-fns'
import { Plus, Shield, AlertTriangle, HeartPulse, Package } from 'lucide-react'
import { useLocalData } from '../../hooks/useLocalData'
import { Select, Input, VoiceTextarea, NumberInput } from '../../components/ui/FormField'
import { StatusBadge, Badge } from '../../components/ui/Badge'
import { Modal } from '../../components/ui/Modal'
import { EmptyState } from '../../components/ui/EmptyState'
import { EMPLOYEES } from '../../data/employees'
import { INCIDENT_TYPES, SEVERITY_LEVELS, INCIDENT_STATUSES, PPE_ITEMS, SHIFT_TYPES } from '../../data/constants'

const INCIDENT_EMPTY = {
  date: format(new Date(), 'yyyy-MM-dd'),
  time: format(new Date(), 'HH:mm'),
  type: 'Incident', severity: 'Low', location: '',
  description: '', persons_involved: '', witnesses: '',
  immediate_action: '', corrective_action: '',
  follow_up_date: '', status: 'Open'
}

const TOOLBOX_EMPTY = {
  date: format(new Date(), 'yyyy-MM-dd'),
  shift: 'Day', topic: '', attendees: [], supervisor: '', notes: ''
}

const FIRSTAID_EMPTY = {
  date: format(new Date(), 'yyyy-MM-dd'),
  employee_id: '', nature: '', treated_by: '', referred_to_hospital: 'No'
}

const PPE_EMPTY = {
  employee_id: '', ppe_item: '', date_issued: format(new Date(), 'yyyy-MM-dd'),
  size_spec: '', condition: 'New', issued_by: ''
}

export default function HSEPage() {
  const { rows: incidents, upsert: upsertIncident } = useLocalData('incidents')
  const { rows: toolbox, upsert: upsertToolbox } = useLocalData('toolbox_talks')
  const { rows: firstaid, upsert: upsertFirstAid } = useLocalData('first_aid_log')
  const { rows: ppe, upsert: upsertPPE } = useLocalData('ppe_issuance')
  const [tab, setTab] = useState('incidents')
  const [modal, setModal] = useState(false)
  const [form, setForm] = useState(INCIDENT_EMPTY)
  const [saving, setSaving] = useState(false)
  const [employees, setEmployees] = useState([])

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem('mm_employees') || '[]')
    setEmployees(stored.length ? stored : EMPLOYEES)
  }, [])

  const tabs = [
    { key: 'incidents', label: 'Incidents', icon: AlertTriangle },
    { key: 'toolbox',   label: 'Toolbox',   icon: Shield },
    { key: 'firstaid',  label: 'First Aid', icon: HeartPulse },
    { key: 'ppe',       label: 'PPE',       icon: Package }
  ]

  const empName = id => employees.find(e => e.id === id)?.name || id

  function set(f) { return e => setForm(p => ({ ...p, [f]: e.target.value })) }

  function openNew() {
    const empty = tab === 'incidents' ? INCIDENT_EMPTY :
      tab === 'toolbox' ? TOOLBOX_EMPTY :
      tab === 'firstaid' ? FIRSTAID_EMPTY : PPE_EMPTY
    setForm(empty)
    setModal(true)
  }

  async function handleSave() {
    setSaving(true)
    const upsert = tab === 'incidents' ? upsertIncident :
      tab === 'toolbox' ? upsertToolbox :
      tab === 'firstaid' ? upsertFirstAid : upsertPPE
    await upsert({ ...form, id: form.id || crypto.randomUUID() })
    setSaving(false)
    setModal(false)
  }

  const sevColor = { Low: 'gray', Medium: 'amber', High: 'orange', Critical: 'red' }
  const openIncidents = incidents.filter(i => i.status === 'Open')

  return (
    <div className="space-y-4">
      {openIncidents.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-2xl px-4 py-3 flex items-center gap-2">
          <AlertTriangle size={18} className="text-red-600 shrink-0" />
          <p className="text-sm font-semibold text-red-700">{openIncidents.length} open incident{openIncidents.length !== 1 ? 's' : ''}</p>
        </div>
      )}

      <div className="flex gap-1 overflow-x-auto pb-1 -mx-1 px-1">
        {tabs.map(({ key, label }) => (
          <button key={key} onClick={() => setTab(key)}
            className={`shrink-0 px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${
              tab === key ? 'bg-navy text-white' : 'bg-gray-100 text-gray-600'
            }`}>{label}</button>
        ))}
      </div>

      <button onClick={openNew} className="btn-primary w-full gap-2">
        <Plus size={18} /> {tab === 'incidents' ? 'Report Incident / Near-Miss' : tab === 'toolbox' ? 'Log Toolbox Talk' : tab === 'firstaid' ? 'Log First Aid' : 'Issue PPE'}
      </button>

      {/* Incidents list */}
      {tab === 'incidents' && (
        <div className="space-y-2">
          {incidents.length === 0 ? (
            <EmptyState icon={Shield} title="No incidents recorded" description="All clear. Log any incidents or near-misses here." />
          ) : [...incidents].reverse().map(inc => (
            <button key={inc.id} onClick={() => { setForm(inc); setModal(true) }}
              className="card w-full text-left hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between gap-2 mb-1">
                <div>
                  <p className="font-semibold text-sm text-navy">{inc.type}</p>
                  <p className="text-xs text-gray-500">{inc.date} {inc.time} · {inc.location}</p>
                </div>
                <div className="flex gap-1.5 shrink-0">
                  <Badge color={sevColor[inc.severity] || 'gray'}>{inc.severity}</Badge>
                  <StatusBadge status={inc.status} />
                </div>
              </div>
              <p className="text-sm text-gray-600 line-clamp-2">{inc.description}</p>
            </button>
          ))}
        </div>
      )}

      {/* Toolbox talks */}
      {tab === 'toolbox' && (
        <div className="space-y-2">
          {toolbox.length === 0 ? (
            <EmptyState icon={Shield} title="No toolbox talks recorded" />
          ) : [...toolbox].reverse().map(t => (
            <div key={t.id} className="card">
              <div className="flex items-center justify-between mb-1">
                <p className="font-semibold text-sm text-navy">{t.topic}</p>
                <span className="text-xs bg-navy/10 text-navy px-2 py-0.5 rounded-full">{t.shift} Shift</span>
              </div>
              <p className="text-xs text-gray-500">{t.date} · {t.supervisor}</p>
              {t.attendees?.length > 0 && (
                <p className="text-xs text-gray-500 mt-1">{t.attendees.length} attendees</p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* First aid */}
      {tab === 'firstaid' && (
        <div className="space-y-2">
          {firstaid.length === 0 ? (
            <EmptyState icon={HeartPulse} title="No first aid records" />
          ) : [...firstaid].reverse().map(r => (
            <div key={r.id} className="card">
              <p className="font-semibold text-sm text-navy">{empName(r.employee_id)}</p>
              <p className="text-xs text-gray-500">{r.date} · Treated by: {r.treated_by}</p>
              <p className="text-sm text-gray-600 mt-1">{r.nature}</p>
              {r.referred_to_hospital === 'Yes' && (
                <Badge color="red" className="mt-1">Referred to Hospital</Badge>
              )}
            </div>
          ))}
        </div>
      )}

      {/* PPE */}
      {tab === 'ppe' && (
        <div className="space-y-2">
          {ppe.length === 0 ? (
            <EmptyState icon={Package} title="No PPE records" />
          ) : [...ppe].reverse().map(r => (
            <div key={r.id} className="card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-sm text-navy">{empName(r.employee_id)}</p>
                  <p className="text-xs text-gray-500">{r.ppe_item}{r.size_spec ? ` · ${r.size_spec}` : ''}</p>
                </div>
                <Badge color={r.condition === 'New' ? 'green' : 'amber'}>{r.condition}</Badge>
              </div>
              <p className="text-xs text-gray-400 mt-1">{r.date_issued} · Issued by: {r.issued_by}</p>
            </div>
          ))}
        </div>
      )}

      {/* Modal — dynamically renders based on tab */}
      <Modal open={modal} onClose={() => setModal(false)}
        title={tab === 'incidents' ? 'Incident / Near-Miss Report' : tab === 'toolbox' ? 'Toolbox Talk' : tab === 'firstaid' ? 'First Aid Log' : 'PPE Issuance'}>
        <div className="space-y-4">
          {tab === 'incidents' && <>
            <div className="grid grid-cols-2 gap-3">
              <Input label="Date" type="date" value={form.date || ''} onChange={set('date')} required />
              <Input label="Time" type="time" value={form.time || ''} onChange={set('time')} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Select label="Type" value={form.type || ''} onChange={set('type')} options={INCIDENT_TYPES} />
              <Select label="Severity" value={form.severity || ''} onChange={set('severity')} options={SEVERITY_LEVELS} />
            </div>
            <Input label="Location" value={form.location || ''} onChange={set('location')} placeholder="Where did this occur?" required />
            <VoiceTextarea label="Description" name="inc_desc" value={form.description || ''} onChange={set('description')} rows={3} required />
            <Input label="Persons Involved" value={form.persons_involved || ''} onChange={set('persons_involved')} placeholder="Names" />
            <Input label="Witnesses" value={form.witnesses || ''} onChange={set('witnesses')} placeholder="Names" />
            <VoiceTextarea label="Immediate Action Taken" name="immediate_action" value={form.immediate_action || ''} onChange={set('immediate_action')} rows={2} />
            <VoiceTextarea label="Corrective Action" name="corrective_action" value={form.corrective_action || ''} onChange={set('corrective_action')} rows={2} />
            <div className="grid grid-cols-2 gap-3">
              <Input label="Follow-up Date" type="date" value={form.follow_up_date || ''} onChange={set('follow_up_date')} />
              <Select label="Status" value={form.status || 'Open'} onChange={set('status')} options={INCIDENT_STATUSES} />
            </div>
          </>}

          {tab === 'toolbox' && <>
            <div className="grid grid-cols-2 gap-3">
              <Input label="Date" type="date" value={form.date || ''} onChange={set('date')} required />
              <Select label="Shift" value={form.shift || 'Day'} onChange={set('shift')} options={SHIFT_TYPES} />
            </div>
            <Input label="Topic" value={form.topic || ''} onChange={set('topic')} required placeholder="Toolbox talk topic" />
            <Input label="Supervisor Sign-off" value={form.supervisor || ''} onChange={set('supervisor')} placeholder="Supervisor name" required />
            <div>
              <label className="form-label">Attendees</label>
              <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto bg-gray-50 rounded-xl p-3">
                {employees.filter(e => e.status === 'Active').map(e => (
                  <label key={e.id} className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" className="rounded"
                      checked={(form.attendees || []).includes(e.id)}
                      onChange={ev => setForm(p => ({
                        ...p, attendees: ev.target.checked
                          ? [...(p.attendees || []), e.id]
                          : (p.attendees || []).filter(x => x !== e.id)
                      }))} />
                    <span className="text-sm">{e.name}</span>
                  </label>
                ))}
              </div>
            </div>
            <VoiceTextarea label="Notes" name="toolbox_notes" value={form.notes || ''} onChange={set('notes')} rows={2} />
          </>}

          {tab === 'firstaid' && <>
            <Input label="Date" type="date" value={form.date || ''} onChange={set('date')} required />
            <Select label="Employee" value={form.employee_id || ''} onChange={set('employee_id')}
              options={employees.map(e => ({ value: e.id, label: e.name }))} placeholder="Select…" required />
            <VoiceTextarea label="Nature of Treatment" name="fa_nature" value={form.nature || ''} onChange={set('nature')} rows={2} required />
            <Input label="Treated By" value={form.treated_by || ''} onChange={set('treated_by')} required />
            <Select label="Referred to Hospital?" value={form.referred_to_hospital || 'No'} onChange={set('referred_to_hospital')}
              options={['No', 'Yes']} />
          </>}

          {tab === 'ppe' && <>
            <Select label="Employee" value={form.employee_id || ''} onChange={set('employee_id')}
              options={employees.map(e => ({ value: e.id, label: e.name }))} placeholder="Select…" required />
            <Select label="PPE Item" value={form.ppe_item || ''} onChange={set('ppe_item')}
              options={PPE_ITEMS} placeholder="Select item…" required />
            <div className="grid grid-cols-2 gap-3">
              <Input label="Date Issued" type="date" value={form.date_issued || ''} onChange={set('date_issued')} />
              <Input label="Size/Spec" value={form.size_spec || ''} onChange={set('size_spec')} placeholder="e.g. L, size 10" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Select label="Condition" value={form.condition || 'New'} onChange={set('condition')} options={['New', 'Used']} />
              <Input label="Issued By" value={form.issued_by || ''} onChange={set('issued_by')} placeholder="Name" required />
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
