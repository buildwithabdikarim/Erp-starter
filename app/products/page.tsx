'use client'

import { useState, useEffect } from 'react'
import { Layout } from '@/components/Layout'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/Card'
import { Table } from '@/components/Table'
import { Modal } from '@/components/Modal'
import { Form } from '@/components/Form'
import { Button } from '@/components/Button'
import { useModal, useNotification } from '@/hooks'
import { productAPI } from '@/services/api'
import { getProductFormFields } from '@/features/products/fields'
import { productColumns } from '@/features/products/columns'
import { Product, FormConfig, TableConfig } from '@/types'
import { Plus, Edit2, Trash2 } from 'lucide-react'

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const modal = useModal()
  const { notifications, add } = useNotification()
  const [selectedProduct, setSelectedProduct] = useState<Product | undefined>()

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setIsLoading(true)
    try {
      const productsRes = await productAPI.getAll(1, 50)
      setProducts(productsRes.data)
      
      // Extract unique categories from products
      const uniqueCategories = Array.from(new Set(productsRes.data.map((p) => p.category)))
      setCategories(uniqueCategories)
    } catch (error) {
      add({ type: 'error', title: 'Error', message: 'Failed to load data' })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (data: Record<string, any>) => {
    try {
      if (modal.mode === 'create') {
        const productData = {
          name: data.name,
          category: data.category,
          cost_price: data.cost_price,
          selling_price: data.selling_price,
          quantity: data.quantity,
        }
        
        // Add new category if it doesn't exist
        if (!categories.includes(data.category)) {
          setCategories([...categories, data.category])
        }
        
        const result = await productAPI.create(productData)
        if (result.success) {
          await loadData()
          modal.close()
          add({ type: 'success', title: 'Success', message: 'Product created' })
        }
      } else if (modal.mode === 'edit' && selectedProduct) {
        const result = await productAPI.update(selectedProduct.id, data)
        if (result.success) {
          await loadData()
          modal.close()
          add({ type: 'success', title: 'Success', message: 'Product updated' })
        }
      }
    } catch (error) {
      add({ type: 'error', title: 'Error', message: 'Failed to save product' })
    }
  }

  const handleDelete = async (product: Product) => {
    if (!confirm('Delete this product?')) return
    try {
      const result = await productAPI.delete(product.id)
      if (result.success) {
        await loadData()
        add({ type: 'success', title: 'Success', message: 'Product deleted' })
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
