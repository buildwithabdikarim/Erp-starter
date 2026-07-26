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

    // Get or create test user
    let testUserId = 'user-1785048354294'
    const existingUser = await db.select().from(user).limit(1)
    if (existingUser.length > 0) {
      testUserId = existingUser[0].id
    }

    console.log('Skipping RBAC setup - roles and permissions already exist')

    // 5. Create warehouses
    const warehouse1 = await db
      .insert(warehouse)
      .values({
        id: 'wh-' + Date.now() + '-1',
        code: 'WH-001',
        name: 'Main Warehouse',
        location: 'New York, NY',
        capacity: 50000,
        status: 'active',
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning()
      .then((r) => r[0])

    const warehouse2 = await db
      .insert(warehouse)
      .values({
        id: 'wh-' + Date.now() + '-2',
        code: 'WH-002',
        name: 'Secondary Warehouse',
        location: 'Los Angeles, CA',
        capacity: 30000,
        status: 'active',
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning()
      .then((r) => r[0])

    // 6. Create suppliers
    const supplier1 = await db
      .insert(supplier)
      .values({
        id: 'sup-' + Date.now() + '-1',
        code: 'SUP-001',
        name: 'TechSupplies Inc.',
        email: 'sales@techsupplies.com',
        phone: '+1-555-0101',
        address: '123 Industrial Ave',
        city: 'Chicago',
        state: 'IL',
        country: 'USA',
        postalCode: '60601',
        status: 'active',
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning()
      .then((r) => r[0])

    const supplier2 = await db
      .insert(supplier)
      .values({
        id: 'sup-' + Date.now() + '-2',
        code: 'SUP-002',
        name: 'Global Electronics Ltd.',
        email: 'contact@globalelectronics.com',
        phone: '+44-20-7123-4567',
        address: '456 Commerce Street',
        city: 'London',
        state: 'UK',
        country: 'United Kingdom',
        postalCode: 'EC1A 1BB',
        status: 'active',
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning()
      .then((r) => r[0])

    // 7. Create products
    const productValues = [
      {
        id: 'prod-' + Date.now() + '-1',
        code: 'PROD-001',
        sku: 'PROD-001',
        name: 'Wireless Mouse',
        description: 'Ergonomic wireless mouse with 2.4GHz connectivity',
        category: 'Electronics',
        unit: 'piece',
        costPrice: '12.50',
        sellingPrice: '24.99',
        reorderLevel: 50,
        reorderQuantity: 100,
        status: 'active',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'prod-' + Date.now() + '-2',
        code: 'PROD-002',
        sku: 'PROD-002',
        name: 'USB-C Cable',
        description: 'Premium USB-C to USB-C cable, 2 meters',
        category: 'Accessories',
        unit: 'piece',
        costPrice: '3.75',
        sellingPrice: '9.99',
        reorderLevel: 100,
        reorderQuantity: 200,
        status: 'active',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'prod-' + Date.now() + '-3',
        code: 'PROD-003',
        sku: 'PROD-003',
        name: 'Mechanical Keyboard',
        description: 'RGB Mechanical Gaming Keyboard with Cherry MX switches',
        category: 'Electronics',
        unit: 'piece',
        costPrice: '45.00',
        sellingPrice: '99.99',
        reorderLevel: 20,
        reorderQuantity: 50,
        status: 'active',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'prod-' + Date.now() + '-4',
        code: 'PROD-004',
        sku: 'PROD-004',
        name: 'Monitor Stand',
        description: 'Adjustable monitor stand with storage',
        category: 'Furniture',
        unit: 'piece',
        costPrice: '18.00',
        sellingPrice: '39.99',
        reorderLevel: 15,
        reorderQuantity: 30,
        status: 'active',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'prod-' + Date.now() + '-5',
        code: 'PROD-005',
        sku: 'PROD-005',
        name: 'Laptop Stand',
        description: 'Aluminum laptop cooling stand',
        category: 'Furniture',
        unit: 'piece',
        costPrice: '15.00',
        sellingPrice: '34.99',
        reorderLevel: 25,
        reorderQuantity: 50,
        status: 'active',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]

    const createdProducts = await db.insert(product).values(productValues as any).returning()

    // 8. Create inventory records
    const inventoryValues = []
    let idx = 0
    for (const prod of createdProducts) {
      idx++
      inventoryValues.push({
        id: 'inv-' + Date.now() + '-' + idx,
        productId: prod.id,
        warehouseId: warehouse1.id,
        quantity: Math.floor(Math.random() * 200) + 50,
        reservedQuantity: 0,
        availableQuantity: Math.floor(Math.random() * 200) + 50,
        createdAt: new Date(),
        updatedAt: new Date(),
      })

      idx++
      inventoryValues.push({
        id: 'inv-' + Date.now() + '-' + idx,
        productId: prod.id,
        warehouseId: warehouse2.id,
        quantity: Math.floor(Math.random() * 150) + 30,
        reservedQuantity: 0,
        availableQuantity: Math.floor(Math.random() * 150) + 30,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
    }

    const createdInventories = await db.insert(inventory).values(inventoryValues as any).returning()

    return Response.json({
      success: true,
      message: 'Database seeded successfully',
      data: {
        userId: testUserId,
        warehousesCreated: 2,
        suppliersCreated: 2,
        productsCreated: createdProducts.length,
        inventoryRecordsCreated: createdInventories.length,
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
