'use client'

import { useState, useEffect } from 'react'
import { Layout } from '@/components/Layout'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/Card'
import { Table } from '@/components/Table'
import { Modal } from '@/components/Modal'
import { Form } from '@/components/Form'
import { Button } from '@/components/Button'
import { Can } from '@/components/Can'
import { useModal, useNotification } from '@/hooks'
import { supplierAPI } from '@/services/api'
import { getSupplierFormConfig } from '@/features/suppliers/fields'
import { supplierColumns } from '@/features/suppliers/columns'
import { Supplier, TableConfig } from '@/types'
import { canAccess, type UserAccess } from '@/lib/permissions'
import { Plus, Edit2, Trash2 } from 'lucide-react'

export function SuppliersClient({ access }: { access: UserAccess }) {
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const modal = useModal()
  const { notifications, add } = useNotification()
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | undefined>()
  const canUpdate = canAccess(access, 'suppliers', 'update')
  const canDelete = canAccess(access, 'suppliers', 'delete')
  const formConfig = getSupplierFormConfig(modal.mode === 'edit' ? 'edit' : 'create')
  const formKey = `${modal.mode}-${selectedSupplier?.id ?? 'new'}`

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setIsLoading(true)
    try {
      const result = await supplierAPI.getAll(1, 50)
      setSuppliers(result.data)
    } catch (error) {
      add({ type: 'error', title: 'Error', message: 'Failed to load suppliers' })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (data: Record<string, any>) => {
    try {
      if (modal.mode === 'create') {
        const supplierData = {
          name: data.name,
          email: data.email,
          phone: data.phone,
          address: data.address,
        }
        const result = await supplierAPI.create(supplierData)
        if (result.success) {
          await loadData()
          modal.close()
          add({ type: 'success', title: 'Success', message: 'Supplier created' })
        }
      } else if (modal.mode === 'edit' && selectedSupplier) {
        const result = await supplierAPI.update(selectedSupplier.id, data)
        if (result.success) {
          await loadData()
          modal.close()
          add({ type: 'success', title: 'Success', message: 'Supplier updated' })
        }
      }
    } catch (error) {
      add({ type: 'error', title: 'Error', message: 'Failed to save supplier' })
    }
  }

  const handleDelete = async (supplier: Supplier) => {
    if (!confirm('Delete this supplier?')) return
    try {
      const result = await supplierAPI.delete(supplier.id)
      if (result.success) {
        await loadData()
        add({ type: 'success', title: 'Success', message: 'Supplier deleted' })
      }
    } catch (error) {
      add({ type: 'error', title: 'Error', message: 'Failed to delete supplier' })
    }
  }

  const tableConfig: TableConfig = {
    columns: supplierColumns,
    data: suppliers,
    enableSorting: true,
    enablePagination: true,
    enableFiltering: true,
    filterPlaceholder: 'Search suppliers by name, email, phone, or address…',
    actions: [
      ...(canUpdate
        ? [
            {
              label: '',
              icon: <Edit2 className="w-4 h-4" />,
              variant: 'secondary' as const,
              onClick: (row: any) => {
                setSelectedSupplier(row)
                modal.open('edit', row)
              },
            },
          ]
        : []),
      ...(canDelete
        ? [
            {
              label: '',
              icon: <Trash2 className="w-4 h-4" />,
              variant: 'destructive' as const,
              onClick: (row: any) => handleDelete(row),
            },
          ]
        : []),
    ],
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
          <h1 className="text-3xl font-bold">Suppliers</h1>
          <Can access={access} module="suppliers" action="create">
            <Button
              onClick={() => {
                setSelectedSupplier(undefined)
                modal.open('create')
              }}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Supplier
            </Button>
          </Can>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Supplier Directory</CardTitle>
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
        footer={
          <>
            <Button variant="outline" onClick={modal.close}>
              Cancel
            </Button>
            <Button onClick={() => {
              const form = document.querySelector('form')
              form?.dispatchEvent(new Event('submit', { bubbles: true }))
            }}>
              {formConfig.submitLabel || 'Save'}
            </Button>
          </>
        }
      >
        <Form
          config={formConfig}
          formKey={formKey}
          initialValues={selectedSupplier || {}}
          onSubmit={handleSubmit}
          onCancel={modal.close}
        />
      </Modal>
    </Layout>
  )
}
