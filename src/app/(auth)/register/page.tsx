'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Select } from '@/components/ui/select'
import { createClient } from '@/lib/supabase/client'
import { useState, type FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function RegisterPage() {
  const [form, setForm] = useState({ full_name: '', email: '', password: '', phone: '', group_name: '', role: 'farmer' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [verifying, setVerifying] = useState(false)
  const router = useRouter()

  function update(field: string) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setForm((prev) => ({ ...prev, [field]: e.target.value }))
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')
    if (form.password.length < 6) { setError('Password minimal 6 karakter'); return }
    setLoading(true)

    const supabase = createClient()
    const { data, error: authErr } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: {
        data: {
          full_name: form.full_name,
          phone: form.phone,
          role: form.role,
        },
      },
    })

    if (authErr) {
      // ponytail: Supabase returns different error shapes depending on failure type
      const raw = authErr.message || String(authErr)
      let msg = 'Terjadi kesalahan. Silakan coba lagi.'
      if (typeof raw === 'string' && raw.length > 0) {
        if (raw.includes('already registered')) msg = 'Email sudah terdaftar. Silakan gunakan email lain atau masuk.'
        else if (raw.includes('valid email')) msg = 'Format email tidak valid.'
        else if (raw.includes('at least 6')) msg = 'Password minimal 6 karakter.'
        else if (raw.includes('violates not-null')) msg = 'Gagal membuat akun. Silakan coba lagi.'
        else msg = raw
      }
      setError(msg); setLoading(false); return
    }

    // If user already has session (auto-confirm enabled) → redirect
    if (data.session) {
      router.push('/dashboard')
      router.refresh()
      return
    }

    // Email confirmation required
    setVerifying(true)
    setLoading(false)
  }

  async function handleGoogle() {
    setError('')
    setGoogleLoading(true)
    try {
      const supabase = createClient()
      const { error: oauthErr } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: `${window.location.origin}/callback` },
      })
      if (oauthErr) setError(oauthErr.message)
    } catch {
      setError('Gagal memulai login Google. Coba lagi.')
    } finally {
      setGoogleLoading(false)
    }
  }

  // Email verification screen
  if (verifying) {
    return (
      <Card className="w-full max-w-sm text-center">
        <CardHeader>
          <div className="rounded-full bg-primary/10 w-16 h-16 flex items-center justify-center mx-auto mb-2">
            <svg className="h-8 w-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <CardTitle>Cek Email Anda</CardTitle>
          <CardDescription>
            Kami telah mengirim tautan verifikasi ke <strong>{form.email}</strong>.
            Klik tautan tersebut untuk mengaktifkan akun Anda.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-xs text-muted-foreground">Tidak menerima email? Cek folder spam atau</p>
          <Button variant="outline" size="sm" className="w-full" onClick={() => setVerifying(false)}>
            Coba email lain
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-sm">
      <CardHeader className="text-center">
        <div className="flex justify-center mb-2">
          <div className="h-10 w-10 rounded-lg bg-primary flex items-center justify-center text-white font-bold">P</div>
        </div>
        <CardTitle>Daftar Padionix</CardTitle>
        <CardDescription>Buat akun untuk memantau lahan Anda</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium">Nama Lengkap</label>
            <Input placeholder="Budi Santoso" value={form.full_name} onChange={update('full_name')} required />
          </div>
          <div>
            <label className="text-sm font-medium">Email</label>
            <Input type="email" placeholder="nama@email.com" value={form.email} onChange={update('email')} required />
          </div>
          <div>
            <label className="text-sm font-medium">Password</label>
            <Input type="password" placeholder="Min. 6 karakter" value={form.password} onChange={update('password')} required minLength={6} />
          </div>
          <div>
            <label className="text-sm font-medium">No. Telepon</label>
            <Input type="tel" placeholder="08123456789" value={form.phone} onChange={update('phone')} />
          </div>
          <div>
            <label className="text-sm font-medium">Saya mendaftar sebagai</label>
            <Select value={form.role} onChange={update('role')}>
              <option value="farmer">Petani</option>
              <option value="group">Kelompok Tani</option>
              <option value="dinas">Dinas Pertanian</option>
            </Select>
          </div>
          {form.role === 'group' && (
          <div>
            <label className="text-sm font-medium">Nama Kelompok</label>
            <Input placeholder="Kelompok Tani Makmur" value={form.group_name} onChange={update('group_name')} />
          </div>
          )}
          {error && <p className="text-sm text-destructive">{error}</p>}
          <Button type="submit" className="w-full" disabled={loading}>{loading ? 'Memproses...' : 'Daftar Gratis'}</Button>
        </form>
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center"><span className="w-full border-t" /></div>
          <div className="relative flex justify-center text-xs"><span className="bg-card px-2 text-muted-foreground">Atau</span></div>
        </div>
        <Button variant="outline" className="w-full" onClick={handleGoogle} disabled={googleLoading}>
          {googleLoading ? 'Memproses...' : 'Daftar dengan Google'}
        </Button>
      </CardContent>
      <CardFooter className="justify-center text-sm">
        Sudah punya akun? <Link href="/login" className="text-primary font-medium ml-1">Masuk</Link>
      </CardFooter>
    </Card>
  )
}
