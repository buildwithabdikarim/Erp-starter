import { BaseRepository } from './BaseRepository'
import { product } from '@/lib/db/schema'
import { db } from '@/lib/db'
import { eq, like } from 'drizzle-orm'

export class ProductRepository extends BaseRepository<any> {
  constructor() {
    super(product)
  }

  async findBySku(sku: string, includeSoftDeleted = false) {
    let query = db.select().from(product).where(eq(product.sku, sku)) as any

    if (!includeSoftDeleted) {
      query = query.where(eq(product.deletedAt, null))
    }

    const result = await query.limit(1)
    return result[0] || null
  }

  async searchByName(name: string, userId: string, limit = 20) {
    return db
      .select()
      .from(product)
      .where((t) => like(t.name, `%${name}%`) && eq(t.userId, userId))
      .limit(limit)
  }

  async findByCategory(category: string, userId: string, limit = 50) {
    return db
      .select()
      .from(product)
      .where((t) => eq(t.category, category) && eq(t.userId, userId))
      .limit(limit)
  }

  async findLowStock(userId: string, limit = 50) {
    return db
      .select()
      .from(product)
      .where((t) => eq(t.userId, userId))
      .limit(limit)
  }

  async findActive(userId: string, limit = 100) {
    return db
      .select()
      .from(product)
      .where((t) => eq(t.userId, userId) && eq(t.isActive, true))
      .limit(limit)
  }
}

export const productRepository = new ProductRepository()
