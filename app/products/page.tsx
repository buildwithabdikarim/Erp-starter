import { Layout } from '@/components/Layout'
import { requirePageAuth } from '@/lib/auth-utils'
import { canAccess, getUserAccess } from '@/lib/permissions-server'
import { ProductsClient } from './products-client'

export default async function ProductsPage() {
  const session = await requirePageAuth()
  const access = await getUserAccess(session.user.id)

  if (!canAccess(access, 'products', 'read')) {
    return (
      <Layout>
        <div className="max-w-lg space-y-2">
          <h1 className="text-2xl font-semibold">Access denied</h1>
          <p className="text-muted-foreground">
            You need the <code>products:read</code> permission to view this page.
            {access.roles.length === 0
              ? ' No roles are assigned to your account yet — run the seed endpoint in development to bootstrap Admin access.'
              : ` Your roles: ${access.roles.join(', ')}.`}
          </p>
        </div>
      </Layout>
    )
  }

  return <ProductsClient access={access} />
}
