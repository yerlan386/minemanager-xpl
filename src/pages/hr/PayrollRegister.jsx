import { useState } from 'react'
import { Plus, Info } from 'lucide-react'
import { useLocalData } from '../../hooks/useLocalData'
import { useEmployees } from '../../hooks/useEmployees'
import { Select, Input, NumberInput } from '../../components/ui/FormField'
import { StatusBadge, Badge } from '../../components/ui/Badge'
import { Modal } from '../../components/ui/Modal'
import { PAYMENT_METHODS, PAYROLL_STATUSES } from '../../data/constants'

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December']
const currentYear  = new Date().getFullYear()
const currentMonth = MONTHS[new Date().getMonth()]

// ── Calculation engines ────────────────────────────────────────────────────

function calcMonthly(f) {
  const rate        = parseFloat(f.monthly_rate)  || 0
  const dailyRate   = rate / 25                          // 25 working days per month
  const daysWorked  = parseFloat(f.days_worked)   ?? 25
  const leaveTaken  = parseFloat(f.leave_days)    ?? 5
  const leaveAsPay  = parseFloat(f.leave_as_pay_days) || 0

  // Base: proportional if fewer than 25 days worked
  const base = Math.min(daysWorked, 25) * dailyRate
  // Deduction: leave days beyond the 5 free days
  const excessLeave    = Math.max(0, leaveTaken - 5)
  const leaveDeduction = excessLeave * dailyRate
  // Leave converted to cash (employee opts to get paid instead of taking days off)
  const leaveAsCash    = leaveAsPay * dailyRate

  const gross = Math.max(0, base - leaveDeduction + leaveAsCash)
  return { gross, base, dailyRate, leaveDeduction, leaveAsCash, excessLeave }
}

function calcHourly(f) {
  const hourlyRate   = parseFloat(f.monthly_rate)    || 0
  const hrsPerShift  = parseFloat(f.hours_per_shift) || 0
  const shifts       = parseFloat(f.shifts_worked)   || 0
  const totalHours   = hrsPerShift * shifts
  const gross        = hourlyRate * totalHours
  const other        = parseFloat(f.other_payments)  || 0
  return { gross: gross + other, totalHours }
}

function calcNet(gross, f) {
  const nssa  = parseFloat(f.nssa)  || 0
  const paye  = parseFloat(f.paye)  || 0
  return Math.max(0, gross - nssa - paye)
}

// ── Default form states ────────────────────────────────────────────────────

const MONTHLY_EMPTY = {
  employee_id: '', month: currentMonth, year: String(currentYear),
  monthly_rate: '',
  days_worked: '25', leave_days: '5', leave_as_pay_days: '0',
  nssa: '', paye: '', other_payments: '', other_memo: '',
  paid_amount: '', payment_date: '', payment_method: 'Cash', paid_from: '',
  status: 'Unpaid', _type: 'Monthly'
}

const HOURLY_EMPTY = {
  employee_id: '', month: currentMonth, year: String(currentYear),
  monthly_rate: '',     // stores hourly_rate
  hours_per_shift: '12', shifts_worked: '',
  nssa: '', paye: '', other_payments: '', other_memo: '',
  paid_amount: '', payment_date: '', payment_method: 'Cash', paid_from: '',
  status: 'Unpaid', _type: 'Hourly'
}

// Detect employment type from stored record (other_memo encodes type)
function detectStoredType(rec) {
  if (!rec) return 'Monthly'
  if (rec.other_memo?.startsWith('hourly:')) return 'Hourly'
  return 'Monthly'
}

