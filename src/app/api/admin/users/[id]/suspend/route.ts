import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export const dynamic = 'force-dynamic'

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const supabase = await createClient()
  const { data: { user }, error: authErr } = await supabase.auth.getUser()
  if (authErr || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: profile } = await supabase
    .from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { id } = await params
  const admin = createAdminClient()

  // toggle suspend: flip is_active on all user's devices
  const { data: devices } = await admin
    .from('devices')
    .select('is_active')
    .eq('user_id', id)

  if (!devices || devices.length === 0) {
    return NextResponse.json({ message: 'No devices to suspend' })
  }

  const newStatus = !devices[0].is_active
  const { error } = await admin
    .from('devices')
    .update({ is_active: newStatus })
    .eq('user_id', id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ message: newStatus ? 'Unsuspended' : 'Suspended', is_active: newStatus })
}
