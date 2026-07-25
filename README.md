# ERP Frontend - Configuration-Driven Enterprise Management System

A powerful, reusable ERP framework demonstrating **configuration-driven architecture** and **enterprise-grade component patterns** built with Next.js 16, React 19, and TailwindCSS v4.

## Philosophy

This ERP system is built on the principle of **separating configuration from implementation**. Instead of writing new UI code for each module, we define:

- **Form configurations** that auto-generate forms with validation
- **Table configurations** that produce fully-featured data tables
- **Modal configurations** for consistent dialogs
- **API services** that can be easily swapped with real backends

Adding a new module requires only creating a configuration file—no new UI component code needed.

## Project Structure

```
/vercel/share/v0-project
├── app/
│   ├── page.tsx              # Dashboard with analytics
│   ├── products/             # Products CRUD module
│   │   └── page.tsx
│   ├── suppliers/            # Suppliers CRUD module
│   │   └── page.tsx
│   ├── places/               # Places CRUD module
│   │   └── page.tsx
│   ├── layout.tsx            # Root layout
│   └── globals.css           # TailwindCSS v4 with design tokens
│
├── components/               # Reusable generic components
│   ├── Button.tsx            # Button with variants & loading states
│   ├── Card.tsx              # Card with header/content/footer
│   ├── Modal.tsx             # Modal with escape key handling
│   ├── Form.tsx              # Configuration-driven form renderer
│   ├── Table.tsx             # TanStack Table wrapper with sorting/pagination
│   ├── Alert.tsx             # Alert & Toast notifications
│   ├── Layout.tsx            # Main sidebar layout
│   ├── inputs/               # Input components (Text, Select, TextArea, Checkbox)
│   └── index.ts              # Barrel exports
│
├── config/                   # Module configuration files
│   ├── productConfig.ts      # Product form & table configs
│   ├── supplierConfig.ts     # Supplier form & table configs
│   └── placeConfig.ts        # Place form & table configs
│
├── services/
│   └── api.ts               # Mock API service layer (easily replaceable)
│
├── types/
│   └── index.ts             # TypeScript types for forms, tables, entities
│
├── constants/
│   └── index.ts             # UI constants, statuses, messages, field types
│
├── hooks/
│   ├── useModal.ts          # Modal state management hook
│   ├── useNotification.ts   # Toast notification system hook
│   └── index.ts
│
└── package.json
```

## Technology Stack

- **Next.js 16** - App Router, Server Components, optimized builds
- **React 19** - Latest React features and stability
- **TailwindCSS v4** - Utility-first styling with design tokens
- **TypeScript 5.7** - Type-safe development
- **React Hook Form** - Efficient form state management
- **Zod** - TypeScript-first schema validation
- **TanStack Table v8** - Headless table library with advanced features
- **Lucide React** - Icon library

## Key Features

### 1. **Generic Reusable Components**

All components are configuration-driven:

- **Form** - Renders from config, auto-validates with Zod
- **Table** - Sorting, pagination, filtering, column sizing from config
- **Modal** - Configurable sizing, escape handling, transitions
- **Inputs** - Text, Email, Select, TextArea, Checkbox with consistent styling
- **Button** - Multiple variants, loading states, icons
- **Card** - Flexible container with padding options
- **Layout** - Collapsible sidebar, responsive header

### 2. **Configuration-Driven Architecture**

Example - adding a new field to the Products form:

```typescript
// No component changes needed!
// Just update productConfig.ts
{
  name: 'newField',
  label: 'New Field Label',
  type: 'text',
  required: true,
  validation: z.string().min(1),
}
```

### 3. **Type-Safe Development**

- Full TypeScript coverage
- Zod schema validation for forms
- Type-safe API responses
- Proper inference for form/table configs

### 4. **Mock API Service Layer**

The `services/api.ts` file provides:

- CRUD operations for Products, Suppliers, Places
- Realistic async delays (simulates network latency)
- Proper error handling
- Easy to replace with real backend

### 5. **Notification System**

Built-in toast notifications with:

- Success, Error, Warning, Info types
- Auto-dismiss or manual control
- Full accessibility features

### 6. **Enterprise UI Patterns**

- Responsive grid layouts
- Dark mode support
- Semantic HTML
- ARIA attributes
- Keyboard navigation (Escape to close modals)

## Running the Application

### Development

```bash
# Install dependencies
pnpm install

# Start dev server
pnpm dev
```

Visit `http://localhost:3000`

### Production Build

```bash
# Build for production
pnpm build

# Start production server
pnpm start
```

### TypeScript Check

```bash
# Type check without building
pnpm exec tsc --noEmit
```

## Module Architecture

Each module follows the same pattern:

### 1. **Configuration** (`config/productConfig.ts`)

```typescript
export const productFormConfig: FormConfig = {
  fields: [
    { name: 'name', label: 'Product Name', type: 'text', required: true },
    // ... more fields
  ],
  submitLabel: 'Save Product',
}

export const getProductTableConfig = (data) => ({
  columns: [
    { id: 'name', header: 'Product Name', accessor: 'name', sortable: true },
    // ... more columns
  ],
  // ... table settings
})
```

### 2. **Page Component** (`app/products/page.tsx`)

```typescript
'use client'

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const modal = useModal()
  const { notifications, add } = useNotification()

  // Load data
  useEffect(() => {
    loadProducts()
  }, [])

  // CRUD operations
  const handleSubmit = async (data) => {
    const result = await productAPI.create(data)
    // Handle response
  }

  return (
    <Layout>
      {/* Header */}
      {/* Notifications */}
      {/* Table with CRUD actions */}
      {/* Modal with Form */}
    </Layout>
  )
}
```

