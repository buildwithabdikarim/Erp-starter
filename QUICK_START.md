# Quick Start Guide

## 🚀 Start Development

```bash
cd /vercel/share/v0-project
pnpm dev
```

**Visit**: http://localhost:3000

## 📖 Understanding the Project

### 1. Configuration-Driven Design
Everything is defined through configuration objects, not hardcoded UI.

```typescript
// Add a new form field? Update the config:
{
  name: 'newField',
  label: 'New Field',
  type: 'text',
  required: true
}
// Form auto-renders!
```

### 2. Three Main Modules

| Module | Path | CRUD | Status |
|--------|------|------|--------|
| **Products** | `/products` | ✅ | Complete |
| **Suppliers** | `/suppliers` | ✅ | Complete |
| **Places** | `/places` | ✅ | Complete |

### 3. Component Usage

**Form**
```tsx
<Form config={productFormConfig} onSubmit={handleSubmit} />
```

**Table**
```tsx
<Table config={getProductTableConfig(data)} />
```

**Modal**
```tsx
<Modal isOpen={open} onClose={close} title="Title">
  {children}
</Modal>
```

**Button**
```tsx
<Button variant="primary" onClick={handleClick}>
  Click Me
</Button>
```

## 🎯 Add a New Module in 5 Minutes

### Step 1: Define Type
```typescript
// types/index.ts
export interface Item extends BaseEntity {
  name: string
  description: string
  status: 'active' | 'inactive'
}
```

### Step 2: Create Config
```typescript
// config/itemConfig.ts
export const itemFormConfig: FormConfig = {
  fields: [
    { name: 'name', label: 'Name', type: 'text', required: true },
    { name: 'description', label: 'Description', type: 'textarea' },
    {
      name: 'status',
      label: 'Status',
      type: 'select',
      options: [
        { value: 'active', label: 'Active' },
        { value: 'inactive', label: 'Inactive' }
      ]
    }
  ],
  submitLabel: 'Save Item'
}

export const getItemTableConfig = (data: any[]) => ({
  columns: [
    { id: 'name', header: 'Name', accessor: 'name', sortable: true },
    { id: 'description', header: 'Description', accessor: 'description' },
    { id: 'status', header: 'Status', accessor: 'status' }
  ],
  data,
  enableSorting: true,
  enablePagination: true
})
```

### Step 3: Add API Service
```typescript
// services/api.ts
export const itemAPI = {
  async getAll(page = 1, pageSize = 10) {
    // Simulate network delay
    await new Promise(r => setTimeout(r, 300))
    
    const items: Item[] = [
      { id: '1', name: 'Item 1', description: 'Desc 1', status: 'active' }
    ]
    
    return {
      data: items.slice((page-1)*pageSize, page*pageSize),
      total: items.length,
      page,
      pageSize,
      totalPages: Math.ceil(items.length / pageSize)
    }
  },
  
  async create(data: Omit<Item, 'id' | 'createdAt' | 'updatedAt'>) {
    return { success: true, data: { ...data, id: '123' } }
  },
  
  async update(id: string, data: Partial<Item>) {
    return { success: true, data: { ...data, id } }
  },
  
  async delete(id: string) {
    return { success: true, data: null }
  }
}
```

### Step 4: Create Page
```typescript
// app/items/page.tsx - Copy from products/page.tsx and adapt
'use client'

import { useState, useEffect } from 'react'
import { Layout } from '@/components/Layout'
import { Table } from '@/components/Table'
import { Modal } from '@/components/Modal'
import { Form } from '@/components/Form'
import { Button } from '@/components/Button'
import { Alert } from '@/components/Alert'
import { useModal, useNotification } from '@/hooks'
import { itemAPI } from '@/services/api'
import { itemFormConfig, getItemTableConfig } from '@/config/itemConfig'
import { Item } from '@/types'
import { Plus, Edit2, Trash2 } from 'lucide-react'

export default function ItemsPage() {
  const [items, setItems] = useState<Item[]>([])
  const [loading, setLoading] = useState(true)
  const modal = useModal()
  const { notifications, add, remove } = useNotification()
  const [selected, setSelected] = useState<Item | null>(null)

  useEffect(() => {
    loadItems()
  }, [])

  const loadItems = async () => {
    try {
      const res = await itemAPI.getAll()
      setItems(res.data)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (data: Record<string, any>) => {
    try {
      if (modal.mode === 'create') {
        const res = await itemAPI.create(data)
        if (res.success) {
          setItems([...items, res.data])
          add({ type: 'success', message: 'Item created' })
          modal.close()
        }
      }
    } catch (error) {
      add({ type: 'error', message: 'Error' })
    }
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between">
          <h1 className="text-2xl font-bold">Items</h1>
          <Button onClick={() => modal.open('create')} leftIcon={<Plus />}>
            Add Item
          </Button>
        </div>

        <div className="space-y-2">
          {notifications.map(n => (
            <Alert key={n.id} type={n.type} message={n.message} />
          ))}
        </div>

        {!loading && <Table config={getItemTableConfig(items)} />}

        <Modal isOpen={modal.isOpen} onClose={modal.close} title="Item">
          <Form config={itemFormConfig} onSubmit={handleSubmit} onCancel={modal.close} />
        </Modal>
      </div>
    </Layout>
  )
}
```

