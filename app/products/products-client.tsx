'use client'

import { useMemo, useState } from 'react'
import { Layout } from '@/components/Layout'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/Card'
import { Table } from '@/components/Table'
import { Modal } from '@/components/Modal'
import { Form } from '@/components/Form'
import { Button } from '@/components/Button'
import { Can } from '@/components/Can'
import { useModal, useNotification } from '@/hooks'
import { useProducts } from '@/hooks/useProducts'
import { getProductFormConfig } from '@/features/products/fields'
import { productColumns } from '@/features/products/columns'
import { TableConfig } from '@/types'
import { canAccess, type UserAccess } from '@/lib/permissions'
import { Plus, Edit2, Trash2 } from 'lucide-react'

type ProductsClientProps = {
  access: UserAccess
}

function toProductPayload(data: Record<string, any>) {
  return {
    code: data.code,
    sku: data.sku,
    name: data.name,
    description: data.description || null,
    category: data.category,
    unit: data.unit || 'piece',
    costPrice: data.costPrice,
    sellingPrice: data.sellingPrice,
    reorderLevel: data.reorderLevel ?? 10,
    reorderQuantity: data.reorderQuantity ?? 50,
    status: data.status || 'active',
  }
}

export function ProductsClient({ access }: ProductsClientProps) {
  const { data: products = [], isLoading, refetch } = useProducts()
  const [extraCategories, setExtraCategories] = useState<string[]>([])
  const modal = useModal()
  const { notifications, add } = useNotification()
  const [selectedProduct, setSelectedProduct] = useState<any>(undefined)

  const canCreate = canAccess(access, 'products', 'create')
  const canUpdate = canAccess(access, 'products', 'update')
  const canDelete = canAccess(access, 'products', 'delete')
  const showActions = canUpdate || canDelete

  const categories = useMemo(() => {
    const fromProducts = products
      .map((p: { category?: string }) => p.category)
      .filter((c: string | undefined): c is string => Boolean(c))
    return [...new Set([...fromProducts, ...extraCategories])]
  }, [products, extraCategories])

  const formConfig = getProductFormConfig(
    categories,
    modal.mode === 'edit' ? 'edit' : 'create'
  )

  const formKey = `${modal.mode}-${selectedProduct?.id ?? 'new'}`

  const handleSubmit = async (data: Record<string, any>) => {
    try {
      if (data.category && !categories.includes(data.category)) {
        setExtraCategories((prev) => [...prev, data.category])
      }

      const payload = toProductPayload(data)

      if (modal.mode === 'create') {
        if (!canCreate) {
          add({ type: 'error', title: 'Forbidden', message: 'Missing permission: products:create' })
          return
        }

        const response = await fetch('/api/products', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })

        if (response.ok) {
          await refetch()
          modal.close()
          add({ type: 'success', title: 'Success', message: 'Product created' })
        } else {
          const error = await response.json()
          add({ type: 'error', title: 'Error', message: error.message || error.error })
        }
      } else if (modal.mode === 'edit' && selectedProduct) {
        if (!canUpdate) {
          add({ type: 'error', title: 'Forbidden', message: 'Missing permission: products:update' })
          return
        }

        const response = await fetch(`/api/products/${selectedProduct.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })

        if (response.ok) {
          await refetch()
          modal.close()
          add({ type: 'success', title: 'Success', message: 'Product updated' })
        } else {
          const error = await response.json()
          add({ type: 'error', title: 'Error', message: error.message || error.error })
        }
      }
    } catch (error) {
      add({ type: 'error', title: 'Error', message: 'Failed to save product' })
    }
  }

  const handleDelete = async (product: any) => {
    if (!canDelete) {
      add({ type: 'error', title: 'Forbidden', message: 'Missing permission: products:delete' })
      return
    }
    if (!confirm('Delete this product?')) return
    try {
      const response = await fetch(`/api/products/${product.id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        await refetch()
        add({ type: 'success', title: 'Success', message: 'Product deleted' })
      } else {
        const error = await response.json()
        add({ type: 'error', title: 'Error', message: error.message || error.error })
      }
    } catch (error) {
      add({ type: 'error', title: 'Error', message: 'Failed to delete product' })
    }
  }

  const tableConfig: TableConfig = {
    columns: [
      ...productColumns,
      ...(showActions
        ? [
            {
              id: 'actions',
              header: 'Actions',
              width: 120,
              cell: (_: unknown, row: any) => (
                <div className="flex gap-2">
                  <Can access={access} module="products" action="update">
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => {
                        setSelectedProduct(row)
                        modal.open('edit', row)
                      }}
                    >
                      <Edit2 className="w-4 h-4" />
                    </Button>
                  </Can>
                  <Can access={access} module="products" action="delete">
                    <Button size="sm" variant="destructive" onClick={() => handleDelete(row)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </Can>
                </div>
              ),
            },
          ]
        : []),
    ],
    data: products,
    enableSorting: true,
    enablePagination: true,
    enableFiltering: true,
  }

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-96">
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Products</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Roles: {access.roles.length ? access.roles.join(', ') : 'None'}
            </p>
          </div>
          <Can access={access} module="products" action="create">
            <Button
              onClick={() => {
                setSelectedProduct(undefined)
                modal.open('create')
              }}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Product
            </Button>
          </Can>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Product Inventory</CardTitle>
          </CardHeader>
          <CardContent>
            <Table config={tableConfig} />
          </CardContent>
        </Card>
      </div>

      <div className="fixed bottom-4 right-4 max-w-md space-y-2 z-50">
        {notifications.map((n) => (
          <div key={n.id} className="bg-background border border-border rounded-lg p-4 shadow-lg">
            <p className="text-sm font-medium">{n.message}</p>
          </div>
        ))}
      </div>

      <Modal
        isOpen={modal.isOpen}
        onClose={modal.close}
        title={formConfig.title || ''}
        width="lg"
      >
        <Form
          config={formConfig}
          formKey={formKey}
          initialValues={selectedProduct || {}}
          onSubmit={handleSubmit}
          onCancel={modal.close}
        />
      </Modal>
    </Layout>
  )
}
