import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export const dynamic = 'force-dynamic'

export async function GET(_request: NextRequest) {
  const supabase = await createClient()
  const { data: { user }, error: authErr } = await supabase.auth.getUser()
  if (authErr || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: profile } = await supabase
    .from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const admin = createAdminClient()
  const now = new Date()
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()

  const [
    { count: totalUsers },
    { count: totalDevices },
    { count: totalDetections },
    { count: detectionsMonth },
    { count: totalAlerts },
    { count: unreadAlerts },
    { count: activeDevices },
  ] = await Promise.all([
    admin.from('profiles').select('*', { count: 'exact', head: true }),
    admin.from('devices').select('*', { count: 'exact', head: true }),
    admin.from('detections').select('*', { count: 'exact', head: true }),
    admin.from('detections').select('*', { count: 'exact', head: true })
      .gte('detected_at', monthStart),
    admin.from('alerts').select('*', { count: 'exact', head: true }),
    admin.from('alerts').select('*', { count: 'exact', head: true }).eq('is_read', false),
    admin.from('devices').select('*', { count: 'exact', head: true }).eq('status', 'online'),
  ])

  return NextResponse.json({
    totalUsers: totalUsers ?? 0,
    totalDevices: totalDevices ?? 0,
    activeDevices: activeDevices ?? 0,
    totalDetections: totalDetections ?? 0,
    detectionsThisMonth: detectionsMonth ?? 0,
    totalAlerts: totalAlerts ?? 0,
    unreadAlerts: unreadAlerts ?? 0,
  })
}
