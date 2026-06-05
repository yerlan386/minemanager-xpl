import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || ''
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || ''
const SUPABASE_SERVICE_ROLE_KEY = import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY || ''

export const DEMO_MODE = !SUPABASE_URL || !SUPABASE_ANON_KEY

export const supabase = DEMO_MODE
  ? null
  : createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: { persistSession: true, autoRefreshToken: true },
      realtime: { params: { eventsPerSecond: 10 } }
    })

// Admin client — bypasses RLS, used only for Owner-level operations
export const supabaseAdmin = (!DEMO_MODE && SUPABASE_SERVICE_ROLE_KEY)
  ? createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      auth: { persistSession: false, autoRefreshToken: false }
    })
  : null

// Generic upsert helper — falls back to localStorage in demo mode
export async function dbUpsert(table, data) {
  if (DEMO_MODE) {
    const key = `mm_${table}`
    const existing = JSON.parse(localStorage.getItem(key) || '[]')
    const idx = existing.findIndex(r => r.id === data.id)
    if (idx >= 0) existing[idx] = { ...existing[idx], ...data }
    else existing.push({ ...data, id: data.id || crypto.randomUUID(), created_at: new Date().toISOString() })
    localStorage.setItem(key, JSON.stringify(existing))
    return { data: existing, error: null }
  }
  return supabase.from(table).upsert(data).select()
}

export async function dbSelect(table, filters = {}) {
  if (DEMO_MODE) {
    const key = `mm_${table}`
    let rows = JSON.parse(localStorage.getItem(key) || '[]')
    Object.entries(filters).forEach(([k, v]) => { rows = rows.filter(r => r[k] === v) })
    return { data: rows, error: null }
  }
  let q = supabase.from(table).select('*')
  Object.entries(filters).forEach(([k, v]) => { q = q.eq(k, v) })
  return q
}

export async function dbDelete(table, id) {
  if (DEMO_MODE) {
    const key = `mm_${table}`
    const existing = JSON.parse(localStorage.getItem(key) || '[]')
    localStorage.setItem(key, JSON.stringify(existing.filter(r => r.id !== id)))
    return { error: null }
  }
  return supabase.from(table).delete().eq('id', id)
}
