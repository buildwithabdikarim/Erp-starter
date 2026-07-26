import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { auth } from './auth'

export type AppSession = NonNullable<Awaited<ReturnType<typeof getSession>>>

export async function getSession() {
  return auth.api.getSession({ headers: await headers() })
}

export async function getUserId() {
  const session = await getSession()
  if (!session?.user) {
    throw new Error('Unauthorized')
  }
  return session.user.id
}

/** Full session validation for server pages / layouts. Redirects if unauthenticated. */
export async function requirePageAuth() {
  const session = await getSession()
  if (!session?.user) {
    redirect('/sign-in')
  }
  return session
}

/**
 * Full session validation for route handlers.
 * Returns `{ session }` or `{ error: Response }` so handlers stay consistent.
 */
export async function requireApiAuth(): Promise<
  { session: AppSession; error?: never } | { session?: never; error: Response }
> {
  const session = await getSession()
  if (!session?.user) {
    return {
      error: Response.json({ error: 'Unauthorized' }, { status: 401 }),
    }
  }
  return { session }
}

export async function getRequestMeta() {
  const headersList = await headers()
  return {
    ipAddress:
      headersList.get('x-forwarded-for') || headersList.get('x-real-ip') || 'unknown',
    userAgent: headersList.get('user-agent') || 'unknown',
  }
}
