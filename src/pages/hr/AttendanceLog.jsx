import { useState, useEffect } from 'react'
import { format } from 'date-fns'
import { Plus } from 'lucide-react'
import { useLocalData } from '../../hooks/useLocalData'
import { Select, Input, NumberInput } from '../../components/ui/FormField'
import { Badge } from '../../components/ui/Badge'
import { Modal } from '../../components/ui/Modal'
import { EMPLOYEES } from '../../data/employees'
import { SHIFT_TYPES, ATTENDANCE_STATUSES } from '../../data/constants'

const EMPTY = {
  date: format(new Date(), 'yyyy-MM-dd'),
  shift: 'Day', employee_id: '',
  status: 'Present', hours_worked: '12', notes: ''
}

const statusColor = { Present: 'green', Absent: 'red', Late: 'amber', 'Half Day': 'orange' }

export default function AttendanceLog() {
  const { rows, upsert } = useLocalData('attendance')
  const [employees, setEmployees] = useState([])
  const [filterDate, setFilterDate] = useState(format(new Date(), 'yyyy-MM-dd'))
  const [modal, setModal] = useState(false)
  const [form, setForm] = useState(EMPTY)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem('mm_employees') || '[]')
    setEmployees(stored.length ? stored : EMPLOYEES)
  }, [])

  const filtered = rows.filter(r => r.date === filterDate)
  function set(f) { return e => setForm(p => ({ ...p, [f]: e.target.value })) }

  async function handleSave() {
    setSaving(true)
    await upsert({ ...form, id: form.id || crypto.randomUUID() })
    setSaving(false)
    setModal(false)
  }

  const empName = id => employees.find(e => e.id === id)?.name || id

  return (
    <div className="space-y-4">
      <div className="flex gap-3">
        <Input label="" type="date" value={filterDate} onChange={e => setFilterDate(e.target.value)}
          className="flex-1" />
        <button onClick={() => { setForm(EMPTY); setModal(true) }} className="btn-primary px-4 py-2.5 gap-1 text-sm shrink-0 self-end">
          <Plus size={16} /> Log
        </button>
      </div>

      <div className="space-y-2">
        {filtered.length === 0 ? (
          <p className="text-center text-gray-400 py-8 text-sm">No attendance records for this date.</p>
        ) : filtered.map(r => (
          <div key={r.id} className="card flex items-center justify-between gap-3">
            <div>
              <p className="font-semibold text-sm text-navy">{empName(r.employee_id)}</p>
              <p className="text-xs text-gray-500">{r.shift} · {r.hours_worked}hrs</p>
              {r.notes && <p className="text-xs text-gray-400 mt-0.5">{r.notes}</p>}
            </div>
            <Badge color={statusColor[r.status] || 'gray'}>{r.status}</Badge>
          </div>
        ))}
      </div>

      <Modal open={modal} onClose={() => setModal(false)} title="Log Attendance">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Input label="Date" type="date" value={form.date} onChange={set('date')} required />
            <Select label="Shift" value={form.shift} onChange={set('shift')} options={SHIFT_TYPES} />
          </div>
          <Select label="Employee" value={form.employee_id} onChange={set('employee_id')}
            options={employees.map(e => ({ value: e.id, label: e.name }))} placeholder="Select…" required />
          <Select label="Status" value={form.status} onChange={set('status')} options={ATTENDANCE_STATUSES} />
          <NumberInput label="Hours Worked" suffix="hrs" value={form.hours_worked} onChange={set('hours_worked')} step="0.5" min="0" max="24" />
          <div className="flex gap-3 pt-2">
            <button onClick={() => setModal(false)} className="btn-outline flex-1">Cancel</button>
            <button onClick={handleSave} disabled={saving} className="btn-primary flex-1">{saving ? '…' : 'Save'}</button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
