import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export async function GET(_request: NextRequest) {
  const supabase = await createClient()
  const { data: { user }, error: authErr } = await supabase.auth.getUser()

  if (authErr || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // get user's device IDs
  const { data: devices } = await supabase
    .from('devices')
    .select('id, status')
    .eq('user_id', user.id)

  const deviceIds = devices?.map(d => d.id) ?? []
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const todayStr = today.toISOString()

  // run aggregations in parallel
  const [totalDevices, detectionsToday, activeAlerts, sensors] =
    await Promise.all([
      // total devices count
      Promise.resolve(devices?.length ?? 0),

      // detections today
      deviceIds.length > 0
        ? supabase
            .from('detections')
            .select('*', { count: 'exact', head: true })
            .in('device_id', deviceIds)
            .gte('detected_at', todayStr)
            .then(({ count }) => count ?? 0)
        : Promise.resolve(0),

      // active (unread) alerts
      supabase
        .from('alerts')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('is_read', false)
        .then(({ count }) => count ?? 0),

      // latest sensor readings per device (last 24h)
      deviceIds.length > 0
        ? supabase
            .from('sensor_readings')
            .select('temperature, humidity')
            .in('device_id', deviceIds)
            .gte('recorded_at', new Date(Date.now() - 86400000).toISOString())
            .then(({ data }) => data ?? [])
        : Promise.resolve([]),
    ])

  const readings = sensors as { temperature?: number; humidity?: number }[]
  const temps = readings.filter(r => r.temperature != null).map(r => r.temperature!)
  const hums = readings.filter(r => r.humidity != null).map(r => r.humidity!)
  const avgTemperature =
    temps.length > 0
      ? Math.round((temps.reduce((a, b) => a + b, 0) / temps.length) * 10) / 10
      : null
  const avgHumidity =
    hums.length > 0
      ? Math.round((hums.reduce((a, b) => a + b, 0) / hums.length) * 10) / 10
      : null

  const devicesOnline = devices?.filter(d => d.status === 'online').length ?? 0
  const devicesOffline = (devices?.length ?? 0) - devicesOnline

  return NextResponse.json({
    total_devices: totalDevices,
    detections_today: detectionsToday,
    active_alerts: activeAlerts,
    avg_temperature: avgTemperature,
    avg_humidity: avgHumidity,
    devices_online: devicesOnline,
    devices_offline: devicesOffline,
  })
}
