import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import type { Role, Subscription } from '@/lib/types'

export const dynamic = 'force-dynamic'

async function requireAdmin() {
  const supabase = await createClient()
  const { data: { user }, error: authErr } = await supabase.auth.getUser()
  if (authErr || !user) return null
  const { data: profile } = await supabase
    .from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'admin') return null
  return createAdminClient()
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const admin = await requireAdmin()
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params

  const { data: profile, error } = await admin
    .from('profiles')
    .select('*, devices(count)')
    .eq('id', id)
    .single()

  if (error || !profile) return NextResponse.json({ error: 'User not found' }, { status: 404 })
  return NextResponse.json(profile)
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const admin = await requireAdmin()
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const body = await request.json()

  // ponytail: allowlist of updatable fields
  const allowed: Record<string, unknown> = {}
  const fields = ['full_name', 'phone', 'group_name', 'address', 'avatar_url'] as const
  for (const f of fields) {
    if (body[f] !== undefined) allowed[f] = body[f]
  }
  if (body.role !== undefined) allowed.role = body.role as Role
  if (body.subscription !== undefined) allowed.subscription = body.subscription as Subscription

  // suspend/unsuspend all user's devices
  let devicesUpdated = false
  if (body.is_active !== undefined) {
    const { error: devErr } = await admin
      .from('devices')
      .update({ is_active: body.is_active as boolean })
      .eq('user_id', id)
    if (devErr) return NextResponse.json({ error: devErr.message }, { status: 500 })
    devicesUpdated = true
  }

  if (Object.keys(allowed).length === 0 && !devicesUpdated) {
    return NextResponse.json({ error: 'No valid fields provided' }, { status: 400 })
  }

  if (Object.keys(allowed).length === 0) {
    // only device status changed, return current profile
    const { data, error } = await admin.from('profiles').select('*').eq('id', id).single()
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json(data)
  }

  const { data, error } = await admin
    .from('profiles')
    .update(allowed)
    .eq('id', id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const admin = await requireAdmin()
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params

  // soft-delete: deactivate devices + mark profile deleted
  const now = new Date().toISOString()

  const { error: devErr } = await admin
    .from('devices')
    .update({ is_active: false })
    .eq('user_id', id)
  if (devErr) return NextResponse.json({ error: devErr.message }, { status: 500 })

  const { error: profileErr } = await admin
    .from('profiles')
    .update({ deleted_at: now })
    .eq('id', id)
  if (profileErr) return NextResponse.json({ error: profileErr.message }, { status: 500 })

  return NextResponse.json({ status: 'deleted', deleted_at: now })
}
