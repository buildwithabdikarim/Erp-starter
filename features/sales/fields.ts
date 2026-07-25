import { z } from 'zod'
import { FormField } from '@/types'
import { Product, Supplier } from '@/types'

export const getSalesFormFields = (products: Product[], suppliers: Supplier[]): FormField[] => [
  {
    name: 'product_id',
    label: 'Product',
    type: 'select',
    required: true,
    placeholder: 'Select a product',
    options: products.map((p) => ({
      value: p.id,
      label: `${p.name} ($${p.selling_price.toFixed(2)})`,
    })),
    validation: z.string().min(1, 'Product is required'),
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
    name: 'quantity',
    label: 'Quantity',
    type: 'number',
    required: true,
    placeholder: '1',
    validation: z.number().min(1, 'Quantity must be at least 1'),
    min: 1,
  },
  {
    name: 'unit_price',
    label: 'Unit Price',
    type: 'number',
    required: true,
    placeholder: '0.00',
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
]
