'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { createClient } from '@/lib/supabase/client'
import { useState, useEffect, type FormEvent } from 'react'
import Link from 'next/link'
import Breadcrumbs from '@/components/Breadcrumbs'

export default function ForgotPasswordPage() {
  useEffect(() => { document.title = 'Lupa Password | Padionix' }, [])
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    const supabase = createClient()
    const { error: authErr } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/callback`,
    })
    if (authErr) {
      setError(authErr.message)
      setLoading(false)
      return
    }
    setSent(true)
    setLoading(false)
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <Breadcrumbs items={[{ label: 'Beranda', href: '/' }, { label: 'Lupa Password' }]} />
        <Card className="w-full">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-2">
            <div className="h-10 w-10 rounded-lg bg-primary flex items-center justify-center text-white font-bold">P</div>
          </div>
          <CardTitle>Lupa Password</CardTitle>
          <CardDescription>Masukkan email untuk mereset password</CardDescription>
        </CardHeader>
        <CardContent>
          {sent ? (
            <div className="text-center space-y-4">
              <div className="rounded-full bg-primary/10 w-16 h-16 flex items-center justify-center mx-auto">
                <svg className="h-8 w-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
              </div>
              <p className="text-sm text-muted-foreground">Cek email Anda untuk tautan reset password</p>
              <Link href="/login" className="inline-flex items-center justify-center h-9 px-4 rounded-md text-sm font-medium border border-border bg-background hover:bg-muted transition-colors">Kembali ke Login</Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-sm font-medium">Email</label>
                <Input type="email" placeholder="nama@email.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
              </div>
              {error && <p className="text-sm text-danger">{error}</p>}
              <Button type="submit" className="w-full" disabled={loading}>{loading ? 'Mengirim...' : 'Kirim Tautan Reset'}</Button>
            </form>
          )}
        </CardContent>
        {!sent && (
          <CardFooter className="justify-center text-sm">
            Ingat password? <Link href="/login" className="text-primary font-medium ml-1">Masuk</Link>
          </CardFooter>
        )}
      </Card>
      </div>
    </div>
  )
}
