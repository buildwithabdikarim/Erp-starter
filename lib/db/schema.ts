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
    code: varchar('code', { length: 50 }).notNull().unique(),
    name: varchar('name', { length: 255 }).notNull(),
    email: varchar('email', { length: 255 }),
    phone: varchar('phone', { length: 20 }),
    address: text('address'),
    city: varchar('city', { length: 100 }),
    state: varchar('state', { length: 100 }),
    country: varchar('country', { length: 100 }),
    postalCode: varchar('postalCode', { length: 20 }),
    status: varchar('status', { length: 20 }).notNull().default('active'),
    deletedAt: timestamp('deletedAt'),
    createdAt: timestamp('createdAt').notNull().defaultNow(),
    updatedAt: timestamp('updatedAt').notNull().defaultNow(),
  }
)

// Products/Items
export const product = pgTable(
  'product',
  {
    id: text('id').primaryKey().default(sql`gen_random_uuid()::text`),
    code: varchar('code', { length: 50 }).notNull().unique(),
    sku: varchar('sku', { length: 100 }).notNull().unique(),
    name: varchar('name', { length: 255 }).notNull(),
    description: text('description'),
    category: varchar('category', { length: 100 }),
    unit: varchar('unit', { length: 50 }).notNull().default('piece'),
    costPrice: numeric('costPrice', { precision: 12, scale: 2 }),
    sellingPrice: numeric('sellingPrice', { precision: 12, scale: 2 }),
    reorderLevel: integer('reorderLevel').notNull().default(10),
    reorderQuantity: integer('reorderQuantity').default(50),
    status: varchar('status', { length: 20 }).notNull().default('active'),
    deletedAt: timestamp('deletedAt'),
    createdAt: timestamp('createdAt').notNull().defaultNow(),
    updatedAt: timestamp('updatedAt').notNull().defaultNow(),
  }
)

// Warehouses
export const warehouse = pgTable(
  'warehouse',
  {
    id: text('id').primaryKey().default(sql`gen_random_uuid()::text`),
    code: varchar('code', { length: 50 }).notNull().unique(),
    name: varchar('name', { length: 255 }).notNull(),
    location: text('location'),
    capacity: integer('capacity'),
    status: varchar('status', { length: 20 }).notNull().default('active'),
    deletedAt: timestamp('deletedAt'),
    createdAt: timestamp('createdAt').notNull().defaultNow(),
    updatedAt: timestamp('updatedAt').notNull().defaultNow(),
  }
)

// Inventory/Stock
export const inventory = pgTable(
  'inventory',
  {
    id: text('id').primaryKey().default(sql`gen_random_uuid()::text`),
    productId: text('productId').notNull(),
    warehouseId: text('warehouseId').notNull(),
    quantity: integer('quantity').notNull().default(0),
    reservedQuantity: integer('reservedQuantity').notNull().default(0),
    availableQuantity: integer('availableQuantity').notNull().default(0),
    lastCountDate: timestamp('lastCountDate'),
    lastMovementDate: timestamp('lastMovementDate'),
    deletedAt: timestamp('deletedAt'),
    createdAt: timestamp('createdAt').notNull().defaultNow(),
    updatedAt: timestamp('updatedAt').notNull().defaultNow(),
  },
  (table) => [
    index('idx_inventory_productId').on(table.productId),
    index('idx_inventory_warehouseId').on(table.warehouseId),
  ]
)

// Stock Movements (Audit trail for all inventory changes)
export const stockMovement = pgTable(
  'stockMovement',
  {
    id: text('id').primaryKey().default(sql`gen_random_uuid()::text`),
    productId: text('productId').notNull(),
    warehouseId: text('warehouseId').notNull(),
    movementType: varchar('movementType', { length: 50 }).notNull(),
    quantity: integer('quantity').notNull(),
    referenceType: varchar('referenceType', { length: 50 }),
    referenceId: text('referenceId'),
    notes: text('notes'),
    createdBy: text('createdBy').notNull(),
    deletedAt: timestamp('deletedAt'),
    createdAt: timestamp('createdAt').notNull().defaultNow(),
  },
  (table) => [
    index('idx_stockMovement_productId').on(table.productId),
    index('idx_stockMovement_warehouseId').on(table.warehouseId),
  ]
)