## Adding a New Module

To add a new module (e.g., "Orders"):

### Step 1: Define Types

```typescript
// types/index.ts
export interface Order extends BaseEntity {
  orderNumber: string
  customer: string
  total: number
  status: 'pending' | 'shipped' | 'delivered'
  // ... more fields
}
```

### Step 2: Create Configuration

```typescript
// config/orderConfig.ts
export const orderFormConfig: FormConfig = {
  fields: [
    { name: 'orderNumber', label: 'Order #', type: 'text', required: true },
    // ... more fields
  ],
}

export const getOrderTableConfig = (data) => ({
  columns: [ /* ... */ ],
  // ...
})
```

### Step 3: Add API Service

```typescript
// services/api.ts - add to existing file
export const orderAPI = {
  async getAll() { /* ... */ },
  async create(data) { /* ... */ },
  async update(id, data) { /* ... */ },
  async delete(id) { /* ... */ },
}
```

### Step 4: Create Page Component

```typescript
// app/orders/page.tsx
// Copy/paste from products/page.tsx and replace API/config
```

### Step 5: Update Navigation

```typescript
// components/Layout.tsx - add NavLink for /orders
<NavLink href={ROUTES.orders} label="Orders" />
```

## Design System

### Colors (TailwindCSS v4 Design Tokens)

- **Primary**: For main actions and highlights
- **Secondary**: For secondary actions
- **Destructive**: For delete/warning actions
- **Muted**: For disabled/secondary text
- **Accent**: For highlights and important elements
- **Background/Foreground**: Base theme colors
- **Border/Input**: For form elements
- **Ring**: For focus states

### Typography

- **Headings**: Using system fonts
- **Body**: Readable line heights (1.4-1.6)
- **Font Sizes**: Responsive scaling with TailwindCSS

### Spacing

Uses TailwindCSS spacing scale (4px base unit):
- `gap-4` for content spacing
- `p-6` for padding
- `mb-2` for margins

### Responsive Design

Built mobile-first:

```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
  {/* Mobile: 1 column, Tablet: 2, Desktop: 4 */}
</div>
```

## Validation

Form validation uses **Zod** schemas:

```typescript
{
  name: 'email',
  label: 'Email',
  type: 'email',
  validation: z.string().email('Invalid email address'),
}
```

Validation is triggered:
- On form submission
- On blur for inputs
- Updates clear when user starts typing

## Performance Optimizations

1. **Component Splitting** - Generic components used across modules
2. **Memoization** - TanStack Table memoizes configurations
3. **Lazy Loading** - Modal content only renders when open
4. **CSS-in-JS** - TailwindCSS generates only used styles
5. **Static Generation** - Pages pre-rendered at build time
6. **Image Optimization** - Next.js Image component ready

## Security Considerations

When integrating with a real backend:

1. **Input Validation** - Already implemented with Zod
2. **CSRF Protection** - Add with middleware
3. **Rate Limiting** - Implement on backend
4. **Authentication** - Add session/JWT handling
5. **Authorization** - Check user permissions in API
6. **SQL Injection** - Use parameterized queries (backend)
7. **XSS Protection** - React handles this automatically

## Accessibility

The application includes:

- Semantic HTML (`<header>`, `<main>`, `<nav>`)
- ARIA labels and roles
- Keyboard navigation (Tab, Enter, Escape)
- Focus management in modals
- Color contrast compliance
- Screen reader text support

## Testing Strategy

Recommended testing approach:

```typescript
// Unit tests for validators
test('Product validator', () => {
  expect(productSchema.parse({ name: 'Test' })).toBeDefined()
})

// Component tests for forms/tables
test('Product form renders', () => {
  render(<Form config={productFormConfig} />)
  expect(screen.getByText('Product Name')).toBeInTheDocument()
})

// Integration tests for CRUD flows
test('Create product flow', async () => {
  // Fill form -> submit -> verify table update
})
```

## Future Enhancements

1. **Real Backend Integration** - Replace mock API with actual endpoints
2. **Authentication** - Add user login and session management
3. **Role-Based Access Control** - Restrict features by user role
4. **Advanced Filtering** - Complex filter UI with date ranges, multi-select
5. **Bulk Operations** - Select multiple rows for batch actions
6. **Export/Import** - CSV export, Excel import
7. **Search** - Full-text search across modules
8. **Caching** - SWR for data synchronization
9. **Offline Support** - Service worker for offline capability
10. **Analytics Dashboard** - Charts and metrics visualization

## Deployment

### Vercel (Recommended)

```bash
# Push to GitHub
git push

# Deploy from Vercel dashboard
# Automatic deployments on push to main
```

### Docker

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN pnpm install
COPY . .
RUN pnpm build
CMD ["pnpm", "start"]
```

```bash
docker build -t erp-system .
docker run -p 3000:3000 erp-system
```

## Troubleshooting

**Port already in use**
```bash
lsof -i :3000
kill -9 <PID>
```

**TypeScript errors**
```bash
pnpm exec tsc --noEmit
```

**Build failures**
```bash
rm -rf .next node_modules
pnpm install
pnpm build
```

## License

This project demonstrates enterprise architecture patterns and is provided as-is for educational purposes.

## Summary

This ERP system showcases:

✅ Configuration-driven component architecture  
✅ Enterprise CRUD patterns  
✅ Type-safe forms with validation  
✅ Advanced table features (sorting, pagination, filtering)  
✅ Responsive design with TailwindCSS  
✅ Production-ready Next.js setup  
✅ Mock API easily replaceable  
✅ Accessibility compliance  
✅ Notification system  
✅ Dark mode support  

**The core philosophy**: Build features through configuration, not code duplication.
# Erp-starter
