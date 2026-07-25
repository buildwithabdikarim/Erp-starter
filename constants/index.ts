// ============================================================================
// UI Constants
// ============================================================================

export const BUTTON_VARIANTS = {
  primary: 'bg-primary text-primary-foreground hover:bg-primary/90',
  secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
  destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
  outline: 'border border-input bg-background hover:bg-accent hover:text-accent-foreground',
  ghost: 'hover:bg-accent hover:text-accent-foreground',
  link: 'text-primary underline-offset-4 hover:underline',
} as const

export const BUTTON_SIZES = {
  sm: 'h-8 px-3 text-xs rounded-md',
  md: 'h-9 px-4 text-sm rounded-md',
  lg: 'h-10 px-6 text-base rounded-md',
  xl: 'h-12 px-8 text-lg rounded-md',
} as const

export const INPUT_SIZES = {
  sm: 'h-8 text-xs px-2 rounded',
  md: 'h-9 text-sm px-3 rounded',
  lg: 'h-10 text-base px-4 rounded',
} as const

export const MODAL_WIDTHS = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
} as const

// ============================================================================
// Status Constants
// ============================================================================

export const PRODUCT_STATUSES = {
  active: { label: 'Active', color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' },
  inactive: { label: 'Inactive', color: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200' },
  discontinued: { label: 'Discontinued', color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' },
} as const

export const SUPPLIER_STATUSES = {
  active: { label: 'Active', color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' },
  inactive: { label: 'Inactive', color: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200' },
} as const

export const PLACE_STATUSES = {
  active: { label: 'Active', color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' },
  inactive: { label: 'Inactive', color: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200' },
} as const

export const PLACE_TYPES = {
  warehouse: 'Warehouse',
  store: 'Store',
  office: 'Office',
} as const

// ============================================================================
// Pagination Constants
// ============================================================================

export const DEFAULT_PAGE_SIZE = 10
export const PAGE_SIZE_OPTIONS = [10, 25, 50, 100]

// ============================================================================
// Validation Messages
// ============================================================================

export const VALIDATION_MESSAGES = {
  required: 'This field is required',
  email: 'Please enter a valid email address',
  min: (min: number) => `Must be at least ${min} characters`,
  max: (max: number) => `Must not exceed ${max} characters`,
  minNumber: (min: number) => `Must be at least ${min}`,
  maxNumber: (max: number) => `Must not exceed ${max}`,
  pattern: 'Please enter a valid format',
  unique: 'This value already exists',
} as const

// ============================================================================
// Messages
// ============================================================================

export const MESSAGES = {
  success: {
    create: 'Item created successfully',
    update: 'Item updated successfully',
    delete: 'Item deleted successfully',
    save: 'Changes saved successfully',
  },
  error: {
    create: 'Failed to create item',
    update: 'Failed to update item',
    delete: 'Failed to delete item',
    load: 'Failed to load data',
    save: 'Failed to save changes',
  },
  confirm: {
    delete: 'Are you sure you want to delete this item? This action cannot be undone.',
  },
  empty: {
    noData: 'No data available',
    noResults: 'No results found',
  },
} as const

// ============================================================================
// Routes
// ============================================================================

export const ROUTES = {
  dashboard: '/',
  products: '/products',
  suppliers: '/suppliers',
  sales: '/sales',
} as const

// ============================================================================
// Field Types & Options
// ============================================================================

export const FIELD_TYPES = {
  text: 'text',
  email: 'email',
  password: 'password',
  number: 'number',
  textarea: 'textarea',
  select: 'select',
  checkbox: 'checkbox',
  date: 'date',
} as const

// ============================================================================
// Sorting & Filtering
// ============================================================================

export const SORT_DIRECTIONS = {
  asc: 'asc' as const,
  desc: 'desc' as const,
} as const

export const FILTER_OPERATORS = {
  equals: 'equals',
  contains: 'contains',
  startsWith: 'startsWith',
  endsWith: 'endsWith',
  greaterThan: 'greaterThan',
  lessThan: 'lessThan',
  between: 'between',
} as const
