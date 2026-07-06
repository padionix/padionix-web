'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { createClient } from '@/lib/supabase/client'
import { useState, useEffect, type FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import Breadcrumbs from '@/components/Breadcrumbs'

export default function UpdatePasswordPage() {
  useEffect(() => { document.title = 'Update Password | Padionix' }, [])
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const router = useRouter()

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')
    if (password.length < 6) { setError('Password minimal 6 karakter'); return }
    if (password !== confirm) { setError('Konfirmasi password tidak cocok'); return }

    setLoading(true)
    const supabase = createClient()
    const { error: updateErr } = await supabase.auth.updateUser({ password })
    if (updateErr) { setError(updateErr.message); setLoading(false); return }
    const { data: { user } } = await supabase.auth.getUser()
    const userId = user?.id
    setDone(true)
    setLoading(false)
    setTimeout(() => router.push(userId ? `/dashboard/${userId}` : '/dashboard'), 3000)
  }

  if (done) {
    return (
      <div className="w-full max-w-sm">
        <Breadcrumbs items={[{ label: 'Beranda', href: '/' }, { label: 'Update Password' }]} />
        <Card className="w-full text-center">
        <CardHeader>
          <div className="rounded-full bg-success/10 w-16 h-16 flex items-center justify-center mx-auto mb-2">
            <svg className="h-8 w-8 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <CardTitle>Password Diperbarui</CardTitle>
          <CardDescription>Password Anda berhasil diubah. Mengarahkan ke dashboard...</CardDescription>
        </CardHeader>
      </Card>
      </div>
    )
  }

  return (
    <div className="w-full max-w-sm">
      <Breadcrumbs items={[{ label: 'Beranda', href: '/' }, { label: 'Update Password' }]} />
      <Card className="w-full">
      <CardHeader className="text-center">
        <div className="flex justify-center mb-2">
          <div className="h-10 w-10 rounded-lg bg-primary flex items-center justify-center text-white font-bold">P</div>
        </div>
        <CardTitle>Buat Password Baru</CardTitle>
        <CardDescription>Masukkan password baru untuk akun Anda</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium">Password Baru</label>
            <Input
              type="password"
              placeholder="Min. 6 karakter"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required minLength={6}
            />
          </div>
          <div>
            <label className="text-sm font-medium">Konfirmasi Password</label>
            <Input
              type="password"
              placeholder="Ulangi password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              required minLength={6}
            />
          </div>
          {error && <p className="text-sm text-danger">{error}</p>}
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Menyimpan...' : 'Simpan Password Baru'}
          </Button>
        </form>
      </CardContent>
    </Card>
    </div>
  )
}
