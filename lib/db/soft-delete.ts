import { eq, and, isNull, SQL } from 'drizzle-orm'

/**
 * Soft-delete utilities for Drizzle ORM
 * Provides query builders that automatically filter out soft-deleted records
 */

export interface SoftDeleteTable {
  deletedAt?: any
}

/**
 * Build a WHERE clause that excludes soft-deleted records
 */
export function excludeSoftDeleted(table: any): SQL | undefined {
  if (!table.deletedAt) return undefined
  return isNull(table.deletedAt)
}

/**
 * Build a WHERE clause that only includes soft-deleted records
 */
export function onlySoftDeleted(table: any): SQL | undefined {
  if (!table.deletedAt) return undefined
  return isNull(table.deletedAt).not()
}

/**
 * Safely soft-delete a record
 */
export async function softDelete(db: any, table: any, id: string, idColumn = 'id') {
  if (!table.deletedAt) {
    throw new Error(`Table does not support soft delete - no deletedAt column`)
  }

  return db
    .update(table)
    .set({ deletedAt: new Date() })
    .where(eq(table[idColumn], id))
    .returning()
}

/**
 * Restore a soft-deleted record
 */
export async function restoreDeleted(db: any, table: any, id: string, idColumn = 'id') {
  if (!table.deletedAt) {
    throw new Error(`Table does not support soft delete - no deletedAt column`)
  }

  return db
    .update(table)
    .set({ deletedAt: null })
    .where(eq(table[idColumn], id))
    .returning()
}

/**
 * Permanently delete a soft-deleted record
 */
export async function permanentlyDelete(db: any, table: any, id: string, idColumn = 'id') {
  return db
    .delete(table)
    .where(eq(table[idColumn], id))
    .returning()
}

/**
 * Find a record including soft-deleted ones
 */
export async function findWithDeleted(db: any, table: any, id: string, idColumn = 'id') {
  return db
    .select()
    .from(table)
    .where(eq(table[idColumn], id))
    .limit(1)
}

/**
 * Find a record excluding soft-deleted ones
 */
export async function findWithoutDeleted(db: any, table: any, id: string, idColumn = 'id') {
  const where = excludeSoftDeleted(table)
  if (!where) {
    return findWithDeleted(db, table, id, idColumn)
  }

  return db
    .select()
    .from(table)
    .where(and(eq(table[idColumn], id), where))
    .limit(1)
}
