import { useState } from 'react'
import { format, differenceInDays, parseISO } from 'date-fns'
import { Plus, ChevronRight } from 'lucide-react'
import { useLocalData } from '../../hooks/useLocalData'
import { useEmployees } from '../../hooks/useEmployees'
import { Select, Input } from '../../components/ui/FormField'
import { Modal } from '../../components/ui/Modal'
import { LEAVE_TYPES } from '../../data/constants'

const EMPTY = {
  employee_id: '', leave_type: 'Annual Leave',
  start_date: format(new Date(), 'yyyy-MM-dd'),
  end_date: format(new Date(), 'yyyy-MM-dd'), notes: ''
}

export default function LeaveTracker() {
  const { rows: leave, upsert } = useLocalData('leave_records')
  const { employees, salaried: activeEmps } = useEmployees()
  const [modal, setModal] = useState(false)
  const [form, setForm] = useState(EMPTY)
  const [saving, setSaving] = useState(false)

  function set(f) { return e => setForm(p => ({ ...p, [f]: e.target.value })) }

  function getDaysTaken(empId) {
    return leave.filter(r => r.employee_id === empId)
      .reduce((s, r) => s + Math.max(0, differenceInDays(parseISO(r.end_date), parseISO(r.start_date)) + 1), 0)
  }

  function getAccrued(empId) {
    const emp = employees.find(e => e.id === empId)
    if (!emp || !emp.startDate) return 0
    const months = Math.floor(differenceInDays(new Date(), parseISO(emp.startDate)) / 30)
    return Math.floor(months * (30 / 12))
  }

  async function handleSave() {
    setSaving(true)
    const days = Math.max(0, differenceInDays(parseISO(form.end_date), parseISO(form.start_date)) + 1)
    await upsert({ ...form, id: form.id || crypto.randomUUID(), days_taken: days })
    setSaving(false)
    setModal(false)
  }

  return (
    <div className="space-y-4">
      <button onClick={() => { setForm(EMPTY); setModal(true) }} className="btn-primary w-full gap-2">
        <Plus size={18} /> Log Leave
      </button>

      <div className="space-y-2">
        {activeEmps.map(emp => {
          const accrued = getAccrued(emp.id)
          const taken = getDaysTaken(emp.id)
          const balance = accrued - taken
          const dailyRate = emp.monthlyRate / 30
          return (
            <div key={emp.id} className="card">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <p className="font-semibold text-sm text-navy">{emp.name}</p>
                  <p className="text-xs text-gray-500">{emp.role}</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-navy">{balance} <span className="text-sm font-medium text-gray-500">days</span></p>
                  <p className="text-xs text-green-600 font-medium">${(balance * dailyRate).toFixed(2)} value</p>
                </div>
              </div>
              <div className="flex gap-4 text-xs text-gray-500">
                <span>Accrued: <strong className="text-gray-700">{accrued}</strong></span>
                <span>Taken: <strong className="text-gray-700">{taken}</strong></span>
                <span>Rate: <strong className="text-gray-700">${dailyRate.toFixed(2)}/day</strong></span>
              </div>
              {/* Progress bar */}
              <div className="mt-2 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-green-500 rounded-full transition-all"
                  style={{ width: `${Math.min(100, accrued > 0 ? (taken / accrued) * 100 : 0)}%` }} />
              </div>
            </div>
          )
        })}
      </div>

      <Modal open={modal} onClose={() => setModal(false)} title="Log Leave">
        <div className="space-y-4">
          <Select label="Employee" value={form.employee_id} onChange={set('employee_id')}
            options={activeEmps.map(e => ({ value: e.id, label: e.name }))} placeholder="Select…" required />
          <Select label="Leave Type" value={form.leave_type} onChange={set('leave_type')} options={LEAVE_TYPES} />
          <div className="grid grid-cols-2 gap-3">
            <Input label="Start Date" type="date" value={form.start_date} onChange={set('start_date')} required />
            <Input label="End Date" type="date" value={form.end_date} onChange={set('end_date')} required />
          </div>
          {form.start_date && form.end_date && (
            <div className="bg-navy/5 rounded-xl px-4 py-3 text-sm">
              <span className="text-gray-600">Days: </span>
              <strong className="text-navy">
                {Math.max(0, differenceInDays(parseISO(form.end_date), parseISO(form.start_date)) + 1)}
              </strong>
            </div>
          )}
          <div className="flex gap-3 pt-2">
            <button onClick={() => setModal(false)} className="btn-outline flex-1">Cancel</button>
            <button onClick={handleSave} disabled={saving} className="btn-primary flex-1">{saving ? '…' : 'Save'}</button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
