import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { auth } from './auth'
import { hasPermission, type PermissionAction, type PermissionModule } from './permissions-server'

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

/**
 * Authentication + authorization for route handlers.
 * Returns 401 if unauthenticated, 403 if missing module/action permission.
 */
export async function requireApiPermission(
  module: PermissionModule | string,
  action: PermissionAction | string
): Promise<{ session: AppSession; error?: never } | { session?: never; error: Response }> {
  const authResult = await requireApiAuth()
  if (authResult.error) return authResult

  const allowed = await hasPermission(authResult.session.user.id, module, action)
  if (!allowed) {
    return {
      error: Response.json(
        {
          error: 'Forbidden',
          message: `Missing permission: ${module}:${action}`,
        },
        { status: 403 }
      ),
    }
  }

  return { session: authResult.session }
}

export async function getRequestMeta() {
  const headersList = await headers()
  return {
    ipAddress:
      headersList.get('x-forwarded-for') || headersList.get('x-real-ip') || 'unknown',
    userAgent: headersList.get('user-agent') || 'unknown',
  }
}
