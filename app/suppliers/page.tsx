import { Layout } from '@/components/Layout'
import { requirePageAuth } from '@/lib/auth-utils'
import { canAccess, getUserAccess } from '@/lib/permissions-server'
import { SuppliersClient } from './suppliers-client'

export default async function SuppliersPage() {
  const session = await requirePageAuth()
  const access = await getUserAccess(session.user.id)

  if (!canAccess(access, 'suppliers', 'read')) {
    return (
      <Layout>
        <div className="max-w-lg space-y-2">
          <h1 className="text-2xl font-semibold">Access denied</h1>
          <p className="text-muted-foreground">
            You need the <code>suppliers:read</code> permission to view this page.
          </p>
        </div>
      </Layout>
    )
  }

  return <SuppliersClient access={access} />
}
