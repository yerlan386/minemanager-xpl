import { createContext, useContext, useState, useEffect } from 'react'
import { supabase, DEMO_MODE } from '../lib/supabase'
import { DEMO_USERS } from '../data/employees'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (DEMO_MODE) {
      const saved = localStorage.getItem('mm_session')
      if (saved) setUser(JSON.parse(saved))
      setLoading(false)
      return
    }
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user ?? null)
    })
    return () => subscription.unsubscribe()
  }, [])

  async function login(email, password) {
    if (DEMO_MODE) {
      const found = DEMO_USERS.find(u => u.email === email && u.password === password)
      if (!found) return { error: { message: 'Invalid email or password' } }
      const session = { ...found, password: undefined }
      localStorage.setItem('mm_session', JSON.stringify(session))
      setUser(session)
      return { error: null }
    }
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    return { data, error }
  }

  async function logout() {
    if (DEMO_MODE) {
      localStorage.removeItem('mm_session')
      setUser(null)
      return
    }
    await supabase.auth.signOut()
  }

  const value = { user, loading, login, logout, isDemo: DEMO_MODE }
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}

export function useHasAccess(permission) {
  const { user } = useAuth()
  if (!user) return false
  if (user.role === 'Owner') return true
  const ROLE_PERMISSIONS = {
    'Mine Manager':    ['dashboard','shift','production','hr','operations','compliance','goldroom'],
    'Shift Supervisor':['dashboard','shift','production','hr_attendance','maintenance_faults','hse','si91'],
    'Metallurgist':    ['dashboard','shift_view','production_view','goldroom'],
    'HSE Officer':     ['dashboard','shift_view','hse','regulatory','reports_hse'],
    'HR/Admin':        ['dashboard','hr']
  }
  return ROLE_PERMISSIONS[user.role]?.includes(permission) ?? false
}
