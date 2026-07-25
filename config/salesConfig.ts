import { FormConfig, TableConfig } from '@/types'
import { z } from 'zod'

// ============================================================================
// Sales Status Configuration
// ============================================================================

export const SALE_STATUSES = {
  completed: { label: 'Completed', color: 'bg-green-100 text-green-800' },
  pending: { label: 'Pending', color: 'bg-yellow-100 text-yellow-800' },
  cancelled: { label: 'Cancelled', color: 'bg-red-100 text-red-800' },
} as const

// ============================================================================
// Form Configuration
// ============================================================================

export const salesFormConfig: FormConfig = {
  title: 'Sales Transaction',
  fields: [
    {
      name: 'customer_name',
      label: 'Customer Name',
      type: 'text',
      required: true,
      placeholder: 'Enter customer name',
      validation: z.string().min(2, 'Name must be at least 2 characters'),
    },
    {
      name: 'product_id',
      label: 'Product',
      type: 'select',
      required: true,
      validation: z.string().min(1, 'Product is required'),
      options: [], // Will be populated dynamically
    },
    {
      name: 'quantity',
      label: 'Quantity',
      type: 'number',
      required: true,
      validation: z.number().min(1, 'Quantity must be at least 1'),
      min: 1,
    },
    {
      name: 'unit_price',
      label: 'Unit Price',
      type: 'number',
      required: true,
      validation: z.number().min(0, 'Price must be positive'),
      min: 0,
    },
    {
      name: 'sale_date',
      label: 'Sale Date',
      type: 'date',
      required: true,
      validation: z.string().min(1, 'Sale date is required'),
    },
    {
      name: 'notes',
      label: 'Notes',
      type: 'textarea',
      placeholder: 'Optional notes about this sale',
      validation: z.string().optional(),
      rows: 3,
    },
    {
      name: 'status',
      label: 'Status',
      type: 'select',
      required: true,
      validation: z.enum(['completed', 'pending', 'cancelled']),
      options: [
        { value: 'completed', label: 'Completed' },
        { value: 'pending', label: 'Pending' },
        { value: 'cancelled', label: 'Cancelled' },
      ],
    },
  ],
  submitLabel: 'Save Sale',
  cancelLabel: 'Cancel',
}

// ============================================================================
// Table Configuration
// ============================================================================

export const salesTableConfig: TableConfig = {
  columns: [
    {
      id: 'customer_name',
      header: 'Customer',
      accessor: 'customer_name',
      sortable: true,
      width: 150,
    },
    {
      id: 'product_name',
      header: 'Product',
      accessor: 'product_name',
      sortable: true,
      width: 150,
    },
    {
      id: 'quantity',
      header: 'Qty',
      accessor: 'quantity',
      sortable: true,
      width: 80,
    },
    {
      id: 'unit_price',
      header: 'Unit Price',
      accessor: 'unit_price',
      sortable: true,
      width: 120,
      cell: (value) => `$${(value as number).toFixed(2)}`,
    },
    {
      id: 'total_amount',
      header: 'Total',
      accessor: 'total_amount',
      sortable: true,
      width: 120,
      cell: (value) => `$${(value as number).toFixed(2)}`,
    },
    {
      id: 'sale_date',
      header: 'Date',
      accessor: 'sale_date',
      sortable: true,
      width: 120,
      cell: (value) => {
        const date = new Date(value as string)
        return date.toLocaleDateString()
      },
    },
    {
      id: 'status',
      header: 'Status',
      accessor: 'status',
      sortable: true,
      width: 100,
      cell: (value) => {
        const statusConfig = SALE_STATUSES[value as keyof typeof SALE_STATUSES]
        return statusConfig.label
      },
    },
  ],
  data: [],
  enableSorting: true,
  enablePagination: true,
  enableFiltering: true,
}
