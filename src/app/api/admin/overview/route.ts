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

  const [{ count: totalDevices }, { count: totalUsers }, { count: detectionsMonth }] = await Promise.all([
    admin.from('devices').select('*', { count: 'exact', head: true }),
    admin.from('profiles').select('*', { count: 'exact', head: true }),
    admin.from('detections').select('*', { count: 'exact', head: true })
      .gte('detected_at', monthStart),
  ])

  return NextResponse.json({
    totalDevices: totalDevices ?? 0,
    totalUsers: totalUsers ?? 0,
    detectionsThisMonth: detectionsMonth ?? 0,
  })
}
