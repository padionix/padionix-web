import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatBattery, formatDateTime, timeAgo } from '@/lib/utils/formatters'
import { ArrowLeft, Cpu, Wifi, WifiOff, AlertTriangle } from 'lucide-react'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { DeviceStatus } from '@/lib/types'
import SensorChart from './SensorChart'

export default async function DeviceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()
  const { data: d, error } = await supabase.from('devices').select('*').eq('id', id).single()
  if (error || !d) notFound()

  const { data: readings } = await supabase
    .from('sensor_readings')
    .select('*')
    .eq('device_id', id)
    .order('recorded_at', { ascending: false })
    .limit(20)

  const { data: detections } = await supabase
    .from('detections')
    .select('id, pest_name, pest_type, confidence, status, detected_at')
    .eq('device_id', id)
    .order('detected_at', { ascending: false })
    .limit(10)

  const statusIcon = (s: DeviceStatus) => {
    if (s === 'online') return <><Wifi className="h-4 w-4" /> Online</>
    if (s === 'error') return <><AlertTriangle className="h-4 w-4" /> Error</>
    return <><WifiOff className="h-4 w-4" /> Offline</>
  }

  return (
    <div className="space-y-6">
      <Link href="/devices" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4 mr-1" /> Kembali ke Perangkat
      </Link>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <Cpu className="h-6 w-6 text-primary" />
            <h1 className="text-2xl font-bold font-display">{d.name}</h1>
          </div>
          <p className="text-muted-foreground mt-1">{d.location_name || 'Lokasi tidak diatur'}</p>
        </div>
        <Badge variant={d.status === 'online' ? 'default' : d.status === 'error' ? 'destructive' : 'secondary'}
          className="text-sm py-1 px-3">
          {statusIcon(d.status)}
        </Badge>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Info */}
        <Card>
          <CardHeader><CardTitle className="text-sm">Informasi</CardTitle></CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex justify-between"><span className="text-muted-foreground">Device Key</span><code className="text-xs bg-muted px-1 rounded">{d.device_key}</code></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Baterai</span><span>{formatBattery(d.battery_pct)}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Firmware</span><span>{d.firmware_ver || '—'}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Terakhir Aktif</span><span>{d.last_seen ? timeAgo(d.last_seen) : '—'}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Status</span><span>{d.is_active ? 'Aktif' : 'Tidak Aktif'}</span></div>
          </CardContent>
        </Card>

        {/* Camera */}
        <Card className="lg:col-span-2">
          <CardHeader><CardTitle className="text-sm">Live Camera</CardTitle></CardHeader>
          <CardContent>
            {/* ponytail: placeholder — real camera with WebRTC/MJPEG when device online */}
            <div className="aspect-video rounded-lg bg-muted flex items-center justify-center text-muted-foreground">
              {d.status === 'online' ? 'Camera feed — placeholder' : 'Perangkat offline'}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sensor readings chart placeholder */}
      <Card>
        <CardHeader><CardTitle className="text-sm">Sensor Readings</CardTitle></CardHeader>
        <CardContent>
          <SensorChart readings={readings ?? []} />
          {readings && readings.length > 0 && (
            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-muted-foreground">
                    <th className="text-left py-1 font-medium">Waktu</th>
                    <th className="text-right py-1 font-medium">Suhu</th>
                    <th className="text-right py-1 font-medium">Humidity</th>
                    <th className="text-right py-1 font-medium">Pressure</th>
                  </tr>
                </thead>
                <tbody>
                  {readings.slice(0, 5).map((r) => (
                    <tr key={r.id} className="border-b last:border-0">
                      <td className="py-1 text-muted-foreground">{formatDateTime(r.recorded_at)}</td>
                      <td className="py-1 text-right">{r.temperature?.toFixed(1) ?? '—'}°C</td>
                      <td className="py-1 text-right">{r.humidity?.toFixed(0) ?? '—'}%</td>
                      <td className="py-1 text-right">{r.pressure?.toFixed(0) ?? '—'} hPa</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Detection history */}
      <Card>
        <CardHeader><CardTitle className="text-sm">Riwayat Deteksi</CardTitle></CardHeader>
        <CardContent>
          {!detections || detections.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">Belum ada deteksi</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-muted-foreground">
                    <th className="text-left py-2 font-medium">Hama</th>
                    <th className="text-left py-2 font-medium">Tipe</th>
                    <th className="text-left py-2 font-medium">Confidence</th>
                    <th className="text-left py-2 font-medium">Status</th>
                    <th className="text-left py-2 font-medium">Waktu</th>
                  </tr>
                </thead>
                <tbody>
                  {detections.map((det) => (
                    <tr key={det.id} className="border-b last:border-0">
                      <td className="py-2">{det.pest_name || '—'}</td>
                      <td className="py-2"><Badge variant={det.pest_type === 'hama' ? 'destructive' : 'secondary'}>{det.pest_type}</Badge></td>
                      <td className="py-2">{det.confidence ? `${(det.confidence * 100).toFixed(0)}%` : '—'}</td>
                      <td className="py-2"><Badge variant={det.status === 'resolved' ? 'default' : det.status === 'unhandled' ? 'destructive' : 'secondary'}>{det.status}</Badge></td>
                      <td className="py-2 text-muted-foreground">{formatDateTime(det.detected_at)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
