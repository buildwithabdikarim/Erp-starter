import {
  pgTable,
  text,
  timestamp,
  boolean,
  numeric,
  integer,
  varchar,
  jsonb,
  index,
} from 'drizzle-orm/pg-core'
import { sql } from 'drizzle-orm'

// --- Better Auth required tables -------------------------------------------
// Column names are camelCase to match Better Auth's defaults. Do not rename.

export const user = pgTable('user', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  emailVerified: boolean('emailVerified').notNull().default(false),
  image: text('image'),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt').notNull().defaultNow(),
})

export const session = pgTable('session', {
  id: text('id').primaryKey(),
  expiresAt: timestamp('expiresAt').notNull(),
  token: text('token').notNull().unique(),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt').notNull().defaultNow(),
  ipAddress: text('ipAddress'),
  userAgent: text('userAgent'),
  userId: text('userId')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
})

export const account = pgTable('account', {
  id: text('id').primaryKey(),
  accountId: text('accountId').notNull(),
  providerId: text('providerId').notNull(),
  userId: text('userId')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  accessToken: text('accessToken'),
  refreshToken: text('refreshToken'),
  idToken: text('idToken'),
  accessTokenExpiresAt: timestamp('accessTokenExpiresAt'),
  refreshTokenExpiresAt: timestamp('refreshTokenExpiresAt'),
  scope: text('scope'),
  password: text('password'),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt').notNull().defaultNow(),
})

export const verification = pgTable('verification', {
  id: text('id').primaryKey(),
  identifier: text('identifier').notNull(),
  value: text('value').notNull(),
  expiresAt: timestamp('expiresAt').notNull(),
  createdAt: timestamp('createdAt').defaultNow(),
  updatedAt: timestamp('updatedAt').defaultNow(),
})

// --- RBAC Tables -------------------------------------------

export const role = pgTable('role', {
  id: text('id').primaryKey().default(sql`gen_random_uuid()::text`),
  name: varchar('name', { length: 100 }).notNull().unique(),
  description: text('description'),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt').notNull().defaultNow(),
})

export const permission = pgTable('permission', {
  id: text('id').primaryKey().default(sql`gen_random_uuid()::text`),
  name: varchar('name', { length: 100 }).notNull().unique(),
  description: text('description'),
  module: varchar('module', { length: 100 }).notNull(), // e.g., 'products', 'sales', 'inventory'
  action: varchar('action', { length: 50 }).notNull(), // e.g., 'create', 'read', 'update', 'delete'
  createdAt: timestamp('createdAt').notNull().defaultNow(),
})

export const rolePermission = pgTable('rolePermission', {
  id: text('id').primaryKey().default(sql`gen_random_uuid()::text`),
  roleId: text('roleId')
    .notNull()
    .references(() => role.id, { onDelete: 'cascade' }),
  permissionId: text('permissionId')
    .notNull()
    .references(() => permission.id, { onDelete: 'cascade' }),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
})

export const userRole = pgTable('userRole', {
  id: text('id').primaryKey().default(sql`gen_random_uuid()::text`),
  userId: text('userId')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  roleId: text('roleId')
    .notNull()
    .references(() => role.id, { onDelete: 'cascade' }),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
})

// --- Audit Log Tables -------------------------------------------

export const auditLog = pgTable('auditLog', {
  id: text('id').primaryKey().default(sql`gen_random_uuid()::text`),
  userId: text('userId').notNull(),
  action: varchar('action', { length: 50 }).notNull(), // 'CREATE', 'UPDATE', 'DELETE'
  module: varchar('module', { length: 100 }).notNull(),
  entityId: text('entityId').notNull(),
  entityType: varchar('entityType', { length: 100 }).notNull(),
  changes: jsonb('changes'), // Previous and new values
  ipAddress: text('ipAddress'),
  userAgent: text('userAgent'),
  status: varchar('status', { length: 20 }).notNull().default('success'), // 'success' or 'failed'
  errorMessage: text('errorMessage'),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
})

// --- Core Business Entities -------------------------------------------