### Step 5: Add Navigation Link
```typescript
// components/Layout.tsx - Add this line:
<NavLink href="/items" label="Items" />
```

**Done!** Your new module is complete.

## 📁 File Organization

```
app/              # Pages & routes
components/       # Reusable UI components
config/           # Module configurations
services/         # API layer
types/            # TypeScript definitions
constants/        # UI constants
hooks/            # Custom React hooks
```

## 🎨 Component Reference

### Button Variants
```tsx
<Button variant="primary">Primary</Button>
<Button variant="secondary">Secondary</Button>
<Button variant="destructive">Delete</Button>
<Button variant="outline">Outline</Button>
<Button variant="ghost">Ghost</Button>
<Button variant="link">Link</Button>
```

### Button States
```tsx
<Button isLoading>Loading...</Button>
<Button disabled>Disabled</Button>
<Button size="sm">Small</Button>
<Button size="lg">Large</Button>
<Button leftIcon={<Icon />}>With Icon</Button>
```

### Form Fields
```tsx
<TextInput label="Name" required error="Name is required" />
<SelectInput label="Status" options={options} />
<TextAreaInput label="Description" rows={4} />
<CheckboxInput label="Active" />
```

### Alert Types
```tsx
<Alert type="success" message="Success!" />
<Alert type="error" message="Error occurred" />
<Alert type="warning" message="Warning" />
<Alert type="info" message="Info" />
```

## 🔌 Connect to Real Backend

Replace mock API with real endpoints:

```typescript
// services/api.ts
export const itemAPI = {
  async getAll(page = 1, pageSize = 10) {
    const res = await fetch(
      `/api/items?page=${page}&pageSize=${pageSize}`
    )
    return res.json()
  },

  async create(data) {
    const res = await fetch('/api/items', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    })
    return res.json()
  },

  // ... update/delete methods similarly
}
```

## 🧪 Testing a Component

```typescript
import { render, screen } from '@testing-library/react'
import { Form } from '@/components/Form'
import { itemFormConfig } from '@/config/itemConfig'

test('Form renders', () => {
  render(<Form config={itemFormConfig} onSubmit={jest.fn()} />)
  expect(screen.getByLabelText('Name')).toBeInTheDocument()
})
```

## 🐛 Debugging Tips

### Check Console Logs
```bash
# Terminal output shows real-time logs
```

### React DevTools Browser Extension
- Inspect component hierarchy
- Check prop values
- Monitor hooks

### Network Tab (Browser DevTools)
- Monitor API calls
- Check request/response payloads

### TypeScript Errors
```bash
pnpm exec tsc --noEmit
```

## 🎯 Common Tasks

### Add a Form Field
```typescript
// config/productConfig.ts
{
  name: 'newField',
  label: 'New Field Label',
  type: 'text',    // or 'select', 'textarea', etc
  required: true,
  validation: z.string().min(1)
}
```

### Add a Table Column
```typescript
// config/productConfig.ts
{
  id: 'newColumn',
  header: 'New Column',
  accessor: 'fieldName',
  sortable: true,
  cell: (value) => `$${value}`  // Custom formatting
}
```

### Show Notification
```typescript
const { add } = useNotification()

// Success
add({ type: 'success', message: 'Created!' })

// Error
add({ type: 'error', message: 'Failed' })

// With title
add({ 
  type: 'success', 
  title: 'Success',
  message: 'Item created' 
})
```

### Handle Modal
```typescript
const modal = useModal()

// Open for create
modal.open('create')

// Open for edit with data
modal.open('edit', product)

// Check state
if (modal.isOpen) {
  console.log(modal.mode)  // 'create' | 'edit' | 'view'
  console.log(modal.data)  // The data passed
}

// Close
modal.close()
```

## 📱 Responsive Classes

```tsx
<div className="
  grid 
  grid-cols-1        /* Mobile: 1 column */
  md:grid-cols-2     /* Tablet: 2 columns */
  lg:grid-cols-4     /* Desktop: 4 columns */
">
  {/* Content */}
</div>
```

## 🌙 Dark Mode

Already supported! TailwindCSS handles dark mode automatically via `prefers-color-scheme`.

## 🚀 Deploy

### To Vercel
```bash
git push  # Auto-deploys
```

### Build & Run Locally
```bash
pnpm build
pnpm start
```

## 📚 More Documentation

- **README.md** - Full project guide
- **ARCHITECTURE.md** - Deep technical design
- **BUILD_SUMMARY.md** - What was built

## ✅ Checklist for New Modules

- [ ] Type defined in `types/index.ts`
- [ ] Config created in `config/`
- [ ] API service added to `services/api.ts`
- [ ] Page created in `app/modulename/page.tsx`
- [ ] Navigation link added in `components/Layout.tsx`
- [ ] Constants updated if needed in `constants/index.ts`
- [ ] Tested in browser
- [ ] Forms validating correctly
- [ ] Table sorting/pagination working
- [ ] CRUD operations working

## 🎓 Learning Path

1. Start with README.md
2. Explore existing modules (products, suppliers)
3. Understand configs vs components
4. Try adding a simple field to existing module
5. Create your own simple module
6. Connect to real backend API

---

**Happy building! 🚀**
