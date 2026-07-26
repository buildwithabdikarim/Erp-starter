import { BaseRepository } from './BaseRepository'
import { supplier } from '@/lib/db/schema'
import { db } from '@/lib/db'
import { eq, like } from 'drizzle-orm'

export class SupplierRepository extends BaseRepository<any> {
  constructor() {
    super(supplier)
  }

  async findByName(name: string, userId: string, limit = 20) {
    return db
      .select()
      .from(supplier)
      .where((t) => like(t.name, `%${name}%`) && eq(t.userId, userId))
      .limit(limit)
  }

  async findByEmail(email: string, userId: string) {
    const result = await db
      .select()
      .from(supplier)
      .where((t) => eq(t.email, email) && eq(t.userId, userId))
      .limit(1)
    return result[0] || null
  }

  async findByCountry(country: string, userId: string, limit = 50) {
    return db
      .select()
      .from(supplier)
      .where((t) => eq(t.country, country) && eq(t.userId, userId))
      .limit(limit)
  }

  async findActive(userId: string, limit = 100) {
    return db
      .select()
      .from(supplier)
      .where((t) => eq(t.userId, userId) && eq(t.isActive, true))
      .limit(limit)
  }

  async findTopRated(userId: string, limit = 20) {
    return db
      .select()
      .from(supplier)
      .where((t) => eq(t.userId, userId) && eq(t.isActive, true))
      .orderBy((t) => t.rating)
      .limit(limit)
  }
}

export const supplierRepository = new SupplierRepository()
