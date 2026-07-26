import { auth } from '@/lib/auth'
import { headers } from 'next/headers'
import { auditRepository } from '@/lib/repositories/AuditRepository'

export async function GET(request: Request) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const url = new URL(request.url)
  const type = url.searchParams.get('type') // 'user', 'module', 'action', 'stats'
  const filter = url.searchParams.get('filter')
  const limit = Math.min(parseInt(url.searchParams.get('limit') || '100'), 500)

  try {
    let result

    if (type === 'user') {
      result = await auditRepository.findByUser(filter || session.user.id, limit)
    } else if (type === 'module') {
      result = await auditRepository.findByModule(filter || '', limit)
    } else if (type === 'action') {
      result = await auditRepository.findByAction(filter || '', limit)
    } else if (type === 'failures') {
      result = await auditRepository.findFailures(limit)
    } else if (type === 'stats') {
      result = await auditRepository.getStats(session.user.id)
    } else {
      result = await auditRepository.findByUser(session.user.id, limit)
    }

    return Response.json(result)
  } catch (error) {
    console.error('[Audit API] Error:', error)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}
