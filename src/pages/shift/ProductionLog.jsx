import { useState, useEffect } from 'react'
import { format } from 'date-fns'
import { Plus, Trash2, CheckCircle2 } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { dbUpsert, dbSelect, dbDelete } from '../../lib/supabase'
import { Input, Select, NumberInput } from '../../components/ui/FormField'
import { SHIFT_TYPES, DOWNTIME_REASONS } from '../../data/constants'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts'

const EMPTY = {
  date: format(new Date(), 'yyyy-MM-dd'),
  shift: 'Day',
  plant_runtime_hrs: '',
  sluice_yield_g: '',
  concentrator_yield_g: '',
  table_yield_g: '',
  downtime_entries: []
}

function DowntimeEntry({ entry, onChange, onRemove, idx }) {
  function set(f) { return e => onChange(idx, { ...entry, [f]: e.target.value }) }
  const dur = entry.start_time && entry.end_time
    ? (() => {
        const [sh, sm] = entry.start_time.split(':').map(Number)
        const [eh, em] = entry.end_time.split(':').map(Number)
        const mins = (eh * 60 + em) - (sh * 60 + sm)
        return mins > 0 ? `${(mins / 60).toFixed(1)} hrs` : '—'
      })() : '—'
  return (
    <div className="bg-gray-50 rounded-xl p-3 space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-gray-600">Downtime #{idx + 1}</span>
        <button type="button" onClick={() => onRemove(idx)} className="text-red-500 hover:text-red-700 p-1">
          <Trash2 size={16} />
        </button>
      </div>
      <div className="grid grid-cols-3 gap-2">
        <Input label="Start" type="time" value={entry.start_time || ''} onChange={set('start_time')} />
        <Input label="End" type="time" value={entry.end_time || ''} onChange={set('end_time')} />
        <div className="space-y-1">
          <label className="form-label">Duration</label>
          <div className="form-input bg-gray-100 text-gray-600 text-sm flex items-center">{dur}</div>
        </div>
      </div>
      <Select label="Reason" value={entry.reason || ''} onChange={set('reason')}
        options={DOWNTIME_REASONS} placeholder="Select reason…" />
    </div>
  )
}

