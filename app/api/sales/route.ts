import { requireApiPermission } from '@/lib/auth-utils'
import { salesOrderRepository } from '@/lib/repositories/SalesOrderRepository'
import { productRepository } from '@/lib/repositories/ProductRepository'

export async function GET(request: Request) {
  const authResult = await requireApiPermission('orders', 'read')
  if (authResult.error) return authResult.error

  const url = new URL(request.url)
  const limit = Math.min(parseInt(url.searchParams.get('limit') || '50'), 500)

  try {
    const result = await salesOrderRepository.listDetailed(limit)
    return Response.json({ success: true, data: result })
  } catch (error) {
    console.error('[Sales API] GET Error:', error)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  const authResult = await requireApiPermission('orders', 'create')
  if (authResult.error) return authResult.error

  try {
    const data = await request.json()
    const productId = data.productId || data.product_id
    const quantity = Number(data.quantity)
    const unitPrice = Number(data.unitPrice ?? data.unit_price)

    if (!data.customerName || !productId || !quantity || Number.isNaN(unitPrice)) {
      return Response.json(
        { error: 'customerName, productId, quantity, and unitPrice are required' },
        { status: 400 }
      )
    }

    const product = await productRepository.findById(productId)
    if (!product) {
      return Response.json({ error: 'Product not found' }, { status: 404 })
    }

    const result = await salesOrderRepository.createWithLine({
      userId: authResult.session.user.id,
      customerName: data.customerName,
      productId,
      quantity,
      unitPrice,
      orderDate: data.orderDate || data.sale_date,
    })

    return Response.json({ success: true, data: result })
  } catch (error) {
    console.error('[Sales API] POST Error:', error)
    return Response.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}
