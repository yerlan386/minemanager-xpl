import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://hwjkfvdvfeocmrkvsgxm.supabase.co'
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_D06gPm-eUPN-CQ3iKfFRvA_ue4GLUwS'
const SUPABASE_SERVICE_ROLE_KEY = import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY
  || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh3amtmdmR2ZmVvY21ya3ZzZ3htIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MDU5MTY4NywiZXhwIjoyMDk2MTY3Njg3fQ.mt70chwVAygKT7uI2WIiB8X25BppphbtfddIb0QU7ZU'

export const DEMO_MODE = !SUPABASE_URL || !SUPABASE_ANON_KEY

export const supabase = DEMO_MODE
  ? null
  : createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: { persistSession: true, autoRefreshToken: true },
      realtime: { params: { eventsPerSecond: 10 } }
    })

// Admin client — bypasses RLS, used only for Owner-level operations.
// storageKey must differ from the main client to avoid "Multiple GoTrueClient" warning.
export const supabaseAdmin = (!DEMO_MODE && SUPABASE_SERVICE_ROLE_KEY)
  ? createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        storageKey: 'mm_admin_session',
      }
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
