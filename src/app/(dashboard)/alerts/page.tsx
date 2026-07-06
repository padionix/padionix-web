'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { createClient } from '@/lib/supabase/client'
import { formatDateTime } from '@/lib/utils/formatters'
import { AlertTriangle, Info, AlertCircle, CheckCheck } from 'lucide-react'
import { useEffect, useState } from 'react'
import type { Alert, AlertSeverity } from '@/lib/types'

export default function AlertsPage() {
  useEffect(() => { document.title = 'Alert | Padionix' }, [])
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<AlertSeverity | 'all' | 'unread'>('all')

  useEffect(() => {
    const supabase = createClient()
    supabase.from('alerts').select('*').order('created_at', { ascending: false }).then(({ data }) => {
      if (data) setAlerts(data as Alert[])
      setLoading(false)
    })
  }, [])

  async function markRead(id: string) {
    const supabase = createClient()
    await supabase.from('alerts').update({ is_read: true }).eq('id', id)
    setAlerts((prev) => prev.map((a) => (a.id === id ? { ...a, is_read: true } : a)))
  }

  async function markAllRead() {
    const supabase = createClient()
    await supabase.from('alerts').update({ is_read: true }).in('id', alerts.filter((a) => !a.is_read).map((a) => a.id))
    setAlerts((prev) => prev.map((a) => ({ ...a, is_read: true })))
  }

  const filtered = alerts.filter((a) => {
    if (filter === 'unread') return !a.is_read
    if (filter === 'all') return true
    return a.severity === filter
  })

  const iconMap: Record<AlertSeverity, typeof Info> = { info: Info, warning: AlertTriangle, critical: AlertCircle }

  if (loading) return <div className="space-y-4">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-20" />)}</div>

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-display">Notifikasi & Alert</h1>
          <p className="text-muted-foreground mt-1">Pantau kondisi dan peringatan</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          {(['all', 'unread', 'critical', 'warning', 'info'] as const).map((f) => (
            <Button key={f} variant={filter === f ? 'default' : 'outline'} size="sm" onClick={() => setFilter(f)}>
              {f === 'all' ? 'Semua' : f === 'unread' ? 'Belum Dibaca' : f.charAt(0).toUpperCase() + f.slice(1)}
            </Button>
          ))}
          <Button variant="ghost" size="sm" onClick={markAllRead}><CheckCheck className="h-4 w-4 mr-1" /> Baca Semua</Button>
        </div>
      </div>

      {filtered.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">Tidak ada notifikasi</CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filtered.map((alert) => {
            const Icon = iconMap[alert.severity]
            return (
              <Card key={alert.id} className={alert.is_read ? 'opacity-70' : 'border-l-4 border-l-primary'}>
                <CardContent className="py-4">
                  <div className="flex items-start gap-3">
                    <Icon className={`h-5 w-5 mt-0.5 shrink-0 ${
                      alert.severity === 'critical' ? 'text-danger' : alert.severity === 'warning' ? 'text-warning' : 'text-info'
                    }`} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h4 className="font-medium text-sm">{alert.title}</h4>
                          <p className="text-sm text-muted-foreground mt-0.5">{alert.message}</p>
                        </div>
                        <Badge variant={alert.severity === 'critical' ? 'destructive' : alert.severity === 'warning' ? 'destructive' : 'secondary'}>
                          {alert.severity}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-3 mt-2">
                        <span className="text-xs text-muted-foreground">{formatDateTime(alert.created_at)}</span>
                        {!alert.is_read && (
                          <Button size="sm" variant="ghost" className="h-6 text-xs" onClick={() => markRead(alert.id)}>
                            Tandai Dibaca
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
