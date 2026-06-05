import { useState } from 'react'
import { format } from 'date-fns'
import { Plus } from 'lucide-react'
import { useLocalData } from '../../hooks/useLocalData'
import { useEmployees } from '../../hooks/useEmployees'
import { Select, Input, NumberInput } from '../../components/ui/FormField'
import { StatusBadge, Badge } from '../../components/ui/Badge'
import { Modal } from '../../components/ui/Modal'
import { PAYMENT_METHODS, PAYROLL_STATUSES } from '../../data/constants'

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December']
const currentYear = new Date().getFullYear()
const currentMonth = MONTHS[new Date().getMonth()]

const EMPTY = {
  employee_id: '', month: currentMonth, year: String(currentYear),
  start_day: '1', end_day: String(new Date(currentYear, new Date().getMonth() + 1, 0).getDate()),
  monthly_rate: '', nssa: '', paye: '', other_payments: '', other_memo: '',
  paid_amount: '', payment_date: '', payment_method: 'Cash', paid_from: '',
  status: 'Unpaid'
}

function calcPayroll(f) {
  const rate = parseFloat(f.monthly_rate) || 0
  const days = (parseFloat(f.end_day) || 0) - (parseFloat(f.start_day) || 0) + 1
  const gross = (rate / 30) * days
  const nssa = parseFloat(f.nssa) || 0
  const paye = parseFloat(f.paye) || 0
  const other = parseFloat(f.other_payments) || 0
  return { days, gross, net: gross - nssa - paye + other }
}

