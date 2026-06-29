'use client'

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Select } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { createClient } from '@/lib/supabase/client'
import { formatBattery, timeAgo } from '@/lib/utils/formatters'
import { Cpu, Plus, Wifi, WifiOff, AlertTriangle } from 'lucide-react'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import type { Device } from '@/lib/types'

export default function DevicesPage() {
  const [devices, setDevices] = useState<Device[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    const supabase = createClient()
    supabase.from('devices').select('*').order('created_at', { ascending: false }).then(({ data }) => {
      if (data) setDevices(data)
      setLoading(false)
    })
  }, [])

  const filtered = filter === 'all' ? devices : devices.filter((d) => d.status === filter)

  if (loading) return <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
    {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-32" />)}
  </div>

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-display">Perangkat</h1>
          <p className="text-muted-foreground mt-1">Kelola perangkat IoT Anda</p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={filter} onChange={(e) => setFilter(e.target.value)} className="w-36">
            <option value="all">Semua Status</option>
            <option value="online">Online</option>
            <option value="offline">Offline</option>
            <option value="error">Error</option>
          </Select>
          <Link
            href="/devices/new"
            className="inline-flex items-center gap-2 h-9 px-4 py-2 rounded-md text-sm font-medium bg-primary text-primary-foreground shadow hover:bg-primary-dark transition-colors"
          >
            <Plus className="h-4 w-4" /> Tambah Perangkat
          </Link>
        </div>
      </div>

      {filtered.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Cpu className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <CardTitle className="mb-2">Belum Ada Perangkat</CardTitle>
            <CardDescription className="mb-4">Tambahkan perangkat pertama Anda untuk mulai monitoring</CardDescription>
            <Link
              href="/devices/new"
              className="inline-flex items-center gap-2 h-9 px-4 py-2 rounded-md text-sm font-medium bg-primary text-primary-foreground shadow hover:bg-primary-dark transition-colors"
            >
              <Plus className="h-4 w-4" /> Tambah Perangkat
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((device) => (
            <Link key={device.id} href={`/devices/${device.id}`}>
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardHeader className="flex flex-row items-start justify-between pb-2">
                  <div>
                    <CardTitle className="text-sm">{device.name}</CardTitle>
                    <CardDescription>{device.location_name || 'Lokasi tidak diatur'}</CardDescription>
                  </div>
                  <Badge variant={device.status === 'online' ? 'default' : device.status === 'error' ? 'destructive' : 'secondary'}>
                    {device.status === 'online' ? <><Wifi className="h-3 w-3 mr-1" /> Online</> :
                     device.status === 'error' ? <><AlertTriangle className="h-3 w-3 mr-1" /> Error</> :
                     <><WifiOff className="h-3 w-3 mr-1" /> Offline</>}
                  </Badge>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>Baterai: {formatBattery(device.battery_pct)}</span>
                    <span>{device.last_seen ? timeAgo(device.last_seen) : '—'}</span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
