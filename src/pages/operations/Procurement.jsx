import { useState } from 'react'
import { format } from 'date-fns'
import { Plus, ChevronRight, Package } from 'lucide-react'
import { useLocalData } from '../../hooks/useLocalData'
import { Select, Input, NumberInput, VoiceTextarea } from '../../components/ui/FormField'
import { StatusBadge, Badge } from '../../components/ui/Badge'
import { Modal } from '../../components/ui/Modal'
import { EmptyState } from '../../components/ui/EmptyState'
import { PROCUREMENT_URGENCY, PO_STATUSES, SPEND_CATEGORIES, SUPPLIERS } from '../../data/constants'
import { useAuth } from '../../context/AuthContext'

const PR_EMPTY = {
  item: '', qty: '', unit: 'each', urgency: 'Routine',
  requested_by: '', date_needed: '', notes: '', status: 'Draft'
}

const PO_STATUSES_FLOW = PO_STATUSES

function autoPoNumber() {
  return `PO-${Date.now().toString().slice(-6)}`
}

const urgencyColor = { Routine: 'gray', Urgent: 'amber', Critical: 'red' }

export default function Procurement() {
  const { user } = useAuth()
  const { rows: prs, upsert: upsertPR } = useLocalData('purchase_requests')
  const { rows: spend, upsert: upsertSpend } = useLocalData('spend_log')
  const [tab, setTab] = useState('requests')
  const [modal, setModal] = useState(false)
  const [spendModal, setSpendModal] = useState(false)
  const [form, setForm] = useState({ ...PR_EMPTY, requested_by: user?.name || '' })
  const [spendForm, setSpendForm] = useState({ category: 'Spares', amount: '', date: format(new Date(), 'yyyy-MM-dd'), po_ref: '', notes: '' })
  const [saving, setSaving] = useState(false)

  function set(f) { return e => setForm(p => ({ ...p, [f]: e.target.value })) }
  function setS(f) { return e => setSpendForm(p => ({ ...p, [f]: e.target.value })) }

  async function savePR(status) {
    setSaving(true)
    await upsertPR({
      id: form.id || crypto.randomUUID(),
      ...form,
      status,
      po_number: form.po_number || (status !== 'Draft' ? autoPoNumber() : ''),
      created_at: form.created_at || new Date().toISOString()
    })
    setSaving(false)
    setModal(false)
    setForm({ ...PR_EMPTY, requested_by: user?.name || '' })
  }

  async function saveSpend() {
    setSaving(true)
    await upsertSpend({ ...spendForm, id: spendForm.id || crypto.randomUUID() })
    setSaving(false)
    setSpendModal(false)
  }

  const totalSpend = spend.reduce((s, r) => s + (parseFloat(r.amount) || 0), 0)
  const openPRs = prs.filter(r => r.status !== 'Received' && r.status !== 'Invoiced')

  return (
    <div className="space-y-4">
      <div className="flex gap-1 bg-gray-100 rounded-xl p-1">
        {['requests', 'spend'].map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`flex-1 py-2 text-sm font-semibold rounded-xl transition-colors ${
              tab === t ? 'bg-white text-navy shadow-sm' : 'text-gray-500'
            }`}>{t === 'requests' ? `PO Tracker (${openPRs.length} open)` : 'Spend Log'}</button>
        ))}
      </div>

      {tab === 'requests' ? (
        <>
          <button onClick={() => { setForm({ ...PR_EMPTY, requested_by: user?.name || '' }); setModal(true) }}
            className="btn-primary w-full gap-2"><Plus size={18} /> Purchase Request</button>
          {prs.length === 0 ? (
            <EmptyState icon={Package} title="No purchase requests" description="Create your first purchase request." />
          ) : (
            <div className="space-y-2">
              {[...prs].reverse().map(pr => (
                <button key={pr.id} onClick={() => { setForm(pr); setModal(true) }}
                  className="card w-full text-left hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm text-navy truncate">{pr.item}</p>
                      {pr.po_number && <p className="text-xs text-gray-400">{pr.po_number}</p>}
                    </div>
                    <div className="flex gap-1.5 shrink-0">
                      <Badge color={urgencyColor[pr.urgency] || 'gray'}>{pr.urgency}</Badge>
                      <StatusBadge status={pr.status} />
                    </div>
                  </div>
                  <div className="flex gap-3 text-xs text-gray-500">
                    <span>Qty: {pr.qty} {pr.unit}</span>
                    {pr.date_needed && <span>Need by: {pr.date_needed}</span>}
                    <span>{pr.requested_by}</span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </>
      ) : (
        <>
          <div className="flex items-center justify-between">
            <div className="card flex-1 text-center mr-3">
              <p className="text-xs text-gray-500">Total Spend</p>
              <p className="text-xl font-bold text-navy">${totalSpend.toFixed(2)}</p>
            </div>
            <button onClick={() => setSpendModal(true)} className="btn-primary gap-1.5 text-sm">
              <Plus size={16} /> Add
            </button>
          </div>
          <div className="space-y-2">
            {[...spend].reverse().map(s => (
              <div key={s.id} className="card flex items-center justify-between gap-3">
                <div>
                  <p className="font-semibold text-sm text-navy">{s.category}</p>
                  <p className="text-xs text-gray-500">{s.date}{s.po_ref ? ` · ${s.po_ref}` : ''}</p>
                  {s.notes && <p className="text-xs text-gray-400">{s.notes}</p>}
                </div>
                <p className="text-base font-bold text-navy shrink-0">${parseFloat(s.amount).toFixed(2)}</p>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Purchase Request Modal */}
      <Modal open={modal} onClose={() => setModal(false)} title="Purchase Request">
        <div className="space-y-4">
          <Input label="Item Description" value={form.item} onChange={set('item')} required placeholder="What do you need?" />
          <div className="grid grid-cols-3 gap-3">
            <NumberInput label="Qty" value={form.qty} onChange={set('qty')} min="1" />
            <Input label="Unit" value={form.unit} onChange={set('unit')} placeholder="each" />
            <Select label="Urgency" value={form.urgency} onChange={set('urgency')} options={PROCUREMENT_URGENCY} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Input label="Requested By" value={form.requested_by} onChange={set('requested_by')} />
            <Input label="Date Needed" type="date" value={form.date_needed} onChange={set('date_needed')} />
          </div>
          {form.id && (
            <Select label="PO Status" value={form.status} onChange={set('status')} options={PO_STATUSES_FLOW} />
          )}
          <Select label="Supplier" value={form.supplier_id || ''} onChange={set('supplier_id')}
            options={SUPPLIERS.map(s => ({ value: s.id, label: s.name }))} placeholder="Select supplier…" />
          <VoiceTextarea label="Notes" name="pr_notes" value={form.notes} onChange={set('notes')} rows={2} placeholder="Additional details…" />
          <div className="flex gap-3 pt-2">
            <button onClick={() => setModal(false)} className="btn-outline flex-1">Cancel</button>
            <button onClick={() => savePR('Draft')} disabled={saving} className="btn-outline flex-1">Save Draft</button>
            <button onClick={() => savePR('Approved')} disabled={saving} className="btn-primary flex-1">{saving ? '…' : 'Submit'}</button>
          </div>
        </div>
      </Modal>

      {/* Spend Modal */}
      <Modal open={spendModal} onClose={() => setSpendModal(false)} title="Spend Entry">
        <div className="space-y-4">
          <Select label="Category" value={spendForm.category} onChange={setS('category')} options={SPEND_CATEGORIES} />
          <NumberInput label="Amount (USD)" prefix="$" value={spendForm.amount} onChange={setS('amount')} step="0.01" required />
          <div className="grid grid-cols-2 gap-3">
            <Input label="Date" type="date" value={spendForm.date} onChange={setS('date')} />
            <Input label="PO Reference" value={spendForm.po_ref} onChange={setS('po_ref')} placeholder="PO-xxxxxx" />
          </div>
          <Input label="Notes" value={spendForm.notes} onChange={setS('notes')} placeholder="Details…" />
          <div className="flex gap-3 pt-2">
            <button onClick={() => setSpendModal(false)} className="btn-outline flex-1">Cancel</button>
            <button onClick={saveSpend} disabled={saving} className="btn-primary flex-1">{saving ? '…' : 'Save'}</button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
