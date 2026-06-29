'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRealtime } from '@/lib/hooks/useRealtime'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { SensorReading } from '@/lib/types'

// ponytail: single component — serves initial data + realtime updates
export default function DashboardClient() {
  const [latest, setLatest] = useState<SensorReading | null>(null)
  const readings = useRealtime<SensorReading>('sensor_readings')

  useEffect(() => {
    createClient()
      .from('sensor_readings')
      .select('*')
      .order('recorded_at', { ascending: false })
      .limit(1)
      .single()
      .then(({ data }) => { if (data) setLatest(data) })
  }, [])

  const l = readings[0] || latest

  return (
    <Card>
      <CardHeader><CardTitle className="text-sm">Sensor Real-time</CardTitle></CardHeader>
      <CardContent>
        {l ? (
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold">{l.temperature?.toFixed(1) ?? '—'}°C</div>
              <div className="text-xs text-muted-foreground">Suhu</div>
            </div>
            <div>
              <div className="text-2xl font-bold">{l.humidity?.toFixed(0) ?? '—'}%</div>
              <div className="text-xs text-muted-foreground">Kelembaban</div>
            </div>
            <div>
              <div className="text-2xl font-bold">{l.pressure?.toFixed(0) ?? '—'} hPa</div>
              <div className="text-xs text-muted-foreground">Tekanan</div>
            </div>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground text-center py-4">Belum ada data sensor</p>
        )}
      </CardContent>
    </Card>
  )
}