export default function PayrollRegister() {
  const { rows: payroll, upsert } = useLocalData('payroll')
  const { salaried: activeEmps, empName } = useEmployees()
  const [filterMonth, setFilterMonth] = useState(currentMonth)
  const [filterYear, setFilterYear] = useState(String(currentYear))
  const [modal, setModal] = useState(false)
  const [form, setForm] = useState(EMPTY)
  const [saving, setSaving] = useState(false)
  const filtered = payroll.filter(r => r.month === filterMonth && String(r.year) === filterYear)

  const totals = filtered.reduce((acc, r) => {
    const { gross, net } = calcPayroll(r)
    return { gross: acc.gross + gross, net: acc.net + net }
  }, { gross: 0, net: 0 })

  function set(f) { return e => setForm(p => ({ ...p, [f]: e.target.value })) }

  function openNew(emp) {
    // If a record already exists for this employee + current filter period, load it
    const existing = emp ? filtered.find(r => r.employee_id === emp.id) : null
    if (existing) {
      setForm({ ...EMPTY, ...existing })
    } else {
      setForm({ ...EMPTY, employee_id: emp?.id || '', monthly_rate: String(emp?.monthlyRate || '') })
    }
    setModal(true)
  }

  async function handleSave() {
    setSaving(true)
    const { gross, net } = calcPayroll(form)
    await upsert({
      id: form.id || crypto.randomUUID(),
      ...form,
      gross_pay: gross.toFixed(2),
      net_pay: net.toFixed(2)
    })
    setSaving(false)
    setModal(false)
  }

  const statusColor = { Paid: 'green', Unpaid: 'red', Partial: 'amber' }

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <select className="form-select flex-1 py-2.5 text-sm" value={filterMonth} onChange={e => setFilterMonth(e.target.value)}>
          {MONTHS.map(m => <option key={m}>{m}</option>)}
        </select>
        <select className="form-select w-24 py-2.5 text-sm" value={filterYear} onChange={e => setFilterYear(e.target.value)}>
          {[currentYear - 1, currentYear, currentYear + 1].map(y => <option key={y}>{y}</option>)}
        </select>
        <button onClick={() => openNew()} className="btn-primary px-4 py-2.5 gap-1 text-sm shrink-0">
          <Plus size={16} /> Add
        </button>
      </div>

      {/* Summary totals */}
      {filtered.length > 0 && (
        <div className="grid grid-cols-2 gap-3">
          <div className="card text-center">
            <p className="text-xs text-gray-500 font-medium">Gross Payroll</p>
            <p className="text-xl font-bold text-navy">${totals.gross.toFixed(2)}</p>
          </div>
          <div className="card text-center">
            <p className="text-xs text-gray-500 font-medium">Net Payroll</p>
            <p className="text-xl font-bold text-green-700">${totals.net.toFixed(2)}</p>
          </div>
        </div>
      )}

      <div className="space-y-2">
        {activeEmps.map(emp => {
          const rec = filtered.find(r => r.employee_id === emp.id)
          const { gross, net } = rec ? calcPayroll(rec) : { gross: 0, net: 0 }
          return (
            <button key={emp.id} onClick={() => openNew(emp)}
              className="card w-full text-left flex items-center justify-between gap-3 hover:shadow-md transition-shadow">
              <div>
                <p className="font-semibold text-sm text-navy">{emp.name}</p>
                <p className="text-xs text-gray-500">{emp.role}</p>
              </div>
              <div className="text-right">
                {rec ? (
                  <>
                    <Badge color={statusColor[rec.status]}>{rec.status}</Badge>
                    <p className="text-xs text-gray-500 mt-1">Net ${net.toFixed(2)}</p>
                  </>
                ) : (
                  <Badge color="gray">No record</Badge>
                )}
              </div>
            </button>
          )
        })}
      </div>

      <Modal open={modal} onClose={() => setModal(false)} title="Payroll Entry">
        <div className="space-y-4">
          <Select label="Employee" value={form.employee_id} onChange={set('employee_id')}
            options={activeEmps.map(e => ({ value: e.id, label: e.name }))} placeholder="Select…" required />
          <div className="grid grid-cols-2 gap-3">
            <Select label="Month" value={form.month} onChange={set('month')} options={MONTHS} />
            <Input label="Year" type="number" value={form.year} onChange={set('year')} />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <NumberInput label="Start Day" value={form.start_day} onChange={set('start_day')} min="1" max="31" />
            <NumberInput label="End Day" value={form.end_day} onChange={set('end_day')} min="1" max="31" />
            <div className="space-y-1">
              <label className="form-label">Days</label>
              <div className="form-input bg-gray-100 text-sm flex items-center font-semibold">
                {Math.max(0, (parseInt(form.end_day) || 0) - (parseInt(form.start_day) || 0) + 1)}
              </div>
            </div>
          </div>
          <NumberInput label="Monthly Rate (USD)" prefix="$" value={form.monthly_rate} onChange={set('monthly_rate')} step="0.01" />
          <div className="grid grid-cols-2 gap-3">
            <NumberInput label="NSSA" prefix="$" value={form.nssa} onChange={set('nssa')} step="0.01" placeholder="0.00" />
            <NumberInput label="PAYE" prefix="$" value={form.paye} onChange={set('paye')} step="0.01" placeholder="0.00" />
          </div>
          {/* Calc preview */}
          {form.monthly_rate && (
            <div className="bg-navy/5 rounded-xl px-4 py-3 space-y-1">
              {(() => { const { gross, net, days } = calcPayroll(form); return (
                <>
                  <div className="flex justify-between text-sm"><span className="text-gray-600">Gross ({days} days)</span><strong>${gross.toFixed(2)}</strong></div>
                  <div className="flex justify-between text-sm text-green-700 font-bold border-t border-gray-200 pt-1 mt-1"><span>Net Pay</span><span>${net.toFixed(2)}</span></div>
                </>
              )})()}
            </div>
          )}
          <div className="grid grid-cols-2 gap-3">
            <Select label="Status" value={form.status} onChange={set('status')} options={PAYROLL_STATUSES} />
            <Select label="Payment Method" value={form.payment_method} onChange={set('payment_method')} options={PAYMENT_METHODS} />
          </div>
          <Input label="Payment Date" type="date" value={form.payment_date} onChange={set('payment_date')} />
          <Input label="Paid From" value={form.paid_from} onChange={set('paid_from')} placeholder="Paid by whom / from which account" />
          <div className="flex gap-3 pt-2">
            <button onClick={() => setModal(false)} className="btn-outline flex-1">Cancel</button>
            <button onClick={handleSave} disabled={saving} className="btn-primary flex-1">{saving ? '…' : 'Save'}</button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
