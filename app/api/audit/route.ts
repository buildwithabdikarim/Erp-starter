import { requireApiPermission } from '@/lib/auth-utils'
import { auditRepository } from '@/lib/repositories/AuditRepository'

export async function GET(request: Request) {
  const authResult = await requireApiPermission('audit', 'read')
  if (authResult.error) return authResult.error

  const url = new URL(request.url)
  const type = url.searchParams.get('type') // 'user', 'module', 'action', 'stats'
  const filter = url.searchParams.get('filter')
  const limit = Math.min(parseInt(url.searchParams.get('limit') || '100'), 500)

  try {
    let result

    if (type === 'user') {
      result = await auditRepository.findByUser(filter || authResult.session.user.id, limit)
    } else if (type === 'module') {
      result = await auditRepository.findByModule(filter || '', limit)
    } else if (type === 'action') {
      result = await auditRepository.findByAction(filter || '', limit)
    } else if (type === 'failures') {
      result = await auditRepository.findFailures(limit)
    } else if (type === 'stats') {
      result = await auditRepository.getStats(authResult.session.user.id)
    } else {
      result = await auditRepository.findByUser(authResult.session.user.id, limit)
    }

    return Response.json(result)
  } catch (error) {
    console.error('[Audit API] Error:', error)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}