// Load an existing DB record back into the form
function recordToForm(rec, emp) {
  const type = detectStoredType(rec)
  if (type === 'Hourly') {
    // other_memo format: "hourly:{hrsPerShift}:{shifts}"
    const [, hrs = '12', shifts = ''] = (rec.other_memo || '').split(':')
    return {
      ...HOURLY_EMPTY, id: rec.id,
      employee_id:    rec.employee_id,
      month:          rec.month,
      year:           String(rec.year),
      monthly_rate:   String(rec.monthly_rate || ''),
      hours_per_shift: hrs,
      shifts_worked:   shifts,
      nssa:           String(rec.nssa  || ''),
      paye:           String(rec.paye  || ''),
      other_payments: String(rec.other_payments || ''),
      other_memo:     rec.other_memo || '',
      paid_amount:    String(rec.paid_amount || ''),
      payment_date:   rec.payment_date || '',
      payment_method: rec.payment_method || 'Cash',
      paid_from:      rec.paid_from || '',
      status:         rec.status || 'Unpaid',
      _type:          'Hourly'
    }
  } else {
    // other_memo format: "leave_as_pay:{days}" (optional)
    const leapMatch = (rec.other_memo || '').match(/leave_as_pay:(\d+)/)
    const leaveAsPay = leapMatch ? leapMatch[1] : '0'
    // Legacy records (start_day=1, end_day≥25): use sensible defaults
    const daysWorked  = (rec.start_day === 1 && rec.end_day >= 25) ? '25' : String(rec.start_day ?? 25)
    const leaveDays   = (rec.start_day === 1 && rec.end_day >= 25) ? '5'  : String(rec.end_day  ?? 5)
    return {
      ...MONTHLY_EMPTY, id: rec.id,
      employee_id:      rec.employee_id,
      month:            rec.month,
      year:             String(rec.year),
      monthly_rate:     String(rec.monthly_rate || emp?.monthlyRate || ''),
      days_worked:      daysWorked,
      leave_days:       leaveDays,
      leave_as_pay_days: leaveAsPay,
      nssa:             String(rec.nssa  || ''),
      paye:             String(rec.paye  || ''),
      other_payments:   String(rec.other_payments || ''),
      other_memo:       rec.other_memo || '',
      paid_amount:      String(rec.paid_amount || ''),
      payment_date:     rec.payment_date || '',
      payment_method:   rec.payment_method || 'Cash',
      paid_from:        rec.paid_from || '',
      status:           rec.status || 'Unpaid',
      _type:            'Monthly'
    }
  }
}

// ── Component ──────────────────────────────────────────────────────────────

