import { BaseRepository } from './BaseRepository'
import { product } from '@/lib/db/schema'
import { db } from '@/lib/db'
import { eq, like, isNull } from 'drizzle-orm'

export class ProductRepository extends BaseRepository<any> {
  constructor() {
    super(product)
  }

  async findBySku(sku: string, includeSoftDeleted = false) {
    let query = db.select().from(product).where(eq(product.sku, sku)) as any

    if (!includeSoftDeleted) {
      query = query.where(isNull(product.deletedAt))
    }

    const result = await query.limit(1)
    return result[0] || null
  }

  async searchByName(name: string, limit = 20) {
    return db
      .select()
      .from(product)
      .where((t) => like(t.name, `%${name}%`) && isNull(t.deletedAt))
      .limit(limit)
  }

  async findByCategory(category: string, limit = 50) {
    return db
      .select()
      .from(product)
      .where((t) => eq(t.category, category) && isNull(t.deletedAt))
      .limit(limit)
  }

  async findLowStock(limit = 50) {
    return db
      .select()
      .from(product)
      .where((t) => isNull(t.deletedAt))
      .limit(limit)
  }

  async findActive(limit = 100) {
    return db
      .select()
      .from(product)
      .where((t) => eq(t.status, 'active') && isNull(t.deletedAt))
      .limit(limit)
  }

  async getAllProducts(limit = 100) {
    return db
      .select()
      .from(product)
      .where(isNull(product.deletedAt))
      .limit(limit)
  }
}

export const productRepository = new ProductRepository()