// Purchase Orders
export const purchaseOrder = pgTable(
  'purchaseOrder',
  {
    id: text('id').primaryKey().default(sql`gen_random_uuid()::text`),
    code: varchar('code', { length: 50 }).notNull().unique(),
    supplierId: text('supplierId').notNull(),
    warehouseId: text('warehouseId').notNull(),
    orderDate: timestamp('orderDate').notNull().defaultNow(),
    expectedDeliveryDate: timestamp('expectedDeliveryDate'),
    actualDeliveryDate: timestamp('actualDeliveryDate'),
    subtotal: numeric('subtotal', { precision: 15, scale: 2 }).notNull(),
    tax: numeric('tax', { precision: 15, scale: 2 }).default(0),
    totalAmount: numeric('totalAmount', { precision: 15, scale: 2 }).notNull(),
    status: varchar('status', { length: 50 }).notNull().default('draft'),
    notes: text('notes'),
    createdBy: text('createdBy').notNull(),
    deletedAt: timestamp('deletedAt'),
    createdAt: timestamp('createdAt').notNull().defaultNow(),
    updatedAt: timestamp('updatedAt').notNull().defaultNow(),
  },
  (table) => [
    index('idx_purchaseOrder_supplierId').on(table.supplierId),
    index('idx_purchaseOrder_status').on(table.status),
  ]
)

// Purchase Order Line Items
export const purchaseOrderLineItem = pgTable(
  'purchaseOrderLineItem',
  {
    id: text('id').primaryKey().default(sql`gen_random_uuid()::text`),
    purchaseOrderId: text('purchaseOrderId').notNull(),
    productId: text('productId').notNull(),
    quantity: integer('quantity').notNull(),
    unitPrice: numeric('unitPrice', { precision: 15, scale: 2 }).notNull(),
    lineTotal: numeric('lineTotal', { precision: 15, scale: 2 }).notNull(),
    receivedQuantity: integer('receivedQuantity').default(0),
    deletedAt: timestamp('deletedAt'),
    createdAt: timestamp('createdAt').notNull().defaultNow(),
    updatedAt: timestamp('updatedAt').notNull().defaultNow(),
  },
  (table) => [
    index('idx_purchaseOrderItem_purchaseOrderId').on(table.purchaseOrderId),
  ]
)

// Sales Orders
export const salesOrder = pgTable(
  'salesOrder',
  {
    id: text('id').primaryKey().default(sql`gen_random_uuid()::text`),
    code: varchar('code', { length: 50 }).notNull().unique(),
    customerName: varchar('customerName', { length: 255 }).notNull(),
    customerEmail: varchar('customerEmail', { length: 255 }),
    customerPhone: varchar('customerPhone', { length: 20 }),
    orderDate: timestamp('orderDate').notNull().defaultNow(),
    shipDate: timestamp('shipDate'),
    deliveryDate: timestamp('deliveryDate'),
    subtotal: numeric('subtotal', { precision: 15, scale: 2 }).notNull(),
    tax: numeric('tax', { precision: 15, scale: 2 }).default(0),
    totalAmount: numeric('totalAmount', { precision: 15, scale: 2 }).notNull(),
    status: varchar('status', { length: 50 }).notNull().default('draft'),
    paymentStatus: varchar('paymentStatus', { length: 50 }).notNull().default('unpaid'),
    notes: text('notes'),
    createdBy: text('createdBy').notNull(),
    deletedAt: timestamp('deletedAt'),
    createdAt: timestamp('createdAt').notNull().defaultNow(),
    updatedAt: timestamp('updatedAt').notNull().defaultNow(),
  },
  (table) => [
    index('idx_salesOrder_status').on(table.status),
  ]
)

// Sales Order Line Items
export const salesOrderLineItem = pgTable(
  'salesOrderLineItem',
  {
    id: text('id').primaryKey().default(sql`gen_random_uuid()::text`),
    salesOrderId: text('salesOrderId').notNull(),
    productId: text('productId').notNull(),
    quantity: integer('quantity').notNull(),
    unitPrice: numeric('unitPrice', { precision: 15, scale: 2 }).notNull(),
    lineTotal: numeric('lineTotal', { precision: 15, scale: 2 }).notNull(),
    shippedQuantity: integer('shippedQuantity').default(0),
    deletedAt: timestamp('deletedAt'),
    createdAt: timestamp('createdAt').notNull().defaultNow(),
    updatedAt: timestamp('updatedAt').notNull().defaultNow(),
  },
  (table) => [
    index('idx_salesOrderItem_salesOrderId').on(table.salesOrderId),
  ]
)
