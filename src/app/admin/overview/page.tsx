import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Cpu, Users, BugPlay, Activity } from 'lucide-react'

export default async function AdminOverviewPage() {
  const supabase = await createClient()

  const [{ count: totalDevices }, { count: totalUsers }, { count: detectionsMonth }] = await Promise.all([
    supabase.from('devices').select('*', { count: 'exact', head: true }),
    supabase.from('profiles').select('*', { count: 'exact', head: true }),
    supabase.from('detections').select('*', { count: 'exact', head: true })
      .gte('detected_at', new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString()),
  ])

  const stats = [
    { icon: Cpu, label: 'Total Perangkat', value: totalDevices ?? 0 },
    { icon: Users, label: 'Total Pengguna', value: totalUsers ?? 0 },
    { icon: BugPlay, label: 'Deteksi Bulan Ini', value: detectionsMonth ?? 0 },
    { icon: Activity, label: 'Sistem', value: 'Aktif' },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-display">Overview</h1>
        <p className="text-muted-foreground mt-1">Statistik agregat platform</p>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <Card key={s.label}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">{s.label}</CardTitle>
              <s.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{s.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
