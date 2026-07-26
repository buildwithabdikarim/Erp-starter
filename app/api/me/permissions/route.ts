import { requireApiAuth } from '@/lib/auth-utils'
import { getUserAccess } from '@/lib/permissions-server'

export async function GET() {
  const authResult = await requireApiAuth()
  if (authResult.error) return authResult.error

  try {
    const access = await getUserAccess(authResult.session.user.id)
    return Response.json({
      success: true,
      data: access,
    })
  } catch (error) {
    console.error('[Me Permissions API] Error:', error)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}
