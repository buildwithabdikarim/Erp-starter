import { db } from '@/lib/db'
import { auditLog } from '@/lib/db/schema'
import { desc, eq } from 'drizzle-orm'

export interface AuditLogEntry {
  userId: string
  action: 'CREATE' | 'UPDATE' | 'DELETE' | 'RESTORE'
  module: string
  entityId: string
  entityType: string
  changes?: Record<string, any>
  ipAddress?: string
  userAgent?: string
  status: 'success' | 'failure'
  errorMessage?: string
}

export class AuditRepository {
  async create(entry: AuditLogEntry) {
    const result = await db.insert(auditLog).values(entry).returning()
    return result[0]
  }

  async findByEntity(entityType: string, entityId: string, limit = 50) {
    return db
      .select()
      .from(auditLog)
      .where((t) => eq(t.entityType, entityType) && eq(t.entityId, entityId))
      .orderBy(desc(auditLog.createdAt))
      .limit(limit)
  }

  async findByUser(userId: string, limit = 100) {
    return db
      .select()
      .from(auditLog)
      .where(eq(auditLog.userId, userId))
      .orderBy(desc(auditLog.createdAt))
      .limit(limit)
  }

  async findByModule(module: string, limit = 100) {
    return db
      .select()
      .from(auditLog)
      .where(eq(auditLog.module, module))
      .orderBy(desc(auditLog.createdAt))
      .limit(limit)
  }

  async findByAction(action: string, limit = 100) {
    return db
      .select()
      .from(auditLog)
      .where(eq(auditLog.action, action))
      .orderBy(desc(auditLog.createdAt))
      .limit(limit)
  }

  async findFailures(limit = 50) {
    return db
      .select()
      .from(auditLog)
      .where(eq(auditLog.status, 'failure'))
      .orderBy(desc(auditLog.createdAt))
      .limit(limit)
  }

  async getStats(userId?: string) {
    let query = db.select().from(auditLog)
    if (userId) {
      query = query.where(eq(auditLog.userId, userId)) as any
    }

    const logs = await query
    
    return {
      totalActions: logs.length,
      creates: logs.filter(l => l.action === 'CREATE').length,
      updates: logs.filter(l => l.action === 'UPDATE').length,
      deletes: logs.filter(l => l.action === 'DELETE').length,
      restores: logs.filter(l => l.action === 'RESTORE').length,
      failures: logs.filter(l => l.status === 'failure').length,
      byModule: this.groupByModule(logs),
      byUser: userId ? undefined : this.groupByUser(logs),
    }
  }

  private groupByModule(logs: any[]) {
    return logs.reduce(
      (acc, log) => {
        acc[log.module] = (acc[log.module] || 0) + 1
        return acc
      },
      {} as Record<string, number>
    )
  }

  private groupByUser(logs: any[]) {
    return logs.reduce(
      (acc, log) => {
        acc[log.userId] = (acc[log.userId] || 0) + 1
        return acc
      },
      {} as Record<string, number>
    )
  }
}

export const auditRepository = new AuditRepository()
