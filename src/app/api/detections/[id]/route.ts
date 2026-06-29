import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user }, error: authErr } = await supabase.auth.getUser()

  if (authErr || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // verify detection belongs to user's device
  const { data: det } = await supabase
    .from('detections')
    .select('device_id')
    .eq('id', id)
    .single()

  if (!det) {
    return NextResponse.json({ error: 'Detection not found' }, { status: 404 })
  }

  const { data: device } = await supabase
    .from('devices')
    .select('id')
    .eq('id', det.device_id)
    .eq('user_id', user.id)
    .single()

  if (!device) {
    return NextResponse.json({ error: 'Detection not found' }, { status: 404 })
  }

  const body = await request.json()

  const updateData: Record<string, unknown> = {
    handled_by: user.id,
    handled_at: new Date().toISOString(),
  }
  if (body.status !== undefined) updateData.status = body.status
  if (body.handler_note !== undefined) updateData.handler_note = body.handler_note

  const { data, error } = await supabase
    .from('detections')
    .update(updateData)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}
