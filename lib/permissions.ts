export type PermissionModule = 'products' | 'suppliers' | 'orders' | 'inventory' | 'audit'
export type PermissionAction = 'create' | 'read' | 'update' | 'delete' | 'adjust'

export type UserAccess = {
  userId: string
  roles: string[]
  permissions: Array<{ name: string; module: string; action: string }>
  isAdmin: boolean
}

/** Canonical permission catalog used by seed + runtime checks. */
export const PERMISSION_CATALOG: Array<{
  module: PermissionModule
  action: PermissionAction
  name: string
  description: string
}> = [
  { module: 'products', action: 'create', name: 'product:create', description: 'Create products' },
  { module: 'products', action: 'read', name: 'product:read', description: 'View products' },
  { module: 'products', action: 'update', name: 'product:update', description: 'Update products' },
  { module: 'products', action: 'delete', name: 'product:delete', description: 'Delete products' },
  { module: 'suppliers', action: 'create', name: 'supplier:create', description: 'Create suppliers' },
  { module: 'suppliers', action: 'read', name: 'supplier:read', description: 'View suppliers' },
  { module: 'suppliers', action: 'update', name: 'supplier:update', description: 'Update suppliers' },
  { module: 'suppliers', action: 'delete', name: 'supplier:delete', description: 'Delete suppliers' },
  { module: 'orders', action: 'create', name: 'order:create', description: 'Create orders' },
  { module: 'orders', action: 'read', name: 'order:read', description: 'View orders' },
  { module: 'orders', action: 'update', name: 'order:update', description: 'Update orders' },
  { module: 'orders', action: 'delete', name: 'order:delete', description: 'Delete orders' },
  { module: 'inventory', action: 'read', name: 'inventory:read', description: 'View inventory' },
  { module: 'inventory', action: 'adjust', name: 'inventory:adjust', description: 'Adjust inventory' },
  { module: 'audit', action: 'read', name: 'audit:read', description: 'View audit logs' },
]

/** Client/server helper — no DB call. */
export function canAccess(
  access: Pick<UserAccess, 'isAdmin' | 'permissions'>,
  module: PermissionModule | string,
  action: PermissionAction | string
): boolean {
  if (access.isAdmin) return true
  return access.permissions.some((p) => p.module === module && p.action === action)
}
