import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user }, error: authErr } = await supabase.auth.getUser()

  if (authErr || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // verify device ownership
  const { data: device } = await supabase
    .from('devices')
    .select('id')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (!device) {
    return NextResponse.json({ error: 'Device not found' }, { status: 404 })
  }

  const sp = request.nextUrl.searchParams
  const from = sp.get('from') || new Date(Date.now() - 86400000).toISOString()
  const to = sp.get('to') || new Date().toISOString()
  const interval = sp.get('interval') || 'hour'
  const page = Math.max(parseInt(sp.get('page') || '1', 10), 1)
  const limit = Math.min(Math.max(parseInt(sp.get('limit') || '100', 10), 1), 500)
  const offset = (page - 1) * limit

  // supported intervals for date_trunc
  const validIntervals = ['minute', 'hour', 'day', 'week', 'month']
  const bucket = validIntervals.includes(interval) ? interval : 'hour'

  // get total count for pagination
  const { count } = await supabase
    .from('sensor_readings')
    .select('*', { count: 'exact', head: true })
    .eq('device_id', id)
    .gte('recorded_at', from)
    .lte('recorded_at', to)

  // aggregated query with date_trunc
  const { data, error } = await supabase
    .rpc('get_readings_aggregated', {
      p_device_id: id,
      p_from: from,
      p_to: to,
      p_interval: bucket,
      p_limit: limit,
      p_offset: offset,
    })

  if (error) {
    // fallback: fetch raw readings
    const { data: raw, error: rawErr } = await supabase
      .from('sensor_readings')
      .select('*')
      .eq('device_id', id)
      .gte('recorded_at', from)
      .lte('recorded_at', to)
      .order('recorded_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (rawErr) {
      return NextResponse.json({ error: rawErr.message }, { status: 500 })
    }

    return NextResponse.json({
      data: raw,
      pagination: { page, limit, total: count ?? 0, total_pages: Math.ceil((count ?? 0) / limit) },
    })
  }

  return NextResponse.json({
    data,
    pagination: { page, limit, total: count ?? 0, total_pages: Math.ceil((count ?? 0) / limit) },
  })
}
