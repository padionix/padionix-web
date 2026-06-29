'use client'

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { createClient } from '@/lib/supabase/client'
import { useEffect, useState } from 'react'
import { User, Bell, Shield } from 'lucide-react'

type Tab = 'profile' | 'notifications' | 'security'

export default function SettingsPage() {
  const [tab, setTab] = useState<Tab>('profile')
  const [profile, setProfile] = useState({ full_name: '', phone: '', group_name: '' })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [passwords, setPasswords] = useState({ current: '', new: '', confirm: '' })
  const [notifSettings, setNotifSettings] = useState({ email: true, wa: false, push: true })
  const [message, setMessage] = useState('')

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return
      supabase.from('profiles').select('*').eq('id', user.id).single().then(({ data }) => {
        if (data) setProfile({ full_name: data.full_name || '', phone: data.phone || '', group_name: data.group_name || '' })
        setLoading(false)
      })
    })
  }, [])

  async function saveProfile() {
    setSaving(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    await supabase.from('profiles').update({ full_name: profile.full_name, phone: profile.phone, group_name: profile.group_name }).eq('id', user.id)
    setSaving(false)
    setMessage('Profil berhasil disimpan')
    setTimeout(() => setMessage(''), 3000)
  }

  async function changePassword() {
    if (passwords.new !== passwords.confirm) { setMessage('Password baru tidak cocok'); return }
    setSaving(true)
    const supabase = createClient()
    const { error } = await supabase.auth.updateUser({ password: passwords.new })
    if (error) setMessage(error.message)
    else { setMessage('Password berhasil diubah'); setPasswords({ current: '', new: '', confirm: '' }) }
    setSaving(false)
    setTimeout(() => setMessage(''), 3000)
  }

  if (loading) return <div className="space-y-4"><Skeleton className="h-64" /></div>

  const tabs: { key: Tab; label: string; icon: typeof User }[] = [
    { key: 'profile', label: 'Profil', icon: User },
    { key: 'notifications', label: 'Notifikasi', icon: Bell },
    { key: 'security', label: 'Keamanan', icon: Shield },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-display">Pengaturan</h1>
        <p className="text-muted-foreground mt-1">Kelola akun dan preferensi Anda</p>
      </div>

      {message && <div className="rounded-md bg-primary/10 text-primary text-sm px-4 py-2">{message}</div>}

      <div className="flex gap-2 border-b pb-4">
        {tabs.map((t) => {
          const Icon = t.icon
          return (
            <Button key={t.key} variant={tab === t.key ? 'default' : 'ghost'} size="sm" onClick={() => setTab(t.key)}>
              <Icon className="h-4 w-4 mr-1" /> {t.label}
            </Button>
          )
        })}
      </div>

      {tab === 'profile' && (
        <Card>
          <CardHeader><CardTitle>Profil</CardTitle><CardDescription>Informasi dasar akun Anda</CardDescription></CardHeader>
          <CardContent className="space-y-4">
            <div><label className="text-sm font-medium">Nama Lengkap</label><Input value={profile.full_name} onChange={(e) => setProfile((p) => ({ ...p, full_name: e.target.value }))} /></div>
            <div><label className="text-sm font-medium">No. Telepon</label><Input value={profile.phone} onChange={(e) => setProfile((p) => ({ ...p, phone: e.target.value }))} /></div>
            <div><label className="text-sm font-medium">Nama Kelompok</label><Input value={profile.group_name} onChange={(e) => setProfile((p) => ({ ...p, group_name: e.target.value }))} /></div>
            <Button onClick={saveProfile} disabled={saving}>{saving ? 'Menyimpan...' : 'Simpan'}</Button>
          </CardContent>
        </Card>
      )}

      {tab === 'notifications' && (
        <Card>
          <CardHeader><CardTitle>Preferensi Notifikasi</CardTitle><CardDescription>Pilih saluran notifikasi yang diinginkan</CardDescription></CardHeader>
          <CardContent className="space-y-4">
            {[
              { key: 'email' as const, label: 'Notifikasi Email', desc: 'Terima notifikasi via email' },
              { key: 'wa' as const, label: 'Notifikasi WhatsApp', desc: 'Terima notifikasi via WhatsApp (coming soon)' },
              { key: 'push' as const, label: 'Push Notification', desc: 'Terima notifikasi di browser' },
            ].map((item) => (
              <label key={item.key} className="flex items-center justify-between py-2 cursor-pointer">
                <div><p className="font-medium text-sm">{item.label}</p><p className="text-xs text-muted-foreground">{item.desc}</p></div>
                <input type="checkbox" checked={notifSettings[item.key]}
                  onChange={() => setNotifSettings((p) => ({ ...p, [item.key]: !p[item.key] }))}
                  className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary" />
              </label>
            ))}
            <Button onClick={() => { setMessage('Preferensi disimpan'); setTimeout(() => setMessage(''), 3000) }}>Simpan</Button>
          </CardContent>
        </Card>
      )}

      {tab === 'security' && (
        <Card>
          <CardHeader><CardTitle>Ganti Password</CardTitle><CardDescription>Password minimal 6 karakter</CardDescription></CardHeader>
          <CardContent className="space-y-4">
            <div><label className="text-sm font-medium">Password Baru</label><Input type="password" placeholder="Min. 6 karakter" value={passwords.new} onChange={(e) => setPasswords((p) => ({ ...p, new: e.target.value }))} /></div>
            <div><label className="text-sm font-medium">Konfirmasi Password</label><Input type="password" placeholder="Ulangi password baru" value={passwords.confirm} onChange={(e) => setPasswords((p) => ({ ...p, confirm: e.target.value }))} /></div>
            <Button onClick={changePassword} disabled={saving || !passwords.new}>{saving ? 'Menyimpan...' : 'Ubah Password'}</Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
