'use client'

import React, { useState } from 'react'
import { Modal } from './Modal'
import { Button } from './Button'
import { Sale, Product, Supplier } from '@/types'
import { Calendar, Filter, CheckSquare } from 'lucide-react'

interface BulkPrintDialogProps {
  isOpen: boolean
  onClose: () => void
  sales: (Sale & { product_name: string; supplier_name: string })[]
  suppliers: Supplier[]
  onPrint: (selectedSales: (Sale & { product_name: string; supplier_name: string })[], groupBy: 'date' | 'supplier' | 'manual') => void
}

export const BulkPrintDialog: React.FC<BulkPrintDialogProps> = ({
  isOpen,
  onClose,
  sales,
  suppliers,
  onPrint,
}) => {
  const [groupBy, setGroupBy] = useState<'date' | 'supplier' | 'manual'>('date')
  const [selectedSupplier, setSelectedSupplier] = useState<string>('')
  const [startDate, setStartDate] = useState<string>('')
  const [endDate, setEndDate] = useState<string>('')
  const [selectedSales, setSelectedSales] = useState<Set<string>>(new Set())

  const getFilteredSales = (): (Sale & { product_name: string; supplier_name: string })[] => {
    switch (groupBy) {
      case 'date':
        if (!startDate || !endDate) return []
        return sales.filter((s) => {
          const saleDate = new Date(s.sale_date).toISOString().split('T')[0]
          return saleDate >= startDate && saleDate <= endDate
        })

      case 'supplier':
        if (!selectedSupplier) return []
        return sales.filter((s) => s.supplier_id === selectedSupplier)

      case 'manual':
        return sales.filter((s) => selectedSales.has(s.id))

      default:
        return []
    }
  }

  const filteredSales = getFilteredSales()
  const isValid = filteredSales.length > 0

  const handlePrint = () => {
    if (isValid) {
      onPrint(filteredSales, groupBy)
      onClose()
    }
  }

  const toggleSaleSelection = (saleId: string) => {
    const newSelected = new Set(selectedSales)
    if (newSelected.has(saleId)) {
      newSelected.delete(saleId)
    } else {
      newSelected.add(saleId)
    }
    setSelectedSales(newSelected)
  }

  const toggleAllSales = () => {
    if (selectedSales.size === sales.length) {
      setSelectedSales(new Set())
    } else {
      setSelectedSales(new Set(sales.map((s) => s.id)))
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Bulk Print Transactions" width="lg">
      <div className="space-y-6">
        {/* Grouping Options */}
        <div className="space-y-3">
          <p className="text-sm font-semibold text-foreground">Select Grouping Method</p>
          <div className="space-y-2">
            {/* Date Range Option */}
            <label className="flex items-center gap-3 p-3 border border-border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors">
              <input
                type="radio"
                name="groupBy"
                value="date"
                checked={groupBy === 'date'}
                onChange={(e) => {
                  setGroupBy('date')
                  setSelectedSupplier('')
                  setSelectedSales(new Set())
                }}
                className="w-4 h-4"
              />
              <Calendar className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-medium">By Date Range</span>
            </label>

            {groupBy === 'date' && (
              <div className="ml-7 space-y-3 p-3 bg-muted/30 rounded-lg">
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1">
                    End Date
                  </label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20"
                  />
                </div>
              </div>
            )}

            {/* Supplier Option */}
            <label className="flex items-center gap-3 p-3 border border-border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors">
              <input
                type="radio"
                name="groupBy"
                value="supplier"
                checked={groupBy === 'supplier'}
                onChange={(e) => {
                  setGroupBy('supplier')
                  setStartDate('')
                  setEndDate('')
                  setSelectedSales(new Set())
                }}
                className="w-4 h-4"
              />
              <Filter className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-medium">By Supplier</span>
            </label>

            {groupBy === 'supplier' && (
              <div className="ml-7 p-3 bg-muted/30 rounded-lg">
                <select
                  value={selectedSupplier}
                  onChange={(e) => setSelectedSupplier(e.target.value)}
                  className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20"
                >
                  <option value="">Select a supplier...</option>
                  {suppliers.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Manual Selection Option */}
            <label className="flex items-center gap-3 p-3 border border-border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors">
              <input
                type="radio"
                name="groupBy"
                value="manual"
                checked={groupBy === 'manual'}
                onChange={(e) => {
                  setGroupBy('manual')
                  setStartDate('')
                  setEndDate('')
                  setSelectedSupplier('')
                }}
                className="w-4 h-4"
              />
              <CheckSquare className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-medium">Manual Selection</span>
            </label>

            {groupBy === 'manual' && (
              <div className="ml-7 p-3 bg-muted/30 rounded-lg space-y-3">
                <div>
                  <button
                    onClick={toggleAllSales}
                    className="text-sm text-primary hover:underline font-medium"
                  >
                    {selectedSales.size === sales.length ? 'Deselect All' : 'Select All'}
                  </button>
                </div>
                <div className="max-h-48 overflow-y-auto space-y-2">
                  {sales.map((sale) => (
                    <label key={sale.id} className="flex items-center gap-2 p-2 hover:bg-muted rounded cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedSales.has(sale.id)}
                        onChange={() => toggleSaleSelection(sale.id)}
                        className="w-4 h-4"
                      />
                      <span className="text-sm">
                        {sale.product_name} - {sale.supplier_name} - ${sale.total_amount.toFixed(2)}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Summary */}
        <div className="p-3 bg-muted/50 rounded-lg">
          <p className="text-sm">
            <span className="font-semibold">Transactions to print:</span>
            <span className="ml-2 text-primary font-bold">{filteredSales.length}</span>
          </p>
          {filteredSales.length > 0 && (
            <p className="text-xs text-muted-foreground mt-1">
              Total: ${filteredSales.reduce((sum, s) => sum + s.total_amount, 0).toFixed(2)}
            </p>
          )}
        </div>

        {/* Footer */}
        <div className="flex gap-3 justify-end">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handlePrint} disabled={!isValid}>
            Print ({filteredSales.length})
          </Button>
        </div>
      </div>
    </Modal>
  )
}

BulkPrintDialog.displayName = 'BulkPrintDialog'
