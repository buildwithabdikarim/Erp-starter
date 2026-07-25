'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { Menu, X } from 'lucide-react'
import { ROUTES } from '@/constants'

interface LayoutProps {
  children: React.ReactNode
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true)

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <aside
        className={cn(
          'border-r border-border bg-sidebar text-sidebar-foreground transition-all duration-300',
          'flex flex-col',
          sidebarOpen ? 'w-64' : 'w-0 overflow-hidden'
        )}
      >
        <div className="p-6 border-b border-sidebar-border">
          <h1 className="text-xl font-bold text-sidebar-foreground">ERP System</h1>
        </div>

        <nav className="flex-1 overflow-y-auto p-4 space-y-2">
          <NavLink href={ROUTES.dashboard} label="Dashboard" />
          <NavLink href={ROUTES.products} label="Products" />
          <NavLink href={ROUTES.suppliers} label="Suppliers" />
          <NavLink href={ROUTES.sales} label="Sales" />
        </nav>

        <div className="p-4 border-t border-sidebar-border">
          <div className="text-xs text-sidebar-foreground/60">Version 1.0.0</div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="border-b border-border bg-card text-card-foreground px-6 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 hover:bg-muted rounded transition-colors"
            >
              {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            <h2 className="text-lg font-semibold">Welcome to ERP System</h2>
            <div className="w-10" /> {/* Spacer for alignment */}
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 overflow-auto">
          <div className="p-6">{children}</div>
        </main>
      </div>
    </div>
  )
}

Layout.displayName = 'Layout'

interface NavLinkProps {
  href: string
  label: string
}

const NavLink: React.FC<NavLinkProps> = ({ href, label }) => {
  return (
    <Link
      href={href}
      className={cn(
        'block px-4 py-2 rounded transition-colors',
        'hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
        'text-sidebar-foreground'
      )}
    >
      {label}
    </Link>
  )
}
