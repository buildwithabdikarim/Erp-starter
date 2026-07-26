import { db } from '@/lib/db'
import { eq, and, isNull } from 'drizzle-orm'

export interface FindOptions {
  where?: Record<string, any>
  limit?: number
  offset?: number
  includeSoftDeleted?: boolean
}

export class BaseRepository<T extends Record<string, any>> {
  constructor(private table: any) {}

  async findAll(options?: FindOptions) {
    let query = db.select().from(this.table)
    
    if (!options?.includeSoftDeleted && this.table.deletedAt) {
      query = query.where(isNull(this.table.deletedAt)) as any
    }

    if (options?.limit) {
      query = query.limit(options.limit) as any
    }

    if (options?.offset) {
      query = query.offset(options.offset) as any
    }

    return query
  }

  async findById(id: string, includeSoftDeleted = false) {
    let query = db.select().from(this.table).where(eq(this.table.id, id)) as any

    if (!includeSoftDeleted && this.table.deletedAt) {
      query = query.where(isNull(this.table.deletedAt))
    }

    const result = await query.limit(1)
    return result[0] || null
  }

  async findDeleted(id: string) {
    const query = db.select().from(this.table).where(eq(this.table.id, id)) as any
    const result = await query.limit(1)
    return result[0] || null
  }

  async create(data: Partial<T>) {
    const result = await db.insert(this.table).values(data).returning()
    return result[0]
  }

  async update(id: string, data: Partial<T>) {
    const result = await db
      .update(this.table)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(this.table.id, id))
      .returning()
    return result[0]
  }

  async softDelete(id: string) {
    if (!this.table.deletedAt) {
      throw new Error('Soft delete not supported for this table')
    }
    const result = await db
      .update(this.table)
      .set({ deletedAt: new Date() })
      .where(eq(this.table.id, id))
      .returning()
    return result[0]
  }

  async restore(id: string) {
    if (!this.table.deletedAt) {
      throw new Error('Soft delete not supported for this table')
    }
    const result = await db
      .update(this.table)
      .set({ deletedAt: null })
      .where(eq(this.table.id, id))
      .returning()
    return result[0]
  }

  async hardDelete(id: string) {
    const result = await db.delete(this.table).where(eq(this.table.id, id)).returning()
    return result[0]
  }

  async findDeleted() {
    if (!this.table.deletedAt) {
      throw new Error('Soft delete not supported for this table')
    }
    return db
      .select()
      .from(this.table)
      .where(isNull(this.table.deletedAt).not())
  }

  async permanentlyDeleteAll() {
    if (!this.table.deletedAt) {
      throw new Error('Soft delete not supported for this table')
    }
    return db
      .delete(this.table)
      .where(isNull(this.table.deletedAt).not())
  }
}
