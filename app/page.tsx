'use client'

import { useEffect, useState } from 'react'
import { Layout } from '@/components/Layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/Card'
import { productAPI, supplierAPI, saleAPI } from '@/services/api'
import { Product, Supplier, Sale } from '@/types'
import { Package, Users, ShoppingCart, TrendingUp } from 'lucide-react'

interface Stats {
  productCount: number
  supplierCount: number
  saleCount: number
  totalValue: number
  lowStockItems: number
}

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats>({
    productCount: 0,
    supplierCount: 0,
    saleCount: 0,
    totalValue: 0,
    lowStockItems: 0,
  })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadStats = async () => {
      try {
        const [productsRes, suppliersRes, salesRes] = await Promise.all([
          productAPI.getAll(1, 100),
          supplierAPI.getAll(1, 100),
          saleAPI.getAll(1, 100),
        ])

        const products = productsRes.data
        const lowStockItems = products.filter((p) => p.quantity <= 10).length
        const totalValue = products.reduce((sum, p) => sum + p.selling_price * p.quantity, 0)

        setStats({
          productCount: productsRes.total,
          supplierCount: suppliersRes.total,
          saleCount: salesRes.total,
          totalValue,
          lowStockItems,
        })
      } finally {
        setIsLoading(false)
      }
    }

    loadStats()
  }, [])

  const StatCard = ({
    icon: Icon,
    label,
    value,
    subtext,
    variant,
  }: {
    icon: React.ComponentType<{ className: string }>
    label: string
    value: string | number
    subtext?: string
    variant: 'default' | 'warning' | 'accent'
  }) => {
    const bgColors = {
      default: 'bg-blue-50 dark:bg-blue-950',
      warning: 'bg-yellow-50 dark:bg-yellow-950',
      accent: 'bg-green-50 dark:bg-green-950',
    }

    const iconColors = {
      default: 'text-blue-600 dark:text-blue-400',
      warning: 'text-yellow-600 dark:text-yellow-400',
      accent: 'text-green-600 dark:text-green-400',
    }

    return (
      <Card className="hover:shadow-md transition-shadow">
        <CardContent className="p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">{label}</p>
              <p className="text-2xl font-bold mt-2">{value}</p>
              {subtext && <p className="text-xs text-muted-foreground mt-1">{subtext}</p>}
            </div>
            <div className={`p-3 rounded-lg ${bgColors[variant]}`}>
              <Icon className={`w-6 h-6 ${iconColors[variant]}`} />
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  const LoadingCard = () => (
    <Card>
      <CardContent className="p-6">
        <div className="h-20 bg-muted rounded animate-pulse" />
      </CardContent>
    </Card>
  )

  return (
    <Layout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground mt-2">Welcome to your ERP system. Here&apos;s an overview of your business.</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {isLoading ? (
            <>
              <LoadingCard />
              <LoadingCard />
              <LoadingCard />
              <LoadingCard />
            </>
          ) : (
            <>
              <StatCard
                icon={Package}
                label="Total Products"
                value={stats.productCount}
                subtext={`${stats.lowStockItems} low stock items`}
                variant={stats.lowStockItems > 0 ? 'warning' : 'default'}
              />
              <StatCard
                icon={Users}
                label="Active Suppliers"
                value={stats.supplierCount}
                subtext="Supplier partnerships"
                variant="default"
              />
              <StatCard
                icon={ShoppingCart}
                label="Total Sales"
                value={stats.saleCount}
                subtext="Completed transactions"
                variant="accent"
              />
              <StatCard
                icon={TrendingUp}
                label="Inventory Value"
                value={`$${(stats.totalValue / 1000).toFixed(1)}K`}
                subtext="Total asset value"
                variant="accent"
              />
            </>
          )}
        </div>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <FeatureCard
            title="Products"
            description="Manage your product catalog, inventory levels, and supplier information"
            href="/products"
          />
          <FeatureCard
            title="Suppliers"
            description="Track supplier details, contact information, and partnership status"
            href="/suppliers"
          />
          <FeatureCard
            title="Places"
            description="Monitor warehouses, retail stores, and office locations"
            href="/places"
          />
        </div>

        {/* Info Section */}
        <Card>
          <CardHeader>
            <CardTitle>About This ERP System</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 text-sm">
              <p className="text-foreground">
                This is a <strong>configuration-driven ERP framework</strong> built to demonstrate modern enterprise application development patterns.
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li>
                  <strong className="text-foreground">Reusable Components:</strong> Generic Table, Form, Modal, and Input components
                </li>
                <li>
                  <strong className="text-foreground">Configuration-Based:</strong> UI rendered from config objects, not hardcoded
                </li>
                <li>
                  <strong className="text-foreground">Type-Safe:</strong> Full TypeScript support with Zod validation
                </li>
                <li>
                  <strong className="text-foreground">Service Layer:</strong> Mock APIs easily replaceable with real backends
                </li>
                <li>
                  <strong className="text-foreground">Module-Agnostic:</strong> Add new modules by creating config files only
                </li>
                <li>
                  <strong className="text-foreground">Production Ready:</strong> Built with Next.js 16, React 19, and TailwindCSS v4
                </li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
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