// Suppliers
export const supplier = pgTable(
  'supplier',
  {
    id: text('id').primaryKey().default(sql`gen_random_uuid()::text`),
    userId: text('userId').notNull(), // Who created/owns this
    name: varchar('name', { length: 255 }).notNull(),
    email: varchar('email', { length: 255 }),
    phone: varchar('phone', { length: 20 }),
    address: text('address'),
    city: varchar('city', { length: 100 }),
    state: varchar('state', { length: 100 }),
    country: varchar('country', { length: 100 }),
    zipCode: varchar('zipCode', { length: 20 }),
    paymentTerms: varchar('paymentTerms', { length: 100 }),
    rating: numeric('rating', { precision: 3, scale: 2 }), // 0-5 stars
    notes: text('notes'),
    isActive: boolean('isActive').notNull().default(true),
    deletedAt: timestamp('deletedAt'), // Soft delete
    createdAt: timestamp('createdAt').notNull().defaultNow(),
    updatedAt: timestamp('updatedAt').notNull().defaultNow(),
  },
  (table) => [index('supplier_userId_idx').on(table.userId)]
)

// Products/Items
export const product = pgTable(
  'product',
  {
    id: text('id').primaryKey().default(sql`gen_random_uuid()::text`),
    userId: text('userId').notNull(),
    sku: varchar('sku', { length: 100 }).notNull().unique(),
    name: varchar('name', { length: 255 }).notNull(),
    description: text('description'),
    category: varchar('category', { length: 100 }),
    unit: varchar('unit', { length: 50 }).notNull(), // 'pcs', 'kg', 'liter', etc.
    costPrice: numeric('costPrice', { precision: 12, scale: 2 }),
    sellingPrice: numeric('sellingPrice', { precision: 12, scale: 2 }),
    reorderLevel: integer('reorderLevel').notNull().default(10),
    isActive: boolean('isActive').notNull().default(true),
    deletedAt: timestamp('deletedAt'), // Soft delete
    createdAt: timestamp('createdAt').notNull().defaultNow(),
    updatedAt: timestamp('updatedAt').notNull().defaultNow(),
  },
  (table) => [index('product_userId_idx').on(table.userId)]
)

// Warehouses
export const warehouse = pgTable(
  'warehouse',
  {
    id: text('id').primaryKey().default(sql`gen_random_uuid()::text`),
    userId: text('userId').notNull(),
    name: varchar('name', { length: 255 }).notNull(),
    location: text('location'),
    capacity: integer('capacity'), // In some unit
    manager: varchar('manager', { length: 255 }),
    isActive: boolean('isActive').notNull().default(true),
    createdAt: timestamp('createdAt').notNull().defaultNow(),
    updatedAt: timestamp('updatedAt').notNull().defaultNow(),
  },
  (table) => [index('warehouse_userId_idx').on(table.userId)]
)

// Inventory/Stock
export const inventory = pgTable(
  'inventory',
  {
    id: text('id').primaryKey().default(sql`gen_random_uuid()::text`),
    userId: text('userId').notNull(),
    productId: text('productId')
      .notNull()
      .references(() => product.id),
    warehouseId: text('warehouseId')
      .notNull()
      .references(() => warehouse.id),
    quantity: numeric('quantity', { precision: 15, scale: 4 }).notNull().default(0),
    reservedQuantity: numeric('reservedQuantity', {
      precision: 15,
      scale: 4,
    }).default(0),
    lastCountedAt: timestamp('lastCountedAt'),
    createdAt: timestamp('createdAt').notNull().defaultNow(),
    updatedAt: timestamp('updatedAt').notNull().defaultNow(),
  },
  (table) => [
    index('inventory_userId_idx').on(table.userId),
    index('inventory_productId_idx').on(table.productId),
    index('inventory_warehouseId_idx').on(table.warehouseId),
  ]
)

// Stock Movements (Audit trail for all inventory changes)
export const stockMovement = pgTable(
  'stockMovement',
  {
    id: text('id').primaryKey().default(sql`gen_random_uuid()::text`),
    userId: text('userId').notNull(),
    productId: text('productId')
      .notNull()
      .references(() => product.id),
    warehouseId: text('warehouseId')
      .notNull()
      .references(() => warehouse.id),
    type: varchar('type', { length: 50 }).notNull(), // 'IN', 'OUT', 'ADJUSTMENT', 'TRANSFER'
    quantity: numeric('quantity', { precision: 15, scale: 4 }).notNull(),
    reference: varchar('reference', { length: 100 }), // PO#, SO#, etc.
    notes: text('notes'),
    createdAt: timestamp('createdAt').notNull().defaultNow(),
  },
  (table) => [
    index('stockMovement_userId_idx').on(table.userId),
    index('stockMovement_productId_idx').on(table.productId),
    index('stockMovement_type_idx').on(table.type),
  ]
)

