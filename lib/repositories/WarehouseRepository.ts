import { BaseRepository } from './BaseRepository'
import { warehouse } from '@/lib/db/schema'
import { db } from '@/lib/db'
import { eq, like } from 'drizzle-orm'

export class WarehouseRepository extends BaseRepository<any> {
  constructor() {
    super(warehouse)
  }

  async findByName(name: string, userId: string, limit = 20) {
    return db
      .select()
      .from(warehouse)
      .where((t) => like(t.name, `%${name}%`) && eq(t.userId, userId))
      .limit(limit)
  }

  async findByLocation(location: string, userId: string, limit = 20) {
    return db
      .select()
      .from(warehouse)
      .where((t) => like(t.location, `%${location}%`) && eq(t.userId, userId))
      .limit(limit)
  }

  async findActive(userId: string, limit = 100) {
    return db
      .select()
      .from(warehouse)
      .where((t) => eq(t.userId, userId) && eq(t.isActive, true))
      .limit(limit)
  }

  async findByManager(manager: string, userId: string, limit = 20) {
    return db
      .select()
      .from(warehouse)
      .where((t) => like(t.manager, `%${manager}%`) && eq(t.userId, userId))
      .limit(limit)
  }
}

export const warehouseRepository = new WarehouseRepository()
