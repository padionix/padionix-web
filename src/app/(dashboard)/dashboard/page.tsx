import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge, BadgeSensor } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { timeAgo } from '@/lib/utils/formatters'
import { Cpu, BugPlay, Bell, Activity } from 'lucide-react'
import { Suspense } from 'react'
import DashboardClient from './DashboardClient'

export default async function DashboardPage() {
  const supabase = await createClient()

  // ponytail: simple parallel fetches, no RPC
  const [{ count: totalDevices }, { count: detectionsToday }, { count: activeAlerts }] = await Promise.all([
    supabase.from('devices').select('*', { count: 'exact', head: true }).eq('is_active', true),
    supabase.from('detections').select('*', { count: 'exact', head: true }).gte('detected_at', new Date(new Date().setHours(0, 0, 0, 0)).toISOString()),
    supabase.from('alerts').select('*', { count: 'exact', head: true }).eq('is_read', false),
  ])

  const { data: recentDetections } = await supabase
    .from('detections')
    .select('id, pest_name, pest_type, confidence, status, detected_at, device_id')
    .order('detected_at', { ascending: false })
    .limit(5)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-display">Dashboard</h1>
        <p className="text-muted-foreground mt-1">Ringkasan kondisi lahan Anda</p>
      </div>

      {/* Summary cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Perangkat Aktif</CardTitle>
            <Cpu className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalDevices ?? 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Deteksi Hari Ini</CardTitle>
            <BugPlay className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{detectionsToday ?? 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Alert Aktif</CardTitle>
            <Bell className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeAlerts ?? 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Kondisi</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <BadgeSensor status="aman" />
          </CardContent>
        </Card>
      </div>

      {/* Live feed + sensors */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Suspense fallback={<Skeleton className="h-48 w-full" />}>
          <DashboardLiveFeed />
        </Suspense>
      </div>

      {/* Recent detections */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Deteksi Terbaru</CardTitle>
          <Button variant="outline" size="sm">Lihat Semua</Button>
        </CardHeader>
        <CardContent>
          {!recentDetections || recentDetections.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4 text-center">Belum ada deteksi</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-muted-foreground">
                    <th className="text-left py-2 font-medium">Hama</th>
                    <th className="text-left py-2 font-medium">Tipe</th>
                    <th className="text-left py-2 font-medium">Conf.</th>
                    <th className="text-left py-2 font-medium">Status</th>
                    <th className="text-left py-2 font-medium">Waktu</th>
                  </tr>
                </thead>
                <tbody>
                  {recentDetections.map((d) => (
                    <tr key={d.id} className="border-b last:border-0">
                      <td className="py-2">{d.pest_name || '—'}</td>
                      <td className="py-2">
                        <Badge variant={d.pest_type === 'hama' ? 'destructive' : d.pest_type === 'penyakit' ? 'destructive' : 'secondary'}>
                          {d.pest_type}
                        </Badge>
                      </td>
                      <td className="py-2">{d.confidence ? `${(d.confidence * 100).toFixed(0)}%` : '—'}</td>
                      <td className="py-2">
                        <Badge variant={d.status === 'resolved' ? 'default' : d.status === 'unhandled' ? 'destructive' : 'secondary'}>
                          {d.status}
                        </Badge>
                      </td>
                      <td className="py-2 text-muted-foreground">{timeAgo(d.detected_at)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Realtime client */}
      <DashboardClient />
    </div>
  )
}

async function DashboardLiveFeed() {
  // ponytail: static placeholder, real feed from useRealtime on client
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">Live Feed</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="aspect-video rounded-lg bg-muted flex items-center justify-center text-muted-foreground text-sm">
          Camera feed — akan aktif saat perangkat terhubung
        </div>
      </CardContent>
    </Card>
  )
}

// ponytail: sensor card moved to DashboardClient (realtime)
