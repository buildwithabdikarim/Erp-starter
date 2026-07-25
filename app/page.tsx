import { auth } from '@/lib/auth'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { Layout } from '@/components/Layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/Card'
import { Package, Users, ShoppingCart, TrendingUp } from 'lucide-react'
import { DashboardClient } from '@/components/dashboard-client'

export default async function DashboardPage() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) redirect('/sign-in')

  return (
    <Layout>
      <DashboardClient />
    </Layout>
  )
}

interface FeatureCardProps {
  title: string
  description: string
  href: string
}

const FeatureCard: React.FC<FeatureCardProps> = ({ title, description, href }) => {
  return (
    <a href={href}>
      <Card className="h-full hover:border-primary hover:shadow-lg transition-all duration-200 cursor-pointer">
        <CardContent className="p-6">
          <h3 className="font-semibold text-lg mb-2">{title}</h3>
          <p className="text-sm text-muted-foreground">{description}</p>
        </CardContent>
      </Card>
    </a>
  )
}

interface Stats {
  productCount: number
  supplierCount: number
  saleCount: number
  totalValue: number
  lowStockItems: number
}

