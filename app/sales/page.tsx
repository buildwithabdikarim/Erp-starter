import { Layout } from '@/components/Layout'
import { requirePageAuth } from '@/lib/auth-utils'
import { canAccess, getUserAccess } from '@/lib/permissions-server'
import { SalesClient } from './sales-client'

export default async function SalesPage() {
  const session = await requirePageAuth()
  const access = await getUserAccess(session.user.id)

  if (!canAccess(access, 'orders', 'read')) {
    return (
      <Layout>
        <div className="max-w-lg space-y-2">
          <h1 className="text-2xl font-semibold">Access denied</h1>
          <p className="text-muted-foreground">
            You need the <code>orders:read</code> permission to view this page.
          </p>
        </div>
      </Layout>
    )
  }

  return <SalesClient access={access} />
}
