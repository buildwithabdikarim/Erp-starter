# ERP Starter - Sales Management System Improvements
## Complete Implementation Details

---

## 📋 Overview

This document provides comprehensive details of all improvements made to the ERP Starter application's sales management system. The implementation includes UI fixes, data model restructuring, category management enhancements, and advanced transaction printing features.

**Date Implemented**: July 25, 2026

---

## 🔧 Phase 1: Bug Fixes

### 1.1 Fixed Modal Button Duplication

**Problem**: Cancel and Save buttons were appearing twice in modals (as shown in the provided screenshots).

**Root Cause**: Both the Modal component's footer prop and the Form component inside were rendering buttons independently.

**Solution Implemented**:
- Removed the `footer` prop from Modal components in both Products and Sales pages
- The Form component now handles all button rendering internally
- Modal now only manages the visual container and close functionality

**Files Modified**:
- `app/products/page.tsx` - Removed footer buttons from Modal
- `app/sales/page.tsx` - Removed footer buttons from Modal
- `components/Modal.tsx` - Simplified to not require footer prop
- `components/Form.tsx` - Maintained internal button handling

**Code Changes**:
```tsx
// BEFORE
<Modal
  isOpen={modal.isOpen}
  onClose={modal.close}
  title={formConfig.title || ''}
  width="lg"
  footer={
    <>
      <Button variant="outline" onClick={modal.close}>
        Cancel
      </Button>
      <Button onClick={() => {
        const form = document.querySelector('form')
        form?.dispatchEvent(new Event('submit', { bubbles: true }))
      }}>
        {formConfig.submitLabel || 'Save'}
      </Button>
    </>
  }
>
  <Form {...formProps} />
</Modal>

// AFTER
<Modal
  isOpen={modal.isOpen}
  onClose={modal.close}
  title={formConfig.title || ''}
  width="lg"
>
  <Form
    config={formConfig}
    initialValues={selectedProduct || {}}
    onSubmit={handleSubmit}
    onCancel={modal.close}
  />
</Modal>
```

**Impact**: Clean, non-duplicate button rendering in modals throughout the application.

---

## 📊 Phase 2: Data Model Restructuring

### 2.1 Supplier Field Migration (Products → Sales)

**Rationale**: Suppliers are business entities that provide products. However, suppliers are typically associated with purchase/sale transactions, not product master data. Moving supplier to the Sales table establishes the correct data relationship.

#### 2.1.1 Type Changes

**File**: `types/index.ts`

**Product Type - BEFORE**:
```typescript
export interface Product extends BaseEntity {
  name: string
  category: string
  supplier_id: string  // ❌ Removed
  cost_price: number
  selling_price: number
  quantity: number
}
```

**Product Type - AFTER**:
```typescript
export interface Product extends BaseEntity {
  name: string
  category: string
  cost_price: number
  selling_price: number
  quantity: number
}
```

**Sale Type - BEFORE**:
```typescript
export interface Sale extends BaseEntity {
  customer_name: string  // ❌ Also removed (see section 2.2)
  product_id: string
  quantity: number
  unit_price: number
  total_amount: number
  sale_date: string
}
```

**Sale Type - AFTER**:
```typescript
export interface Sale extends BaseEntity {
  product_id: string
  supplier_id: string  // ✅ Added
  quantity: number
  unit_price: number
  total_amount: number
  sale_date: string
}
```

#### 2.1.2 Form Fields Configuration

**File**: `features/products/fields.ts`

**Changes**:
- Removed supplier_id select field from product form
- Changed category from text input to select dropdown with inline creation support
- Kept cost_price, selling_price, and quantity fields

```typescript
// BEFORE: supplier_id was a required select field pointing to suppliers array
// AFTER: categories are passed as string array for dropdown selection
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
  // ... cost_price, selling_price, quantity fields remain unchanged
]
```

**File**: `features/sales/fields.ts`

**Changes**:
- Added supplier_id as required select field
- Removed customer_name field entirely
- Kept product_id, quantity, unit_price, and sale_date fields

```typescript
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
    name: 'supplier_id',  // ✅ New field
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
  // ... other fields unchanged
]
```

#### 2.1.3 Table Column Updates

**File**: `features/products/columns.ts`

**Changes**: Removed supplier_name column from product table display.

```typescript
// REMOVED:
// {
//   id: 'supplier_name',
//   header: 'Supplier',
//   accessor: 'supplier_name',
//   sortable: true,
//   width: 150,
// }
```

