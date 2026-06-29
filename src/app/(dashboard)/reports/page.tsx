'use client'

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Select } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { createClient } from '@/lib/supabase/client'
import { formatDateTime } from '@/lib/utils/formatters'
import { useEffect, useState } from 'react'
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { Download, FileText, Calendar } from 'lucide-react'

type Tab = 'ringkasan' | 'riwayat' | 'analitik' | 'perbandingan'

const tabs: { key: Tab; label: string }[] = [
  { key: 'ringkasan', label: 'Ringkasan Lahan' },
  { key: 'riwayat', label: 'Riwayat Deteksi' },
  { key: 'analitik', label: 'Analitik Sensor' },
  { key: 'perbandingan', label: 'Perbandingan' },
]

// ponytail: placeholder chart data
const tempData = [
  { hari: 'Sen', suhu: 32, kelembaban: 78 },
  { hari: 'Sel', suhu: 31, kelembaban: 75 },
  { hari: 'Rab', suhu: 33, kelembaban: 80 },
  { hari: 'Kam', suhu: 30, kelembaban: 72 },
  { hari: 'Jum', suhu: 32, kelembaban: 76 },
  { hari: 'Sab', suhu: 34, kelembaban: 82 },
  { hari: 'Min', suhu: 31, kelembaban: 74 },
]

const deteksiBulanan = [
  { bulan: 'Jan', hama: 12, penyakit: 5 },
  { bulan: 'Feb', hama: 8, penyakit: 3 },
  { bulan: 'Mar', hama: 15, penyakit: 7 },
  { bulan: 'Apr', hama: 10, penyakit: 4 },
  { bulan: 'Mei', hama: 6, penyakit: 2 },
  { bulan: 'Jun', hama: 9, penyakit: 6 },
]

interface SummaryData {
  total_devices: number
  total_detections: number
  active_alerts: number
  avg_temperature: number
  avg_humidity: number
  healthy_fields: number
  total_fields: number
}

