'use client'

import { Card, CardContent, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Select } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { createClient } from '@/lib/supabase/client'
import { timeAgo } from '@/lib/utils/formatters'
import { BugPlay, Check, ImageIcon } from 'lucide-react'
import { useEffect, useState } from 'react'
import type { Detection } from '@/lib/types'

export default function DetectionsPage() {
  useEffect(() => { document.title = 'Deteksi | Padionix' }, [])
  const [detections, setDetections] = useState<Detection[]>([])
  const [loading, setLoading] = useState(true)
  const [filterStatus, setFilterStatus] = useState('all')

  useEffect(() => {
    const supabase = createClient()
    supabase.from('detections').select('*').order('detected_at', { ascending: false }).then(({ data }) => {
      if (data) setDetections(data as Detection[])
      setLoading(false)
    })
  }, [])

  async function updateStatus(id: string, status: Detection['status']) {
    const supabase = createClient()
    await supabase.from('detections').update({ status, handled_at: new Date().toISOString() }).eq('id', id)
    setDetections((prev) => prev.map((d) => (d.id === id ? { ...d, status } : d)))
  }

  const filtered = filterStatus === 'all' ? detections : detections.filter((d) => d.status === filterStatus)

  if (loading) return <div className="space-y-4">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-24" />)}</div>

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-display">Deteksi</h1>
          <p className="text-muted-foreground mt-1">Hasil deteksi hama dan penyakit</p>
        </div>
        <div className="flex gap-3">
          <Select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="w-40">
            <option value="all">Semua Status</option>
            <option value="unhandled">Belum Ditangani</option>
            <option value="in_progress">Diproses</option>
            <option value="resolved">Selesai</option>
            <option value="false_positive">False Positive</option>
          </Select>
        </div>
      </div>

      {filtered.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <BugPlay className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <CardTitle className="mb-2">Belum Ada Deteksi</CardTitle>
            <CardDescription>Tidak ada hasil deteksi untuk filter ini</CardDescription>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filtered.map((det) => (
            <Card key={det.id}>
              <CardContent className="pt-6">
                <div className="flex gap-4">
                  {/* Image placeholder */}
                  <div className="h-20 w-20 shrink-0 rounded-lg bg-muted flex items-center justify-center">
                    <ImageIcon className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="font-semibold">{det.pest_name || 'Tidak teridentifikasi'}</h3>
                        <p className="text-sm text-muted-foreground">{det.pest_type} &middot; {det.confidence ? `${(det.confidence * 100).toFixed(0)}%` : '—'}</p>
                      </div>
                      <Badge variant={det.status === 'resolved' ? 'default' : det.status === 'unhandled' ? 'destructive' : 'secondary'}>
                        {det.status === 'unhandled' ? 'Belum Ditangani' : det.status === 'in_progress' ? 'Diproses' : det.status === 'resolved' ? 'Selesai' : 'False Positive'}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                      <span>Perangkat: {det.device_id.slice(0, 8)}...</span>
                      <span>{timeAgo(det.detected_at)}</span>
                    </div>
                    {det.status !== 'resolved' && det.status !== 'false_positive' && (
                      <div className="flex gap-2 mt-2">
                        <Button size="sm" variant="outline" onClick={() => updateStatus(det.id, 'in_progress')}>
                          Proses
                        </Button>
                        <Button size="sm" variant="default" onClick={() => updateStatus(det.id, 'resolved')}>
                          <Check className="h-3 w-3 mr-1" /> Selesai
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
