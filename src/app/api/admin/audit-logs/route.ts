import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user }, error: authErr } = await supabase.auth.getUser()
  if (authErr || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: profile } = await supabase
    .from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const admin = createAdminClient()
  const sp = request.nextUrl.searchParams

  const page = Math.max(1, parseInt(sp.get('page') ?? '1', 10) || 1)
  const limit = Math.min(100, Math.max(1, parseInt(sp.get('limit') ?? '50', 10) || 50))
  const offset = (page - 1) * limit

  const userId = sp.get('user_id')
  const action = sp.get('action')
  const resource = sp.get('resource')
  const fromDate = sp.get('from')
  const toDate = sp.get('to')

  let query = admin.from('audit_logs').select('*', { count: 'exact' })
  let countQuery = admin.from('audit_logs').select('*', { count: 'exact', head: true })

  if (userId) {
    query = query.eq('user_id', userId)
    countQuery = countQuery.eq('user_id', userId)
  }
  if (action) {
    query = query.eq('action', action)
    countQuery = countQuery.eq('action', action)
  }
  if (resource) {
    query = query.eq('resource', resource)
    countQuery = countQuery.eq('resource', resource)
  }
  if (fromDate) {
    query = query.gte('created_at', fromDate)
    countQuery = countQuery.gte('created_at', fromDate)
  }
  if (toDate) {
    query = query.lt('created_at', toDate)
    countQuery = countQuery.lt('created_at', toDate)
  }

  const [{ data, error }, { count }] = await Promise.all([
    query.order('created_at', { ascending: false }).range(offset, offset + limit - 1),
    countQuery,
  ])

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({
    data: data ?? [],
    pagination: { page, limit, total: count ?? 0, totalPages: Math.ceil((count ?? 0) / limit) },
  })
}