export default function ReportsPage() {
  const [tab, setTab] = useState<Tab>('ringkasan')
  const [summary, setSummary] = useState<SummaryData | null>(null)
  const [loading, setLoading] = useState(true)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [detections, setDetections] = useState<any[]>([])
  const [fromDate, setFromDate] = useState('')
  const [toDate, setToDate] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')

  useEffect(() => {
    const supabase = createClient()
    supabase.from('devices').select('*', { count: 'exact', head: true }).then(({ count }) => {
      supabase.from('detections').select('*', { count: 'exact', head: true }).then(({ count: detCount }) => {
        supabase.from('alerts').select('*', { count: 'exact', head: true }).eq('is_read', false).then(({ count: alertCount }) => {
          supabase.from('sensor_readings').select('temperature, humidity').order('recorded_at', { ascending: false }).limit(100).then(({ data: readings }) => {
            const avg = (arr: (number | undefined)[]) => {
              const nums = arr.filter((n): n is number => n != null)
              return nums.length ? nums.reduce((a, b) => a + b, 0) / nums.length : 0
            }
            const temps = readings?.map((r) => r.temperature) ?? []
            const hums = readings?.map((r) => r.humidity) ?? []
            setSummary({
              total_devices: count ?? 0,
              total_detections: detCount ?? 0,
              active_alerts: alertCount ?? 0,
              avg_temperature: avg(temps),
              avg_humidity: avg(hums),
              healthy_fields: 3,
              total_fields: 5,
            })
            setLoading(false)
          })
        })
      })
    })
    // fetch detections for riwayat tab
    supabase.from('detections').select('*').order('detected_at', { ascending: false }).limit(50).then(({ data }) => {
      if (data) setDetections(data)
    })
  }, [])

  const filteredDetections = detections.filter((d) => {
    if (filterStatus !== 'all' && d.status !== filterStatus) return false
    if (fromDate && new Date(d.detected_at) < new Date(fromDate)) return false
    if (toDate && new Date(d.detected_at) > new Date(toDate + 'T23:59:59')) return false
    return true
  })

  if (loading) return <div className="space-y-4"><Skeleton className="h-48" /><Skeleton className="h-64" /></div>

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-display">Laporan</h1>
          <p className="text-muted-foreground mt-1">Analisis dan ringkasan data lahan</p>
        </div>
      </div>

      <div className="flex gap-2 border-b pb-4 overflow-x-auto">
        {tabs.map((t) => (
          <Button key={t.key} variant={tab === t.key ? 'default' : 'ghost'} size="sm" onClick={() => setTab(t.key)}>
            {t.label}
          </Button>
        ))}
      </div>

      {tab === 'ringkasan' && (
        <div className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm">Perangkat Aktif</CardTitle></CardHeader>
              <CardContent><div className="text-3xl font-bold">{summary?.total_devices ?? 0}</div></CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm">Total Deteksi</CardTitle></CardHeader>
              <CardContent><div className="text-3xl font-bold">{summary?.total_detections ?? 0}</div></CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm">Alert Aktif</CardTitle></CardHeader>
              <CardContent><div className="text-3xl font-bold text-danger">{summary?.active_alerts ?? 0}</div></CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm">Lahan Sehat</CardTitle></CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{summary?.healthy_fields ?? 0}/{summary?.total_fields ?? 0}</div>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader><CardTitle className="text-sm">Rata-rata Suhu & Kelembaban</CardTitle></CardHeader>
              <CardContent>
                <div className="flex gap-8 text-center">
                  <div>
                    <div className="text-3xl font-bold text-warning">{summary?.avg_temperature.toFixed(1) ?? '--'}°C</div>
                    <div className="text-xs text-muted-foreground">Suhu</div>
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-info">{summary?.avg_humidity.toFixed(0) ?? '--'}%</div>
                    <div className="text-xs text-muted-foreground">Kelembaban</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle className="text-sm">Tren Suhu (7 Hari)</CardTitle></CardHeader>
              <CardContent className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={tempData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="hari" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                    <YAxis tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                    <Tooltip />
                    <Line type="monotone" dataKey="suhu" stroke="hsl(var(--warning))" strokeWidth={2} dot={false} name="Suhu (°C)" />
                    <Line type="monotone" dataKey="kelembaban" stroke="hsl(var(--info))" strokeWidth={2} dot={false} name="Kelembaban (%)" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {tab === 'riwayat' && (
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <CardTitle className="text-sm">Riwayat Deteksi</CardTitle>
              <div className="flex items-center gap-3 flex-wrap">
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)}
                    className="h-8 rounded-md border border-border bg-background px-2 text-sm" />
                  <span className="text-muted-foreground">—</span>
                  <input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)}
                    className="h-8 rounded-md border border-border bg-background px-2 text-sm" />
                </div>
                <Select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="w-36">
                  <option value="all">Semua Status</option>
                  <option value="unhandled">Belum Ditangani</option>
                  <option value="in_progress">Diproses</option>
                  <option value="resolved">Selesai</option>
                </Select>
                <a href="/api/reports/export" className="inline-flex items-center gap-2 h-8 rounded-md px-3 text-xs font-medium border border-border bg-background hover:bg-muted transition-colors">
                  <Download className="h-4 w-4" /> Export CSV
                </a>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {filteredDetections.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">Tidak ada data deteksi</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-muted-foreground">
                      <th className="text-left py-2 font-medium">Waktu</th>
                      <th className="text-left py-2 font-medium">Hama</th>
                      <th className="text-left py-2 font-medium">Tipe</th>
                      <th className="text-left py-2 font-medium">Confidence</th>
                      <th className="text-left py-2 font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredDetections.map((d) => (
                      <tr key={d.id} className="border-b last:border-0">
                        <td className="py-2 text-muted-foreground">{formatDateTime(d.detected_at)}</td>
                        <td className="py-2">{d.pest_name || '—'}</td>
                        <td className="py-2"><Badge variant={d.pest_type === 'hama' ? 'destructive' : 'secondary'}>{d.pest_type}</Badge></td>
                        <td className="py-2">{d.confidence ? `${(d.confidence * 100).toFixed(0)}%` : '—'}</td>
                        <td className="py-2"><Badge variant={d.status === 'resolved' ? 'default' : d.status === 'unhandled' ? 'destructive' : 'secondary'}>{d.status}</Badge></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {tab === 'analitik' && (
        <div className="space-y-6">
          <Card>
            <CardHeader><CardTitle className="text-sm">Tren Suhu & Kelembaban</CardTitle></CardHeader>
            <CardContent className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={tempData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="hari" stroke="hsl(var(--muted-foreground))" />
                  <YAxis stroke="hsl(var(--muted-foreground))" />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="suhu" stroke="hsl(var(--warning))" strokeWidth={2} name="Suhu (°C)" />
                  <Line type="monotone" dataKey="kelembaban" stroke="hsl(var(--info))" strokeWidth={2} name="Kelembaban (%)" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-sm">Deteksi per Bulan</CardTitle></CardHeader>
            <CardContent className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={deteksiBulanan}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="bulan" stroke="hsl(var(--muted-foreground))" />
                  <YAxis stroke="hsl(var(--muted-foreground))" />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="hama" fill="hsl(var(--danger))" name="Hama" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="penyakit" fill="hsl(var(--warning))" name="Penyakit" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      )}

      {tab === 'perbandingan' && (
        <Card>
          <CardHeader><CardTitle className="text-sm">Perbandingan Antar Perangkat</CardTitle></CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground text-center py-8">
              {/* ponytail: placeholder — perbandingan multi-device dengan Recharts ketika data tersedia */}
              Fitur perbandingan akan tersedia setelah beberapa perangkat terdaftar dan mengirim data
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
