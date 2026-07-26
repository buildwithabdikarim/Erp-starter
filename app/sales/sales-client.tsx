'use client'

import { useEffect, useState } from 'react'
import { Layout } from '@/components/Layout'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/Card'
import { Table } from '@/components/Table'
import { Modal } from '@/components/Modal'
import { Form } from '@/components/Form'
import { Button } from '@/components/Button'
import { Can } from '@/components/Can'
import { useModal, useNotification } from '@/hooks'
import { getSalesFormConfig } from '@/features/sales/fields'
import { salesColumns } from '@/features/sales/columns'
import { Sale, Product, TableConfig } from '@/types'
import { canAccess, type UserAccess } from '@/lib/permissions'
import { Plus, Edit2, Trash2, Printer } from 'lucide-react'
import { BulkPrintDialog } from '@/components/BulkPrintDialog'
import { PrintTransaction } from '@/components/PrintTransaction'
import { PrintTransactionGroup } from '@/components/PrintTransactionGroup'

type SalesRow = Sale & { product_name: string; supplier_name: string }

export function SalesClient({ access }: { access: UserAccess }) {
  const [sales, setSales] = useState<SalesRow[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const modal = useModal()
  const { notifications, add } = useNotification()
  const [selectedSale, setSelectedSale] = useState<Sale | undefined>()
  const [bulkPrintOpen, setBulkPrintOpen] = useState(false)
  const [printMode, setPrintMode] = useState<'single' | 'group' | null>(null)
  const [printData, setPrintData] = useState<{
    sales: SalesRow[]
    groupBy: 'date' | 'supplier' | 'manual'
  } | null>(null)
  const canUpdate = canAccess(access, 'orders', 'update')
  const canDelete = canAccess(access, 'orders', 'delete')
  const formConfig = getSalesFormConfig(products || [], modal.mode === 'edit' ? 'edit' : 'create')
  const formKey = `${modal.mode}-${selectedSale?.id ?? 'new'}`

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setIsLoading(true)
    try {
      const [salesRes, productsRes] = await Promise.all([
        fetch('/api/sales?limit=100'),
        fetch('/api/products?limit=100'),
      ])

      if (!salesRes.ok || !productsRes.ok) {
        throw new Error('Failed to load sales data')
      }

      const salesJson = await salesRes.json()
      const productsJson = await productsRes.json()

      setSales(salesJson.data || [])
      setProducts(productsJson.data || [])
    } catch (error) {
      add({ type: 'error', title: 'Error', message: 'Failed to load data' })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (data: Record<string, any>) => {
    try {
      const payload = {
        customerName: data.customerName,
        productId: data.productId,
        quantity: data.quantity,
        unitPrice: data.unitPrice,
        orderDate: data.orderDate,
      }

      if (modal.mode === 'create') {
        if (!canAccess(access, 'orders', 'create')) {
          add({ type: 'error', title: 'Forbidden', message: 'Missing permission: orders:create' })
          return
        }

        const response = await fetch('/api/sales', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
        const result = await response.json()
        if (!response.ok) {
          add({ type: 'error', title: 'Error', message: result.message || result.error })
          return
        }
        await loadData()
        modal.close()
        add({ type: 'success', title: 'Success', message: 'Sale created' })
      } else if (modal.mode === 'edit' && selectedSale) {
        if (!canUpdate) {
          add({ type: 'error', title: 'Forbidden', message: 'Missing permission: orders:update' })
          return
        }

        const response = await fetch(`/api/sales/${selectedSale.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
        const result = await response.json()
        if (!response.ok) {
          add({ type: 'error', title: 'Error', message: result.message || result.error })
          return
        }
        await loadData()
        modal.close()
        add({ type: 'success', title: 'Success', message: 'Sale updated' })
      }
    } catch (error) {
      add({ type: 'error', title: 'Error', message: 'Failed to save sale' })
    }
  }

  const handleDelete = async (sale: Sale) => {
    if (!canDelete) {
      add({ type: 'error', title: 'Forbidden', message: 'Missing permission: orders:delete' })
      return
    }
    if (!confirm('Delete this sale?')) return
    try {
      const response = await fetch(`/api/sales/${sale.id}`, { method: 'DELETE' })
      const result = await response.json()
      if (!response.ok) {
        add({ type: 'error', title: 'Error', message: result.message || result.error })
        return
      }
      await loadData()
      add({ type: 'success', title: 'Success', message: 'Sale deleted' })
    } catch (error) {
      add({ type: 'error', title: 'Error', message: 'Failed to delete sale' })
    }
  }

  const handlePrintSingle = (sale: SalesRow) => {
    setPrintMode('single')
    setPrintData({ sales: [sale], groupBy: 'manual' })
  }

  const handleBulkPrint = (selectedSales: SalesRow[], groupBy: 'date' | 'supplier' | 'manual') => {
    setPrintMode('group')
    setPrintData({ sales: selectedSales, groupBy })
  }

  const editInitialValues = selectedSale
    ? {
        customerName: selectedSale.customerName,
        productId: selectedSale.productId,
        quantity: selectedSale.quantity,
        unitPrice: selectedSale.unit_price,
        orderDate: selectedSale.sale_date
          ? new Date(selectedSale.sale_date).toISOString().slice(0, 10)
          : '',
      }
    : {}

  const tableConfig: TableConfig = {
    columns: salesColumns,
    data: sales,
    enableSorting: true,
    enablePagination: true,
    enableFiltering: true,
    filterPlaceholder: 'Search sales by code, customer, or product…',
    actions: [
      {
        label: '',
        icon: <Printer className="w-4 h-4" />,
        variant: 'secondary' as const,
        onClick: (row: any) => handlePrintSingle(row),
      },
      ...(canUpdate
        ? [
            {
              label: '',
              icon: <Edit2 className="w-4 h-4" />,
              variant: 'secondary' as const,
              onClick: (row: any) => {
                setSelectedSale(row)
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
          <h1 className="text-3xl font-bold">Sales</h1>
          <div className="flex gap-2">
            <Button variant="secondary" onClick={() => setBulkPrintOpen(true)}>
              <Printer className="w-4 h-4 mr-2" />
              Bulk Print
            </Button>
            <Can access={access} module="orders" action="create">
              <Button
                onClick={() => {
                  setSelectedSale(undefined)
                  modal.open('create')
                }}
              >
                <Plus className="w-4 h-4 mr-2" />
                Record Sale
              </Button>
            </Can>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Sales Orders</CardTitle>
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

      <Modal isOpen={modal.isOpen} onClose={modal.close} title={formConfig.title || ''} width="lg">
        <Form
          config={formConfig}
          formKey={formKey}
          initialValues={editInitialValues}
          onSubmit={handleSubmit}
          onCancel={modal.close}
        />
      </Modal>

      <BulkPrintDialog
        isOpen={bulkPrintOpen}
        onClose={() => setBulkPrintOpen(false)}
        sales={sales}
        suppliers={[]}
        onPrint={handleBulkPrint}
      />

      {printMode === 'single' && printData && (
        <div className="fixed inset-0 bg-white z-50 overflow-auto no-print">
          <div className="p-4 bg-background border-b border-border sticky top-0 z-10 flex justify-between items-center">
            <h2 className="text-lg font-semibold">Print Preview - Transaction</h2>
            <div className="flex gap-2">
              <Button onClick={() => window.print()}>Print</Button>
              <Button variant="outline" onClick={() => setPrintMode(null)}>
                Close
              </Button>
            </div>
          </div>
          <PrintTransaction sale={printData.sales[0]} />
        </div>
      )}

      {printMode === 'group' && printData && (
        <div className="fixed inset-0 bg-white z-50 overflow-auto no-print">
          <div className="p-4 bg-background border-b border-border sticky top-0 z-10 flex justify-between items-center">
            <h2 className="text-lg font-semibold">Print Preview - Bulk Report</h2>
            <div className="flex gap-2">
              <Button onClick={() => window.print()}>Print</Button>
              <Button variant="outline" onClick={() => setPrintMode(null)}>
                Close
              </Button>
            </div>
          </div>
          <PrintTransactionGroup
            transactions={printData.sales}
            groupBy={printData.groupBy}
            title={`Transactions Report - ${
              printData.groupBy === 'date'
                ? 'By Date'
                : printData.groupBy === 'supplier'
                  ? 'By Customer'
                  : 'Manual Selection'
            }`}
          />
        </div>
      )}
    </Layout>
  )
}
