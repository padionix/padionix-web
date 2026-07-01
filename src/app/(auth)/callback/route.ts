import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const type = searchParams.get('type')

  if (!code) {
    console.error('[auth/callback] No code provided')
    return NextResponse.redirect(`${origin}/login?error=no_code`)
  }

  const next = type === 'recovery' ? '/auth/update-password' : '/dashboard'

  const response = NextResponse.redirect(`${origin}${next}`)
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (cookiesToSet) => {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    },
  )

  const { error } = await supabase.auth.exchangeCodeForSession(code)
  if (error) {
    console.error('[auth/callback] Exchange failed:', error.message)
    return NextResponse.redirect(`${origin}/login?error=auth_callback_error`)
  }

  return response
}
