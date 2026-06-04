import { useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import { Eye, EyeOff, HardHat } from 'lucide-react'
import { DEMO_USERS } from '../../data/employees'

export default function Login() {
  const { login, isDemo } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '' })
  const [showPw, setShowPw] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    const { error: err } = await login(form.email, form.password)
    setLoading(false)
    if (err) setError(err.message)
    else navigate('/')
  }

  function quickLogin(u) {
    setForm({ email: u.email, password: u.password })
  }

  return (
    <div className="min-h-screen bg-navy flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gold rounded-2xl mb-4">
            <HardHat size={32} className="text-navy" />
          </div>
          <h1 className="text-3xl font-bold text-white">MineManager</h1>
          <p className="text-gold font-semibold text-lg">XPL</p>
          <p className="text-white/50 text-sm mt-1">Celestium Corporate Ltd · Dande, Zimbabwe</p>
        </div>

        {/* Form */}
        <div className="bg-white rounded-2xl p-6 shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="form-label">Email</label>
              <input
                type="email"
                className="form-input"
                placeholder="you@celestium.zw"
                value={form.email}
                onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                required
                autoComplete="email"
              />
            </div>
            <div>
              <label className="form-label">Password</label>
              <div className="relative">
                <input
                  type={showPw ? 'text' : 'password'}
                  className="form-input pr-12"
                  placeholder="••••••••"
                  value={form.password}
                  onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                  required
                  autoComplete="current-password"
                />
                <button type="button" onClick={() => setShowPw(p => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1">
                  {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
            {error && <p className="text-red-600 text-sm font-medium bg-red-50 px-3 py-2 rounded-xl">{error}</p>}
            <button type="submit" disabled={loading} className="btn-primary w-full text-base py-4">
              {loading ? 'Signing in…' : 'Sign In'}
            </button>
          </form>

          {isDemo && (
            <div className="mt-6 pt-5 border-t border-gray-100">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Demo — quick login</p>
              <div className="grid grid-cols-2 gap-2">
                {DEMO_USERS.map(u => (
                  <button key={u.id} type="button" onClick={() => quickLogin(u)}
                    className="text-left p-2.5 rounded-xl border border-gray-200 hover:border-navy hover:bg-navy/5 transition-colors">
                    <p className="text-xs font-semibold text-navy truncate">{u.name}</p>
                    <p className="text-[10px] text-gray-400 truncate">{u.role}</p>
                  </button>
                ))}
              </div>
              <p className="text-[10px] text-gray-400 text-center mt-3">Password: demo1234</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
