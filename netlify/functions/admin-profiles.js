// Server-side function — service role key never reaches the browser bundle
// Called only by UserManagement (Owner role) to list all user_profiles

export default async (request) => {
  // Only allow GET
  if (request.method !== 'GET') {
    return new Response('Method not allowed', { status: 405 })
  }

  // Verify caller is an authenticated Supabase user
  const authHeader = request.headers.get('Authorization') || ''
  const callerJwt = authHeader.replace('Bearer ', '')
  if (!callerJwt) {
    return new Response('Unauthorized', { status: 401 })
  }

  const SUPABASE_URL = process.env.SUPABASE_URL
  const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
    return new Response('Server misconfigured', { status: 500 })
  }

  // Verify caller identity — fetch their own profile (respects RLS)
  const verifyRes = await fetch(`${SUPABASE_URL}/rest/v1/user_profiles?select=role`, {
    headers: {
      'apikey': process.env.SUPABASE_ANON_KEY,
      'Authorization': `Bearer ${callerJwt}`
    }
  })
  const callerProfiles = await verifyRes.json()
  const callerRole = callerProfiles?.[0]?.role

  if (callerRole !== 'Owner') {
    return new Response('Forbidden — Owner access only', { status: 403 })
  }

  // Fetch all profiles with service role (bypasses RLS)
  const res = await fetch(`${SUPABASE_URL}/rest/v1/user_profiles?select=id,name,role,employee_id`, {
    headers: {
      'apikey': SERVICE_ROLE_KEY,
      'Authorization': `Bearer ${SERVICE_ROLE_KEY}`
    }
  })
  const profiles = await res.json()

  return new Response(JSON.stringify(profiles), {
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  })
}

export const config = { path: '/api/admin-profiles' }
