import { z } from 'zod'
import { FormConfig, TableConfig } from '@/types'
import { PLACE_TYPES, PRODUCT_STATUSES } from '@/constants'

// ============================================================================
// Product Form Config
// ============================================================================

export const productFormConfig: FormConfig = {
  title: 'Product',
  fields: [
    {
      name: 'name',
      label: 'Product Name',
      type: 'text',
      required: true,
      placeholder: 'Enter product name',
      validation: z.string().min(1, 'Product name is required').max(100),
    },
    {
      name: 'description',
      label: 'Description',
      type: 'textarea',
      required: true,
      placeholder: 'Enter product description',
      rows: 4,
      validation: z.string().min(1, 'Description is required'),
    },
    {
      name: 'sku',
      label: 'SKU',
      type: 'text',
      required: true,
      placeholder: 'e.g., PROD-001',
      validation: z.string().min(1, 'SKU is required'),
    },
    {
      name: 'category',
      label: 'Category',
      type: 'text',
      required: true,
      placeholder: 'e.g., Electronics',
      validation: z.string().min(1, 'Category is required'),
    },
    {
      name: 'price',
      label: 'Price',
      type: 'number',
      required: true,
      placeholder: '0.00',
      validation: z.number().positive('Price must be positive'),
    },
    {
      name: 'quantity',
      label: 'Stock Quantity',
      type: 'number',
      required: true,
      placeholder: '0',
      validation: z.number().nonnegative('Quantity must be non-negative'),
    },
    {
      name: 'status',
      label: 'Status',
      type: 'select',
      required: true,
      options: [
        { value: 'active', label: 'Active' },
        { value: 'inactive', label: 'Inactive' },
        { value: 'discontinued', label: 'Discontinued' },
      ],
      defaultValue: 'active',
    },
  ],
  submitLabel: 'Save Product',
  cancelLabel: 'Cancel',
}

// ============================================================================
// Product Table Config
// ============================================================================

export const getProductTableConfig = (data: any[]): TableConfig => ({
  columns: [
    {
      id: 'name',
      header: 'Product Name',
      accessor: 'name',
      sortable: true,
      filterable: true,
    },
    {
      id: 'sku',
      header: 'SKU',
      accessor: 'sku',
      sortable: true,
      width: 120,
    },
    {
      id: 'category',
      header: 'Category',
      accessor: 'category',
      sortable: true,
      width: 120,
    },
    {
      id: 'price',
      header: 'Price',
      accessor: 'price',
      sortable: true,
      width: 120,
      cell: (value) => `$${parseFloat(value).toFixed(2)}`,
    },
    {
      id: 'quantity',
      header: 'Stock',
      accessor: 'quantity',
      sortable: true,
      width: 100,
      cell: (value) => {
        const warning = value <= 10 ? ' ⚠' : ''
        return `${value}${warning}`
      },
    },
    {
      id: 'status',
      header: 'Status',
      accessor: 'status',
      sortable: true,
      width: 100,
      cell: (value) => {
        const statusConfig = PRODUCT_STATUSES[value as keyof typeof PRODUCT_STATUSES]
        return statusConfig.label
      },
    },
  ],
  data,
  pageSize: 10,
  enableSorting: true,
  enablePagination: true,
  enableFiltering: true,
})
