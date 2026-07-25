# ERP Frontend - Architecture Documentation

## Overview

This document provides a deep dive into the **configuration-driven ERP architecture** that powers this enterprise management system.

## Core Principle: Configuration Over Code

Instead of writing new component code for each module, we define the module entirely through **configuration objects**. This approach provides:

- **DRY (Don't Repeat Yourself)** - No duplicated form/table code
- **Consistency** - All modules follow identical patterns
- **Scalability** - Easy to add new modules
- **Maintainability** - Changes in one place affect all modules
- **Type Safety** - TypeScript ensures all configs are correct

## Architecture Layers

```
┌─────────────────────────────────────────────────┐
│         Feature Pages                           │
│  (products/page.tsx, suppliers/page.tsx, etc)  │
└─────────────────┬───────────────────────────────┘
                  │
         ┌────────┴────────┐
         │                 │
┌────────▼──────────┐  ┌──▼────────────────────┐
│ Configuration     │  │ Hooks                 │
│ (productConfig)   │  │ (useModal,            │
│                   │  │  useNotification)     │
└────────┬──────────┘  └──┬───────────────────┘
         │                │
         └────────┬───────┘
                  │
    ┌─────────────┴─────────────┐
    │                           │
┌──▼─────────────┐  ┌──────────▼────────┐
│ Generic         │  │ API Services      │
│ Components      │  │ (productAPI,      │
│ (Form, Table,   │  │  supplierAPI,     │
│  Modal, etc)    │  │  placeAPI)        │
│                 │  │                   │
└────────┬────────┘  └──────────┬────────┘
         │                      │
         │      ┌───────────────┘
         │      │
         └──────┴──────────────────────────────────┐
                                                   │
                      ┌──────────────────────────┐│
                      │ Shared Types             ││
                      │ & Constants              ││
                      │ (types/index.ts,        ││
                      │  constants/index.ts)    ││
                      └──────────────────────────┘│
```

## Configuration Object Structure

### FormConfig

Defines how a form is rendered:

```typescript
{
  title?: string
  description?: string
  fields: [
    {
      name: string                    // Form field key
      label: string                   // Display label
      type: FieldType                 // text|email|select|textarea|etc
      required?: boolean              // Field required?
      placeholder?: string            // Placeholder text
      options?: SelectOption[]        // For select fields
      validation?: ZodSchema          // Zod validator
      defaultValue?: any              // Initial value
      rows?: number                   // For textarea
    }
  ]
  submitLabel?: string                // Submit button text
  cancelLabel?: string                // Cancel button text
}
```

### TableConfig

Defines table structure and behavior:

```typescript
{
  columns: [
    {
      id: string                      // Unique column ID
      header: string                  // Column header text
      accessor?: string               // Data property path
      width?: number                  // Column width in px
      sortable?: boolean              // Sortable?
      filterable?: boolean            // Filterable?
      cell?: (value, row) => any      // Custom cell renderer
    }
  ]
  data: any[]                         // Table data
  pageSize?: number                   // Items per page
  enableSorting?: boolean             // Enable sorting?
  enablePagination?: boolean          // Enable pagination?
  enableFiltering?: boolean           // Enable filtering?
  enableColumnResizing?: boolean      // Enable column resize?
  actions?: [                         // Row actions
    {
      label: string
      icon?: React.ReactNode
      onClick: (row) => void
      variant?: 'default'|'destructive'
    }
  ]
}
```

## Component Layer

### Generic Components

All components are agnostic to module domain:

#### Form
- Takes FormConfig
- Auto-renders fields
- Validates with Zod
- Handles errors
- Manages submission state

```tsx
<Form
  config={productFormConfig}
  initialValues={product}
  onSubmit={handleSubmit}
  onCancel={onCancel}
/>
```

#### Table
- Takes TableConfig
- Renders with TanStack Table
- Supports sorting/pagination/filtering
- Handles row selection/actions
- Responsive layout

```tsx
<Table
  config={tableConfig}
  onRowClick={(row) => handleEdit(row)}
/>
```

#### Modal
- Configurable sizing
- Keyboard navigation (Escape)
- Focus management
- Backdrop dismissal

```tsx
<Modal
  isOpen={isOpen}
  onClose={onClose}
  title="Create Product"
  width="lg"
>
  {/* Any content */}
</Modal>
```

#### Inputs
- TextInput, SelectInput, TextAreaInput, CheckboxInput
- Consistent styling
- Error display
- Helper text support

#### Button
- Multiple variants
- Loading state
- Icon support
- Accessible

### Layout Components

#### Layout (Main)
- Collapsible sidebar
- Responsive design
- Navigation links
- Main content area

#### Card
- Flexible container
- Header/Content/Footer slots
- Hover effects
- Border options

## Hook Layer

### useModal

State management for modal dialogs:

```typescript
const modal = useModal()

// Open create mode
modal.open('create')

// Open edit mode with data
modal.open('edit', productData)

// Check state
if (modal.isOpen && modal.mode === 'edit') {
  // ...
}

// Close
modal.close()
```

### useNotification

Toast notification system:

```typescript
const { add, remove, notifications, success, error } = useNotification()

// Show notification
success('Product created')
error('Failed to create product')

// Manual control
const id = add({
  type: 'info',
  message: 'Loading...',
  autoClose: false
})
remove(id)
```

## Service Layer (API)

Mock services for Products, Suppliers, Places:

```typescript
// Each service has CRUD operations
productAPI.getAll(page, pageSize)     // Returns paginated data
productAPI.getById(id)                // Single item
productAPI.create(data)               // Create new
productAPI.update(id, data)           // Update existing
productAPI.delete(id)                 // Delete item

// All methods return ApiResponse<T> or PaginatedResponse<T>
```

To connect to a real backend:

```typescript
// Replace getAll method
async getAll(page: number, pageSize: number) {
  const response = await fetch(`/api/products?page=${page}&pageSize=${pageSize}`)
  return response.json()
}
```

## Type Safety

### BaseEntity
All entities extend BaseEntity:

```typescript
interface BaseEntity {
  id: string
  createdAt?: string
  updatedAt?: string
}

interface Product extends BaseEntity {
  name: string
  description: string
  // ... more fields
}
```

### Type Flow

```
Config → Component → Hook → Service → Type
  ↑        ↑         ↑       ↑       ↑
  └─────────────────────────────────┘
      TypeScript ensures alignment
```

## State Management

### Component-Level State

Each page manages:

```typescript
// Data
const [products, setProducts] = useState<Product[]>([])

// Modal state
const modal = useModal()

// Notifications
const { notifications, add, remove } = useNotification()

// Specific item being edited
const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
```

### Data Flow

1. **Load** - `useEffect` calls `productAPI.getAll()`
2. **Create** - Form submission calls `productAPI.create()`
3. **Update** - Form submission calls `productAPI.update()`
4. **Delete** - Action button calls `productAPI.delete()`
5. **Re-render** - State update triggers component re-render

## Adding New Modules - Step by Step

### 1. Create Type

```typescript
// types/index.ts
export interface MyEntity extends BaseEntity {
  field1: string
  field2: number
  status: 'active' | 'inactive'
}
```

### 2. Create Configuration

```typescript
// config/myEntityConfig.ts
import { FormConfig, TableConfig } from '@/types'

export const myEntityFormConfig: FormConfig = {
  title: 'My Entity',
  fields: [
    {
      name: 'field1',
      label: 'Field 1',
      type: 'text',
      required: true,
      validation: z.string().min(1),
    },
    // ... more fields
  ],
  submitLabel: 'Save',
}

export const getMyEntityTableConfig = (data: any[]): TableConfig => ({
  columns: [
    { id: 'field1', header: 'Field 1', accessor: 'field1' },
    // ... more columns
  ],
  data,
  enableSorting: true,
  enablePagination: true,
})
```

### 3. Add API Service

```typescript
// services/api.ts
export const myEntityAPI = {
  async getAll(page = 1, pageSize = 10) {
    // Implementation
  },
  async getById(id: string) {
    // Implementation
  },
  async create(data: Omit<MyEntity, ...>) {
    // Implementation
  },
  // ... etc
}
```

### 4. Create Page

```typescript
// app/myentity/page.tsx
'use client'

export default function MyEntityPage() {
  const [items, setItems] = useState<MyEntity[]>([])
  const modal = useModal()
  const { add, notifications, remove } = useNotification()

  useEffect(() => {
    // Load items
    myEntityAPI.getAll().then(res => setItems(res.data))
  }, [])

  return (
    <Layout>
      {/* Header */}
      <div className="flex justify-between mb-6">
        <h1>My Entities</h1>
        <Button onClick={() => modal.open('create')}>Add</Button>
      </div>

      {/* Notifications */}
      <div className="space-y-2">
        {notifications.map(n => (
          <Alert key={n.id} type={n.type} message={n.message} />
        ))}
      </div>

      {/* Table */}
      <Table config={getMyEntityTableConfig(items)} />

      {/* Modal */}
      <Modal isOpen={modal.isOpen} onClose={modal.close} title="...">
        <Form config={myEntityFormConfig} onSubmit={handleSubmit} />
      </Modal>
    </Layout>
  )
}
```

### 5. Update Navigation

```typescript
// components/Layout.tsx
<NavLink href="/myentity" label="My Entities" />
```

**That's it!** Your new module is complete.

## Performance Optimizations

### 1. Component Memoization

Table configs are memoized to prevent unnecessary re-renders:

```typescript
const columns = useMemo(() => getColumns(), [data])
```

### 2. Lazy Modal Content

Modal content only renders when open:

```tsx
{isOpen && <Form config={config} />}
```

### 3. Paginated Data

Tables use pagination to avoid rendering 10K+ rows:

```typescript
const { data, total, page, pageSize, totalPages } = 
  await productAPI.getAll(currentPage, 10)
```

### 4. TailwindCSS PurgeCSS

Only used styles are included in bundle.

## Security Best Practices

When connecting to real backend:

1. **Input Validation** ✅ (Already implemented with Zod)
2. **CSRF Protection** - Add middleware
3. **Rate Limiting** - Implement on backend
4. **Authentication** - Add JWT/session handling
5. **Authorization** - Check permissions in backend
6. **SQL Injection** - Use parameterized queries
7. **XSS Protection** ✅ (React sanitizes by default)

## Testing Strategy

### Unit Tests
```typescript
test('Product validator', () => {
  const config = productFormConfig
  const isValid = config.fields[0].validation?.safeParse('test')
  expect(isValid).toBeDefined()
})
```

### Component Tests
```typescript
test('Form renders with config', () => {
  render(<Form config={productFormConfig} />)
  expect(screen.getByText('Product Name')).toBeVisible()
})
```

### Integration Tests
```typescript
test('Create product flow', async () => {
  render(<ProductsPage />)
  // Fill form
  // Submit
  // Verify in table
})
```

## Monitoring & Debugging

### Console Logs

Use structured logging:

```typescript
console.log('[v0] API Response:', { success, data, error })
console.log('[v0] Form Submission:', { mode, data })
```

### React DevTools

- Profiler: Identify slow components
- Component Tree: Debug prop flow
- Hooks: Inspect hook state

### Network Inspector

- Monitor API calls
- Check response times
- Verify data integrity

## Deployment Checklist

- [ ] TypeScript compiles without errors
- [ ] Tests pass
- [ ] No console errors
- [ ] Responsive on mobile
- [ ] Dark mode works
- [ ] Accessibility checked
- [ ] Performance metrics acceptable
- [ ] Environment variables set
- [ ] Database connection tested
- [ ] API authentication verified

## Future Enhancements

1. **Real Backend Integration** - Replace mock APIs
2. **Authentication** - Add user login
3. **Role-Based Access** - Restrict by user role
4. **Advanced Filtering** - Complex filter UI
5. **Bulk Operations** - Select and batch actions
6. **Export/Import** - CSV export, Excel import
7. **Caching Layer** - SWR for data sync
8. **Offline Support** - Service workers
9. **Analytics** - Dashboard with charts
10. **Audit Logging** - Track all changes

## Key Files Reference

| File | Purpose |
|------|---------|
| `types/index.ts` | All TypeScript interfaces |
| `constants/index.ts` | UI constants, messages, statuses |
| `components/*.tsx` | Generic reusable components |
| `config/*.ts` | Module configurations |
| `services/api.ts` | API service layer |
| `hooks/*.ts` | Custom React hooks |
| `app/*/page.tsx` | Module feature pages |

## Conclusion

This architecture demonstrates how modern enterprise applications can be built with **configuration-driven patterns**, maintaining **DRY principles** while staying **type-safe** and **performant**.

The key is: **Configuration objects define UI, not component code.**

---

For more details, see [README.md](README.md)
