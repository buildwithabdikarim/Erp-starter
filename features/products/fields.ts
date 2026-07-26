import { z } from 'zod'
import { FormConfig, FormField } from '@/types'

const UNIT_OPTIONS = [
  { value: 'piece', label: 'Piece' },
  { value: 'kg', label: 'Kilogram' },
  { value: 'liter', label: 'Liter' },
  { value: 'box', label: 'Box' },
  { value: 'pack', label: 'Pack' },
]

const STATUS_OPTIONS = [
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
]

/**
 * Single source of truth for product forms.
 * Field names match the Drizzle/API schema (camelCase).
 */
export const getProductFormFields = (categories: string[] = []): FormField[] => [
  {
    name: 'code',
    label: 'Product Code',
    type: 'text',
    required: true,
    placeholder: 'e.g., PRD-001',
    validation: z.string().min(1, 'Product code is required').max(50),
  },
  {
    name: 'sku',
    label: 'SKU',
    type: 'text',
    required: true,
    placeholder: 'e.g., SKU-001',
    validation: z.string().min(1, 'SKU is required').max(100),
  },
  {
    name: 'name',
    label: 'Product Name',
    type: 'text',
    required: true,
    placeholder: 'Enter product name',
    validation: z.string().min(1, 'Product name is required').max(255),
  },
  {
    name: 'description',
    label: 'Description',
    type: 'textarea',
    required: false,
    placeholder: 'Optional description',
    rows: 3,
    validation: z.string().max(2000).optional(),
  },
  {
    name: 'category',
    label: 'Category',
    type: 'select',
    component: 'creatable-select',
    required: true,
    placeholder: 'Select or add a category',
    options: categories.map((c) => ({ value: c, label: c })),
    validation: z.string().min(1, 'Category is required'),
  },
  {
    name: 'unit',
    label: 'Unit',
    type: 'select',
    required: true,
    options: UNIT_OPTIONS,
    defaultValue: 'piece',
    validation: z.string().min(1, 'Unit is required'),
  },
  {
    name: 'costPrice',
    label: 'Cost Price',
    type: 'number',
    required: true,
    placeholder: '0.00',
    min: 0,
    validation: z.number().nonnegative('Cost price must be zero or positive'),
  },
  {
    name: 'sellingPrice',
    label: 'Selling Price',
    type: 'number',
    required: true,
    placeholder: '0.00',
    min: 0,
    validation: z.number().positive('Selling price must be positive'),
  },
  {
    name: 'reorderLevel',
    label: 'Reorder Level',
    type: 'number',
    required: true,
    placeholder: '10',
    min: 0,
    defaultValue: 10,
    validation: z.number().int().nonnegative('Reorder level must be zero or positive'),
  },
  {
    name: 'reorderQuantity',
    label: 'Reorder Quantity',
    type: 'number',
    required: false,
    placeholder: '50',
    min: 0,
    defaultValue: 50,
    validation: z.number().int().nonnegative('Reorder quantity must be zero or positive').optional(),
  },
  {
    name: 'status',
    label: 'Status',
    type: 'select',
    required: true,
    options: STATUS_OPTIONS,
    defaultValue: 'active',
    validation: z.enum(['active', 'inactive']),
  },
]

export const getProductFormConfig = (
  categories: string[] = [],
  mode: 'create' | 'edit' = 'create'
): FormConfig => ({
  title: mode === 'create' ? 'Create Product' : 'Edit Product',
  fields: getProductFormFields(categories),
  submitLabel: 'Save Product',
  cancelLabel: 'Cancel',
})
