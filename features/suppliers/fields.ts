import { z } from 'zod'
import { FormConfig, FormField } from '@/types'

/** Single source of truth for supplier forms — matches Drizzle supplier schema. */
export const supplierFormFields: FormField[] = [
  {
    name: 'code',
    label: 'Supplier Code',
    type: 'text',
    required: true,
    placeholder: 'e.g., SUP-001',
    validation: z.string().min(1, 'Supplier code is required').max(50),
  },
  {
    name: 'name',
    label: 'Supplier Name',
    type: 'text',
    required: true,
    placeholder: 'Enter supplier name',
    validation: z.string().min(1, 'Supplier name is required').max(255),
  },
  {
    name: 'email',
    label: 'Email',
    type: 'email',
    required: false,
    placeholder: 'supplier@example.com',
    validation: z.string().email('Invalid email address').optional().or(z.literal('')),
  },
  {
    name: 'phone',
    label: 'Phone',
    type: 'text',
    required: false,
    placeholder: '+1-555-0000',
    validation: z.string().max(20).optional(),
  },
  {
    name: 'address',
    label: 'Street Address',
    type: 'text',
    required: false,
    placeholder: 'Enter street address',
    validation: z.string().max(500).optional(),
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
    validation: z.enum(['active', 'inactive']),
  },
]

export const getSupplierFormConfig = (mode: 'create' | 'edit' = 'create'): FormConfig => ({
  title: mode === 'create' ? 'Create Supplier' : 'Edit Supplier',
  fields: supplierFormFields,
  submitLabel: 'Save Supplier',
  cancelLabel: 'Cancel',
})
