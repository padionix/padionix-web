import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user }, error: authErr } = await supabase.auth.getUser()

  if (authErr || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const sp = request.nextUrl.searchParams
  const deviceId = sp.get('device_id')
  const dateFrom = sp.get('date_from')
  const dateTo = sp.get('date_to')
  const pest = sp.get('pest')
  const status = sp.get('status')
  const limit = Math.min(Math.max(parseInt(sp.get('limit') || '50', 10), 1), 200)
  const offset = Math.max(parseInt(sp.get('offset') || '0', 10), 0)

  // get user's device IDs
  const { data: devices } = await supabase
    .from('devices')
    .select('id')
    .eq('user_id', user.id)

  const deviceIds = devices?.map(d => d.id) ?? []

  if (deviceIds.length === 0) {
    return NextResponse.json({ data: [], pagination: { limit, offset, total: 0 } })
  }

  let query = supabase
    .from('detections')
    .select('*', { count: 'exact' })
    .in('device_id', deviceIds)

  if (deviceId) {
    query = query.eq('device_id', deviceId)
  }
  if (dateFrom) {
    query = query.gte('detected_at', dateFrom)
  }
  if (dateTo) {
    query = query.lte('detected_at', dateTo)
  }
  if (pest) {
    query = query.eq('pest_name', pest)
  }
  if (status) {
    query = query.eq('status', status)
  }

  const { data, error, count } = await query
    .order('detected_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({
    data: data ?? [],
    pagination: { limit, offset, total: count ?? 0 },
  })
}
