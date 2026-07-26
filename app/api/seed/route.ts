import { db } from '@/lib/db'
import { user, role, permission, rolePermission, userRole, supplier, product, warehouse, inventory } from '@/lib/db/schema'

export async function POST(request: Request) {
  // Security check - only allow in development
  if (process.env.NODE_ENV === 'production') {
    return Response.json({ error: 'Seeding is disabled in production' }, { status: 403 })
  }

  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.SEED_TOKEN}` && process.env.NODE_ENV !== 'development') {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    console.log('Starting database seed via API...')

    // 1. Create test user
    const testUserId = 'user-' + Date.now()

    await db.insert(user).values({
      id: testUserId,
      email: 'admin@erp.local',
      name: 'Admin User',
      emailVerified: true,
    })

    // 2. Create roles
    const adminRole = await db
      .insert(role)
      .values({
        name: 'Admin',
        description: 'Administrator with full access',
      })
      .returning()
      .then((r) => r[0])

    const managerRole = await db
      .insert(role)
      .values({
        name: 'Manager',
        description: 'Manager with product and order management access',
      })
      .returning()
      .then((r) => r[0])

    const operatorRole = await db
      .insert(role)
      .values({
        name: 'Operator',
        description: 'Operator with read and basic write access',
      })
      .returning()
      .then((r) => r[0])

    // 3. Create permissions
    const permissions = [
      { module: 'products', action: 'create', name: 'product:create', description: 'Create products' },
      { module: 'products', action: 'read', name: 'product:read', description: 'View products' },
      { module: 'products', action: 'update', name: 'product:update', description: 'Update products' },
      { module: 'products', action: 'delete', name: 'product:delete', description: 'Delete products' },
      { module: 'suppliers', action: 'create', name: 'supplier:create', description: 'Create suppliers' },
      { module: 'suppliers', action: 'read', name: 'supplier:read', description: 'View suppliers' },
      { module: 'suppliers', action: 'update', name: 'supplier:update', description: 'Update suppliers' },
      { module: 'orders', action: 'create', name: 'order:create', description: 'Create orders' },
      { module: 'orders', action: 'read', name: 'order:read', description: 'View orders' },
      { module: 'inventory', action: 'read', name: 'inventory:read', description: 'View inventory' },
      { module: 'inventory', action: 'adjust', name: 'inventory:adjust', description: 'Adjust inventory' },
    ]

    const permissionIds = await Promise.all(
      permissions.map(async (perm) => {
        const result = await db.insert(permission).values(perm).returning().then((r) => r[0])
        return result.id
      })
    )

    // Assign permissions to Admin role (all)
    await Promise.all(
      permissionIds.map((permId) =>
        db.insert(rolePermission).values({
          roleId: adminRole.id,
          permissionId: permId,
        })
      )
    )

    // Assign subset to Manager
    const managerPermissions = permissionIds.filter((_, idx) => idx < 8)
    await Promise.all(
      managerPermissions.map((permId) =>
        db.insert(rolePermission).values({
          roleId: managerRole.id,
          permissionId: permId,
        })
      )
    )

    // Assign read-only to Operator
    const operatorPermissions = permissionIds.filter((_, idx) => [1, 5, 8, 10].includes(idx))
    await Promise.all(
      operatorPermissions.map((permId) =>
        db.insert(rolePermission).values({
          roleId: operatorRole.id,
          permissionId: permId,
        })
      )
    )

    // 4. Assign Admin role to test user
    await db.insert(userRole).values({
      userId: testUserId,
      roleId: adminRole.id,
    })

    // 5. Create warehouses
    const warehouse1 = await db
      .insert(warehouse)
      .values({
        userId: testUserId,
        name: 'Main Warehouse',
        location: 'New York, NY',
        capacity: 50000,
        manager: 'John Smith',
      })
      .returning()
      .then((r) => r[0])

    const warehouse2 = await db
      .insert(warehouse)
      .values({
        userId: testUserId,
        name: 'Secondary Warehouse',
        location: 'Los Angeles, CA',
        capacity: 30000,
        manager: 'Jane Doe',
      })
      .returning()
      .then((r) => r[0])

    // 6. Create suppliers
    const supplier1 = await db
      .insert(supplier)
      .values({
        userId: testUserId,
        name: 'TechSupplies Inc.',
        email: 'sales@techsupplies.com',
        phone: '+1-555-0101',
        address: '123 Industrial Ave',
        city: 'Chicago',
        state: 'IL',
        country: 'USA',
        zipCode: '60601',
        paymentTerms: 'Net 30',
        rating: 4.5,
      })
      .returning()
      .then((r) => r[0])

    const supplier2 = await db
      .insert(supplier)
      .values({
        userId: testUserId,
        name: 'Global Electronics Ltd.',
        email: 'contact@globalelectronics.com',
        phone: '+44-20-7123-4567',
        address: '456 Commerce Street',
        city: 'London',
        state: 'UK',
        country: 'United Kingdom',
        zipCode: 'EC1A 1BB',
        paymentTerms: 'Net 45',
        rating: 4.8,
      })
      .returning()
      .then((r) => r[0])

    // 7. Create products
    const products = [
      {
        userId: testUserId,
        sku: 'PROD-001',
        name: 'Wireless Mouse',
        description: 'Ergonomic wireless mouse with 2.4GHz connectivity',
        category: 'Electronics',
        unit: 'piece',
        costPrice: '12.50',
        sellingPrice: '24.99',
        reorderLevel: 50,
      },
      {
        userId: testUserId,
        sku: 'PROD-002',
        name: 'USB-C Cable',
        description: 'Premium USB-C to USB-C cable, 2 meters',
        category: 'Accessories',
        unit: 'piece',
        costPrice: '3.75',
        sellingPrice: '9.99',
        reorderLevel: 100,
      },
      {
        userId: testUserId,
        sku: 'PROD-003',
        name: 'Mechanical Keyboard',
        description: 'RGB Mechanical Gaming Keyboard with Cherry MX switches',
        category: 'Electronics',
        unit: 'piece',
        costPrice: '45.00',
        sellingPrice: '99.99',
        reorderLevel: 20,
      },
      {
        userId: testUserId,
        sku: 'PROD-004',
        name: 'Monitor Stand',
        description: 'Adjustable monitor stand with storage',
        category: 'Furniture',
        unit: 'piece',
        costPrice: '18.00',
        sellingPrice: '39.99',
        reorderLevel: 15,
      },
      {
        userId: testUserId,
        sku: 'PROD-005',
        name: 'Laptop Stand',
        description: 'Aluminum laptop cooling stand',
        category: 'Furniture',
        unit: 'piece',
        costPrice: '15.00',
        sellingPrice: '34.99',
        reorderLevel: 25,
      },
    ]

    const createdProducts = await Promise.all(
      products.map(async (prod) => {
        const result = await db.insert(product).values(prod).returning().then((r) => r[0])
        return result
      })
    )

    // 8. Create inventory records
    for (const prod of createdProducts) {
      await db.insert(inventory).values({
        userId: testUserId,
        productId: prod.id,
        warehouseId: warehouse1.id,
        quantity: Math.floor(Math.random() * 200) + 50,
        reservedQuantity: 0,
        availableQuantity: Math.floor(Math.random() * 200) + 50,
      })

      await db.insert(inventory).values({
        userId: testUserId,
        productId: prod.id,
        warehouseId: warehouse2.id,
        quantity: Math.floor(Math.random() * 150) + 30,
        reservedQuantity: 0,
        availableQuantity: Math.floor(Math.random() * 150) + 30,
      })
    }

    return Response.json({
      success: true,
      data: {
        userId: testUserId,
        testEmail: 'admin@erp.local',
        rolesCreated: 3,
        permissionsCreated: permissions.length,
        warehousesCreated: 2,
        suppliersCreated: 2,
        productsCreated: createdProducts.length,
        inventoryRecordsCreated: createdProducts.length * 2,
      },
    })
  } catch (error) {
    console.error('Error seeding database:', error)
    return Response.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
