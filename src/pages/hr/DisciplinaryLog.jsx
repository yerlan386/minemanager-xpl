import { useState, useEffect } from 'react'
import { format } from 'date-fns'
import { Plus, AlertTriangle, Star, FileText } from 'lucide-react'
import { useLocalData } from '../../hooks/useLocalData'
import { Select, Input, VoiceTextarea } from '../../components/ui/FormField'
import { Badge } from '../../components/ui/Badge'
import { Modal } from '../../components/ui/Modal'
import { EMPLOYEES } from '../../data/employees'
import { DISCIPLINARY_TYPES } from '../../data/constants'

const EMPTY = {
  employee_id: '', date: format(new Date(), 'yyyy-MM-dd'),
  type: 'Verbal Warning', description: '', manager_name: '', manager_date: ''
}

const typeColor = {
  'Verbal Warning': 'amber', 'Written Warning': 'red', 'Incident': 'red',
  'Commendation': 'green', 'Other': 'gray'
}
const typeIcon = { 'Commendation': Star, 'Incident': AlertTriangle }

export default function DisciplinaryLog() {
  const { rows, upsert } = useLocalData('disciplinary')
  const [employees, setEmployees] = useState([])
  const [modal, setModal] = useState(false)
  const [form, setForm] = useState(EMPTY)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem('mm_employees') || '[]')
    setEmployees(stored.length ? stored : EMPLOYEES)
  }, [])

  function set(f) { return e => setForm(p => ({ ...p, [f]: e.target.value })) }
  const empName = id => employees.find(e => e.id === id)?.name || id

  async function handleSave() {
    setSaving(true)
    await upsert({ ...form, id: crypto.randomUUID() })
    setSaving(false)
    setModal(false)
  }

  const sorted = [...rows].sort((a, b) => new Date(b.date) - new Date(a.date))

  return (
    <div className="space-y-4">
      <button onClick={() => { setForm(EMPTY); setModal(true) }} className="btn-primary w-full gap-2">
        <Plus size={18} /> Add HR Note
      </button>

      <div className="space-y-3">
        {sorted.map(r => {
          const Icon = typeIcon[r.type] || FileText
          return (
            <div key={r.id} className="card">
              <div className="flex items-start gap-3">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                  r.type === 'Commendation' ? 'bg-green-100' : r.type.includes('Warning') || r.type === 'Incident' ? 'bg-red-100' : 'bg-gray-100'
                }`}>
                  <Icon size={18} className={r.type === 'Commendation' ? 'text-green-600' : r.type.includes('Warning') ? 'text-red-600' : 'text-gray-600'} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <p className="font-semibold text-sm text-navy">{empName(r.employee_id)}</p>
                    <Badge color={typeColor[r.type] || 'gray'}>{r.type}</Badge>
                  </div>
                  <p className="text-xs text-gray-500 mb-1">{r.date}</p>
                  <p className="text-sm text-gray-700">{r.description}</p>
                  {r.manager_name && (
                    <p className="text-xs text-gray-400 mt-1.5">Sign-off: {r.manager_name} · {r.manager_date}</p>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      <Modal open={modal} onClose={() => setModal(false)} title="HR Note">
        <div className="space-y-4">
          <Select label="Employee" value={form.employee_id} onChange={set('employee_id')}
            options={employees.map(e => ({ value: e.id, label: e.name }))} placeholder="Select…" required />
          <div className="grid grid-cols-2 gap-3">
            <Input label="Date" type="date" value={form.date} onChange={set('date')} required />
            <Select label="Type" value={form.type} onChange={set('type')} options={DISCIPLINARY_TYPES} />
          </div>
          <VoiceTextarea label="Description" name="description" value={form.description}
            onChange={set('description')} placeholder="Details of the incident or note…" required rows={4} />
          <div className="grid grid-cols-2 gap-3">
            <Input label="Manager Sign-off" value={form.manager_name} onChange={set('manager_name')} placeholder="Name" />
            <Input label="Sign-off Date" type="date" value={form.manager_date} onChange={set('manager_date')} />
          </div>
          <div className="flex gap-3 pt-2">
            <button onClick={() => setModal(false)} className="btn-outline flex-1">Cancel</button>
            <button onClick={handleSave} disabled={saving} className="btn-primary flex-1">{saving ? '…' : 'Save'}</button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
