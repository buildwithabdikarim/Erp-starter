import { z } from 'zod'
import { FormField } from '@/types'
import { Supplier } from '@/types'

export const getProductFormFields = (suppliers: Supplier[]): FormField[] => [
  {
    name: 'name',
    label: 'Product Name',
    type: 'text',
    required: true,
    placeholder: 'Enter product name',
    validation: z.string().min(1, 'Product name is required').max(100),
  },
  {
    name: 'category',
    label: 'Category',
    type: 'text',
    required: true,
    placeholder: 'e.g., Electronics, Furniture',
    validation: z.string().min(1, 'Category is required'),
  },
  {
    name: 'supplier_id',
    label: 'Supplier',
    type: 'select',
    required: true,
    placeholder: 'Select a supplier',
    options: suppliers.map((s) => ({
      value: s.id,
      label: s.name,
    })),
    validation: z.string().min(1, 'Supplier is required'),
  },
  {
    name: 'cost_price',
    label: 'Cost Price',
    type: 'number',
    required: true,
    placeholder: '0.00',
    validation: z.number().positive('Cost price must be positive'),
  },
  {
    name: 'selling_price',
    label: 'Selling Price',
    type: 'number',
    required: true,
    placeholder: '0.00',
    validation: z.number().positive('Selling price must be positive'),
  },
  {
    name: 'quantity',
    label: 'Stock Quantity',
    type: 'number',
    required: true,
    placeholder: '0',
    validation: z.number().nonnegative('Quantity must be non-negative'),
  },
]
