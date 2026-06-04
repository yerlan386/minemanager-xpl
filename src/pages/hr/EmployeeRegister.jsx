import { useState, useEffect } from 'react'
import { Plus, Search, ChevronRight, X } from 'lucide-react'
import { useLocalData } from '../../hooks/useLocalData'
import { Input, Select, NumberInput } from '../../components/ui/FormField'
import { StatusBadge, Badge } from '../../components/ui/Badge'
import { Modal } from '../../components/ui/Modal'
import { Button } from '../../components/ui/Button'
import { EMPLOYEES, ROLES, DEPARTMENTS } from '../../data/employees'
import { EMPLOYMENT_TYPES, EMPLOYEE_STATUSES } from '../../data/constants'
import { format } from 'date-fns'

// Seed employees into storage on first load
function seedEmployees() {
  const key = 'mm_employees'
  if (!localStorage.getItem(key)) {
    localStorage.setItem(key, JSON.stringify(EMPLOYEES.map(e => ({
      ...e, created_at: new Date().toISOString()
    }))))
  }
}

const EMPTY = {
  name: '', role: '', department: '', reportsTo: '',
  employmentType: 'Monthly', startDate: format(new Date(), 'yyyy-MM-dd'),
  endDate: '', monthlyRate: '', status: 'Active'
}

export default function EmployeeRegister() {
  seedEmployees()
  const { rows: employees, upsert, reload } = useLocalData('employees')
  const [search, setSearch] = useState('')
  const [modal, setModal] = useState(false)
  const [form, setForm] = useState(EMPTY)
  const [editId, setEditId] = useState(null)
  const [saving, setSaving] = useState(false)

  const filtered = employees.filter(e =>
    e.name?.toLowerCase().includes(search.toLowerCase()) ||
    e.role?.toLowerCase().includes(search.toLowerCase())
  )

  function openNew() { setForm(EMPTY); setEditId(null); setModal(true) }
  function openEdit(emp) { setForm({ ...EMPTY, ...emp }); setEditId(emp.id); setModal(true) }
  function set(f) { return e => setForm(p => ({ ...p, [f]: e.target.value })) }

  async function handleSave() {
    setSaving(true)
    await upsert({ ...form, id: editId || crypto.randomUUID() })
    setSaving(false)
    setModal(false)
  }

  const statusColor = { Active: 'green', Inactive: 'gray', Outsourced: 'blue' }

  return (
    <div className="space-y-4">
      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input className="form-input pl-9 py-2.5 text-sm" placeholder="Search employees…"
            value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <button onClick={openNew} className="btn-primary px-4 py-2.5 gap-1.5 text-sm">
          <Plus size={16} /> Add
        </button>
      </div>

      <div className="space-y-2">
        {filtered.map(emp => (
          <button key={emp.id} onClick={() => openEdit(emp)}
            className="card w-full text-left flex items-center justify-between gap-3 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-navy text-white flex items-center justify-center font-bold text-sm shrink-0">
                {emp.name?.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="font-semibold text-navy text-sm">{emp.name}</p>
                <p className="text-xs text-gray-500">{emp.role} · {emp.department}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge color={statusColor[emp.status] || 'gray'}>{emp.status}</Badge>
              {emp.monthlyRate > 0 && <span className="text-xs text-gray-500 hidden sm:block">${emp.monthlyRate}/mo</span>}
              <ChevronRight size={16} className="text-gray-400" />
            </div>
          </button>
        ))}
      </div>

      <Modal open={modal} onClose={() => setModal(false)} title={editId ? 'Edit Employee' : 'Add Employee'}>
        <div className="space-y-4">
          <Input label="Full Name" value={form.name} onChange={set('name')} required placeholder="Full name" />
          <Select label="Role" value={form.role} onChange={set('role')} options={ROLES} placeholder="Select role…" required />
          <Select label="Department" value={form.department} onChange={set('department')} options={DEPARTMENTS} placeholder="Select department…" required />
          <Select label="Reports To" value={form.reportsTo} onChange={set('reportsTo')}
            options={employees.map(e => ({ value: e.id, label: e.name }))} placeholder="Select manager…" />
          <div className="grid grid-cols-2 gap-4">
            <Select label="Employment Type" value={form.employmentType} onChange={set('employmentType')} options={EMPLOYMENT_TYPES} />
            <Select label="Status" value={form.status} onChange={set('status')} options={EMPLOYEE_STATUSES} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Start Date" type="date" value={form.startDate} onChange={set('startDate')} />
            <Input label="End Date" type="date" value={form.endDate} onChange={set('endDate')} />
          </div>
          <NumberInput label="Monthly Rate (USD)" prefix="$" value={form.monthlyRate} onChange={set('monthlyRate')} placeholder="0.00" step="0.01" />
          <div className="flex gap-3 pt-2">
            <button onClick={() => setModal(false)} className="btn-outline flex-1">Cancel</button>
            <button onClick={handleSave} disabled={saving} className="btn-primary flex-1">
              {saving ? 'Saving…' : 'Save'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
