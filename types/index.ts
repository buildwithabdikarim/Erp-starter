import { z } from 'zod'

// ============================================================================
// Form Types
// ============================================================================

export type FieldType = 'text' | 'email' | 'password' | 'number' | 'textarea' | 'select' | 'checkbox' | 'date'

/** Optional input renderer override — keeps Form generic (no field-name hardcoding). */
export type FieldComponent = 'creatable-select'

export interface SelectOption {
  value: string | number
  label: string
}

export interface FormField {
  name: string
  label: string
  type: FieldType
  /** Use a specialized input while keeping Form domain-agnostic. */
  component?: FieldComponent
  required?: boolean
  placeholder?: string
  options?: SelectOption[]
  getOptions?: () => Promise<SelectOption[]>
  validation?: z.ZodSchema
  defaultValue?: any
  rows?: number
  min?: number
  max?: number
  pattern?: string
}

export interface FormConfig {
  fields: FormField[]
  submitLabel?: string
  cancelLabel?: string
  title?: string
  description?: string
}

// ============================================================================
// Table Types
// ============================================================================

export type ColumnVisibility = Record<string, boolean>
export type SortingState = Array<{ id: string; desc: boolean }>
export type ColumnSizingState = Record<string, number>

export interface TableColumn {
  id: string
  header: string
  accessor?: string
  width?: number
  /** Defaults to true when table enableSorting is on. */
  sortable?: boolean
  /** Defaults to true when table enableFiltering is on; set false to exclude from search. */
  filterable?: boolean
  cell?: (value: any, row: any) => React.ReactNode
}

export interface TableAction {
  label: string
  icon?: React.ReactNode
  onClick: (row: any) => void
  variant?: 'primary' | 'secondary' | 'destructive' | 'outline' | 'ghost' | 'link'
  /** Hide this action for a given row when false. */
  visible?: (row: any) => boolean
}

export interface TableConfig {
  columns: TableColumn[]
  data: any[]
  pageSize?: number
  enableSorting?: boolean
  enablePagination?: boolean
  enableFiltering?: boolean
  enableColumnResizing?: boolean
  filterPlaceholder?: string
  onRowClick?: (row: any) => void
  actions?: TableAction[]
}

// ============================================================================
// Modal Types
// ============================================================================

export interface ModalConfig {
  title: string
  description?: string
  width?: 'sm' | 'md' | 'lg' | 'xl'
  isDismissible?: boolean
}

// ============================================================================
// Module Types
// ============================================================================

export interface BaseEntity {
  id: string
  createdAt?: string
  updatedAt?: string
}

export interface Product extends BaseEntity {
  code?: string
  sku?: string
  name: string
  category?: string
  costPrice?: number | string
  sellingPrice?: number | string
  // Legacy mock-shaped fields (avoid in new code)
  cost_price?: number
  selling_price?: number
  quantity?: number
}

export interface Supplier extends BaseEntity {
  code?: string
  name: string
  email?: string | null
  phone?: string | null
  address?: string | null
  status?: string
}

/** Flattened sales-order row used by the sales table / print views. */
export interface Sale extends BaseEntity {
  code?: string
  customerName?: string
  productId?: string
  product_id?: string
  product_name?: string
  supplier_name?: string
  quantity: number
  unit_price: number
  total_amount: number
  sale_date: string
  status?: string
  lineItemId?: string
}

// ============================================================================
// API Response Types
// ============================================================================

export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

// ============================================================================
// Hook State Types
// ============================================================================

export interface UseTableState {
  sorting: SortingState
  columnVisibility: ColumnVisibility
  columnSizing: ColumnSizingState
  globalFilter: string
}

export interface UseModalState {
  isOpen: boolean
  mode: 'create' | 'edit' | 'view'
  data?: any
}

export interface UseFormState {
  isSubmitting: boolean
  errors: Record<string, string>
  touched: Record<string, boolean>
}
