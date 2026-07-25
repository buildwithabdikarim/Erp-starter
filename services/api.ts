import { Product, Supplier, Sale, ApiResponse, PaginatedResponse } from '@/types'

// Mock data storage
const mockSuppliers: Supplier[] = [
  {
    id: '1',
    name: 'Tech Global Inc.',
    email: 'contact@techglobal.com',
    phone: '+1-555-0123',
    address: '123 Tech Street',
    createdAt: new Date().toISOString(),
  },
  {
    id: '2',
    name: 'Accessory World',
    email: 'sales@accessoryworld.com',
    phone: '+1-555-0456',
    address: '456 Accessory Ave',
    createdAt: new Date().toISOString(),
  },
]

const mockProducts: Product[] = [
  {
    id: '1',
    name: 'Laptop Pro',
    category: 'Electronics',
    supplier_id: '1',
    cost_price: 800.0,
    selling_price: 1299.99,
    quantity: 45,
    createdAt: new Date().toISOString(),
  },
  {
    id: '2',
    name: 'Wireless Mouse',
    category: 'Accessories',
    supplier_id: '2',
    cost_price: 15.0,
    selling_price: 29.99,
    quantity: 150,
    createdAt: new Date().toISOString(),
  },
]

const mockSales: Sale[] = [
  {
    id: '1',
    customer_name: 'Acme Corp',
    product_id: '1',
    quantity: 2,
    unit_price: 1299.99,
    total_amount: 2599.98,
    sale_date: new Date().toISOString().split('T')[0],
    createdAt: new Date().toISOString(),
  },
  {
    id: '2',
    customer_name: 'John Smith',
    product_id: '2',
    quantity: 5,
    unit_price: 29.99,
    total_amount: 149.95,
    sale_date: new Date(Date.now() - 86400000).toISOString().split('T')[0],
    createdAt: new Date().toISOString(),
  },
]

// ============================================================================
// Product API
// ============================================================================

