import { updateSession } from '@/lib/supabase/middleware'
import { NextResponse, type NextRequest } from 'next/server'

const PUBLIC_ROUTES = ['/', '/login', '/register', '/forgot-password']
const PUBLIC_PREFIXES = ['/auth/']

function isPublicRoute(pathname: string): boolean {
  if (PUBLIC_ROUTES.includes(pathname)) return true
  return PUBLIC_PREFIXES.some((p) => pathname.startsWith(p))
}

export async function middleware(request: NextRequest) {
  const { user, response } = await updateSession(request)
  const { pathname, search, origin } = new URL(request.url)

  // Don't redirect API routes — let handlers return proper 401
  if (pathname.startsWith('/api/')) {
    return response
  }

  // Unauthenticated + non-public → redirect to login
  if (!user && !isPublicRoute(pathname)) {
    const loginUrl = new URL('/login', origin)
    loginUrl.searchParams.set('redirect', pathname + search)
    return NextResponse.redirect(loginUrl)
  }

  // Authenticated + public route → redirect to dashboard
  if (user && isPublicRoute(pathname)) {
    return NextResponse.redirect(new URL(`/dashboard/${user.id}`, origin))
  }

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
