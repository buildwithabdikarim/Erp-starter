'use client'

import { useState } from 'react'
import { Layout } from '@/components/Layout'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/Card'
import { Table } from '@/components/Table'
import { Modal } from '@/components/Modal'
import { Form } from '@/components/Form'
import { Button } from '@/components/Button'
import { useModal, useNotification } from '@/hooks'
import { useProducts } from '@/hooks/useProducts'
import { getProductFormFields } from '@/features/products/fields'
import { productColumns } from '@/features/products/columns'
import { FormConfig, TableConfig } from '@/types'
import { Plus, Edit2, Trash2 } from 'lucide-react'

export default function ProductsPage() {
  const { data: products = [], isLoading, mutate, error } = useProducts()
  const [categories, setCategories] = useState<string[]>([])
  const modal = useModal()
  const { notifications, add } = useNotification()
  const [selectedProduct, setSelectedProduct] = useState<any>(undefined)

  const handleSubmit = async (data: Record<string, any>) => {
    try {
      if (modal.mode === 'create') {
        const productData = {
          sku: data.sku || `SKU-${Date.now()}`,
          name: data.name,
          description: data.description,
          category: data.category,
          unit: data.unit || 'piece',
          costPrice: parseFloat(data.costPrice),
          sellingPrice: parseFloat(data.sellingPrice),
          reorderLevel: parseInt(data.reorderLevel),
        }
        
        if (!categories.includes(data.category)) {
          setCategories([...categories, data.category])
        }
        
        const response = await fetch('/api/products', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(productData),
        })
        
        if (response.ok) {
          await mutate()
          modal.close()
          add({ type: 'success', title: 'Success', message: 'Product created' })
        } else {
          const error = await response.json()
          add({ type: 'error', title: 'Error', message: error.error })
        }
      } else if (modal.mode === 'edit' && selectedProduct) {
        const response = await fetch(`/api/products/${selectedProduct.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        })
        
        if (response.ok) {
          await mutate()
          modal.close()
          add({ type: 'success', title: 'Success', message: 'Product updated' })
        } else {
          const error = await response.json()
          add({ type: 'error', title: 'Error', message: error.error })
        }
      }
    } catch (error) {
      add({ type: 'error', title: 'Error', message: 'Failed to save product' })
    }
  }

  const handleDelete = async (product: any) => {
    if (!confirm('Delete this product?')) return
    try {
      const response = await fetch(`/api/products/${product.id}`, {
        method: 'DELETE',
      })
      
      if (response.ok) {
        await mutate()
        add({ type: 'success', title: 'Success', message: 'Product deleted' })
      } else {
        const error = await response.json()
        add({ type: 'error', title: 'Error', message: error.error })
      }
    } catch (error) {
      add({ type: 'error', title: 'Error', message: 'Failed to delete product' })
    }
  }

  const tableConfig: TableConfig = {
    columns: [
      ...productColumns,
      {
        id: 'actions',
        header: 'Actions',
        width: 120,
        cell: (_, row) => (
          <div className="flex gap-2">
            <Button size="sm" variant="secondary" onClick={() => {
              setSelectedProduct(row)
              modal.open('edit', row)
            }}>
              <Edit2 className="w-4 h-4" />
            </Button>
            <Button size="sm" variant="destructive" onClick={() => handleDelete(row)}>
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        ),
      },
    ],
    data: products,
    enableSorting: true,
    enablePagination: true,
    enableFiltering: true,
  }

  const formConfig: FormConfig = {
    title: `${modal.mode === 'create' ? 'Create' : 'Edit'} Product`,
    fields: getProductFormFields(categories),
    submitLabel: 'Save Product',
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
          <h1 className="text-3xl font-bold">Products</h1>
          <Button onClick={() => {
            setSelectedProduct(undefined)
            modal.open('create')
          }}>
            <Plus className="w-4 h-4 mr-2" />
            Add Product
          </Button>
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

      {/* Notifications */}
      <div className="fixed bottom-4 right-4 max-w-md space-y-2 z-50">
        {notifications.map((n) => (
          <div key={n.id} className="bg-background border border-border rounded-lg p-4 shadow-lg">
            <p className="text-sm font-medium">{n.message}</p>
          </div>
        ))}
      </div>

      {/* Modal */}
      <Modal
        isOpen={modal.isOpen}
        onClose={modal.close}
        title={formConfig.title || ''}
        width="lg"
      >
        <Form
          config={formConfig}
          initialValues={selectedProduct || {}}
          onSubmit={handleSubmit}
          onCancel={modal.close}
        />
      </Modal>
    </Layout>
  )
}
