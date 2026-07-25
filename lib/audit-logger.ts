import { db } from './db'
import { auditLog } from './db/schema'
import { headers } from 'next/headers'

export interface AuditLogData {
  userId: string
  action: string
  module: string
  entityId: string
  entityType: string
  changes?: Record<string, any>
  status?: 'success' | 'failure'
  errorMessage?: string
}

export async function logAudit(data: AuditLogData) {
  try {
    const headersList = await headers()
    const ipAddress = headersList.get('x-forwarded-for') || headersList.get('x-real-ip') || 'unknown'
    const userAgent = headersList.get('user-agent') || 'unknown'

    await db.insert(auditLog).values({
      userId: data.userId,
      action: data.action,
      module: data.module,
      entityId: data.entityId,
      entityType: data.entityType,
      changes: data.changes,
      ipAddress,
      userAgent,
      status: data.status || 'success',
      errorMessage: data.errorMessage,
    })
  } catch (error) {
    console.error('[AuditLog] Failed to log audit event:', error)
  }
}
