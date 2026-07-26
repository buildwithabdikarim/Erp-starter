import { z } from 'zod'
import { FormConfig, FormField } from '@/types'

export type SalesProductOption = {
  id: string
  name: string
  sellingPrice?: string | number | null
}

/** Single source of truth for sales forms — matches salesOrder + line item schema. */
export const getSalesFormFields = (products: SalesProductOption[]): FormField[] => [
  {
    name: 'customerName',
    label: 'Customer Name',
    type: 'text',
    required: true,
    placeholder: 'Customer or company name',
    validation: z.string().min(1, 'Customer name is required').max(255),
  },
  {
    name: 'productId',
    label: 'Product',
    type: 'select',
    required: true,
    placeholder: 'Select a product',
    options: products.map((p) => {
      const price = Number(p.sellingPrice ?? 0)
      return {
        value: p.id,
        label: `${p.name}${Number.isFinite(price) ? ` ($${price.toFixed(2)})` : ''}`,
      }
    }),
    validation: z.string().min(1, 'Product is required'),
  },
  {
    name: 'quantity',
    label: 'Quantity',
    type: 'number',
    required: true,
    placeholder: '1',
    min: 1,
    validation: z.number().min(1, 'Quantity must be at least 1'),
  },
  {
    name: 'unitPrice',
    label: 'Unit Price',
    type: 'number',
    required: true,
    placeholder: '0.00',
    min: 0,
    validation: z.number().min(0, 'Price must be zero or positive'),
  },
  {
    name: 'orderDate',
    label: 'Order Date',
    type: 'date',
    required: true,
    validation: z.string().min(1, 'Order date is required'),
  },
]

export const getSalesFormConfig = (
  products: SalesProductOption[],
  mode: 'create' | 'edit' = 'create'
): FormConfig => ({
  title: mode === 'create' ? 'Create Sale' : 'Edit Sale',
  fields: getSalesFormFields(products),
  submitLabel: 'Save Sale',
  cancelLabel: 'Cancel',
})
