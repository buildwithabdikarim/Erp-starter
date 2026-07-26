import { requireApiPermission } from '@/lib/auth-utils'
import { salesOrderRepository } from '@/lib/repositories/SalesOrderRepository'
import { productRepository } from '@/lib/repositories/ProductRepository'

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = await requireApiPermission('orders', 'update')
  if (authResult.error) return authResult.error

  try {
    const { id } = await params
    const data = await request.json()
    const productId = data.productId || data.product_id

    if (productId) {
      const product = await productRepository.findById(productId)
      if (!product) {
        return Response.json({ error: 'Product not found' }, { status: 404 })
      }
    }

    const result = await salesOrderRepository.updateWithLine(id, {
      customerName: data.customerName,
      productId,
      quantity: data.quantity !== undefined ? Number(data.quantity) : undefined,
      unitPrice:
        data.unitPrice !== undefined || data.unit_price !== undefined
          ? Number(data.unitPrice ?? data.unit_price)
          : undefined,
      orderDate: data.orderDate || data.sale_date,
    })

    return Response.json({ success: true, data: result })
  } catch (error) {
    console.error('[Sales API] PUT Error:', error)
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
  const authResult = await requireApiPermission('orders', 'delete')
  if (authResult.error) return authResult.error

  try {
    const { id } = await params
    const existing = await salesOrderRepository.findById(id)
    if (!existing) {
      return Response.json({ error: 'Sales order not found' }, { status: 404 })
    }

    const deleted = await salesOrderRepository.softDelete(id)
    return Response.json({ success: true, data: deleted })
  } catch (error) {
    console.error('[Sales API] DELETE Error:', error)
    return Response.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}
