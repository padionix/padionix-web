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
  const type = sp.get('type') || 'csv'
  const dateFrom = sp.get('date_from') || new Date(Date.now() - 7 * 86400000).toISOString()
  const dateTo = sp.get('date_to') || new Date().toISOString()

  // get user's device IDs
  const { data: devices } = await supabase
    .from('devices')
    .select('id')
    .eq('user_id', user.id)

  const deviceIds = devices?.map(d => d.id) ?? []

  if (deviceIds.length === 0) {
    if (type === 'csv') {
      return new NextResponse('device_id,pest_name,pest_type,confidence,severity,status,detected_at\n', {
        headers: { 'Content-Type': 'text/csv', 'Content-Disposition': 'attachment; filename=detections.csv' },
      })
    }
    return NextResponse.json({ data: [] })
  }

  const { data, error } = await supabase
    .from('detections')
    .select('device_id, pest_name, pest_type, confidence, severity, status, detected_at')
    .in('device_id', deviceIds)
    .gte('detected_at', dateFrom)
    .lte('detected_at', dateTo)
    .order('detected_at', { ascending: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Accept header or type param decides format
  const accept = request.headers.get('accept') || ''
  const wantsCSV = type === 'csv' || accept.includes('text/csv')

  if (wantsCSV) {
    const header = 'device_id,pest_name,pest_type,confidence,severity,status,detected_at'
    const rows = (data ?? []).map(r =>
      [
        r.device_id,
        r.pest_name ?? '',
        r.pest_type,
        r.confidence ?? '',
        r.severity ?? '',
        r.status,
        r.detected_at,
      ]
        .map(v => `"${String(v).replace(/"/g, '""')}"`)
        .join(',')
    )
    const csv = [header, ...rows].join('\n')

    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': 'attachment; filename=detections.csv',
      },
    })
  }

  return NextResponse.json({ data: data ?? [] })
}
