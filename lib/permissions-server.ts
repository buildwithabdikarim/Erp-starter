import { and, eq } from 'drizzle-orm'
import { db } from '@/lib/db'
import { permission, role, rolePermission, userRole } from '@/lib/db/schema'
import {
  canAccess,
  type PermissionAction,
  type PermissionModule,
  type UserAccess,
} from '@/lib/permissions'

export async function getUserAccess(userId: string): Promise<UserAccess> {
  const roleRows = await db
    .select({ name: role.name })
    .from(userRole)
    .innerJoin(role, eq(userRole.roleId, role.id))
    .where(eq(userRole.userId, userId))

  const roles = [...new Set(roleRows.map((row) => row.name))]
  const isAdmin = roles.includes('Admin')

  const permissionRows = await db
    .select({
      name: permission.name,
      module: permission.module,
      action: permission.action,
    })
    .from(userRole)
    .innerJoin(rolePermission, eq(userRole.roleId, rolePermission.roleId))
    .innerJoin(permission, eq(rolePermission.permissionId, permission.id))
    .where(eq(userRole.userId, userId))

  const unique = new Map<string, UserAccess['permissions'][number]>()
  for (const row of permissionRows) {
    unique.set(row.name, row)
  }

  return {
    userId,
    roles,
    permissions: [...unique.values()],
    isAdmin,
  }
}

export async function hasPermission(
  userId: string,
  module: PermissionModule | string,
  action: PermissionAction | string
): Promise<boolean> {
  // Fast-path Admin role without loading every permission row twice in hot paths
  const adminRole = await db
    .select({ roleId: userRole.roleId })
    .from(userRole)
    .innerJoin(role, eq(userRole.roleId, role.id))
    .where(and(eq(userRole.userId, userId), eq(role.name, 'Admin')))
    .limit(1)

  if (adminRole.length > 0) return true

  const rows = await db
    .select({ id: permission.id })
    .from(userRole)
    .innerJoin(rolePermission, eq(userRole.roleId, rolePermission.roleId))
    .innerJoin(permission, eq(rolePermission.permissionId, permission.id))
    .where(
      and(
        eq(userRole.userId, userId),
        eq(permission.module, module),
        eq(permission.action, action)
      )
    )
    .limit(1)

  return rows.length > 0
}

export { canAccess }