// Purchase Orders
export const purchaseOrder = pgTable(
  'purchaseOrder',
  {
    id: text('id').primaryKey().default(sql`gen_random_uuid()::text`),
    userId: text('userId').notNull(),
    poNumber: varchar('poNumber', { length: 100 }).notNull().unique(),
    supplierId: text('supplierId')
      .notNull()
      .references(() => supplier.id),
    orderDate: timestamp('orderDate').notNull().defaultNow(),
    expectedDeliveryDate: timestamp('expectedDeliveryDate'),
    status: varchar('status', { length: 50 }).notNull().default('draft'), // draft, submitted, confirmed, received, cancelled
    totalAmount: numeric('totalAmount', { precision: 15, scale: 2 }).default(0),
    notes: text('notes'),
    deletedAt: timestamp('deletedAt'), // Soft delete
    createdAt: timestamp('createdAt').notNull().defaultNow(),
    updatedAt: timestamp('updatedAt').notNull().defaultNow(),
  },
  (table) => [
    index('purchaseOrder_userId_idx').on(table.userId),
    index('purchaseOrder_supplierId_idx').on(table.supplierId),
  ]
)

// Purchase Order Line Items
export const purchaseOrderLineItem = pgTable(
  'purchaseOrderLineItem',
  {
    id: text('id').primaryKey().default(sql`gen_random_uuid()::text`),
    userId: text('userId').notNull(),
    purchaseOrderId: text('purchaseOrderId')
      .notNull()
      .references(() => purchaseOrder.id, { onDelete: 'cascade' }),
    productId: text('productId')
      .notNull()
      .references(() => product.id),
    quantity: numeric('quantity', { precision: 15, scale: 4 }).notNull(),
    unitPrice: numeric('unitPrice', { precision: 12, scale: 2 }).notNull(),
    lineTotal: numeric('lineTotal', { precision: 15, scale: 2 }).notNull(),
    receivedQuantity: numeric('receivedQuantity', {
      precision: 15,
      scale: 4,
    }).default(0),
    createdAt: timestamp('createdAt').notNull().defaultNow(),
    updatedAt: timestamp('updatedAt').notNull().defaultNow(),
  },
  (table) => [
    index('poLineItem_userId_idx').on(table.userId),
    index('poLineItem_poId_idx').on(table.purchaseOrderId),
  ]
)

// Sales Orders
export const salesOrder = pgTable(
  'salesOrder',
  {
    id: text('id').primaryKey().default(sql`gen_random_uuid()::text`),
    userId: text('userId').notNull(),
    soNumber: varchar('soNumber', { length: 100 }).notNull().unique(),
    customerName: varchar('customerName', { length: 255 }).notNull(),
    customerEmail: varchar('customerEmail', { length: 255 }),
    orderDate: timestamp('orderDate').notNull().defaultNow(),
    deliveryDate: timestamp('deliveryDate'),
    status: varchar('status', { length: 50 }).notNull().default('draft'), // draft, confirmed, shipped, delivered, cancelled
    totalAmount: numeric('totalAmount', { precision: 15, scale: 2 }).default(0),
    notes: text('notes'),
    deletedAt: timestamp('deletedAt'), // Soft delete
    createdAt: timestamp('createdAt').notNull().defaultNow(),
    updatedAt: timestamp('updatedAt').notNull().defaultNow(),
  },
  (table) => [index('salesOrder_userId_idx').on(table.userId)]
)

// Sales Order Line Items
export const salesOrderLineItem = pgTable(
  'salesOrderLineItem',
  {
    id: text('id').primaryKey().default(sql`gen_random_uuid()::text`),
    userId: text('userId').notNull(),
    salesOrderId: text('salesOrderId')
      .notNull()
      .references(() => salesOrder.id, { onDelete: 'cascade' }),
    productId: text('productId')
      .notNull()
      .references(() => product.id),
    quantity: numeric('quantity', { precision: 15, scale: 4 }).notNull(),
    unitPrice: numeric('unitPrice', { precision: 12, scale: 2 }).notNull(),
    lineTotal: numeric('lineTotal', { precision: 15, scale: 2 }).notNull(),
    shippedQuantity: numeric('shippedQuantity', {
      precision: 15,
      scale: 4,
    }).default(0),
    createdAt: timestamp('createdAt').notNull().defaultNow(),
    updatedAt: timestamp('updatedAt').notNull().defaultNow(),
  },
  (table) => [
    index('soLineItem_userId_idx').on(table.userId),
    index('soLineItem_soId_idx').on(table.salesOrderId),
  ]
)
