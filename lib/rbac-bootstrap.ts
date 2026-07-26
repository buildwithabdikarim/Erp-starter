import { and, eq } from 'drizzle-orm'
import { db } from '@/lib/db'
import { permission, role, rolePermission, userRole } from '@/lib/db/schema'
import { PERMISSION_CATALOG } from '@/lib/permissions'

/**
 * Idempotent RBAC bootstrap: ensures roles/permissions exist and
 * assigns the Admin role to the given user (exam/demo friendly).
 */
export async function ensureRbacBootstrap(userId: string) {
  let adminRole = (
    await db.select().from(role).where(eq(role.name, 'Admin')).limit(1)
  )[0]

  if (!adminRole) {
    adminRole = (
      await db
        .insert(role)
        .values({
          name: 'Admin',
          description: 'Administrator with full access',
        })
        .returning()
    )[0]
  }

  const managerRoleExisting = (
    await db.select().from(role).where(eq(role.name, 'Manager')).limit(1)
  )[0]
  if (!managerRoleExisting) {
    await db.insert(role).values({
      name: 'Manager',
      description: 'Manager with product and supplier access',
    })
  }

  const operatorRoleExisting = (
    await db.select().from(role).where(eq(role.name, 'Operator')).limit(1)
  )[0]
  if (!operatorRoleExisting) {
    await db.insert(role).values({
      name: 'Operator',
      description: 'Operator with read-only access',
    })
  }

  const permissionIds: string[] = []
  for (const entry of PERMISSION_CATALOG) {
    const existing = (
      await db.select().from(permission).where(eq(permission.name, entry.name)).limit(1)
    )[0]

    if (existing) {
      permissionIds.push(existing.id)
      continue
    }

    const created = (
      await db
        .insert(permission)
        .values({
          name: entry.name,
          module: entry.module,
          action: entry.action,
          description: entry.description,
        })
        .returning()
    )[0]
    permissionIds.push(created.id)
  }

  for (const permissionId of permissionIds) {
    const existingLink = (
      await db
        .select()
        .from(rolePermission)
        .where(
          and(
            eq(rolePermission.roleId, adminRole.id),
            eq(rolePermission.permissionId, permissionId)
          )
        )
        .limit(1)
    )[0]

    if (!existingLink) {
      await db.insert(rolePermission).values({
        roleId: adminRole.id,
        permissionId,
      })
    }
  }

  const existingUserRole = (
    await db
      .select()
      .from(userRole)
      .where(and(eq(userRole.userId, userId), eq(userRole.roleId, adminRole.id)))
      .limit(1)
  )[0]

  if (!existingUserRole) {
    await db.insert(userRole).values({
      userId,
      roleId: adminRole.id,
    })
  }

  return { adminRoleId: adminRole.id, permissionCount: permissionIds.length }
}