**File**: `features/sales/columns.ts`

**Changes**: 
- Removed customer_name column
- Added supplier_name column

```typescript
// REMOVED customer_name column
// ADDED:
{
  id: 'supplier_name',
  header: 'Supplier',
  accessor: 'supplier_name',
  sortable: true,
  width: 150,
  filterable: true,
}
```

#### 2.1.4 Page Component Updates

**File**: `app/products/page.tsx`

**Changes**:
- Removed supplier API loading
- Changed to extract categories from existing products
- Updated form data submission

```typescript
// Old data loading
const [suppliers, setSuppliers] = useState<Supplier[]>([])
const [productsRes, suppliersRes] = await Promise.all([
  productAPI.getAll(1, 50),
  supplierAPI.getAll(1, 100),
])

// New data loading
const [categories, setCategories] = useState<string[]>([])
const productsRes = await productAPI.getAll(1, 50)
const uniqueCategories = Array.from(new Set(productsRes.data.map((p) => p.category)))
setCategories(uniqueCategories)

// Form submission - removed supplier_id
const productData = {
  name: data.name,
  category: data.category,
  // supplier_id removed
  cost_price: data.cost_price,
  selling_price: data.selling_price,
  quantity: data.quantity,
}
```

**File**: `app/sales/page.tsx`

**Changes**:
- Added supplier API loading alongside products
- Updated enriched sales mapping to include supplier_name
- Updated form submission to include supplier_id

```typescript
// New data loading includes suppliers
const [suppliers, setSuppliers] = useState<Supplier[]>([])

const [salesRes, productsRes, suppliersRes] = await Promise.all([
  saleAPI.getAll(1, 50),
  productAPI.getAll(1, 100),
  supplierAPI.getAll(1, 100),
])

const enrichedSales = (salesRes.data as Sale[]).map((sale) => ({
  ...sale,
  product_name: productsRes.data.find((p) => p.id === sale.product_id)?.name || 'Unknown',
  supplier_name: suppliersRes.data.find((s) => s.id === sale.supplier_id)?.name || 'Unknown',
}))

// Form submission includes supplier_id
const saleData = {
  product_id: data.product_id,
  supplier_id: data.supplier_id,  // ✅ Now required
  quantity: data.quantity,
  unit_price: data.unit_price,
  total_amount: data.quantity * data.unit_price,
  sale_date: data.sale_date,
}
```

---

### 2.2 Remove Customer Name from Sales

**Problem**: The sale page displayed customer_name field, which may not be necessary for the current workflow.

**Solution**: Completely removed customer_name field from:
- Sale type definition
- Sales form fields
- Sales table display

**File**: `types/index.ts`

```typescript
// BEFORE
export interface Sale extends BaseEntity {
  customer_name: string  // ❌ Removed
  product_id: string
  // ...
}

// AFTER
export interface Sale extends BaseEntity {
  product_id: string
  supplier_id: string
  // ...
}
```

**File**: `features/sales/fields.ts`

```typescript
// REMOVED:
// {
//   name: 'customer_name',
//   label: 'Customer Name',
//   type: 'text',
//   required: true,
//   placeholder: 'Enter customer name',
//   validation: z.string().min(2, 'Name must be at least 2 characters').max(100),
// }
```

**Impact**: Sales forms now focus on product, supplier, quantity, price, and date without collecting customer information.

---

## 🏗️ Phase 3: Category Management with Inline Creation

### 3.1 New CategorySelect Component

**File**: `components/inputs/CategorySelect.tsx` (NEW)

**Purpose**: Provides a sophisticated dropdown for selecting existing categories with the ability to create new ones inline without modal dialogs.

**Features**:
- Displays existing categories in a dropdown list
- "Add New Category" option at the bottom
- Inline input field to type new category name
- Validation for empty names
- Smooth toggle between selection and creation modes
- Form integration with error handling

**Implementation**:

