import { createContext, useContext, useState, useEffect } from 'react'
import { supabase, DEMO_MODE } from '../lib/supabase'
import { DEMO_USERS } from '../data/employees'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser]     = useState(null)
  const [loading, setLoading] = useState(true)

  // Fetch the user_profile row to get name + role
  async function fetchProfile(authUser) {
    if (!authUser) return null
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', authUser.id)
      .single()
    if (error || !data) return { ...authUser, name: authUser.email, role: 'Shift Supervisor' }
    return { ...authUser, name: data.name, role: data.role, employeeId: data.employee_id }
  }

  useEffect(() => {
    if (DEMO_MODE) {
      const saved = localStorage.getItem('mm_session')
      if (saved) setUser(JSON.parse(saved))
      setLoading(false)
      return
    }

    // Check existing session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        const profile = await fetchProfile(session.user)
        setUser(profile)
      }
      setLoading(false)
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        const profile = await fetchProfile(session.user)
        setUser(profile)
      } else {
        setUser(null)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  async function login(email, password) {
    if (DEMO_MODE) {
      // Check built-in demo users + any users created via User Management
      const dynamicUsers = JSON.parse(localStorage.getItem('mm_app_users') || '[]')
      const allUsers = [...DEMO_USERS, ...dynamicUsers]
      const found = allUsers.find(u => u.email === email && u.password === password)
      if (!found) return { error: { message: 'Invalid email or password' } }
      const session = { ...found, password: undefined }
      localStorage.setItem('mm_session', JSON.stringify(session))
      setUser(session)
      return { error: null }
    }

    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) return { error }

    // Set user immediately — don't wait for onAuthStateChange (avoids race condition)
    if (data?.user) {
      const profile = await fetchProfile(data.user)
      setUser(profile)
    }
    return { error: null }
  }

  async function logout() {
    if (DEMO_MODE) {
      localStorage.removeItem('mm_session')
      setUser(null)
      return
    }
    await supabase.auth.signOut()
    setUser(null)
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
    'Mine Manager':     ['dashboard','shift','production','hr','operations','compliance','goldroom'],
    'Camp Manager':     ['dashboard','shift','production','hr','operations','compliance'],
    'Shift Supervisor': ['dashboard','shift','production','hr_attendance','maintenance_faults','hse','si91'],
    'Metallurgist':     ['dashboard','shift_view','production_view','goldroom'],
    'HSE Officer':      ['dashboard','shift_view','hse','regulatory','reports_hse'],
    'HR/Admin':         ['dashboard','hr']
  }
  return ROLE_PERMISSIONS[user.role]?.includes(permission) ?? false
}
