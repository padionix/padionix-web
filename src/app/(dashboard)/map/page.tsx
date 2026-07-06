'use client'

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { createClient } from '@/lib/supabase/client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Cpu, Wifi, WifiOff, AlertTriangle, MapPin } from 'lucide-react'
import type { Device } from '@/lib/types'

// ponytail: Leaflet via CDN, no npm package
const LEAFLET_CSS = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'
const LEAFLET_JS = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'

const statusColor: Record<string, string> = {
  online: '#22c55e',
  warning: '#eab308',
  error: '#ef4444',
  offline: '#6b7280',
}

const statusLabel: Record<string, string> = {
  online: 'Online',
  warning: 'Waspada',
  error: 'Error',
  offline: 'Offline',
}

export default function MapPage() {
  useEffect(() => { document.title = 'Peta | Padionix' }, [])
  const [devices, setDevices] = useState<Device[]>([])
  const [loading, setLoading] = useState(true)
  const [mapReady, setMapReady] = useState(false)

  useEffect(() => {
    const supabase = createClient()
    supabase.from('devices').select('*').order('name').then(({ data }) => {
      if (data) setDevices(data)
      setLoading(false)
    })
  }, [])

  useEffect(() => {
    // load Leaflet CSS
    const link = document.createElement('link')
    link.rel = 'stylesheet'
    link.href = LEAFLET_CSS
    document.head.appendChild(link)

    // load Leaflet JS
    const script = document.createElement('script')
    script.src = LEAFLET_JS
    script.onload = () => setMapReady(true)
    document.body.appendChild(script)

    return () => {
      link.remove()
      script.remove()
    }
  }, [])

  useEffect(() => {
    if (!mapReady || devices.length === 0) return
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const L = (window as any).L
    if (!L) return

    const map = L.map('map').setView([-7.2504, 112.7688], 7) // ponytail: default center Jawa Timur
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
    }).addTo(map)

    devices.forEach((d) => {
      if (d.latitude == null || d.longitude == null) return
      const color = statusColor[d.status] || statusColor.offline
      const icon = L.divIcon({
        className: 'custom-marker',
        html: `<div style="width:24px;height:24px;background:${color};border-radius:50%;border:3px solid white;box-shadow:0 2px 6px rgba(0,0,0,.3)"></div>`,
        iconSize: [24, 24],
        iconAnchor: [12, 12],
      })
      const marker = L.marker([d.latitude, d.longitude], { icon }).addTo(map)
      marker.bindPopup(`
        <div style="min-width:180px">
          <strong style="font-size:14px">${d.name}</strong><br/>
          <span style="color:${color};font-size:12px">${statusLabel[d.status] || d.status}</span><br/>
          <a href="/devices/${d.id}" style="font-size:12px;color:#2563eb">Lihat Detail &rarr;</a>
        </div>
      `)
    })

    // fit bounds if there are coordinates
    const coords = devices.filter((d) => d.latitude != null && d.longitude != null)
    if (coords.length > 0) {
      const bounds = L.latLngBounds(coords.map((d) => [d.latitude, d.longitude]))
      map.fitBounds(bounds, { padding: [40, 40] })
    }

    return () => map.remove()
  }, [mapReady, devices])

  if (loading) return <div className="space-y-4"><Skeleton className="h-96" /></div>

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-display">Peta Lahan</h1>
        <p className="text-muted-foreground mt-1">Visualisasi lokasi perangkat IoT</p>
      </div>

      {mapReady ? (
        <div id="map" className="h-[500px] rounded-xl border overflow-hidden" />
      ) : (
        <Card>
          <CardHeader><CardTitle className="text-sm">Daftar Perangkat</CardTitle></CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {devices.length === 0 ? (
                <p className="text-sm text-muted-foreground col-span-full text-center py-8">Belum ada perangkat</p>
              ) : devices.map((d) => (
                <Link key={d.id} href={`/devices/${d.id}`}>
                  <Card className="hover:shadow-md transition-shadow cursor-pointer">
                    <CardHeader className="flex flex-row items-start justify-between pb-2">
                      <div>
                        <CardTitle className="text-sm flex items-center gap-1">
                          <MapPin className="h-3 w-3 text-muted-foreground" /> {d.name}
                        </CardTitle>
                        <CardDescription>{d.location_name || (d.latitude != null && d.longitude != null ? `${d.latitude.toFixed(4)}, ${d.longitude.toFixed(4)}` : 'Lokasi tidak diatur')}</CardDescription>
                      </div>
                      <Badge variant={d.status === 'online' ? 'default' : d.status === 'error' ? 'destructive' : 'secondary'}>
                        {d.status === 'online' ? <><Wifi className="h-3 w-3 mr-1" /> Online</> :
                         d.status === 'error' ? <><AlertTriangle className="h-3 w-3 mr-1" /> Error</> :
                         <><WifiOff className="h-3 w-3 mr-1" /> Offline</>}
                      </Badge>
                    </CardHeader>
                    <CardContent>
                      <div className="text-xs text-muted-foreground">
                        {d.latitude != null && d.longitude != null
                          ? `${d.latitude.toFixed(4)}, ${d.longitude.toFixed(4)}`
                          : 'Koordinat belum diatur'}
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
