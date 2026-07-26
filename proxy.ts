import { NextRequest, NextResponse } from 'next/server'
import { getSessionCookie } from 'better-auth/cookies'

/**
 * Optimistic route protection (Next.js 16 proxy).
 * Cookie presence is checked here for redirects; full session validation
 * happens in page/API handlers via requirePageAuth / requireApiAuth.
 */
export async function proxy(request: NextRequest) {
  const sessionCookie = getSessionCookie(request)

  if (!sessionCookie) {
    const signInUrl = new URL('/sign-in', request.url)
    signInUrl.searchParams.set('callbackUrl', request.nextUrl.pathname)
    return NextResponse.redirect(signInUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/', '/products/:path*', '/suppliers/:path*', '/sales/:path*'],
}
