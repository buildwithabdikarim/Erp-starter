import { requireApiPermission } from '@/lib/auth-utils'
import { supplierRepository } from '@/lib/repositories/SupplierRepository'

export async function GET(request: Request) {
  const authResult = await requireApiPermission('suppliers', 'read')
  if (authResult.error) return authResult.error

  const url = new URL(request.url)
  const action = url.searchParams.get('action')
  const query = url.searchParams.get('q')
  const limit = Math.min(parseInt(url.searchParams.get('limit') || '50'), 500)

  try {
    let result
    if (action === 'search' && query) {
      result = await supplierRepository.searchByName(query, limit)
    } else if (action === 'active') {
      result = await supplierRepository.findActive(limit)
    } else {
      result = await supplierRepository.getAllSuppliers(limit)
    }

    return Response.json({ success: true, data: result })
  } catch (error) {
    console.error('[Suppliers API] GET Error:', error)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  const authResult = await requireApiPermission('suppliers', 'create')
  if (authResult.error) return authResult.error

  try {
    const data = await request.json()
    const code = data.code || `SUP-${Date.now()}`

    const existing = await supplierRepository.findByCode(code)
    if (existing) {
      return Response.json({ error: 'Supplier code already exists' }, { status: 409 })
    }

    const supplier = await supplierRepository.create({
      code,
      name: data.name,
      email: data.email || null,
      phone: data.phone || null,
      address: data.address || null,
      city: data.city || null,
      state: data.state || null,
      country: data.country || null,
      postalCode: data.postalCode || null,
      status: data.status || 'active',
    })

    return Response.json({ success: true, data: supplier })
  } catch (error) {
    console.error('[Suppliers API] POST Error:', error)
    return Response.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}
