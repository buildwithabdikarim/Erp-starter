import { z } from 'zod'
import { FormConfig, TableConfig } from '@/types'
import { SUPPLIER_STATUSES } from '@/constants'

// ============================================================================
// Supplier Form Config
// ============================================================================

export const supplierFormConfig: FormConfig = {
  title: 'Supplier',
  fields: [
    {
      name: 'name',
      label: 'Supplier Name',
      type: 'text',
      required: true,
      placeholder: 'Enter supplier name',
      validation: z.string().min(1, 'Supplier name is required'),
    },
    {
      name: 'email',
      label: 'Email',
      type: 'email',
      required: true,
      placeholder: 'supplier@example.com',
      validation: z.string().email('Invalid email address'),
    },
    {
      name: 'phone',
      label: 'Phone',
      type: 'text',
      required: true,
      placeholder: '+1-555-0000',
      validation: z.string().min(1, 'Phone is required'),
    },
    {
      name: 'address',
      label: 'Street Address',
      type: 'text',
      required: true,
      placeholder: 'Enter street address',
      validation: z.string().min(1, 'Address is required'),
    },
    {
      name: 'city',
      label: 'City',
      type: 'text',
      required: true,
      placeholder: 'Enter city',
      validation: z.string().min(1, 'City is required'),
    },
    {
      name: 'postalCode',
      label: 'Postal Code',
      type: 'text',
      required: true,
      placeholder: 'Enter postal code',
      validation: z.string().min(1, 'Postal code is required'),
    },
    {
      name: 'country',
      label: 'Country',
      type: 'text',
      required: true,
      placeholder: 'Enter country',
      validation: z.string().min(1, 'Country is required'),
    },
    {
      name: 'status',
      label: 'Status',
      type: 'select',
      required: true,
      options: [
        { value: 'active', label: 'Active' },
        { value: 'inactive', label: 'Inactive' },
      ],
      defaultValue: 'active',
    },
  ],
  submitLabel: 'Save Supplier',
  cancelLabel: 'Cancel',
}

// ============================================================================
// Supplier Table Config
// ============================================================================

export const getSupplierTableConfig = (data: any[]): TableConfig => ({
  columns: [
    {
      id: 'name',
      header: 'Supplier Name',
      accessor: 'name',
      sortable: true,
      filterable: true,
    },
    {
      id: 'email',
      header: 'Email',
      accessor: 'email',
      sortable: true,
      width: 200,
    },
    {
      id: 'phone',
      header: 'Phone',
      accessor: 'phone',
      sortable: true,
      width: 150,
    },
    {
      id: 'city',
      header: 'City',
      accessor: 'city',
      sortable: true,
      width: 120,
    },
    {
      id: 'country',
      header: 'Country',
      accessor: 'country',
      sortable: true,
      width: 120,
    },
    {
      id: 'status',
      header: 'Status',
      accessor: 'status',
      sortable: true,
      width: 100,
      cell: (value) => {
        const statusConfig = SUPPLIER_STATUSES[value as keyof typeof SUPPLIER_STATUSES]
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