export default function ProductionLog({ inline }) {
  const { user } = useAuth()
  const [form, setForm] = useState(EMPTY)
  const [logs, setLogs] = useState([])
  const [saved, setSaved] = useState(false)
  const [saving, setSaving] = useState(false)
  const [showForm, setShowForm] = useState(!inline)

  useEffect(() => {
    dbSelect('production_logs').then(({ data }) => {
      setLogs((data || []).sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 7))
    })
  }, [])

  function set(f) { return e => setForm(p => ({ ...p, [f]: e.target.value })) }

  const totalGold = [form.sluice_yield_g, form.concentrator_yield_g, form.table_yield_g]
    .reduce((s, v) => s + (parseFloat(v) || 0), 0)

  function addDowntime() {
    setForm(p => ({ ...p, downtime_entries: [...p.downtime_entries, { start_time: '', end_time: '', reason: '' }] }))
  }
  function updateDowntime(idx, val) {
    setForm(p => { const d = [...p.downtime_entries]; d[idx] = val; return { ...p, downtime_entries: d } })
  }
  function removeDowntime(idx) {
    setForm(p => ({ ...p, downtime_entries: p.downtime_entries.filter((_, i) => i !== idx) }))
  }

  async function handleSave(submit = false) {
    setSaving(true)
    const record = {
      id: crypto.randomUUID(),
      ...form,
      total_gold_g: totalGold.toFixed(2),
      submitted: submit,
      created_by: user?.name,
      created_at: new Date().toISOString()
    }
    await dbUpsert('production_logs', record)
    setSaved(true)
    setSaving(false)
    if (submit) { setShowForm(false); setForm(EMPTY) }
  }

  const chartData = [...logs].reverse().map(l => ({
    date: l.date ? format(new Date(l.date), 'dd/MM') : '',
    tonnes: parseFloat(l.ore_processed) || 0,
    gold: parseFloat(l.total_gold_g) || 0
  }))

  return (
    <div className="space-y-4">
      {!showForm ? (
        <>
          <button onClick={() => setShowForm(true)} className="btn-primary w-full gap-2">
            <Plus size={18} /> Log Production
          </button>
          {chartData.length > 0 && (
            <div className="card">
              <h3 className="text-sm font-bold text-navy mb-3">Last 7 Days</h3>
              <ResponsiveContainer width="100%" height={160}>
                <BarChart data={chartData}>
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Legend iconSize={10} wrapperStyle={{ fontSize: 11 }} />
                  <Bar dataKey="tonnes" fill="#1B2A4A" name="Tonnes" radius={[3,3,0,0]} />
                  <Bar dataKey="gold" fill="#D4A017" name="Gold (g)" radius={[3,3,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </>
      ) : (
        <div className="space-y-4">
          {!inline && <h1 className="text-xl font-bold text-navy">Production Log</h1>}

          <div className="card space-y-4">
            <h3 className="font-bold text-navy text-sm uppercase tracking-wide">Shift</h3>
            <div className="grid grid-cols-2 gap-4">
              <Input label="Date" type="date" value={form.date} onChange={set('date')} required />
              <Select label="Shift" value={form.shift} onChange={set('shift')} options={SHIFT_TYPES} />
            </div>
            <NumberInput label="Plant Run-Time" suffix="hrs" value={form.plant_runtime_hrs}
              onChange={set('plant_runtime_hrs')} placeholder="0" step="0.1"
              hint={parseFloat(form.plant_runtime_hrs) < 21 && form.plant_runtime_hrs ? '⚠ Target is 21 hrs' : undefined} />
            {parseFloat(form.plant_runtime_hrs) < 18 && form.plant_runtime_hrs && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl px-3 py-2 text-xs text-amber-700 font-medium">
                ⚠ Plant run-time below 18 hrs — alert will be triggered
              </div>
            )}
          </div>

          <div className="card space-y-4">
            <h3 className="font-bold text-navy text-sm uppercase tracking-wide">Gold Recovery</h3>
            <NumberInput label="Sluice Yield" suffix="g" value={form.sluice_yield_g} onChange={set('sluice_yield_g')} placeholder="0.00" step="0.01" />
            <NumberInput label="Centrifugal Concentrator Yield" suffix="g" value={form.concentrator_yield_g} onChange={set('concentrator_yield_g')} placeholder="0.00" step="0.01" />
            <NumberInput label="Shaking Table Yield" suffix="g" value={form.table_yield_g} onChange={set('table_yield_g')} placeholder="0.00" step="0.01" />
            <div className="flex items-center justify-between bg-navy/5 rounded-xl px-4 py-3">
              <span className="font-bold text-navy text-sm">Total Gold Recovery</span>
              <span className="text-2xl font-bold text-gold">{totalGold.toFixed(2)} g</span>
            </div>
          </div>

          <div className="card space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-navy text-sm uppercase tracking-wide">Downtime</h3>
              <button type="button" onClick={addDowntime} className="btn-outline text-xs px-3 py-2 gap-1">
                <Plus size={14} /> Add
              </button>
            </div>
            {form.downtime_entries.map((e, i) => (
              <DowntimeEntry key={i} entry={e} idx={i} onChange={updateDowntime} onRemove={removeDowntime} />
            ))}
            {form.downtime_entries.length === 0 && (
              <p className="text-xs text-gray-500 text-center py-3">No downtime recorded</p>
            )}
          </div>

          <div className="flex gap-3 pb-2">
            <button onClick={() => setShowForm(false)} className="btn-outline flex-1">Cancel</button>
            <button onClick={() => handleSave(false)} disabled={saving} className="btn-outline flex-1">Save Draft</button>
            <button onClick={() => handleSave(true)} disabled={saving} className="btn-primary flex-1">
              {saving ? '…' : 'Submit'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
