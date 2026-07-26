import { requireApiPermission } from '@/lib/auth-utils'
import { supplierRepository } from '@/lib/repositories/SupplierRepository'

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = await requireApiPermission('suppliers', 'read')
  if (authResult.error) return authResult.error

  try {
    const { id } = await params
    const supplier = await supplierRepository.findById(id)
    if (!supplier) {
      return Response.json({ error: 'Supplier not found' }, { status: 404 })
    }
    return Response.json({ success: true, data: supplier })
  } catch (error) {
    console.error('[Suppliers API] GET Error:', error)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = await requireApiPermission('suppliers', 'update')
  if (authResult.error) return authResult.error

  try {
    const { id } = await params
    const existing = await supplierRepository.findById(id)
    if (!existing) {
      return Response.json({ error: 'Supplier not found' }, { status: 404 })
    }

    const data = await request.json()
    const updated = await supplierRepository.update(id, {
      code: data.code ?? existing.code,
      name: data.name ?? existing.name,
      email: data.email ?? existing.email,
      phone: data.phone ?? existing.phone,
      address: data.address ?? existing.address,
      city: data.city ?? existing.city,
      state: data.state ?? existing.state,
      country: data.country ?? existing.country,
      postalCode: data.postalCode ?? existing.postalCode,
      status: data.status ?? existing.status,
    })

    return Response.json({ success: true, data: updated })
  } catch (error) {
    console.error('[Suppliers API] PUT Error:', error)
    return Response.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = await requireApiPermission('suppliers', 'delete')
  if (authResult.error) return authResult.error

  try {
    const { id } = await params
    const existing = await supplierRepository.findById(id)
    if (!existing) {
      return Response.json({ error: 'Supplier not found' }, { status: 404 })
    }

    const deleted = await supplierRepository.softDelete(id)
    return Response.json({ success: true, data: deleted })
  } catch (error) {
    console.error('[Suppliers API] DELETE Error:', error)
    return Response.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}