export const productAPI = {
  async getAll(page: number = 1, pageSize: number = 10): Promise<PaginatedResponse<Product & { supplier_name: string }>> {
    await new Promise((resolve) => setTimeout(resolve, 300))
    const enriched = mockProducts.map((p) => ({
      ...p,
      supplier_name: mockSuppliers.find((s) => s.id === p.supplier_id)?.name || 'Unknown',
    }))
    const start = (page - 1) * pageSize
    const end = start + pageSize
    return {
      data: enriched.slice(start, end),
      total: enriched.length,
      page,
      pageSize,
      totalPages: Math.ceil(enriched.length / pageSize),
    }
  },

  async getById(id: string): Promise<ApiResponse<Product>> {
    await new Promise((resolve) => setTimeout(resolve, 200))
    const product = mockProducts.find((p) => p.id === id)
    return product
      ? { success: true, data: product }
      : { success: false, error: 'Product not found' }
  },

  async create(data: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Promise<ApiResponse<Product>> {
    await new Promise((resolve) => setTimeout(resolve, 500))
    const newProduct: Product = {
      ...data,
      id: Math.random().toString(36).substr(2, 9),
      createdAt: new Date().toISOString(),
    }
    mockProducts.push(newProduct)
    return { success: true, data: newProduct, message: 'Product created successfully' }
  },

  async update(id: string, data: Partial<Product>): Promise<ApiResponse<Product>> {
    await new Promise((resolve) => setTimeout(resolve, 500))
    const index = mockProducts.findIndex((p) => p.id === id)
    if (index === -1) return { success: false, error: 'Product not found' }
    const updated = { ...mockProducts[index], ...data, id }
    mockProducts[index] = updated
    return { success: true, data: updated, message: 'Product updated successfully' }
  },

  async delete(id: string): Promise<ApiResponse<null>> {
    await new Promise((resolve) => setTimeout(resolve, 500))
    const index = mockProducts.findIndex((p) => p.id === id)
    if (index === -1) return { success: false, error: 'Product not found' }
    mockProducts.splice(index, 1)
    return { success: true, data: null, message: 'Product deleted successfully' }
  },
}

// ============================================================================
// Supplier API
// ============================================================================

export const supplierAPI = {
  async getAll(page: number = 1, pageSize: number = 10): Promise<PaginatedResponse<Supplier>> {
    await new Promise((resolve) => setTimeout(resolve, 300))
    const start = (page - 1) * pageSize
    const end = start + pageSize
    return {
      data: mockSuppliers.slice(start, end),
      total: mockSuppliers.length,
      page,
      pageSize,
      totalPages: Math.ceil(mockSuppliers.length / pageSize),
    }
  },

  async getById(id: string): Promise<ApiResponse<Supplier>> {
    await new Promise((resolve) => setTimeout(resolve, 200))
    const supplier = mockSuppliers.find((s) => s.id === id)
    return supplier
      ? { success: true, data: supplier }
      : { success: false, error: 'Supplier not found' }
  },

  async create(data: Omit<Supplier, 'id' | 'createdAt' | 'updatedAt'>): Promise<ApiResponse<Supplier>> {
    await new Promise((resolve) => setTimeout(resolve, 500))
    const newSupplier: Supplier = {
      ...data,
      id: Math.random().toString(36).substr(2, 9),
      createdAt: new Date().toISOString(),
    }
    mockSuppliers.push(newSupplier)
    return { success: true, data: newSupplier, message: 'Supplier created successfully' }
  },

  async update(id: string, data: Partial<Supplier>): Promise<ApiResponse<Supplier>> {
    await new Promise((resolve) => setTimeout(resolve, 500))
    const index = mockSuppliers.findIndex((s) => s.id === id)
    if (index === -1) return { success: false, error: 'Supplier not found' }
    const updated = { ...mockSuppliers[index], ...data, id }
    mockSuppliers[index] = updated
    return { success: true, data: updated, message: 'Supplier updated successfully' }
  },

  async delete(id: string): Promise<ApiResponse<null>> {
    await new Promise((resolve) => setTimeout(resolve, 500))
    const index = mockSuppliers.findIndex((s) => s.id === id)
    if (index === -1) return { success: false, error: 'Supplier not found' }
    mockSuppliers.splice(index, 1)
    return { success: true, data: null, message: 'Supplier deleted successfully' }
  },
}

// ============================================================================
// Sale API
// ============================================================================

export const saleAPI = {
  async getAll(page: number = 1, pageSize: number = 10): Promise<PaginatedResponse<Sale>> {
    await new Promise((resolve) => setTimeout(resolve, 300))
    const start = (page - 1) * pageSize
    const end = start + pageSize
    return {
      data: mockSales.slice(start, end),
      total: mockSales.length,
      page,
      pageSize,
      totalPages: Math.ceil(mockSales.length / pageSize),
    }
  },

  async getById(id: string): Promise<ApiResponse<Sale>> {
    await new Promise((resolve) => setTimeout(resolve, 200))
    const sale = mockSales.find((s) => s.id === id)
    return sale ? { success: true, data: sale } : { success: false, error: 'Sale not found' }
  },

  async create(data: Omit<Sale, 'id' | 'createdAt' | 'updatedAt'>): Promise<ApiResponse<Sale>> {
    await new Promise((resolve) => setTimeout(resolve, 500))
    const newSale: Sale = {
      ...data,
      id: Math.random().toString(36).substr(2, 9),
      createdAt: new Date().toISOString(),
    }
    mockSales.push(newSale)
    return { success: true, data: newSale, message: 'Sale created successfully' }
  },

  async update(id: string, data: Partial<Sale>): Promise<ApiResponse<Sale>> {
    await new Promise((resolve) => setTimeout(resolve, 500))
    const index = mockSales.findIndex((s) => s.id === id)
    if (index === -1) return { success: false, error: 'Sale not found' }
    const updated = { ...mockSales[index], ...data, id }
    mockSales[index] = updated
    return { success: true, data: updated, message: 'Sale updated successfully' }
  },

  async delete(id: string): Promise<ApiResponse<null>> {
    await new Promise((resolve) => setTimeout(resolve, 500))
    const index = mockSales.findIndex((s) => s.id === id)
    if (index === -1) return { success: false, error: 'Sale not found' }
    mockSales.splice(index, 1)
    return { success: true, data: null, message: 'Sale deleted successfully' }
  },
}
