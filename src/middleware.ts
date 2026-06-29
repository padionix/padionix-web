import { NextResponse, type NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'

// ponytail: in-memory rate limiter, per-IP, no persistence across restarts
const rateLimit = new Map<string, { count: number; resetAt: number }>()
const WINDOW_MS = 60_000
const MAX_GENERAL = 100
const MAX_WRITE = 20

function getClientIP(request: NextRequest): string {
  return request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
    || request.headers.get('x-real-ip')
    || '127.0.0.1'
}

function isRateLimited(request: NextRequest): boolean {
  const ip = getClientIP(request)
  const now = Date.now()
  const isWrite = ['POST', 'PATCH', 'DELETE'].includes(request.method)
  const max = isWrite ? MAX_WRITE : MAX_GENERAL

  const entry = rateLimit.get(ip)
  if (!entry || now > entry.resetAt) {
    rateLimit.set(ip, { count: 1, resetAt: now + WINDOW_MS })
    return false
  }

  entry.count++
  return entry.count > max
}

// ponytail: inline routing instead of a config object — fine until 20+ route defs
const publicPagePaths = new Set(['/', '/login', '/register', '/forgot-password', '/auth/update-password'])

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Rate limit — apply to all routes
  if (isRateLimited(request)) {
    return new NextResponse('Too Many Requests', { status: 429 })
  }

  // Public API paths — no auth needed
  if (
    pathname.startsWith('/api/webhook/') ||
    pathname.startsWith('/api/auth/')
  ) {
    return NextResponse.next()
  }

  // Public page paths
  if (publicPagePaths.has(pathname)) {
    return NextResponse.next()
  }

  // Auth check for everything else (dashboard/*, admin/*, api/*)
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

  // Dev mode bypass: all routes public in dev
  if (process.env.NODE_ENV === 'development' || supabaseUrl.includes('placeholder') || supabaseUrl.includes('xxxxxxxx')) {
    return NextResponse.next()
  }

  let supabaseResponse = NextResponse.next()
  const supabase = createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll: (cookiesToSet) => {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
        supabaseResponse = NextResponse.next({ request })
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options)
        )
      },
    },
  })

  const { data: { user } } = await supabase.auth.getUser()

  // Logged in → redirect away from public pages
  if (user && (pathname === '/login' || pathname === '/register')) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  // Not logged in + protected path → redirect to login
  const isProtected =
    pathname.startsWith('/dashboard') ||
    pathname.startsWith('/admin') ||
    pathname.startsWith('/api/')

  if (!user && isProtected) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Admin-only
  if (user && pathname.startsWith('/admin')) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profile?.role !== 'admin') {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|build-progress.html).*)',
  ],
}
