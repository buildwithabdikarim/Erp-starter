import { requirePageAuth } from '@/lib/auth-utils'
import { Layout } from '@/components/Layout'
import { DashboardClient } from '@/components/dashboard-client'

export default async function DashboardPage() {
  await requirePageAuth()

  return (
    <Layout>
      <DashboardClient />
    </Layout>
  )
}