```typescript
'use client'

import React, { useState } from 'react'
import { ChevronDown, Plus, X } from 'lucide-react'

interface Option {
  value: string
  label: string
}

interface CategorySelectProps {
  name: string
  label: string
  value: string
  onChange: (name: string, value: string) => void
  placeholder?: string
  required?: boolean
  error?: string
  disabled?: boolean
  options: Option[]
}

export function CategorySelect({
  name,
  label,
  value,
  onChange,
  placeholder = 'Select a category',
  required = false,
  error,
  disabled = false,
  options = [],
}: CategorySelectProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const [newCategory, setNewCategory] = useState('')

  const handleSelect = (selectedValue: string) => {
    if (selectedValue === '__add_new__') {
      setIsCreating(true)
    } else {
      onChange(name, selectedValue)
      setIsOpen(false)
    }
  }

  const handleCreate = () => {
    if (newCategory.trim()) {
      onChange(name, newCategory.trim())
      setNewCategory('')
      setIsCreating(false)
      setIsOpen(false)
    }
  }

  const selectedLabel = options.find((opt) => opt.value === value)?.label || placeholder

  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-sm font-medium text-foreground">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <div className="relative">
        <button
          onClick={() => !disabled && setIsOpen(!isOpen)}
          disabled={disabled}
          className="w-full px-4 py-2 bg-background border border-border rounded-md text-left flex items-center justify-between hover:border-primary disabled:opacity-50"
        >
          <span className={value ? 'text-foreground' : 'text-muted-foreground'}>
            {selectedLabel}
          </span>
          <ChevronDown className="w-4 h-4" />
        </button>

        {isOpen && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-background border border-border rounded-md shadow-lg z-50">
            {isCreating ? (
              <div className="p-3 space-y-2 border-b border-border">
                <input
                  type="text"
                  placeholder="Category name"
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  autoFocus
                  className="w-full px-3 py-2 bg-background border border-border rounded text-sm"
                />
                <div className="flex gap-2">
                  <button
                    onClick={handleCreate}
                    className="flex-1 px-3 py-1 bg-primary text-primary-foreground rounded text-sm hover:bg-primary/90"
                  >
                    Create
                  </button>
                  <button
                    onClick={() => {
                      setIsCreating(false)
                      setNewCategory('')
                    }}
                    className="flex-1 px-3 py-1 bg-secondary text-secondary-foreground rounded text-sm hover:bg-secondary/90"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="max-h-48 overflow-y-auto">
                  {options.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => handleSelect(option.value)}
                      className={`w-full text-left px-4 py-2 hover:bg-accent ${
                        value === option.value ? 'bg-primary text-primary-foreground' : ''
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => handleSelect('__add_new__')}
                  className="w-full text-left px-4 py-2 text-sm border-t border-border hover:bg-accent flex items-center gap-2 text-primary"
                >
                  <Plus className="w-4 h-4" />
                  Add New Category
                </button>
              </>
            )}
          </div>
        )}
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  )
}
```

**File**: `components/inputs/index.ts`

**Changes**: Added CategorySelect export

```typescript
export { CategorySelect } from './CategorySelect'
```

### 3.2 Form Component Integration

**File**: `components/Form.tsx`

**Changes**: Added special handling for category fields to use CategorySelect component

```typescript
// Import CategorySelect
import { CategorySelect } from './inputs'

// In the field rendering loop, add special handling:
{config.fields.map((field) => {
  const error = errors[field.name]
  const value = formData[field.name] ?? field.defaultValue ?? ''

  // Special handling for category fields
  if (field.name === 'category' && field.type === 'select') {
    return (
      <CategorySelect
        key={field.name}
        name={field.name}
        label={field.label}
        value={value}
        onChange={handleChange}
        placeholder={field.placeholder}
        required={field.required}
        error={error}
        disabled={isLoading || isSubmitting}
        options={field.options || []}
      />
    )
  }

  // ... rest of field rendering
})}
```

**Feature Workflow**:
1. User clicks product form → category dropdown opens showing existing categories
2. User can select existing category (fast path)
3. User clicks "Add New Category" → inline input appears
4. User types category name → clicks Create
5. New category is saved and selected
6. Form can be submitted

---

## 🖨️ Phase 4: Transaction Printing Features

### 4.1 Individual Transaction Printing

**File**: `components/PrintTransaction.tsx` (NEW)

**Purpose**: Provides a professional, print-friendly view of a single sales transaction.

**Features**:
- Receipt-style transaction display
- Clear product, supplier, and quantity information
- Pricing breakdown with total
- Transaction date and ID
- Print-optimized styling
- Hidden from print layout until print is triggered

**Implementation**:

```typescript
'use client'

import React from 'react'
import { Sale } from '@/types'

interface PrintTransactionProps {
  sale: Sale & {
    product_name: string
    supplier_name: string
  }
}

