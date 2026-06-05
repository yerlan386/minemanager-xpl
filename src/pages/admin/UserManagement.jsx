import { useState, useEffect } from 'react'
import { UserPlus, Shield, CheckCircle2, Eye, EyeOff, RefreshCw } from 'lucide-react'
import { supabase, DEMO_MODE, dbSelect } from '../../lib/supabase'
import { useAuth } from '../../context/AuthContext'
import { EMPLOYEES, SYSTEM_ROLES } from '../../data/employees'
import { Select, Input } from '../../components/ui/FormField'
import { Badge } from '../../components/ui/Badge'
import { Modal, ConfirmDialog } from '../../components/ui/Modal'

// Look up email from static employees list (user_profiles has no email column)
const staticEmail = empId => EMPLOYEES.find(e => e.id === empId)?.email || ''

const roleColor = {
  'Owner': 'navy', 'Mine Manager': 'blue', 'Camp Manager': 'purple',
  'Shift Supervisor': 'amber', 'Metallurgist': 'gold', 'HSE Officer': 'green', 'HR/Admin': 'gray'
}

const EMPTY = { employee_id: '', role: '', email: '', password: '', confirmPassword: '' }

export default function UserManagement() {
  const { user: currentUser } = useAuth()
  const [users, setUsers] = useState([])
  const [employees, setEmployees] = useState([])
  const [modal, setModal] = useState(false)
  const [form, setForm] = useState(EMPTY)
  const [showPw, setShowPw] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [resetModal, setResetModal] = useState(null) // { userId, name }

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    // Load employees
    if (DEMO_MODE) {
      const stored = JSON.parse(localStorage.getItem('mm_employees') || '[]')
      setEmployees(stored.length ? stored : EMPLOYEES)
      // Load demo users
      const demoUsers = JSON.parse(localStorage.getItem('mm_app_users') || '[]')
      setUsers(demoUsers)
    } else {
      // Load employees from DB
      const { data: emps } = await dbSelect('employees')
      setEmployees(emps?.length ? emps : EMPLOYEES)
      // Load ALL user profiles via serverless function (bypasses RLS for Owner view)
      try {
        const session = await supabase.auth.getSession()
        const token = session?.data?.session?.access_token
        const res = await fetch('/api/admin-profiles', {
          headers: { 'Authorization': `Bearer ${token}` }
        })
        if (res.ok) {
          setUsers(await res.json())
        } else {
          // Fallback: own profile only (RLS)
          const { data: profiles } = await dbSelect('user_profiles')
          setUsers(profiles || [])
        }
      } catch {
        const { data: profiles } = await dbSelect('user_profiles')
        setUsers(profiles || [])
      }
    }
  }

  function set(f) { return e => setForm(p => ({ ...p, [f]: e.target.value })) }

  // When employee is selected, auto-fill email and role
  function onSelectEmployee(empId) {
    const emp = employees.find(e => e.id === empId)
    if (!emp) return setForm(p => ({ ...p, employee_id: empId }))
    setForm(p => ({
      ...p,
      employee_id: empId,
      email: emp.email || `${emp.name.toLowerCase().replace(/\s+/g, '.')}@celestium.zw`,
      role: SYSTEM_ROLES.includes(emp.role) ? emp.role : ''
    }))
  }

  // Check if employee already has an account
  const hasAccount = empId => users.some(u => u.employee_id === empId)

  async function createUser() {
    setError('')
    if (!form.employee_id || !form.role || !form.email || !form.password) {
      setError('All fields are required.')
      return
    }
    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match.')
      return
    }
    if (form.password.length < 8) {
      setError('Password must be at least 8 characters.')
      return
    }
    if (hasAccount(form.employee_id)) {
      setError('This employee already has a login account.')
      return
    }

    setSaving(true)
    const emp = employees.find(e => e.id === form.employee_id)

    if (DEMO_MODE) {
      const newUser = {
        id: crypto.randomUUID(),
        employee_id: form.employee_id,
        name: emp?.name || '',
        email: form.email,
        password: form.password,
        role: form.role,
        created_at: new Date().toISOString(),
        created_by: currentUser?.name
      }
      const existing = JSON.parse(localStorage.getItem('mm_app_users') || '[]')
      existing.push(newUser)
      localStorage.setItem('mm_app_users', JSON.stringify(existing))
      // Also add to DEMO_USERS in session storage for login
      const sessions = JSON.parse(sessionStorage.getItem('mm_demo_users') || '[]')
      sessions.push(newUser)
      sessionStorage.setItem('mm_demo_users', JSON.stringify(sessions))
      setUsers(existing)
      setSuccess(`Account created for ${emp?.name}. They can now log in.`)
    } else {
      // Create Supabase auth user
      const { data, error: authError } = await supabase.auth.signUp({
        email: form.email,
        password: form.password,
        options: {
          emailRedirectTo: window.location.origin,
          data: { name: emp?.name, role: form.role }
        }
      })
      if (authError) { setError(authError.message); setSaving(false); return }

      // Create user profile
      if (data?.user) {
        await supabase.from('user_profiles').insert({
          id: data.user.id,
          name: emp?.name || form.email,
          role: form.role,
          employee_id: form.employee_id
        })
      }
      setSuccess(`Account created for ${emp?.name}. They will receive a confirmation email.`)
      await loadData()
    }

    setSaving(false)
    setModal(false)
    setForm(EMPTY)
    setTimeout(() => setSuccess(''), 4000)
  }

  async function resetPassword(userId) {
    if (DEMO_MODE) {
      setSuccess('Password reset not available in Demo Mode.')
      setResetModal(null)
      return
    }
    // Send password reset email via Supabase
    const u = users.find(u => u.id === userId)
    const email = staticEmail(u?.employee_id)
    if (!email) return
    await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`
    })
    setSuccess(`Password reset email sent to ${email}`)
    setResetModal(null)
    setTimeout(() => setSuccess(''), 4000)
  }

  // Only employees with SYSTEM_ROLES and no account yet
  const eligibleEmployees = employees.filter(e =>
    SYSTEM_ROLES.includes(e.role) && !hasAccount(e.id)
  )

  const empById = id => employees.find(e => e.id === id)

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-navy">User Management</h1>
          <p className="text-xs text-gray-500 mt-0.5">Owner access only — create and manage login accounts</p>
        </div>
        <button onClick={() => { setForm(EMPTY); setError(''); setModal(true) }}
          className="btn-primary gap-2 text-sm">
          <UserPlus size={16} /> Add User
        </button>
      </div>

      {success && (
        <div className="flex items-center gap-3 bg-green-50 border border-green-200 rounded-2xl px-4 py-3">
          <CheckCircle2 size={18} className="text-green-600 shrink-0" />
          <p className="text-sm font-semibold text-green-700">{success}</p>
        </div>
      )}

      {/* Active accounts */}
      <div className="space-y-2">
        {users.length === 0 ? (
          <div className="card text-center py-10">
            <Shield size={32} className="text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 font-semibold">No accounts yet</p>
            <p className="text-xs text-gray-400 mt-1">Create login accounts for your team</p>
          </div>
        ) : users.map(u => {
          const emp = empById(u.employee_id)
          return (
            <div key={u.id} className="card flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-navy text-white flex items-center justify-center font-bold text-sm shrink-0">
                  {(u.name || emp?.name || '?').charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="font-bold text-navy text-sm">{u.name || emp?.name}</p>
                  <p className="text-xs text-gray-500">{staticEmail(u.employee_id)}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge color={roleColor[u.role] || 'gray'}>{u.role}</Badge>
                <button onClick={() => setResetModal({ id: u.id, name: u.name || emp?.name, employeeId: u.employee_id })}
                  title="Reset password"
                  className="p-2 rounded-xl hover:bg-gray-100 text-gray-400 hover:text-navy transition-colors">
                  <RefreshCw size={15} />
                </button>
              </div>
            </div>
          )
        })}
      </div>

      {/* Employees without accounts */}
      {eligibleEmployees.length > 0 && (
        <div className="card">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">
            Staff Without Login Accounts ({eligibleEmployees.length})
          </p>
          <div className="space-y-2">
            {eligibleEmployees.map(e => (
              <div key={e.id} className="flex items-center justify-between gap-3 py-1.5">
                <div>
                  <p className="font-semibold text-sm text-navy">{e.name}</p>
                  <p className="text-xs text-gray-400">{e.role}</p>
                </div>
                <button onClick={() => { setForm({ ...EMPTY, employee_id: e.id }); onSelectEmployee(e.id); setError(''); setModal(true) }}
                  className="text-xs btn-outline py-1.5 px-3">
                  Create Login
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Create User Modal */}
      <Modal open={modal} onClose={() => setModal(false)} title="Create Login Account">
        <div className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-xl px-3 py-2">
            <p className="text-xs text-blue-700 font-medium">
              Select an employee from the register. Their email and role will be pre-filled.
            </p>
          </div>

          <div>
            <label className="form-label">Employee <span className="text-red-500">*</span></label>
            <select className="form-select" value={form.employee_id}
              onChange={e => onSelectEmployee(e.target.value)}>
              <option value="">Select employee…</option>
              {employees.filter(e => SYSTEM_ROLES.includes(e.role) && !hasAccount(e.id)).map(e => (
                <option key={e.id} value={e.id}>{e.name} — {e.role}</option>
              ))}
            </select>
          </div>

          <Select label="System Role" value={form.role} onChange={set('role')}
            options={SYSTEM_ROLES.map(r => ({ value: r, label: r }))}
            placeholder="Select role…" required />

          <Input label="Email Address" type="email" value={form.email} onChange={set('email')}
            placeholder="name@celestium.zw" required />

          <div>
            <label className="form-label">Password <span className="text-red-500">*</span></label>
            <div className="relative">
              <input type={showPw ? 'text' : 'password'} className="form-input pr-12"
                placeholder="Min. 8 characters" value={form.password}
                onChange={e => setForm(p => ({ ...p, password: e.target.value }))} />
              <button type="button" onClick={() => setShowPw(p => !p)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 p-1">
                {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <Input label="Confirm Password" type={showPw ? 'text' : 'password'} value={form.confirmPassword}
            onChange={set('confirmPassword')} placeholder="Re-enter password" required />

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl px-3 py-2">
              <p className="text-sm text-red-700 font-medium">{error}</p>
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button onClick={() => setModal(false)} className="btn-outline flex-1">Cancel</button>
            <button onClick={createUser} disabled={saving} className="btn-primary flex-1">
              {saving ? 'Creating…' : 'Create Account'}
            </button>
          </div>
        </div>
      </Modal>

      {/* Password Reset Confirm */}
      <ConfirmDialog
        open={!!resetModal}
        onClose={() => setResetModal(null)}
        onConfirm={() => resetPassword(resetModal?.id)}
        title="Reset Password"
        message={`Send a password reset email to ${resetModal?.name} (${staticEmail(resetModal?.employeeId)})?`}
        confirmLabel="Send Reset Email"
      />
    </div>
  )
}
