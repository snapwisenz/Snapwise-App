import { NextResponse, type NextRequest } from 'next/server'
import { updateSession } from '@/utils/supabase/middleware'

export async function middleware(request: NextRequest) {
  // 1. Skip middleware for Next.js prefetch requests to prevent connection flooding
  if (
    request.headers.get('purpose') === 'prefetch' ||
    request.headers.get('x-middleware-prefetch')
  ) {
    const requestHeaders = new Headers(request.headers)
    requestHeaders.set('x-pathname', request.nextUrl.pathname)
    return NextResponse.next({ request: { headers: requestHeaders } })
  }

  // 2. Wrap updateSession in a strict 4.5-second timeout (Vercel limits Hobby Edge to 10s, occasionally shorter on cold starts)
  try {
    const timeoutPromise = new Promise<NextResponse>((_, reject) => {
      setTimeout(() => reject(new Error('Middleware timeout limit reached')), 4500)
    })

    return await Promise.race([updateSession(request), timeoutPromise])
  } catch (error) {
    console.error('Middleware failed or timed out, failing open:', error)
    // Fail gracefully: let the server components (layout.tsx) handle auth validation
    const requestHeaders = new Headers(request.headers)
    requestHeaders.set('x-pathname', request.nextUrl.pathname)
    return NextResponse.next({ request: { headers: requestHeaders } })
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - api (API routes, they handle their own auth)
     */
    '/((?!_next/static|_next/image|favicon.ico|api|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
