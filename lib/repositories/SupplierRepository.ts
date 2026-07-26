import { BaseRepository } from './BaseRepository'
import { supplier } from '@/lib/db/schema'
import { db } from '@/lib/db'
import { and, eq, isNull, like } from 'drizzle-orm'

export class SupplierRepository extends BaseRepository<any> {
  constructor() {
    super(supplier)
  }

  async getAllSuppliers(limit = 100) {
    return db
      .select()
      .from(supplier)
      .where(isNull(supplier.deletedAt))
      .limit(limit)
  }

  async findByCode(code: string) {
    const result = await db
      .select()
      .from(supplier)
      .where(and(eq(supplier.code, code), isNull(supplier.deletedAt)))
      .limit(1)
    return result[0] || null
  }

  async searchByName(name: string, limit = 20) {
    return db
      .select()
      .from(supplier)
      .where(and(like(supplier.name, `%${name}%`), isNull(supplier.deletedAt)))
      .limit(limit)
  }

  async findActive(limit = 100) {
    return db
      .select()
      .from(supplier)
      .where(and(eq(supplier.status, 'active'), isNull(supplier.deletedAt)))
      .limit(limit)
  }
}

export const supplierRepository = new SupplierRepository()
