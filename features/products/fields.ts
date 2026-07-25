import { z } from 'zod'
import { FormField } from '@/types'

export const getProductFormFields = (categories: string[]): FormField[] => [
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
    type: 'select',
    required: true,
    placeholder: 'Select or add a category',
    options: categories.map((c) => ({
      value: c,
      label: c,
    })),
    validation: z.string().min(1, 'Category is required'),
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