export default function PayrollRegister() {
  const { rows: payroll, upsert } = useLocalData('payroll')
  const { salaried: activeEmps } = useEmployees()
  const [filterMonth, setFilterMonth] = useState(currentMonth)
  const [filterYear,  setFilterYear]  = useState(String(currentYear))
  const [modal,   setModal]   = useState(false)
  const [form,    setForm]    = useState(MONTHLY_EMPTY)
  const [saving,  setSaving]  = useState(false)
  const [saveErr, setSaveErr] = useState('')

  const filtered = payroll.filter(r => r.month === filterMonth && String(r.year) === filterYear)
  const isHourly = form._type === 'Hourly'

  // Derived calc (live preview)
  const calc = isHourly ? calcHourly(form) : calcMonthly(form)
  const net  = calcNet(calc.gross, form)

  const totals = filtered.reduce((acc, r) => {
    const type   = detectStoredType(r)
    const c      = type === 'Hourly' ? calcHourly(r) : calcMonthly({ ...r, days_worked: r.start_day, leave_days: r.end_day, leave_as_pay_days: 0 })
    return { gross: acc.gross + c.gross, net: acc.net + calcNet(c.gross, r) }
  }, { gross: 0, net: 0 })

  function set(field) { return e => setForm(p => ({ ...p, [field]: e.target.value })) }

  function openNew(emp) {
    setSaveErr('')
    const existing = emp ? filtered.find(r => r.employee_id === emp.id) : null
    if (existing) {
      setForm(recordToForm(existing, emp))
    } else {
      const type = emp?.employmentType || emp?.employment_type || 'Monthly'
      const base = type === 'Hourly' ? HOURLY_EMPTY : MONTHLY_EMPTY
      setForm({
        ...base,
        employee_id:  emp?.id || '',
        monthly_rate: String(emp?.monthlyRate || emp?.monthly_rate || ''),
        month:        filterMonth,
        year:         filterYear,
        _type:        type === 'Hourly' ? 'Hourly' : 'Monthly',
      })
    }
    setModal(true)
  }

  async function handleSave() {
    setSaveErr('')
    setSaving(true)
    try {
      const { gross } = isHourly ? calcHourly(form) : calcMonthly(form)
      const netPay    = calcNet(gross, form)

      // Build other_memo to encode calculation context
      let other_memo, start_day, end_day, other_payments
      if (isHourly) {
        other_memo      = `hourly:${form.hours_per_shift}:${form.shifts_worked}`
        start_day       = parseInt(form.hours_per_shift) || 0
        end_day         = parseInt(form.shifts_worked)   || 0
        other_payments  = parseFloat(form.other_payments) || 0
      } else {
        const lapDays   = parseFloat(form.leave_as_pay_days) || 0
        const dailyRate = (parseFloat(form.monthly_rate) || 0) / 25
        other_payments  = lapDays > 0 ? parseFloat((lapDays * dailyRate).toFixed(2)) : (parseFloat(form.other_payments) || 0)
        other_memo      = lapDays > 0 ? `leave_as_pay:${lapDays}` : (form.other_memo || '')
        start_day       = parseInt(form.days_worked)  || 25
        end_day         = parseInt(form.leave_days)   || 5
      }

      await upsert({
        id:             form.id || crypto.randomUUID(),
        employee_id:    form.employee_id,
        month:          form.month,
        year:           parseInt(form.year),
        start_day,
        end_day,
        monthly_rate:   parseFloat(form.monthly_rate) || 0,
        gross_pay:      parseFloat(gross.toFixed(2)),
        nssa:           parseFloat(form.nssa)  || 0,
        paye:           parseFloat(form.paye)  || 0,
        other_payments,
        other_memo,
        net_pay:        parseFloat(netPay.toFixed(2)),
        paid_amount:    parseFloat(form.paid_amount) || null,
        payment_date:   form.payment_date   || null,
        payment_method: form.payment_method || null,
        paid_from:      form.paid_from      || null,
        status:         form.status         || 'Unpaid',
      })
      setModal(false)
    } catch (err) {
      setSaveErr(err.message || 'Save failed. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const statusColor = { Paid: 'green', Unpaid: 'red', Partial: 'amber' }

  return (
    <div className="space-y-4">
      {/* Month / Year filter */}
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

      {/* Employee list */}
      <div className="space-y-2">
        {activeEmps.map(emp => {
          const rec     = filtered.find(r => r.employee_id === emp.id)
          const empType = emp.employmentType || emp.employment_type || 'Monthly'
          const recNet  = rec ? (() => {
            const type  = detectStoredType(rec)
            const c     = type === 'Hourly' ? calcHourly(rec) : calcMonthly({ ...rec, days_worked: rec.start_day, leave_days: rec.end_day, leave_as_pay_days: 0 })
            return calcNet(c.gross, rec)
          })() : 0
          return (
            <button key={emp.id} onClick={() => openNew(emp)}
              className="card w-full text-left flex items-center justify-between gap-3 hover:shadow-md transition-shadow">
              <div>
                <p className="font-semibold text-sm text-navy">{emp.name}</p>
                <p className="text-xs text-gray-500">{emp.role}
                  <span className={`ml-2 text-xs font-semibold px-1.5 py-0.5 rounded-full ${empType === 'Hourly' ? 'bg-blue-100 text-blue-700' : 'bg-navy/10 text-navy'}`}>
                    {empType}
                  </span>
                </p>
              </div>
              <div className="text-right">
                {rec ? (
                  <>
                    <Badge color={statusColor[rec.status]}>{rec.status}</Badge>
                    <p className="text-xs text-gray-500 mt-1">Net ${recNet.toFixed(2)}</p>
                  </>
                ) : (
                  <Badge color="gray">No record</Badge>
                )}
              </div>
            </button>
          )
        })}
      </div>

      {/* Payroll Entry Modal */}
      <Modal open={modal} onClose={() => { setModal(false); setSaveErr('') }} title="Payroll Entry">
        <div className="space-y-4">

          <Select label="Employee" value={form.employee_id} onChange={set('employee_id')}
            options={activeEmps.map(e => ({ value: e.id, label: e.name }))} placeholder="Select…" required />

          <div className="grid grid-cols-2 gap-3">
            <Select label="Month" value={form.month} onChange={set('month')} options={MONTHS} />
            <Input label="Year" type="number" value={form.year} onChange={set('year')} />
          </div>

          {/* ── MONTHLY EMPLOYEE FORM ── */}
          {!isHourly && (
            <>
              <div className="bg-navy/5 rounded-xl px-3 py-2 text-xs text-navy font-medium flex items-start gap-2">
                <Info size={14} className="mt-0.5 shrink-0" />
                Monthly salary covers 25 working days. 5 leave days included — no deduction unless more than 5 taken.
              </div>

              <NumberInput label="Monthly Salary (USD)" prefix="$" value={form.monthly_rate}
                onChange={set('monthly_rate')} step="0.01" placeholder="0.00"
                hint={form.monthly_rate ? `Daily rate: $${(parseFloat(form.monthly_rate)/25).toFixed(2)}/day` : undefined} />

              <div className="grid grid-cols-2 gap-3">
                <NumberInput label="Days Worked" suffix="days" value={form.days_worked}
                  onChange={set('days_worked')} min="0" max="25" step="1" placeholder="25"
                  hint="Max 25 working days" />
                <NumberInput label="Leave Days Taken" suffix="days" value={form.leave_days}
                  onChange={set('leave_days')} min="0" max="30" step="1" placeholder="5"
                  hint="First 5 days free" />
              </div>

              <div className="card bg-blue-50 border border-blue-100 space-y-2">
                <p className="text-xs font-bold text-blue-800">Leave as Pay Option</p>
                <p className="text-xs text-blue-600">Employee can take up to 5 leave days as cash instead of time off.</p>
                <NumberInput label="Leave Days → Cash" suffix="days" value={form.leave_as_pay_days}
                  onChange={set('leave_as_pay_days')} min="0" max="5" step="1" placeholder="0" />
                {parseFloat(form.leave_as_pay_days) > 0 && form.monthly_rate && (
                  <p className="text-xs text-blue-700 font-semibold">
                    + ${(parseFloat(form.leave_as_pay_days) * (parseFloat(form.monthly_rate)/25)).toFixed(2)} leave cash added to gross
                  </p>
                )}
              </div>
            </>
          )}

          {/* ── HOURLY EMPLOYEE FORM ── */}
          {isHourly && (
            <>
              <div className="bg-blue-50 rounded-xl px-3 py-2 text-xs text-blue-800 font-medium flex items-start gap-2">
                <Info size={14} className="mt-0.5 shrink-0" />
                Hourly pay: Gross = Hourly Rate × Hours per Shift × Shifts Worked
              </div>

              <NumberInput label="Hourly Rate (USD/hr)" prefix="$" value={form.monthly_rate}
                onChange={set('monthly_rate')} step="0.01" placeholder="0.00" />

              <div className="grid grid-cols-2 gap-3">
                <NumberInput label="Hours per Shift" suffix="hrs" value={form.hours_per_shift}
                  onChange={set('hours_per_shift')} min="0" max="24" step="0.5" placeholder="12" />
                <NumberInput label="Shifts Worked" suffix="shifts" value={form.shifts_worked}
                  onChange={set('shifts_worked')} min="0" step="1" placeholder="0" />
              </div>

              {calc.totalHours > 0 && (
                <p className="text-xs text-gray-500">Total hours: <strong className="text-navy">{calc.totalHours} hrs</strong></p>
              )}

              <NumberInput label="Other Allowances" prefix="$" value={form.other_payments}
                onChange={set('other_payments')} step="0.01" placeholder="0.00" />
            </>
          )}

          {/* ── DEDUCTIONS (both types) ── */}
          <div className="grid grid-cols-2 gap-3">
            <NumberInput label="NSSA" prefix="$" value={form.nssa} onChange={set('nssa')} step="0.01" placeholder="0.00" />
            <NumberInput label="PAYE" prefix="$" value={form.paye} onChange={set('paye')} step="0.01" placeholder="0.00" />
          </div>

          {/* ── GROSS / NET PREVIEW ── */}
          {(form.monthly_rate || (isHourly && form.shifts_worked)) && (
            <div className="bg-navy/5 rounded-xl px-4 py-3 space-y-1.5 text-sm">
              {!isHourly && (
                <>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Base ({Math.min(parseFloat(form.days_worked)||25, 25)} days)</span>
                    <span>${calc.base?.toFixed(2)}</span>
                  </div>
                  {calc.leaveDeduction > 0 && (
                    <div className="flex justify-between text-red-600">
                      <span>Leave deduction ({calc.excessLeave} extra days)</span>
                      <span>− ${calc.leaveDeduction?.toFixed(2)}</span>
                    </div>
                  )}
                  {calc.leaveAsCash > 0 && (
                    <div className="flex justify-between text-blue-700">
                      <span>Leave as pay ({form.leave_as_pay_days} days)</span>
                      <span>+ ${calc.leaveAsCash?.toFixed(2)}</span>
                    </div>
                  )}
                </>
              )}
              <div className="flex justify-between font-semibold border-t border-gray-200 pt-1.5">
                <span className="text-gray-700">Gross Pay</span>
                <span className="text-navy">${calc.gross.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-bold text-green-700 border-t border-gray-200 pt-1.5">
                <span>Net Pay</span>
                <span>${net.toFixed(2)}</span>
              </div>
            </div>
          )}

          {/* ── PAYMENT DETAILS ── */}
          <div className="grid grid-cols-2 gap-3">
            <Select label="Status" value={form.status} onChange={set('status')} options={PAYROLL_STATUSES} />
            <Select label="Payment Method" value={form.payment_method} onChange={set('payment_method')} options={PAYMENT_METHODS} />
          </div>
          <Input label="Payment Date" type="date" value={form.payment_date} onChange={set('payment_date')} />
          <Input label="Paid From" value={form.paid_from} onChange={set('paid_from')} placeholder="Paid by / from which account" />

          {saveErr && (
            <div className="bg-red-50 border border-red-200 rounded-xl px-3 py-2 text-sm text-red-700 font-medium">{saveErr}</div>
          )}
          <div className="flex gap-3 pt-2">
            <button onClick={() => { setModal(false); setSaveErr('') }} className="btn-outline flex-1">Cancel</button>
            <button onClick={handleSave} disabled={saving || !form.employee_id} className="btn-primary flex-1">
              {saving ? 'Saving…' : 'Save'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
