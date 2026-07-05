'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { createClient } from '@/lib/supabase/client'
import { useState, type FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const router = useRouter()

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    const supabase = createClient()
    const { error: authErr } = await supabase.auth.signInWithPassword({ email, password })
    if (authErr) {
      const raw = authErr.message || String(authErr)
      const msg = raw === 'Invalid login credentials' ? 'Email atau password salah'
        : (typeof raw === 'string' && raw.length > 0 ? raw : 'Terjadi kesalahan. Silakan coba lagi.')
      setError(msg)
      setLoading(false)
      return
    }
    router.push('/dashboard')
    router.refresh()
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

  return (
    <Card className="w-full max-w-sm">
      <CardHeader className="text-center">
        <div className="flex justify-center mb-2">
          <div className="h-10 w-10 rounded-lg bg-primary flex items-center justify-center text-white font-bold">P</div>
        </div>
        <CardTitle>Masuk ke Padionix</CardTitle>
        <CardDescription>Masukkan email dan password Anda</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium">Email</label>
            <Input type="email" placeholder="nama@email.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div>
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Password</label>
              <Link href="/forgot-password" className="text-xs text-primary hover:underline">Lupa password?</Link>
            </div>
            <Input type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <Button type="submit" className="w-full" disabled={loading}>{loading ? 'Memproses...' : 'Masuk'}</Button>
        </form>
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center"><span className="w-full border-t" /></div>
          <div className="relative flex justify-center text-xs"><span className="bg-card px-2 text-muted-foreground">Atau</span></div>
        </div>
        <Button variant="outline" className="w-full" onClick={handleGoogle} disabled={googleLoading}>
          {googleLoading ? 'Memproses...' : 'Lanjutkan dengan Google'}
        </Button>
      </CardContent>
      <CardFooter className="justify-center text-sm">
        Belum punya akun? <Link href="/register" className="text-primary font-medium ml-1">Daftar</Link>
      </CardFooter>
    </Card>
  )
}
