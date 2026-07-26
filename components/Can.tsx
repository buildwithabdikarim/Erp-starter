'use client'

import type { ReactNode } from 'react'
import { canAccess, type PermissionAction, type PermissionModule, type UserAccess } from '@/lib/permissions'

type CanProps = {
  access: Pick<UserAccess, 'isAdmin' | 'permissions'>
  module: PermissionModule | string
  action: PermissionAction | string
  children: ReactNode
  fallback?: ReactNode
}

/** Conditionally render UI based on RBAC access. */
export function Can({ access, module, action, children, fallback = null }: CanProps) {
  if (!canAccess(access, module, action)) {
    return <>{fallback}</>
  }
  return <>{children}</>
}
