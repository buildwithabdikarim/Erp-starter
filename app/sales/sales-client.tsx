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
import { saleAPI, productAPI, supplierAPI } from '@/services/api'
import { getSalesFormConfig } from '@/features/sales/fields'
import { salesColumns } from '@/features/sales/columns'
import { Sale, Product, Supplier, TableConfig } from '@/types'
import { canAccess, type UserAccess } from '@/lib/permissions'
import { Plus, Edit2, Trash2, Printer } from 'lucide-react'
import { BulkPrintDialog } from '@/components/BulkPrintDialog'
import { PrintTransaction } from '@/components/PrintTransaction'
import { PrintTransactionGroup } from '@/components/PrintTransactionGroup'

export function SalesClient({ access }: { access: UserAccess }) {
  const [sales, setSales] = useState<(Sale & { product_name: string; supplier_name: string })[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const modal = useModal()
  const { notifications, add } = useNotification()
  const [selectedSale, setSelectedSale] = useState<Sale | undefined>()
  const [bulkPrintOpen, setBulkPrintOpen] = useState(false)
  const [printMode, setPrintMode] = useState<'single' | 'group' | null>(null)
  const [printData, setPrintData] = useState<{
    sales: (Sale & { product_name: string; supplier_name: string })[]
    groupBy: 'date' | 'supplier' | 'manual'
  } | null>(null)
  const canUpdate = canAccess(access, 'orders', 'update')
  const canDelete = canAccess(access, 'orders', 'delete')
  const formConfig = getSalesFormConfig(
    products || [],
    suppliers || [],
    modal.mode === 'edit' ? 'edit' : 'create'
  )
  const formKey = `${modal.mode}-${selectedSale?.id ?? 'new'}`

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setIsLoading(true)
    try {
      const [salesRes, productsRes, suppliersRes] = await Promise.all([
        saleAPI.getAll(1, 50),
        productAPI.getAll(1, 100),
        supplierAPI.getAll(1, 100),
      ])
      
      const enrichedSales = (salesRes.data as Sale[]).map((sale) => ({
        ...sale,
        product_name: productsRes.data.find((p) => p.id === sale.product_id)?.name || 'Unknown',
        supplier_name: suppliersRes.data.find((s) => s.id === sale.supplier_id)?.name || 'Unknown',
      }))
      
      setSales(enrichedSales)
      setProducts(productsRes.data)
      setSuppliers(suppliersRes.data)
    } catch (error) {
      add({ type: 'error', title: 'Error', message: 'Failed to load data' })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (data: Record<string, any>) => {
    try {
      if (modal.mode === 'create') {
        const saleData = {
          product_id: data.product_id,
          supplier_id: data.supplier_id,
          quantity: data.quantity,
          unit_price: data.unit_price,
          total_amount: data.quantity * data.unit_price,
          sale_date: data.sale_date,
        }
        const result = await saleAPI.create(saleData)
        if (result.success) {
          await loadData()
          modal.close()
          add({ type: 'success', title: 'Success', message: 'Sale created' })
        }
      } else if (modal.mode === 'edit' && selectedSale) {
        const result = await saleAPI.update(selectedSale.id, data)
        if (result.success) {
          await loadData()
          modal.close()
          add({ type: 'success', title: 'Success', message: 'Sale updated' })
        }
      }
    } catch (error) {
      add({ type: 'error', title: 'Error', message: 'Failed to save sale' })
    }
  }

  const handleDelete = async (sale: Sale) => {
    if (!confirm('Delete this sale?')) return
    try {
      const result = await saleAPI.delete(sale.id)
      if (result.success) {
        await loadData()
        add({ type: 'success', title: 'Success', message: 'Sale deleted' })
      }
    } catch (error) {
      add({ type: 'error', title: 'Error', message: 'Failed to delete sale' })
    }
  }

  const handlePrintSingle = (sale: Sale & { product_name: string; supplier_name: string }) => {
    setPrintMode('single')
    setPrintData({ sales: [sale], groupBy: 'manual' })
  }

  const handleBulkPrint = (selectedSales: (Sale & { product_name: string; supplier_name: string })[], groupBy: 'date' | 'supplier' | 'manual') => {
    setPrintMode('group')
    setPrintData({ sales: selectedSales, groupBy })
  }

  const tableConfig: TableConfig = {
    columns: [
      ...salesColumns,
      {
        id: 'actions',
        header: 'Actions',
        width: 150,
        cell: (_: unknown, row: any) => (
          <div className="flex gap-2">
            <Button size="sm" variant="secondary" onClick={() => handlePrintSingle(row)}>
              <Printer className="w-4 h-4" />
            </Button>
            <Can access={access} module="orders" action="update">
              <Button
                size="sm"
                variant="secondary"
                onClick={() => {
                  setSelectedSale(row)
                  modal.open('edit', row)
                }}
              >
                <Edit2 className="w-4 h-4" />
              </Button>
            </Can>
            <Can access={access} module="orders" action="delete">
              <Button size="sm" variant="destructive" onClick={() => handleDelete(row)}>
                <Trash2 className="w-4 h-4" />
              </Button>
            </Can>
          </div>
        ),
      },
    ],
    data: sales,
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
            <CardTitle>Sales Transactions</CardTitle>
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
          formKey={formKey}
          initialValues={selectedSale || {}}
          onSubmit={handleSubmit}
          onCancel={modal.close}
        />
      </Modal>

      {/* Bulk Print Dialog */}
      <BulkPrintDialog
        isOpen={bulkPrintOpen}
        onClose={() => setBulkPrintOpen(false)}
        sales={sales}
        suppliers={suppliers}
        onPrint={handleBulkPrint}
      />

      {/* Print Views */}
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
            title={`Transactions Report - ${printData.groupBy === 'date' ? 'By Date' : printData.groupBy === 'supplier' ? 'By Supplier' : 'Manual Selection'}`}
          />
        </div>
      )}
    </Layout>
  )
}
