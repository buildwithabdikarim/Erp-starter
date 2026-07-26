import { z } from 'zod'
import { FormConfig, FormField } from '@/types'

/** Single source of truth for supplier forms. */
export const supplierFormFields: FormField[] = [
  {
    name: 'name',
    label: 'Supplier Name',
    type: 'text',
    required: true,
    placeholder: 'Enter supplier name',
    validation: z.string().min(1, 'Supplier name is required').max(100),
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
    validation: z.string().min(10, 'Phone must be at least 10 characters'),
  },
  {
    name: 'address',
    label: 'Street Address',
    type: 'text',
    required: true,
    placeholder: 'Enter street address',
    validation: z.string().min(1, 'Address is required').max(200),
  },
]

export const getSupplierFormConfig = (mode: 'create' | 'edit' = 'create'): FormConfig => ({
  title: mode === 'create' ? 'Create Supplier' : 'Edit Supplier',
  fields: supplierFormFields,
  submitLabel: 'Save Supplier',
  cancelLabel: 'Cancel',
})
