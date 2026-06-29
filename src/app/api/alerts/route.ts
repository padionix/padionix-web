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
  const isRead = sp.get('is_read')
  const type = sp.get('type')
  const severity = sp.get('severity')

  let query = supabase
    .from('alerts')
    .select('*')
    .eq('user_id', user.id)

  if (isRead === 'true') query = query.eq('is_read', true)
  else if (isRead === 'false') query = query.eq('is_read', false)

  if (type) query = query.eq('type', type)
  if (severity) query = query.eq('severity', severity)

  const { data, error } = await query
    .order('created_at', { ascending: false })
    .limit(50)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data ?? [])
}