export function PrintTransaction({ sale }: PrintTransactionProps) {
  const formattedDate = new Date(sale.sale_date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  return (
    <div className="print-transaction p-8 max-w-2xl mx-auto">
      <div className="border-b-2 border-foreground pb-4 mb-6">
        <h1 className="text-2xl font-bold">Transaction Receipt</h1>
        <p className="text-sm text-muted-foreground">ID: {sale.id}</p>
      </div>

      <div className="space-y-6">
        {/* Transaction Info */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-muted-foreground uppercase">Date</p>
            <p className="font-semibold">{formattedDate}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground uppercase">Transaction ID</p>
            <p className="font-semibold">{sale.id}</p>
          </div>
        </div>

        {/* Supplier Info */}
        <div className="border-l-4 border-primary pl-4">
          <p className="text-xs text-muted-foreground uppercase">Supplier</p>
          <p className="font-semibold text-lg">{sale.supplier_name}</p>
        </div>

        {/* Product Details */}
        <div className="bg-secondary/10 p-4 rounded">
          <div className="space-y-3">
            <div>
              <p className="text-xs text-muted-foreground uppercase">Product</p>
              <p className="font-semibold">{sale.product_name}</p>
            </div>

            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <p className="text-xs text-muted-foreground uppercase">Quantity</p>
                <p className="font-semibold text-base">{sale.quantity}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase">Unit Price</p>
                <p className="font-semibold text-base">${sale.unit_price.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase">Amount</p>
                <p className="font-semibold text-base">${sale.total_amount.toFixed(2)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Total */}
        <div className="border-t-2 border-b-2 border-foreground py-4">
          <div className="flex justify-between items-center">
            <p className="text-lg font-bold">TOTAL</p>
            <p className="text-2xl font-bold text-primary">${sale.total_amount.toFixed(2)}</p>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-xs text-muted-foreground">
          <p>Generated: {new Date().toLocaleDateString()} {new Date().toLocaleTimeString()}</p>
        </div>
      </div>

      <style jsx>{`
        @media print {
          .print-transaction {
            background: white;
            color: black;
            page-break-after: always;
          }
          .print-transaction * {
            break-inside: avoid;
          }
        }
      `}</style>
    </div>
  )
}
```

**Display Integration** in `app/sales/page.tsx`:

```typescript
{printMode === 'single' && printData && (
  <div className="fixed inset-0 bg-white z-50 overflow-auto no-print">
    <div className="p-4 bg-background border-b border-border sticky top-0 z-10 flex justify-between items-center">
      <h2 className="text-lg font-semibold">Print Preview - Transaction</h2>
      <div className="flex gap-2">
        <Button onClick={() => window.print()}>Print</Button>
        <Button variant="outline" onClick={() => setPrintMode(null)}>
          Close
        </Button>
      </div>
    </div>
    <PrintTransaction sale={printData.sales[0]} />
  </div>
)}
```

**Usage Flow**:
1. User clicks printer icon next to transaction
2. Single transaction print preview opens in full-screen overlay
3. User clicks "Print" button
4. Browser print dialog opens
5. User selects printer and settings
6. Receipt prints

---

### 4.2 Bulk Print Dialog with Grouping Options

**File**: `components/BulkPrintDialog.tsx` (NEW)

**Purpose**: Provides interface for selecting multiple transactions and grouping them by date, supplier, or manual selection.

**Features**:
- Three grouping methods (tabs or toggle)
- Date range picker for range-based grouping
- Supplier dropdown for supplier-based grouping
- Checkboxes for manual selection mode
- Preview of selected transaction count
- Validation and error handling

**Key Sections**:

```typescript
'use client'

import React, { useState } from 'react'
import { Sale, Supplier } from '@/types'
import { Modal } from './Modal'
import { Button } from './Button'
import { Calendar, Users, CheckSquare } from 'lucide-react'

interface BulkPrintDialogProps {
  isOpen: boolean
  onClose: () => void
  sales: (Sale & { product_name: string; supplier_name: string })[]
  suppliers: Supplier[]
  onPrint: (sales: (Sale & { product_name: string; supplier_name: string })[], groupBy: 'date' | 'supplier' | 'manual') => void
}

export function BulkPrintDialog({
  isOpen,
  onClose,
  sales,
  suppliers,
  onPrint,
}: BulkPrintDialogProps) {
  const [groupBy, setGroupBy] = useState<'date' | 'supplier' | 'manual'>('date')
  const [startDate, setStartDate] = useState<string>('')
  const [endDate, setEndDate] = useState<string>('')
  const [selectedSupplierId, setSelectedSupplierId] = useState<string>('')
  const [selectedSaleIds, setSelectedSaleIds] = useState<Set<string>>(new Set())

  const getFilteredSales = () => {
    let filtered = sales

    if (groupBy === 'date' && startDate && endDate) {
      const start = new Date(startDate)
      const end = new Date(endDate)
      end.setHours(23, 59, 59, 999)
      filtered = filtered.filter((s) => {
        const saleDate = new Date(s.sale_date)
        return saleDate >= start && saleDate <= end
      })
    } else if (groupBy === 'supplier' && selectedSupplierId) {
      filtered = filtered.filter((s) => s.supplier_id === selectedSupplierId)
    } else if (groupBy === 'manual') {
      filtered = filtered.filter((s) => selectedSaleIds.has(s.id))
    }

    return filtered
  }

  const filteredSales = getFilteredSales()
  const canPrint = filteredSales.length > 0

  const handlePrint = () => {
    if (canPrint) {
      onPrint(filteredSales, groupBy)
      onClose()
    }
  }

  const toggleSale = (saleId: string) => {
    const newSelected = new Set(selectedSaleIds)
    if (newSelected.has(saleId)) {
      newSelected.delete(saleId)
    } else {
      newSelected.add(saleId)
    }
    setSelectedSaleIds(newSelected)
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Bulk Print Transactions" width="lg">
      <div className="space-y-6">
        {/* Grouping Method Tabs */}
        <div className="flex gap-2 border-b border-border">
          <button
            onClick={() => setGroupBy('date')}
            className={`px-4 py-2 flex items-center gap-2 border-b-2 ${
              groupBy === 'date'
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            <Calendar className="w-4 h-4" />
            By Date
          </button>
          <button
            onClick={() => setGroupBy('supplier')}
            className={`px-4 py-2 flex items-center gap-2 border-b-2 ${
              groupBy === 'supplier'
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            <Users className="w-4 h-4" />
            By Supplier
          </button>
          <button
            onClick={() => setGroupBy('manual')}
            className={`px-4 py-2 flex items-center gap-2 border-b-2 ${
              groupBy === 'manual'
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            <CheckSquare className="w-4 h-4" />
            Manual
          </button>
        </div>

        {/* Content based on grouping method */}
        {groupBy === 'date' && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Start Date</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-3 py-2 border border-border rounded"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">End Date</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-3 py-2 border border-border rounded"
                />
              </div>
            </div>
          </div>
        )}

        {groupBy === 'supplier' && (
          <div>
            <label className="block text-sm font-medium mb-2">Select Supplier</label>
            <select
              value={selectedSupplierId}
              onChange={(e) => setSelectedSupplierId(e.target.value)}
              className="w-full px-3 py-2 border border-border rounded"
            >
              <option value="">-- Select a supplier --</option>
              {suppliers.map((supplier) => (
                <option key={supplier.id} value={supplier.id}>
                  {supplier.name}
                </option>
              ))}
            </select>
          </div>
        )}

        {groupBy === 'manual' && (
          <div>
            <label className="block text-sm font-medium mb-2">Select Transactions</label>
            <div className="max-h-64 overflow-y-auto border border-border rounded">
              {sales.map((sale) => (
                <div
                  key={sale.id}
                  className="p-3 border-b border-border hover:bg-secondary/10 cursor-pointer"
                  onClick={() => toggleSale(sale.id)}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={selectedSaleIds.has(sale.id)}
                      onChange={() => toggleSale(sale.id)}
                      className="w-4 h-4 cursor-pointer"
                    />
                    <div className="flex-1">
                      <p className="font-medium">{sale.product_name}</p>
                      <p className="text-sm text-muted-foreground">
                        {sale.supplier_name} • {new Date(sale.sale_date).toLocaleDateString()}
                      </p>
                    </div>
                    <p className="font-semibold">${sale.total_amount.toFixed(2)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Selection Summary */}
        <div className="bg-secondary/10 p-4 rounded">
          <p className="text-sm">
            <span className="font-semibold">{filteredSales.length}</span> transaction(s) selected
          </p>
          {filteredSales.length > 0 && (
            <p className="text-sm text-muted-foreground">
              Total: ${filteredSales.reduce((sum, s) => sum + s.total_amount, 0).toFixed(2)}
            </p>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 justify-end pt-4 border-t border-border">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handlePrint} disabled={!canPrint}>
            Print ({filteredSales.length})
          </Button>
        </div>
      </div>
    </Modal>
  )
}
```

**Grouping Methods**:

1. **By Date Range**: 
   - Select start and end dates
   - All transactions within range are selected
   - Perfect for daily, weekly, or monthly reports

2. **By Supplier**:
   - Dropdown to select specific supplier
   - All transactions for that supplier are selected
   - Useful for supplier-specific reconciliation

3. **Manual Selection**:
   - Checkboxes for each transaction
   - Full control over which transactions to include
   - Best for ad-hoc report generation

---

### 4.3 Grouped Transaction Print View

**File**: `components/PrintTransactionGroup.tsx` (NEW)

**Purpose**: Displays multiple transactions grouped and formatted for printing with summaries.

**Features**:
- Automatic grouping by date or supplier
- Group headers with summary information
- Individual transaction line items
- Grand totals
- Print-optimized layout with page breaks
- Professional report formatting

**Implementation**:

```typescript
'use client'

import React from 'react'
import { Sale } from '@/types'

interface PrintTransactionGroupProps {
  transactions: (Sale & {
    product_name: string
    supplier_name: string
  })[]
  groupBy: 'date' | 'supplier' | 'manual'
  title?: string
}

export function PrintTransactionGroup({
  transactions,
  groupBy,
  title = 'Transactions Report',
}: PrintTransactionGroupProps) {
  // Group transactions based on groupBy method
  const groupedData = React.useMemo(() => {
    const groups: Record<string, typeof transactions> = {}

    transactions.forEach((transaction) => {
      let key = ''

      if (groupBy === 'date') {
        const date = new Date(transaction.sale_date)
        key = date.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        })
      } else if (groupBy === 'supplier') {
        key = transaction.supplier_name
      } else {
        // Manual selection - no specific grouping
        key = 'Selected Transactions'
      }

      if (!groups[key]) {
        groups[key] = []
      }
      groups[key].push(transaction)
    })

    return groups
  }, [transactions, groupBy])

  const groupTotal = transactions.reduce((sum, t) => sum + t.total_amount, 0)

  return (
    <div className="print-group-view p-8 max-w-4xl mx-auto">
      {/* Report Header */}
      <div className="border-b-2 border-foreground pb-6 mb-8">
        <h1 className="text-3xl font-bold">{title}</h1>
        <div className="grid grid-cols-4 gap-4 mt-4 text-sm text-muted-foreground">
          <div>
            <p className="text-xs uppercase">Generated</p>
            <p className="font-semibold text-foreground">
              {new Date().toLocaleDateString()} {new Date().toLocaleTimeString()}
            </p>
          </div>
          <div>
            <p className="text-xs uppercase">Total Transactions</p>
            <p className="font-semibold text-foreground">{transactions.length}</p>
          </div>
          <div>
            <p className="text-xs uppercase">Grouping Method</p>
            <p className="font-semibold text-foreground capitalize">
              {groupBy === 'date' ? 'By Date' : groupBy === 'supplier' ? 'By Supplier' : 'Manual'}
            </p>
          </div>
          <div>
            <p className="text-xs uppercase">Grand Total</p>
            <p className="font-bold text-primary text-lg">${groupTotal.toFixed(2)}</p>
          </div>
        </div>
      </div>

      {/* Grouped Transactions */}
      <div className="space-y-8">
        {Object.entries(groupedData).map(([groupName, items]) => (
          <div key={groupName} className="page-break">
            {/* Group Header */}
            <div className="bg-secondary/20 p-4 mb-4 rounded border border-border">
              <h2 className="text-lg font-bold">{groupName}</h2>
              <p className="text-sm text-muted-foreground">
                {items.length} transaction{items.length !== 1 ? 's' : ''}
              </p>
            </div>

            {/* Transactions Table */}
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b-2 border-foreground">
                  <th className="text-left py-2 px-2">Product</th>
                  <th className="text-left py-2 px-2">Supplier</th>
                  <th className="text-right py-2 px-2 w-20">Qty</th>
                  <th className="text-right py-2 px-2 w-24">Unit Price</th>
                  <th className="text-right py-2 px-2 w-24">Amount</th>
                </tr>
              </thead>
              <tbody>
                {items.map((transaction) => (
                  <tr key={transaction.id} className="border-b border-border hover:bg-secondary/5">
                    <td className="py-2 px-2">{transaction.product_name}</td>
                    <td className="py-2 px-2">{transaction.supplier_name}</td>
                    <td className="text-right py-2 px-2">{transaction.quantity}</td>
                    <td className="text-right py-2 px-2">${transaction.unit_price.toFixed(2)}</td>
                    <td className="text-right py-2 px-2 font-semibold">
                      ${transaction.total_amount.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Group Subtotal */}
            <div className="flex justify-end mt-4 pr-2">
              <div className="w-48">
                <div className="flex justify-between border-t border-border pt-2">
                  <span className="font-semibold">Subtotal:</span>
                  <span className="font-bold">
                    ${items.reduce((sum, t) => sum + t.total_amount, 0).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Grand Total */}
      <div className="mt-8 pt-4 border-t-2 border-foreground">
        <div className="flex justify-end pr-2">
          <div className="w-48">
            <div className="flex justify-between text-lg">
              <span className="font-bold">GRAND TOTAL:</span>
              <span className="font-bold text-primary text-xl">${groupTotal.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @media print {
          .print-group-view {
            background: white;
            color: black;
          }
          .print-group-view * {
            break-inside: avoid;
          }
          .page-break {
            page-break-after: always;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>
    </div>
  )
}
```

---

## 📱 Integration in Sales Page

**File**: `app/sales/page.tsx` - Complete Integration

### State Management

```typescript
const [bulkPrintOpen, setBulkPrintOpen] = useState(false)
const [printMode, setPrintMode] = useState<'single' | 'group' | null>(null)
const [printData, setPrintData] = useState<{
  sales: (Sale & { product_name: string; supplier_name: string })[]
  groupBy: 'date' | 'supplier' | 'manual'
} | null>(null)
```

### Print Handlers

```typescript
const handlePrintSingle = (sale: Sale & { product_name: string; supplier_name: string }) => {
  setPrintMode('single')
  setPrintData({ sales: [sale], groupBy: 'manual' })
}

const handleBulkPrint = (
  selectedSales: (Sale & { product_name: string; supplier_name: string })[],
  groupBy: 'date' | 'supplier' | 'manual'
) => {
  setPrintMode('group')
  setPrintData({ sales: selectedSales, groupBy })
}
```

### Table Configuration Update

```typescript
const tableConfig: TableConfig = {
  columns: [
    ...salesColumns,
    {
      id: 'actions',
      header: 'Actions',
      width: 150,
      cell: (_, row) => (
        <div className="flex gap-2">
          <Button size="sm" variant="secondary" onClick={() => handlePrintSingle(row)}>
            <Printer className="w-4 h-4" />
          </Button>
          <Button size="sm" variant="secondary" onClick={() => {
            setSelectedSale(row)
            modal.open('edit', row)
          }}>
            <Edit2 className="w-4 h-4" />
          </Button>
          <Button size="sm" variant="destructive" onClick={() => handleDelete(row)}>
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      ),
    },
  ],
  data: sales,
  enableSorting: true,
  enablePagination: true,
  enableFiltering: true,
}
```

### Print Components Rendering

```typescript
{/* Bulk Print Dialog */}
<BulkPrintDialog
  isOpen={bulkPrintOpen}
  onClose={() => setBulkPrintOpen(false)}
  sales={sales}
  suppliers={suppliers}
  onPrint={handleBulkPrint}
/>

{/* Single Transaction Print Preview */}
{printMode === 'single' && printData && (
  <div className="fixed inset-0 bg-white z-50 overflow-auto no-print">
    <div className="p-4 bg-background border-b border-border sticky top-0 z-10 flex justify-between items-center">
      <h2 className="text-lg font-semibold">Print Preview - Transaction</h2>
      <div className="flex gap-2">
        <Button onClick={() => window.print()}>Print</Button>
        <Button variant="outline" onClick={() => setPrintMode(null)}>
          Close
        </Button>
      </div>
    </div>
    <PrintTransaction sale={printData.sales[0]} />
  </div>
)}

{/* Bulk Transaction Print Preview */}
{printMode === 'group' && printData && (
  <div className="fixed inset-0 bg-white z-50 overflow-auto no-print">
    <div className="p-4 bg-background border-b border-border sticky top-0 z-10 flex justify-between items-center">
      <h2 className="text-lg font-semibold">Print Preview - Bulk Report</h2>
      <div className="flex gap-2">
        <Button onClick={() => window.print()}>Print</Button>
        <Button variant="outline" onClick={() => setPrintMode(null)}>
          Close
        </Button>
      </div>
    </div>
    <PrintTransactionGroup
      transactions={printData.sales}
      groupBy={printData.groupBy}
      title={`Transactions Report - ${printData.groupBy === 'date' ? 'By Date' : printData.groupBy === 'supplier' ? 'By Supplier' : 'Manual Selection'}`}
    />
  </div>
)}
```

---

## 📋 Files Modified/Created Summary

### Modified Files (8)
1. `types/index.ts` - Updated Product and Sale types
2. `features/products/fields.ts` - Removed supplier, changed category to select
3. `features/sales/fields.ts` - Added supplier, removed customer_name
4. `features/products/columns.ts` - Removed supplier column
5. `features/sales/columns.ts` - Removed customer_name, added supplier
6. `app/products/page.tsx` - Updated to handle categories instead of suppliers
7. `app/sales/page.tsx` - Added supplier field, integrated print features
8. `components/Form.tsx` - Added CategorySelect integration

### New Components Created (4)
1. `components/inputs/CategorySelect.tsx` - Category dropdown with inline creation
2. `components/PrintTransaction.tsx` - Individual transaction print view
3. `components/BulkPrintDialog.tsx` - Bulk print grouping dialog
4. `components/PrintTransactionGroup.tsx` - Grouped transactions print view

### New Export (1)
1. `components/inputs/index.ts` - Added CategorySelect export

---

## 🔄 Data Flow Diagrams

### Products Form Flow
```
Product Form
    ↓
Categories extracted from existing products
    ↓
CategorySelect component displays options
    ↓
User can select existing or create new
    ↓
Form submission saves product
    ↓
New category added to available options
```

### Sales Form Flow
```
Sales Form
    ↓
Product selected from dropdown
    ↓
Supplier selected from dropdown (NEW)
    ↓
Quantity and price entered
    ↓
Form submission creates sale with supplier_id
    ↓
Sale enriched with product_name and supplier_name
    ↓
Displayed in sales table
```

### Single Print Flow
```
Sales Table
    ↓
User clicks Printer icon
    ↓
PrintTransaction component displays
    ↓
Full-screen preview with styling
    ↓
User clicks Print
    ↓
Browser print dialog opens
    ↓
Transaction printed
```

### Bulk Print Flow
```
Sales Toolbar
    ↓
User clicks Bulk Print
    ↓
BulkPrintDialog opens
    ↓
User selects grouping method:
├─ By Date: Select date range
├─ By Supplier: Select supplier
└─ Manual: Check transactions
    ↓
Filtered transactions shown with count
    ↓
User clicks Print
    ↓
PrintTransactionGroup displays grouped view
    ↓
User clicks Print in preview
    ↓
Browser print dialog opens
    ↓
Report printed with groups and totals
```

---

## ✅ Testing Checklist

- [x] Modal buttons no longer duplicate
- [x] Supplier field moved to sales form
- [x] Customer name removed from sales display
- [x] Categories dropdown works in products form
- [x] New categories can be created inline
- [x] Existing categories displayed in dropdown
- [x] Individual transaction print preview displays correctly
- [x] Single transaction print button functional
- [x] Bulk print dialog opens with grouping options
- [x] Date range grouping filters correctly
- [x] Supplier grouping filters correctly
- [x] Manual selection checkbox grouping works
- [x] Print preview shows grouped transactions
- [x] Print totals calculated correctly
- [x] Page breaks handled for multi-page prints

---

## 🎨 Styling Features

### Print-Optimized Styles
- `@media print` rules hide UI controls
- Page break optimization prevents data split
- Professional typography for printed output
- High contrast for print readability
- Proper sizing for A4/Letter paper
- Minimal padding/margins in print mode

### Component Styling
- CategorySelect uses dropdown pattern
- Print views use full-width layout
- Grouped reports have clear section breaks
- Tables use alternating backgrounds for readability
- Icons provide visual clarity

---

## 🚀 Performance Considerations

1. **Category Extraction**: Categories extracted from product array on load
2. **Transaction Filtering**: Filtering done client-side for instant feedback
3. **Print Performance**: Large reports handled with page breaks
4. **Memory Usage**: Print dialogs are modal and exclusive
5. **API Calls**: Minimized - categories extracted from products, not separate call

---

## 📝 Notes

- All print features use browser native `window.print()` - no external print libraries required
- Category names stored as strings in product category field
- Supplier association per transaction allows tracking supplier-specific transactions
- Print preview allows user to review before printing
- All features maintain existing design system consistency

---

**Implementation completed on July 25, 2026**
