'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { createClient } from '@/lib/supabase/client'
import { useState, type FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Copy, Check } from 'lucide-react'
import Link from 'next/link'

export default function NewDevicePage() {
  const [form, setForm] = useState({ name: '', description: '', location_name: '', latitude: '', longitude: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [createdDevice, setCreatedDevice] = useState<{ id: string; device_key: string } | null>(null)
  const [copied, setCopied] = useState(false)
  const router = useRouter()

  function update(field: string) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setForm((prev) => ({ ...prev, [field]: e.target.value }))
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setError('Silakan login terlebih dahulu'); setLoading(false); return }

    const { data, error: submitErr } = await supabase.from('devices').insert({
      user_id: user.id,
      name: form.name,
      description: form.description || null,
      location_name: form.location_name || null,
      latitude: form.latitude ? parseFloat(form.latitude) : null,
      longitude: form.longitude ? parseFloat(form.longitude) : null,
      status: 'offline',
      is_active: true,
    }).select('id, device_key').single()

    if (submitErr) { setError(submitErr.message); setLoading(false); return }
    if (data) setCreatedDevice(data)
    setLoading(false)
  }

  if (createdDevice) {
    return (
      <div className="space-y-6 max-w-lg mx-auto">
        <Link href="/devices" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4 mr-1" /> Kembali ke Perangkat
        </Link>
        <Card>
          <CardHeader className="text-center">
            <div className="rounded-full bg-primary/10 w-16 h-16 flex items-center justify-center mx-auto mb-2">
              <Check className="h-8 w-8 text-primary" />
            </div>
            <CardTitle>Perangkat Berhasil Dibuat</CardTitle>
            <CardDescription>Gunakan device key berikut untuk konfigurasi ESP32</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium">Device Key</label>
              <div className="flex gap-2 mt-1">
                <code className="flex-1 rounded-md border bg-muted px-3 py-2 text-sm font-mono break-all">{createdDevice.device_key}</code>
                <Button variant="outline" size="icon" onClick={() => { navigator.clipboard.writeText(createdDevice.device_key); setCopied(true); setTimeout(() => setCopied(false), 2000) }}>
                  {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
            </div>
            <div className="rounded-md bg-muted p-3 text-sm text-muted-foreground">
              <p className="font-medium mb-1">Konfigurasi ESP32:</p>
              <code className="text-xs block">DEVICE_KEY=&quot;{createdDevice.device_key}&quot;</code>
            </div>
            <div className="flex gap-3 pt-2">
              <Button variant="outline" className="flex-1" onClick={() => router.push(`/devices/${createdDevice.id}`)}>
                Lihat Detail
              </Button>
              <Button className="flex-1" onClick={() => router.push('/devices')}>
                Ke Daftar Perangkat
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-lg mx-auto">
      <Link href="/devices" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4 mr-1" /> Kembali
      </Link>
      <div>
        <h1 className="text-2xl font-bold font-display">Tambah Perangkat</h1>
        <p className="text-muted-foreground mt-1">Daftarkan perangkat IoT baru</p>
      </div>
      <Card>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-medium">Nama Perangkat <span className="text-danger">*</span></label>
              <Input placeholder="Contoh: Sensor Lahan A1" value={form.name} onChange={update('name')} required />
            </div>
            <div>
              <label className="text-sm font-medium">Deskripsi Lokasi</label>
              <Input placeholder="Contoh: Sawah belakang rumah" value={form.description} onChange={update('description')} />
            </div>
            <div>
              <label className="text-sm font-medium">Nama Wilayah</label>
              <Input placeholder="Contoh: Desa Sukamaju" value={form.location_name} onChange={update('location_name')} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Latitude</label>
                <Input type="number" step="any" placeholder="-7.2504" value={form.latitude} onChange={update('latitude')} />
              </div>
              <div>
                <label className="text-sm font-medium">Longitude</label>
                <Input type="number" step="any" placeholder="112.7688" value={form.longitude} onChange={update('longitude')} />
              </div>
            </div>
            {error && <p className="text-sm text-danger">{error}</p>}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Menyimpan...' : 'Simpan Perangkat'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
